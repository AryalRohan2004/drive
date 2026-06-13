import { asyncHandler } from '../utils/asyncHandler.js';

export const nearbyPlaceholder = asyncHandler(async (_req, res) => {
  res.json({ matches: [] });
});
