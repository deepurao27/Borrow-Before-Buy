import { env } from '../config/env.js';
import { LocalStorageDriver } from './localStorageDriver.js';

let driver;

if (env.UPLOAD_DRIVER === 's3' && env.S3_BUCKET) {
  // S3 driver placeholder for production
  driver = new LocalStorageDriver();
} else {
  driver = new LocalStorageDriver(env.UPLOAD_DIR);
}

export const storage = driver;
