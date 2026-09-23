import { logger } from '../config/logger.js';
import { sendError } from '../utils/response.js';
import { ZodError } from 'zod';

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  logger.error({
    err: {
      message: err.message,
      stack: err.stack,
      code: err.code
    },
    path: req.path,
    method: req.method
  }, 'Unhandled request error');

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const fields = {};
    err.errors.forEach((e) => {
      const fieldPath = e.path.join('.');
      fields[fieldPath] = e.message;
    });
    return sendError(res, 'VALIDATION_ERROR', 'The submitted data is invalid.', 422, fields);
  }

  // Handle Multer upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 'FILE_TOO_LARGE', 'Uploaded file exceeds the maximum 5MB size limit.', 400);
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return sendError(res, 'INVALID_FILE_UPLOAD', 'Unexpected file upload field or too many files.', 400);
  }

  // Handle known HTTP Status errors
  const status = err.statusCode || err.status || 500;
  const code = err.code || (status === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_FAILED');
  const message = status === 500 ? 'An unexpected server error occurred. Please try again.' : err.message;

  return sendError(res, code, message, status);
};
