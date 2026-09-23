import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import { CONSTANTS } from '../config/constants.js';
import { sendError } from '../utils/response.js';

const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: CONSTANTS.MAX_PHOTO_SIZE_BYTES, // 5MB
    files: CONSTANTS.MAX_PHOTO_COUNT // 5 files max
  }
});

/**
 * Validate file buffers by inspecting actual magic bytes
 */
export const validateMagicBytes = async (req, res, next) => {
  try {
    const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      return next();
    }

    for (const file of files) {
      const detected = await fileTypeFromBuffer(file.buffer);

      if (!detected || !CONSTANTS.ALLOWED_IMAGE_MIME_TYPES.includes(detected.mime)) {
        return sendError(
          res,
          'INVALID_FILE_TYPE',
          'Only valid JPEG, PNG, and WebP image files are allowed. Disguised or corrupt files are rejected.',
          400
        );
      }

      // Attach detected mime and ext
      file.detectedMime = detected.mime;
      file.detectedExt = detected.ext;
    }

    return next();
  } catch (err) {
    return next(err);
  }
};
