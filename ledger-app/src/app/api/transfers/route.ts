// src/app/api/transfers/route.ts
// POST /api/transfers — Atomic fund transfer between two accounts

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { transferSchema } from '@/lib/validations/transaction';
import { handleApiError, validationError, errorResponse } from '@/lib/errors';
import { parseZodError } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return validationError({ _root: ['Request body must be valid JSON'] });
    }

    const parsed = transferSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parseZodError(parsed.error));
    }

    const { from_account_id, to_account_id, amount, description, reference_id } = parsed.data;

    // Early check: accounts must differ (DB function also checks, but fail fast)
    if (from_account_id === to_account_id) {
      return errorResponse('INVALID_TRANSFER', 'Source and destination accounts must be different', 400);
    }

    const supabase = createServerClient();

    // Call the atomic transfer stored procedure
    const { data, error } = await supabase.rpc('transfer_funds', {
      p_from_account_id: from_account_id,
      p_to_account_id:   to_account_id,
      p_amount:          amount,
      p_description:     description,
      p_reference_id:    reference_id,
    });

    if (error) throw error;

    const result = data as { duplicate?: boolean } | null;
    if (result && result.duplicate) {
      return NextResponse.json(
        {
          data,
          message: 'Transfer with this reference_id already exists',
          duplicate: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
