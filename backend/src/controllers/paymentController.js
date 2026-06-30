import Stripe from 'stripe';
import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { query, withTransaction } from '../config/db.js';
import { env } from '../config/env.js';
import { sendEmail } from '../services/emailService.js';
import { logAudit } from '../utils/auditLogger.js';

const stripe = new Stripe(env.stripeSecretKey);

// ─── Helper: confirm booking internals (session + assignment) ──────────────

const addMinutesToTime = (timeValue, minutesToAdd) => {
  if (!timeValue) return timeValue;
  const text = String(timeValue).trim();
  const amPmMatch = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (amPmMatch) {
    let hour = Number(amPmMatch[1]);
    const minute = Number(amPmMatch[2]);
    const period = amPmMatch[3].toUpperCase();
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    const totalMinutes = hour * 60 + minute + Number(minutesToAdd || 0);
    const normalized = ((totalMinutes % 1440) + 1440) % 1440;
    const nextHour = Math.floor(normalized / 60);
    const nextMinute = normalized % 60;
    const suffix = nextHour >= 12 ? 'PM' : 'AM';
    const displayHour = nextHour % 12 || 12;
    return `${String(displayHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')} ${suffix}`;
  }
  const twentyFourHourMatch = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1]);
    const minute = Number(twentyFourHourMatch[2]);
    const totalMinutes = hour * 60 + minute + Number(minutesToAdd || 0);
    const normalized = ((totalMinutes % 1440) + 1440) % 1440;
    const nextHour = Math.floor(normalized / 60);
    const nextMinute = normalized % 60;
    return `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}:00`;
  }
  return timeValue;
};

const ensureScheduledSession = async (client, booking) => {
  if (!booking.user_id || !booking.instructor_id) return null;
  const existing = await client.query('SELECT * FROM lesson_sessions WHERE booking_id = $1 LIMIT 1', [booking.id]);
  if (existing.rowCount > 0) return existing.rows[0];
  const created = await client.query(
    `INSERT INTO lesson_sessions (
      id, booking_id, student_id, instructor_id, session_date, start_time, end_time,
      location, lesson_type, vehicle_type, status, notes
    )
     VALUES ($1,$2,$3,$4,$5::date,$6::time,$7::time,$8,$9,$10,'scheduled',$11)
     RETURNING *`,
    [
      crypto.randomUUID(),
      booking.id,
      booking.user_id,
      booking.instructor_id,
      booking.lesson_date,
      booking.lesson_time,
      addMinutesToTime(booking.lesson_time, Number(booking.duration_minutes || 60)),
      booking.pickup_address || booking.pickup_suburb || null,
      booking.booking_type,
      booking.vehicle_type || null,
      booking.notes || null,
    ]
  );
  return created.rows[0];
};

const ensureLearningStarted = async (client, booking) => {
  if (!booking.user_id || !booking.instructor_id) return null;
  const active = await client.query(
    `SELECT * FROM student_assignments WHERE student_id = $1 AND status = 'active' ORDER BY started_at DESC LIMIT 1`,
    [booking.user_id]
  );
  if (active.rowCount > 0 && active.rows[0].instructor_id === booking.instructor_id) {
    await client.query(
      `UPDATE users SET learning_status = 'active', updated_at = NOW() WHERE id = $1`,
      [booking.user_id]
    );
    return active.rows[0];
  }
  if (active.rowCount > 0) {
    await client.query(
      `UPDATE student_assignments SET status = 'transferred', ended_at = NOW() WHERE id = $1`,
      [active.rows[0].id]
    );
  }
  const created = await client.query(
    `INSERT INTO student_assignments (id, student_id, instructor_id, vehicle_type, status, started_at)
     VALUES ($1, $2, $3, $4, 'active', NOW())
     RETURNING *`,
    [crypto.randomUUID(), booking.user_id, booking.instructor_id, booking.vehicle_type || 'standard-car']
  );
  await client.query(
    `UPDATE users SET learning_status = 'active', updated_at = NOW() WHERE id = $1`,
    [booking.user_id]
  );
  return created.rows[0];
};

