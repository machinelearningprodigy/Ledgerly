// src/app/api/accounts/[id]/route.ts
// GET /api/accounts/:id — Get account details + balance

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { handleApiError, errorResponse } from '@/lib/errors';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return errorResponse(
        'ACCOUNT_NOT_FOUND',
        `Account with id '${id}' not found`,
        404
      );
    }

    return NextResponse.json({
      data: {
        ...data,
        account_id: data.id,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
