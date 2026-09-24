import { z } from 'zod';

export const createItemSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().trim().min(5, 'Description must be at least 5 characters').max(2000),
  categoryId: z.string().min(1, 'Please select a valid category'),
  customCategory: z.preprocess((val) => (val === '' ? null : val), z.string().trim().max(80, 'Custom category cannot exceed 80 characters').nullable().optional()),
  condition: z.enum(['LIKE_NEW', 'GOOD', 'FAIR'], {
    errorMap: () => ({ message: 'Condition must be LIKE_NEW, GOOD, or FAIR' })
  }),
  securityAmount: z.coerce.number().int().min(0, 'Security amount cannot be negative').max(50000, 'Security amount exceeds max limit'),
  handoverPointId: z.string().min(1, 'Please select a valid campus handover point'),
  customHandoverPoint: z.preprocess((val) => (val === '' ? null : val), z.string().trim().max(120, 'Custom handover location cannot exceed 120 characters').nullable().optional())
});

export const updateItemSchema = createItemSchema.partial().extend({
  status: z.enum(['ACTIVE', 'DISABLED']).optional()
});

export const itemQuerySchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().optional(),
  condition: z.enum(['LIKE_NEW', 'GOOD', 'FAIR']).optional(),
  handoverPointId: z.string().optional(),
  zone: z.string().optional(),
  maxSecurity: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20)
});

export const createRequestSchema = z.object({
  requestedStart: z.string().datetime({ message: 'Start date must be a valid ISO datetime' }),
  requestedEnd: z.string().datetime({ message: 'End date must be a valid ISO datetime' }),
  message: z.string().trim().max(500).optional()
}).refine((data) => {
  const start = new Date(data.requestedStart);
  const end = new Date(data.requestedEnd);
  return end >= start;
}, {
  message: 'End date must be on or after start date',
  path: ['requestedEnd']
});
