import {
  createDispute,
  listDisputes,
  getDisputeById,
  resolveDispute
} from '../services/disputeService.js';
import { sendSuccess } from '../utils/response.js';
import { z } from 'zod';

const openDisputeSchema = z.object({
  transactionId: z.string().uuid(),
  type: z.enum(['DAMAGE', 'NON_RETURN', 'FALSE_CLAIM', 'OTHER']),
  description: z.string().min(10, 'Please provide at least 10 characters describing the issue').max(2000),
  evidence: z.array(z.object({
    storageKey: z.string().optional(),
    filename: z.string().optional(),
    mimeType: z.string().optional(),
    description: z.string().optional()
  })).optional()
});

const resolveDisputeSchema = z.object({
  resolution: z.string().min(5, 'Resolution explanation is required').max(2000),
  penaltyUserId: z.string().uuid().optional().nullable(),
  trustDelta: z.number().int().optional().nullable()
});

export const openDispute = async (req, res, next) => {
  try {
    const validatedData = openDisputeSchema.parse(req.body);
    const dispute = await createDispute({
      ...validatedData,
      initiator: req.user
    });
    return sendSuccess(res, { dispute }, 'Dispute filed successfully. Campus moderators have been notified.', 201);
  } catch (err) {
    return next(err);
  }
};

export const getDispute = async (req, res, next) => {
  try {
    const dispute = await getDisputeById(req.params.id, req.user);
    return sendSuccess(res, { dispute });
  } catch (err) {
    return next(err);
  }
};

export const listAllDisputes = async (req, res, next) => {
  try {
    const status = req.query.status;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);

    const result = await listDisputes({ status, page, limit });
    return sendSuccess(res, result);
  } catch (err) {
    return next(err);
  }
};

export const resolveDisputeHandler = async (req, res, next) => {
  try {
    const validatedData = resolveDisputeSchema.parse(req.body);
    const dispute = await resolveDispute({
      disputeId: req.params.id,
      resolver: req.user,
      ...validatedData
    });
    return sendSuccess(res, { dispute }, 'Dispute resolved successfully.');
  } catch (err) {
    return next(err);
  }
};
