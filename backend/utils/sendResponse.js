/**
 * Sends a consistently-shaped JSON success response across the entire API.
 *
 * Shape:
 * {
 *   success: true,
 *   message: "...",
 *   data: {...} | [...] | null,
 *   meta: { pagination, etc. } (optional)
 * }
 */
const sendResponse = (res, statusCode, message, data = null, meta = undefined) => {
  const payload = {
    success: statusCode < 400,
    message,
    data,
  };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

module.exports = sendResponse;
