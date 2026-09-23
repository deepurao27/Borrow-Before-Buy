/**
 * Uniform API Response Utility
 */

export const sendSuccess = (res, data = null, message = null, statusCode = 200, meta = undefined) => {
  const payload = {};
  if (data !== null) payload.data = data;
  if (message) payload.message = message;
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

export const sendError = (res, code, message, statusCode = 400, fields = undefined) => {
  const payload = {
    error: {
      code,
      message,
      ...(fields ? { fields } : {})
    }
  };
  return res.status(statusCode).json(payload);
};
