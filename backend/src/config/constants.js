export const CONSTANTS = {
  APP_NAME: 'Borrow Before Buy',
  APP_TAGLINE: 'Campus Peer-to-Peer Sharing',
  NO_MONEY_NOTICE: 'BBB never handles money. This amount is settled directly between the two of you.',
  
  // Security
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY_DAYS: 7,
  HANDOVER_TOKEN_EXPIRY_MINUTES: 5,
  EMAIL_TOKEN_EXPIRY_HOURS: 24,
  PASSWORD_MIN_LENGTH: 8,
  
  // Storage & Upload Limits
  MAX_PHOTO_COUNT: 5,
  MAX_PHOTO_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Trust Engine
  DEFAULT_TRUST_SCORE: 50,
  MIN_TRUST_SCORE: 0,
  MAX_TRUST_SCORE: 100,
  
  // Rate Limits
  AUTH_RATE_LIMIT_MAX: 15,
  AUTH_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 mins
  GENERAL_RATE_LIMIT_MAX: 120,
  GENERAL_RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 min
  
  // Cookies
  ACCESS_COOKIE_NAME: 'bbb_access_token',
  REFRESH_COOKIE_NAME: 'bbb_refresh_token',
  CSRF_HEADER_NAME: 'x-requested-with',
  CSRF_HEADER_VALUE: 'bbb'
};
