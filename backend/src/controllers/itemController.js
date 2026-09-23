import {
  createItem,
  uploadItemPhotos,
  getItems,
  getItemById,
  updateItem,
  deleteItem
} from '../services/itemService.js';
import {
  createItemSchema,
  updateItemSchema,
  itemQuerySchema
} from '../validators/itemValidators.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const listItems = async (req, res, next) => {
  try {
    const query = itemQuerySchema.parse(req.query);
    const result = await getItems(query);
    return sendSuccess(res, result.items, null, 200, { pagination: result.pagination });
  } catch (err) {
    return next(err);
  }
};

export const getItem = async (req, res, next) => {
  try {
    const item = await getItemById(req.params.id);
    return sendSuccess(res, item);
  } catch (err) {
    return next(err);
  }
};

export const createNewItem = async (req, res, next) => {
  try {
    const validatedData = createItemSchema.parse(req.body);
    const item = await createItem(req.user.id, validatedData);
    return sendSuccess(res, item, 'Item listed on noticeboard successfully!', 201);
  } catch (err) {
    return next(err);
  }
};

export const uploadPhotos = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'NO_FILES_UPLOADED', 'Please select at least one photo to upload.', 400);
    }
    const photos = await uploadItemPhotos(req.user.id, req.params.id, req.files);
    return sendSuccess(res, photos, 'Photos uploaded successfully!', 201);
  } catch (err) {
    return next(err);
  }
};

export const updateItemDetails = async (req, res, next) => {
  try {
    const validatedData = updateItemSchema.parse(req.body);
    const item = await updateItem(req.user.id, req.params.id, validatedData);
    return sendSuccess(res, item, 'Item updated successfully!');
  } catch (err) {
    return next(err);
  }
};

export const deleteItemListing = async (req, res, next) => {
  try {
    const result = await deleteItem(req.user.id, req.params.id);
    return sendSuccess(res, null, result.message);
  } catch (err) {
    return next(err);
  }
};
