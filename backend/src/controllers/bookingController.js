import crypto from 'crypto';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import { sendEmail } from '../services/emailService.js';

const bookingSchema = z.object({
  bookingType: z.enum(['learner', 'overseas', 'test']),
  vehicleType: z.string().optional().nullable(),
  vehicleCategory: z.string().optional().nullable(),
  packageCode: z.string().min(2).optional(),
  packageId: z.string().min(2).optional(),
  lessonDate: z.string().date(),
  lessonTime: z.string().min(1),
  pickupSuburb: z.string().optional().nullable(),
  pickupAddress: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  guestName: z.string().optional().nullable(),
  guestEmail: z.string().email().optional().nullable(),
  guestPhone: z.string().optional().nullable(),
  instructorId: z.string().optional().nullable(),
});

const mapBooking = (row) => ({
  id: row.id,
  bookingNumber: row.booking_number,
  userId: row.user_id,
  guestName: row.guest_name,
  guestEmail: row.guest_email,
  guestPhone: row.guest_phone,
  bookingType: row.booking_type,
  vehicleType: row.vehicle_type,
  vehicleCategory: row.vehicle_category,
  packageId: row.package_id,
  packageCode: row.package_code,
  packageName: row.package_name,
  lessonDate: row.lesson_date,
  lessonTime: row.lesson_time,
  status: row.status,
  paymentStatus: row.payment_status,
  price: Number(row.price),
  notes: row.notes,
  pickupSuburb: row.pickup_suburb,
  pickupAddress: row.pickup_address,
  instructorId: row.instructor_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const listBookings = asyncHandler(async (req, res) => {
  const filters = [];
  const values = [];
  let idx = 1;

  if (req.user.role === 'learner') {
    filters.push(`b.user_id = $${idx++}`);
    values.push(req.user.id);
  } else if (req.user.role === 'instructor') {
    filters.push(`b.instructor_id = $${idx++}`);
    values.push(req.user.id);
  } else if (req.query.studentId) {
    filters.push(`b.user_id = $${idx++}`);
    values.push(req.query.studentId);
  }

  if (req.query.status) {
    filters.push(`b.status = $${idx++}`);
    values.push(req.query.status);
  }

  if (req.query.bookingType) {
    filters.push(`b.booking_type = $${idx++}`);
    values.push(req.query.bookingType);
  }

  if (req.query.instructorId) {
    filters.push(`b.instructor_id = $${idx++}`);
    values.push(req.query.instructorId);
  }

  if (req.query.studentId) {
    filters.push(`b.user_id = $${idx++}`);
    values.push(req.query.studentId);
  }

  if (req.query.from) {
    filters.push(`b.lesson_date >= $${idx++}::date`);
    values.push(req.query.from);
  }

  if (req.query.to) {
    filters.push(`b.lesson_date <= $${idx++}::date`);
    values.push(req.query.to);
  }

  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 100)));
  const offset = (page - 1) * limit;

  const sql = `
    SELECT b.*, p.code AS package_code, p.name AS package_name
    FROM bookings b
    LEFT JOIN lesson_packages p ON p.id = b.package_id
    ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}
    ORDER BY b.lesson_date DESC, b.lesson_time DESC, b.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;

  const result = await query(sql, [...values, limit, offset]);
  res.json({ page, limit, bookings: result.rows.map(mapBooking) });
});

export const getBookingById = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT b.*, p.code AS package_code, p.name AS package_name
     FROM bookings b
     LEFT JOIN lesson_packages p ON p.id = b.package_id
     WHERE b.id = $1`,
    [req.params.id]
  );

  if (result.rowCount === 0) {
    throw new AppError('Booking not found', 404);
  }

  const booking = result.rows[0];
  if (req.user.role !== 'admin' && req.user.role !== 'instructor' && booking.user_id !== req.user.id) {
    throw new AppError('You do not have access to this booking', 403);
  }

  res.json({ booking: mapBooking(booking) });
});

