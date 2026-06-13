import { asyncHandler } from '../utils/asyncHandler.js';
import { query } from '../config/db.js';

const toKm = (aLat, aLng, bLat, bLng) => {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const routeCache = new Map();

const getRouteMetrics = async (fromLat, fromLng, toLat, toLng) => {
  const cacheKey = `${fromLat},${fromLng}:${toLat},${toLng}`;
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey);
  }

  const fallbackDistanceKm = toKm(fromLat, fromLng, toLat, toLng);
  let metrics = {
    routeDistanceKm: fallbackDistanceKm,
    estimatedTravelMinutes: Math.round(fallbackDistanceKm * 2.2),
    algorithm: 'haversine-fallback',
  };

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const route = data?.routes?.[0];
      if (route?.distance && route?.duration) {
        metrics = {
          routeDistanceKm: route.distance / 1000,
          estimatedTravelMinutes: Math.round(route.duration / 60),
          algorithm: 'osrm',
        };
      }
    }
  } catch {
    // Fall back to the distance approximation when routing is unavailable.
  }

  routeCache.set(cacheKey, metrics);
  return metrics;
};

export const findNearbyInstructors = asyncHandler(async (req, res) => {
  const { latitude, longitude, vehicleType, limit = 5, date, time } = req.query;
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.json({ matches: [] });
  }

  const result = await query(
    `SELECT id, full_name, email, phone, service_areas, vehicle_types_supported, base_latitude, base_longitude, service_radius_km, max_travel_distance_km, availability
     FROM users
     WHERE role = 'instructor' AND status = 'active'`,
    []
  );

  const matches = [];
  for (const row of result.rows) {
    if (vehicleType && !(row.vehicle_types_supported || []).includes(vehicleType)) {
      continue;
    }

    const instructorLat = Number(row.base_latitude);
    const instructorLng = Number(row.base_longitude);
    if (!Number.isFinite(instructorLat) || !Number.isFinite(instructorLng)) {
      continue;
    }

    const travelLimit = Number(row.max_travel_distance_km || row.service_radius_km || 0);
    const metrics = await getRouteMetrics(lat, lng, instructorLat, instructorLng);
    if (Number.isFinite(travelLimit) && travelLimit > 0 && metrics.routeDistanceKm > travelLimit) {
      continue;
    }

    if (date && time) {
      const conflict = await query(
        `SELECT id FROM bookings
         WHERE instructor_id = $1
           AND lesson_date = $2::date
           AND lesson_time = $3::time
           AND status IN ('pending', 'confirmed')
         LIMIT 1`,
        [row.id, date, time]
      );
      if (conflict.rowCount > 0) {
        continue;
      }
    }

    matches.push({
      instructorId: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      vehicleTypesSupported: row.vehicle_types_supported || [],
      routeDistanceKm: metrics.routeDistanceKm,
      estimatedTravelMinutes: metrics.estimatedTravelMinutes,
      algorithm: metrics.algorithm,
      score: Math.max(0, Math.round(100 - metrics.routeDistanceKm * 10)),
    });
  }

  matches.sort((a, b) => (a.routeDistanceKm ?? 9999) - (b.routeDistanceKm ?? 9999));

  res.json({ pickup: { latitude: lat, longitude: lng }, vehicleType: vehicleType || null, matches });
});

export const calculateRouteDistance = asyncHandler(async (req, res) => {
  const parsed = Number(req.query.latitude);
  const parsedLng = Number(req.query.longitude);
  const instructorId = req.query.instructorId;
  if (!Number.isFinite(parsed) || !Number.isFinite(parsedLng) || !instructorId) {
    return res.json({ routeDistanceKm: null, estimatedTravelMinutes: null });
  }

  const instructor = await query(
    'SELECT base_latitude, base_longitude FROM users WHERE id = $1 AND role = $2',
    [instructorId, 'instructor']
  );
  if (instructor.rowCount === 0) {
    return res.json({ routeDistanceKm: null, estimatedTravelMinutes: null });
  }

  const baseLat = Number(instructor.rows[0].base_latitude);
  const baseLng = Number(instructor.rows[0].base_longitude);
  if (!Number.isFinite(baseLat) || !Number.isFinite(baseLng)) {
    return res.json({ routeDistanceKm: null, estimatedTravelMinutes: null });
  }

  const metrics = await getRouteMetrics(parsed, parsedLng, baseLat, baseLng);
  res.json({
    routeDistanceKm: metrics.routeDistanceKm,
    estimatedTravelMinutes: metrics.estimatedTravelMinutes,
    algorithm: metrics.algorithm,
  });
});
