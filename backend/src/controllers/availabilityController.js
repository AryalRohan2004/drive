import { asyncHandler } from '../utils/asyncHandler.js';
import { query } from '../config/db.js';

const baseSlots = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];

export const getAvailability = asyncHandler(async (req, res) => {
  const date = req.query.date;
  const instructorId = req.query.instructorId || null;

  if (!date) {
    return res.json({ date: null, availableTimes: baseSlots });
  }

  const booked = await query(
    `SELECT lesson_time
     FROM bookings
     WHERE lesson_date = $1::date
       AND status IN ('pending', 'confirmed')
       AND ($2::text IS NULL OR instructor_id = $2)`,
    [date, instructorId]
  );

  const bookedSet = new Set(booked.rows.map((row) => {
    const [hour, minute] = row.lesson_time.split(':');
    const h = Number(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const normalized = `${String(h % 12 || 12).padStart(2, '0')}:${minute.slice(0, 2)} ${ampm}`;
    return normalized;
  }));

  res.json({
    date,
    availableTimes: baseSlots.filter((slot) => !bookedSet.has(slot)),
  });
});