export const createBooking = asyncHandler(async (req, res) => {
  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || 'Invalid booking payload', 400);
  }

  const data = parsed.data;
  const selectedVehicleType = data.vehicleType || data.vehicleCategory || null;
  let packageRow = null;

  if (data.packageId) {
    const byId = await query('SELECT * FROM lesson_packages WHERE id = $1 AND is_active = TRUE', [data.packageId]);
    if (byId.rowCount === 0) {
      throw new AppError('Package not found', 404);
    }
    packageRow = byId.rows[0];
  } else if (data.packageCode) {
    const byCode = await query('SELECT * FROM lesson_packages WHERE code = $1 AND is_active = TRUE', [data.packageCode]);
    if (byCode.rowCount === 0) {
      throw new AppError('Package not found', 404);
    }
    packageRow = byCode.rows[0];
  } else {
    throw new AppError('A package code or package ID is required', 400);
  }

  const isGuestBooking = !req.user?.id;
  if (isGuestBooking && !env.allowGuestBookings) {
    throw new AppError('Guest bookings are disabled', 403);
  }

  if (data.instructorId) {
    const conflict = await query(
      `SELECT id FROM bookings
       WHERE lesson_date = $1::date
         AND lesson_time = $2::time
         AND instructor_id = $3
         AND status IN ('pending', 'confirmed')
       LIMIT 1`,
      [data.lessonDate, data.lessonTime, data.instructorId]
    );

    if (conflict.rowCount > 0) {
      throw new AppError('That time slot is already booked', 409);
    }
  }

  const bookingNumber = `SANOS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
  const result = await query(
     `INSERT INTO bookings (
      id, booking_number, user_id, guest_name, guest_email, guest_phone,
      booking_type, package_id, lesson_date, lesson_time, status,
      payment_status, price, notes, pickup_suburb, pickup_address, instructor_id, vehicle_type, vehicle_category
    )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::date, $10::time, 'pending', 'unpaid', $11, $12, $13, $14, $15, $16, $17)
     RETURNING *`,
    [
      crypto.randomUUID(),
      bookingNumber,
      req.user?.id || null,
      data.guestName || null,
      data.guestEmail || req.user?.email || null,
      data.guestPhone || req.user?.phone || null,
      data.bookingType,
      packageRow.id,
      data.lessonDate,
      data.lessonTime,
      packageRow.price,
      data.notes || null,
      data.pickupSuburb || null,
      data.pickupAddress || null,
      data.instructorId || null,
      selectedVehicleType,
      selectedVehicleType,
    ]
  );

  const booking = mapBooking({ ...result.rows[0], package_code: packageRow.code, package_name: packageRow.name });

  const notificationEmail = booking.guestEmail || req.user?.email;
  if (notificationEmail) {
    await sendEmail({
      to: notificationEmail,
      subject: 'Your SANOS booking is received',
      text: `Your booking ${booking.bookingNumber} has been received and is pending confirmation.`,
      html: `<p>Your booking <strong>${booking.bookingNumber}</strong> has been received and is pending confirmation.</p>`,
    });
  }

  res.status(201).json({ booking });
});

export const updateBooking = asyncHandler(async (req, res) => {
  const allowed = z.object({
    status: z.string().optional(),
    paymentStatus: z.string().optional(),
    lessonDate: z.string().date().optional(),
    lessonTime: z.string().optional(),
    notes: z.string().optional().nullable(),
    instructorId: z.string().optional().nullable(),
    vehicleType: z.string().optional().nullable(),
    vehicleCategory: z.string().optional().nullable(),
  }).safeParse(req.body);

  if (!allowed.success) {
    throw new AppError(allowed.error.issues[0]?.message || 'Invalid booking update payload', 400);
  }

  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(allowed.data)) {
    const columnMap = {
      status: 'status',
      paymentStatus: 'payment_status',
      lessonDate: 'lesson_date',
      lessonTime: 'lesson_time',
      notes: 'notes',
      instructorId: 'instructor_id',
      vehicleType: 'vehicle_type',
      vehicleCategory: 'vehicle_category',
    };
    fields.push(`${columnMap[key]} = $${idx++}`);
    values.push(value);
  }

  if (fields.length === 0) {
    throw new AppError('No changes submitted', 400);
  }

  values.push(req.params.id);

  const result = await query(
    `UPDATE bookings SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
    values
  );

  if (result.rowCount === 0) {
    throw new AppError('Booking not found', 404);
  }

  res.json({ booking: result.rows[0] });
});

export const confirmBooking = asyncHandler(async (req, res) => {
  const result = await query(
    `UPDATE bookings SET status = 'confirmed', payment_status = 'paid', updated_at = NOW() WHERE id = $1 RETURNING *`,
    [req.params.id]
  );

  if (result.rowCount === 0) {
    throw new AppError('Booking not found', 404);
  }

  res.json({ booking: result.rows[0] });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const existing = await query('SELECT id, user_id FROM bookings WHERE id = $1', [req.params.id]);
  if (existing.rowCount === 0) {
    throw new AppError('Booking not found', 404);
  }

  const booking = existing.rows[0];
  if (req.user.role !== 'admin' && req.user.role !== 'instructor' && booking.user_id !== req.user.id) {
    throw new AppError('You do not have access to cancel this booking', 403);
  }

  const result = await query(
    `UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *`,
    [req.params.id]
  );

  res.json({ booking: result.rows[0] });
});
