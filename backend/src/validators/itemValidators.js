import { z } from 'zod';

export const createItemSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(80, 'Title cannot exceed 80 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000),
  categoryId: z.string().uuid('Please select a valid category'),
  condition: z.enum(['LIKE_NEW', 'GOOD', 'FAIR'], {
    errorMap: () => ({ message: 'Condition must be LIKE_NEW, GOOD, or FAIR' })
  }),
  securityAmount: z.coerce.number().int().min(0, 'Security amount cannot be negative').max(50000, 'Security amount exceeds max limit'),
  handoverPointId: z.string().uuid('Please select a valid campus handover point')
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
