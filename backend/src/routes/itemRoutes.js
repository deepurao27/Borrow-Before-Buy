import express from 'express';
import {
  listItems,
  getItem,
  createNewItem,
  uploadPhotos,
  updateItemDetails,
  deleteItemListing
} from '../controllers/itemController.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadMiddleware, validateMagicBytes } from '../middleware/upload.js';

const router = express.Router();

router.get('/', listItems);
router.get('/:id', getItem);
router.post('/', requireAuth, createNewItem);
router.post('/:id/photos', requireAuth, uploadMiddleware.array('photos', 5), validateMagicBytes, uploadPhotos);
router.patch('/:id', requireAuth, updateItemDetails);
router.delete('/:id', requireAuth, deleteItemListing);

export default router;
