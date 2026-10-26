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

/** Parse any thrown error (Error instance, PostgrestError plain object, or string) */
export function handleApiError(error: unknown): NextResponse {
  console.error('[API Error]', error);

  if (error instanceof AppError) {
    return errorResponse(error.code, error.message, error.statusCode, error.details);
  }

  let msg = '';
  let details: Record<string, unknown> | undefined;

  if (error instanceof Error) {
    msg = error.message;
  } else if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, unknown>;
    msg = String(errObj.message || errObj.error_description || errObj.error || errObj.details || '');
    if (errObj.details && typeof errObj.details === 'object') {
      details = errObj.details as Record<string, unknown>;
    }
  } else {
    msg = String(error);
  }

  if (msg.includes('INSUFFICIENT_BALANCE')) {
    const clean = msg.includes('INSUFFICIENT_BALANCE:')
      ? msg.split('INSUFFICIENT_BALANCE:')[1]?.trim()
      : msg.replace(/.*INSUFFICIENT_BALANCE:?/, '').trim();
    return errorResponse('INSUFFICIENT_BALANCE', clean || 'Insufficient balance for this operation', 422);
  }

  if (msg.includes('ACCOUNT_NOT_FOUND')) {
    const clean = msg.includes('ACCOUNT_NOT_FOUND:')
      ? msg.split('ACCOUNT_NOT_FOUND:')[1]?.trim()
      : msg.replace(/.*ACCOUNT_NOT_FOUND:?/, '').trim();
    return errorResponse('ACCOUNT_NOT_FOUND', clean || 'Account not found', 404);
  }

  if (msg.includes('SAME_ACCOUNT')) {
    return errorResponse('INVALID_TRANSFER', 'Cannot transfer to the same account', 400);
  }

  if (msg.includes('VALIDATION_ERROR')) {
    const clean = msg.includes('VALIDATION_ERROR:')
      ? msg.split('VALIDATION_ERROR:')[1]?.trim()
      : msg.replace(/.*VALIDATION_ERROR:?/, '').trim();
    return errorResponse('VALIDATION_ERROR', clean || 'Validation failed', 400);
  }

  if (msg.includes('uq_account_reference') || msg.includes('duplicate key')) {
    return errorResponse(
      'DUPLICATE_TRANSACTION',
      'A transaction with this reference_id already exists for this account',
      409
    );
  }

  return errorResponse('INTERNAL_ERROR', msg || 'An unexpected error occurred', 500, details);
}