// ─── POST /api/payments/create-checkout-session ────────────────────────────

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    throw new AppError('bookingId is required', 400);
  }

  if (!env.stripeSecretKey || env.stripeSecretKey === 'sk_test_REPLACE_ME') {
    throw new AppError('Stripe is not configured. Please add your STRIPE_SECRET_KEY to .env', 503);
  }

  // Fetch booking with package info
  const result = await query(
    `SELECT b.*, COALESCE(p.duration_minutes, 60) AS duration_minutes, p.name AS package_name
     FROM bookings b
     LEFT JOIN lesson_packages p ON p.id = b.package_id
     WHERE b.id = $1`,
    [bookingId]
  );

  if (result.rowCount === 0) {
    throw new AppError('Booking not found', 404);
  }

  const booking = result.rows[0];

  // Only the booking owner can pay
  if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You do not have access to pay for this booking', 403);
  }

  if (booking.payment_status === 'paid') {
    throw new AppError('This booking has already been paid', 400);
  }

  const amountCents = Math.round(Number(booking.price) * 100);
  if (amountCents <= 0) {
    throw new AppError('Invalid booking amount', 400);
  }

  const successUrl = `${env.frontendUrl}/book?payment=success&bookingId=${booking.id}`;
  const cancelUrl  = `${env.frontendUrl}/book?payment=cancelled&bookingId=${booking.id}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: env.stripeCurrency,
          product_data: {
            name: booking.package_name || 'Driving Lesson',
            description: `Booking #${booking.booking_number} — ${booking.lesson_date} at ${booking.lesson_time}`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    customer_email: booking.guest_email || req.user.email || undefined,
    metadata: {
      bookingId: booking.id,
      bookingNumber: booking.booking_number,
      userId: booking.user_id,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  // Save stripe_session_id on the booking for webhook lookup
  await query(
    `UPDATE bookings SET stripe_session_id = $1, updated_at = NOW() WHERE id = $2`,
    [session.id, booking.id]
  );

  res.json({ sessionId: session.id, url: session.url });
});

// ─── POST /api/payments/webhook ────────────────────────────────────────────

export const handleWebhook = asyncHandler(async (req, res) => {
  if (!env.stripeWebhookSecret || env.stripeWebhookSecret === 'whsec_REPLACE_ME') {
    // In dev without webhook secret, just return 200
    return res.json({ received: true });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.stripeWebhookSecret);
  } catch (err) {
    console.error('⚠️  Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      console.warn('Stripe webhook: no bookingId in session metadata');
      return res.json({ received: true });
    }

    try {
      await withTransaction(async (client) => {
        const bookingResult = await client.query(
          `SELECT b.*, COALESCE(p.duration_minutes, 60) AS duration_minutes
           FROM bookings b
           LEFT JOIN lesson_packages p ON p.id = b.package_id
           WHERE b.id = $1`,
          [bookingId]
        );

        if (bookingResult.rowCount === 0) {
          console.warn(`Stripe webhook: booking ${bookingId} not found`);
          return;
        }

        const booking = bookingResult.rows[0];

        if (booking.payment_status === 'paid') {
          // Already processed (idempotency)
          return;
        }

        // Confirm the booking
        const updated = await client.query(
          `UPDATE bookings
           SET status = 'confirmed',
               payment_status = 'paid',
               stripe_payment_intent_id = $2,
               updated_at = NOW()
           WHERE id = $1
           RETURNING *`,
          [bookingId, session.payment_intent]
        );

        const confirmedBooking = updated.rows[0];

        await ensureScheduledSession(client, { ...confirmedBooking, duration_minutes: booking.duration_minutes });
        await ensureLearningStarted(client, confirmedBooking);

        await logAudit({
          client,
          actor: { id: confirmedBooking.user_id, role: 'system' },
          action: 'booking.payment_confirmed',
          entityType: 'booking',
          entityId: confirmedBooking.id,
          targetUserId: confirmedBooking.user_id,
          targetUserRole: 'learner',
          summary: `Stripe payment confirmed for booking ${confirmedBooking.booking_number}`,
          metadata: {
            stripeSessionId: session.id,
            paymentIntent: session.payment_intent,
            amountTotal: session.amount_total,
          },
        });

        // Send confirmation email
        if (confirmedBooking.guest_email) {
          await sendEmail({
            to: confirmedBooking.guest_email,
            subject: `✅ Booking Confirmed — ${confirmedBooking.booking_number}`,
            text: `Your payment was successful! Booking ${confirmedBooking.booking_number} is confirmed for ${confirmedBooking.lesson_date} at ${confirmedBooking.lesson_time}.`,
            html: `
              <h2>Payment Successful — Booking Confirmed!</h2>
              <p>Hi there,</p>
              <p>Your payment was successful and your booking is confirmed.</p>
              <ul>
                <li><strong>Booking Number:</strong> ${confirmedBooking.booking_number}</li>
                <li><strong>Date:</strong> ${confirmedBooking.lesson_date}</li>
                <li><strong>Time:</strong> ${confirmedBooking.lesson_time}</li>
                <li><strong>Amount Paid:</strong> $${Number(confirmedBooking.price).toFixed(2)} AUD</li>
              </ul>
              <p>See you at your lesson!</p>
              <p>— The SANOS Driving School Team</p>
            `,
          }).catch((e) => console.warn('Email send failed:', e.message));
        }
      });
    } catch (err) {
      console.error('Stripe webhook processing error:', err);
      return res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  res.json({ received: true });
});
