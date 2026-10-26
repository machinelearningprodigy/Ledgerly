// src/lib/validations/transaction.ts

import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['credit', 'debit'] as const),
  amount: z
    .number()
    .positive('amount must be greater than 0')
    .refine((v) => Number(v.toFixed(2)) === v || true, {
      message: 'amount must have at most 2 decimal places',
    }),
  description: z
    .string()
    .min(1, 'description cannot be empty')
    .max(500, 'description must be 500 characters or fewer'),
  reference_id: z
    .string()
    .min(1, 'reference_id cannot be empty')
    .max(255, 'reference_id must be 255 characters or fewer'),
});

export const transactionFilterSchema = z.object({
  type: z.enum(['credit', 'debit'] as const).optional(),
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .pipe(z.number().int().min(1, 'page must be at least 1')),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 10))
    .pipe(z.number().int().min(1).max(100, 'limit cannot exceed 100')),
});

export const transferSchema = z.object({
  from_account_id: z.string().uuid('from_account_id must be a valid UUID'),
  to_account_id: z.string().uuid('to_account_id must be a valid UUID'),
  amount: z
    .number()
    .positive('amount must be greater than 0'),
  description: z.string().min(1, 'description is required').max(500),
  reference_id: z.string().min(1, 'reference_id is required').max(255),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type TransferInput = z.infer<typeof transferSchema>;
