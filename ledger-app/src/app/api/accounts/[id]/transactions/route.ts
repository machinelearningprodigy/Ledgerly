// src/app/api/accounts/[id]/transactions/route.ts
// GET  /api/accounts/:id/transactions — List transactions (filtered, paginated, sorted)
// POST /api/accounts/:id/transactions — Create a credit or debit transaction (atomic via RPC)

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createTransactionSchema, transactionFilterSchema } from '@/lib/validations/transaction';
import { handleApiError, errorResponse, validationError } from '@/lib/errors';
import { parseZodError } from '@/lib/utils';

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    // Verify account exists
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', id)
      .single();

    if (accountError || !account) {
      return errorResponse('ACCOUNT_NOT_FOUND', `Account with id '${id}' not found`, 404);
    }

    // Parse & validate query params
    const { searchParams } = new URL(request.url);
    const parsed = transactionFilterSchema.safeParse({
      type:  searchParams.get('type')  ?? undefined,
      page:  searchParams.get('page')  ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });

    if (!parsed.success) {
      return validationError(parseZodError(parsed.error));
    }

    const { type, page, limit } = parsed.data;
    const from = (page - 1) * limit;
    const to   = from + limit - 1;

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('account_id', id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total_records: count ?? 0,
        total_pages:   Math.ceil((count ?? 0) / limit),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

// ─── POST ────────────────────────────────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return validationError({ _root: ['Request body must be valid JSON'] });
    }

    const parsed = createTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parseZodError(parsed.error));
    }

    const { type, amount, description, reference_id } = parsed.data;
    const supabase = createServerClient();

    // Call the atomic Postgres RPC — handles locking, idempotency, balance update
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'process_transaction',
      {
        p_account_id:   id,
        p_type:         type,
        p_amount:       amount,
        p_description:  description,
        p_reference_id: reference_id,
      }
    );

    if (rpcError) throw rpcError;

    const result = rpcResult as {
      transaction: Record<string, unknown>;
      balance: number;
      duplicate: boolean;
    };

    if (result.duplicate) {
      return NextResponse.json(
        {
          data:      result.transaction,
          message:   'Transaction already exists',
          duplicate: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        data: {
          ...result.transaction,
          new_balance: result.balance,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
