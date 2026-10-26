// src/lib/errors.ts
// Centralised error handling for API routes

import { NextResponse } from 'next/server';
import { ErrorCode } from '@/types';

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 400,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/** Build a consistent JSON error response */
export function errorResponse(
  code: ErrorCode,
  message: string,
  statusCode: number = 400,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status: statusCode }
  );
}

/** Build a 400 Validation error response */
export function validationError(details: Record<string, string[]>) {
  return errorResponse('VALIDATION_ERROR', 'Validation failed', 400, { fields: details });
}

/** Parse any thrown error and return a consistent API response */
export function handleApiError(error: unknown): NextResponse {
  console.error('[API Error]', error);

  if (error instanceof AppError) {
    return errorResponse(error.code, error.message, error.statusCode, error.details);
  }

  if (error instanceof Error) {
    const msg = error.message;

    if (msg.includes('INSUFFICIENT_BALANCE:')) {
      const clean = msg.split('INSUFFICIENT_BALANCE:')[1]?.trim() ?? msg;
      return errorResponse('INSUFFICIENT_BALANCE', clean, 422);
    }
    if (msg.includes('ACCOUNT_NOT_FOUND:')) {
      const clean = msg.split('ACCOUNT_NOT_FOUND:')[1]?.trim() ?? msg;
      return errorResponse('ACCOUNT_NOT_FOUND', clean, 404);
    }
    if (msg.includes('SAME_ACCOUNT:')) {
      return errorResponse('INVALID_TRANSFER', 'Cannot transfer to the same account', 400);
    }
    if (msg.includes('VALIDATION_ERROR:')) {
      const clean = msg.split('VALIDATION_ERROR:')[1]?.trim() ?? msg;
      return errorResponse('VALIDATION_ERROR', clean, 400);
    }
    // Supabase unique constraint violation
    if (msg.includes('uq_account_reference') || msg.includes('duplicate key')) {
      return errorResponse(
        'DUPLICATE_TRANSACTION',
        'A transaction with this reference_id already exists for this account',
        409
      );
    }
  }

  return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
}
