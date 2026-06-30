import { asyncHandler } from '../utils/asyncHandler.js';
import { query } from '../config/db.js';

const defaultSlotStarts = Array.from({ length: 11 }, (_, index) => 7 * 60 + index * 60);

const formatMinutes = (totalMinutes) => {
  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
};

const parseTimeToMinutes = (value) => {
  if (!value) return null;
  const text = String(value).trim();
  const amPmMatch = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (amPmMatch) {
    let hour = Number(amPmMatch[1]);
    const minute = Number(amPmMatch[2]);
    const period = amPmMatch[3].toUpperCase();
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour * 60 + minute;
  }

  const twentyFourHourMatch = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (twentyFourHourMatch) {
    return Number(twentyFourHourMatch[1]) * 60 + Number(twentyFourHourMatch[2]);
  }

  return null;
};

const rangesOverlap = (startA, endA, startB, endB) => startA < endB && startB < endA;

const parseHourLabel = (value) => {
  if (value == null) return null;
  const text = String(value).trim().toLowerCase();
  const match = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const period = match[3]?.toLowerCase();
  if (period === 'pm' && hour !== 12) hour += 12;
  if (period === 'am' && hour === 12) hour = 0;
  if (!period && hour < 24) return hour * 60 + minute;
  return hour * 60 + minute;
};

const parseAvailabilityWindow = (value) => {
  if (!value) return null;
  const normalized = String(value).replace(/\s+/g, '').toLowerCase();
  const match = normalized.match(/(\d{1,2}(?::\d{2})?(?:am|pm)?)[-–](\d{1,2}(?::\d{2})?(?:am|pm)?)/);
  if (!match) return null;
  const start = parseHourLabel(match[1]);
  const end = parseHourLabel(match[2]);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  return { start, end };
};

const buildSlotStarts = (window) => {
  if (!window) return defaultSlotStarts;
  const slots = [];
  for (let start = window.start; start < window.end; start += 60) {
    slots.push(start);
  }
  return slots.length > 0 ? slots : defaultSlotStarts;
};

const getRequestedDuration = async (packageId, packageCode) => {
  if (!packageId && !packageCode) return 60;

  const result = await query(
    `SELECT duration_minutes
     FROM lesson_packages
     WHERE is_active = TRUE AND (($1::text IS NOT NULL AND id = $1) OR ($2::text IS NOT NULL AND code = $2))
     LIMIT 1`,
    [packageId || null, packageCode || null]
  );

  return Number(result.rows[0]?.duration_minutes || 60);
};

export const getAvailability = asyncHandler(async (req, res) => {
  const date = req.query.date;
  const instructorId = req.query.instructorId || null;
  const durationMinutes = await getRequestedDuration(req.query.packageId || null, req.query.packageCode || null);
  const instructorWindow = instructorId
    ? await query(
        `SELECT ip.times_available
         FROM users u
         LEFT JOIN instructor_profiles ip ON ip.user_id = u.id
         WHERE u.id = $1 AND u.role = 'instructor'
         LIMIT 1`,
        [instructorId]
      )
    : null;
  const slotStarts = buildSlotStarts(parseAvailabilityWindow(instructorWindow?.rows?.[0]?.times_available));

  if (!date) {
    const slots = slotStarts.map((start) => ({
      time: formatMinutes(start),
      startMinutes: start,
      endMinutes: start + durationMinutes,
      status: 'available',
      isBooked: false,
    }));
    const availableTimes = slots.map((slot) => slot.time);
    return res.json({ date: null, instructorId, durationMinutes, availableTimes, bookedTimes: [], slots, availability: availableTimes });
  }

  const booked = await query(
    `SELECT b.lesson_time, COALESCE(p.duration_minutes, 60) AS duration_minutes
     FROM bookings b
     LEFT JOIN lesson_packages p ON p.id = b.package_id
     WHERE b.lesson_date = $1::date
       AND b.status IN ('pending', 'confirmed')
       AND ($2::text IS NULL OR b.instructor_id = $2)
     UNION ALL
     SELECT ls.start_time AS lesson_time, 60 AS duration_minutes
     FROM lesson_sessions ls
     WHERE ls.session_date = $1::date
       AND ls.status IN ('scheduled', 'in_progress')
       AND ($2::text IS NULL OR ls.instructor_id = $2)`,
    [date, instructorId]
  );

  const bookedRanges = booked.rows
    .map((row) => {
      const start = parseTimeToMinutes(row.lesson_time);
      if (start === null) return null;
      return { start, end: start + Number(row.duration_minutes || 60) };
    })
    .filter(Boolean);

  const slots = slotStarts.map((start) => {
    const end = start + durationMinutes;
    const isBooked = bookedRanges.some((range) => rangesOverlap(start, end, range.start, range.end));
    return {
      time: formatMinutes(start),
      startMinutes: start,
      endMinutes: end,
      status: isBooked ? 'booked' : 'available',
      isBooked,
    };
  });

  const availableTimes = slots.filter((slot) => !slot.isBooked).map((slot) => slot.time);
  const bookedTimes = slots.filter((slot) => slot.isBooked).map((slot) => slot.time);

  res.json({
    date,
    instructorId,
    durationMinutes,
    availableTimes,
    bookedTimes,
    slots: availableTimes,
    slotDetails: slots,
    availability: availableTimes,
  });
});
