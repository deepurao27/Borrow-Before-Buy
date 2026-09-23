import { CONSTANTS } from '../config/constants.js';
import { sendError } from '../utils/response.js';

/**
 * Custom Header-based CSRF protection for mutating requests.
 * Requires state-changing requests (POST, PUT, PATCH, DELETE) to send `X-Requested-With: bbb`.
 */
export const csrfProtection = (req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const customHeader = req.headers[CONSTANTS.CSRF_HEADER_NAME];
  if (!customHeader || customHeader.toLowerCase() !== CONSTANTS.CSRF_HEADER_VALUE) {
    return sendError(
      res,
      'CSRF_VALIDATION_FAILED',
      'Missing or invalid CSRF anti-tampering protection header.',
      403
    );
  }

  return next();
};
