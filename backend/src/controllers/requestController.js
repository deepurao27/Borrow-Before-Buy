import {
  createBorrowRequest,
  getUserRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest
} from '../services/requestService.js';
import { createRequestSchema } from '../validators/itemValidators.js';
import { sendSuccess } from '../utils/response.js';

export const createRequest = async (req, res, next) => {
  try {
    const validatedData = createRequestSchema.parse(req.body);
    const request = await createBorrowRequest(req.user.id, req.params.itemId, validatedData);
    return sendSuccess(res, request, 'Borrow request submitted to lender!', 201);
  } catch (err) {
    return next(err);
  }
};

export const listRequests = async (req, res, next) => {
  try {
    const type = req.query.type || 'all'; // all, sent, received
    const requests = await getUserRequests(req.user.id, type);
    return sendSuccess(res, requests);
  } catch (err) {
    return next(err);
  }
};

export const accept = async (req, res, next) => {
  try {
    const transaction = await acceptRequest(req.user.id, req.params.id);
    return sendSuccess(res, transaction, 'Borrow request accepted! Transaction initiated.');
  } catch (err) {
    return next(err);
  }
};

export const reject = async (req, res, next) => {
  try {
    const result = await rejectRequest(req.user.id, req.params.id);
    return sendSuccess(res, null, result.message);
  } catch (err) {
    return next(err);
  }
};

export const cancel = async (req, res, next) => {
  try {
    const result = await cancelRequest(req.user.id, req.params.id);
    return sendSuccess(res, null, result.message);
  } catch (err) {
    return next(err);
  }
};
