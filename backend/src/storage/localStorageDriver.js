import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { env } from '../config/env.js';

export class LocalStorageDriver {
  constructor(baseDir = env.UPLOAD_DIR) {
    this.baseDir = path.resolve(baseDir);
    this.init();
  }

  async init() {
    await fs.mkdir(this.baseDir, { recursive: true });
    await fs.mkdir(path.join(this.baseDir, 'public'), { recursive: true });
    await fs.mkdir(path.join(this.baseDir, 'private'), { recursive: true });
  }

  /**
   * Save a file buffer to disk
   * @param {Buffer} buffer - File buffer
   * @param {string} originalName - Original filename
   * @param {boolean} isPrivate - Private or public file
   * @returns {Promise<{ key: string, url: string }>}
   */
  async save(buffer, originalName, isPrivate = false) {
    await this.init();
    const ext = path.extname(originalName).toLowerCase() || '.jpg';
    const randomName = `${crypto.randomUUID()}${ext}`;
    const subfolder = isPrivate ? 'private' : 'public';
    const filePath = path.join(this.baseDir, subfolder, randomName);

    await fs.writeFile(filePath, buffer);

    const key = `${subfolder}/${randomName}`;
    const url = isPrivate ? `/api/evidence/${randomName}` : `/uploads/public/${randomName}`;

    return { key, url, filename: randomName };
  }

  /**
   * Read private file stream/buffer
   */
  async get(key) {
    const filePath = path.join(this.baseDir, key);
    return await fs.readFile(filePath);
  }

  /**
   * Delete file
   */
  async delete(key) {
    try {
      const filePath = path.join(this.baseDir, key);
      await fs.unlink(filePath);
    } catch (err) {
      // Ignore if file doesn't exist
    }
  }
}
