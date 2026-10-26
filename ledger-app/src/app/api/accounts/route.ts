// src/app/api/accounts/route.ts
// GET  /api/accounts  — List accounts (paginated)
// POST /api/accounts  — Create a new account

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createAccountSchema, paginationSchema } from '@/lib/validations/account';
import { handleApiError, validationError } from '@/lib/errors';
import { parseZodError } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parsed = paginationSchema.safeParse({
      page:  searchParams.get('page')  ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });

    if (!parsed.success) {
      return validationError(parseZodError(parsed.error));
    }

    const { page, limit } = parsed.data;
    const from = (page - 1) * limit;
    const to   = from + limit - 1;

    const supabase = createServerClient();

    const { data, error, count } = await supabase
      .from('accounts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({
      data,
      pagination: {
        page,
        current_page:  page,
        limit,
        page_size:     limit,
        total_records: count ?? 0,
        total_pages:   Math.ceil((count ?? 0) / limit),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return validationError({ _root: ['Request body must be valid JSON'] });
    }

    const parsed = createAccountSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parseZodError(parsed.error));
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('accounts')
      .insert({ name: parsed.data.name })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
