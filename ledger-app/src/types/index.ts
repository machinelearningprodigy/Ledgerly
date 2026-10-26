// src/types/index.ts

export interface Account {
  id: string;
  name: string;
  balance: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference_id: string;
  created_at: string;
}

export interface PaginationMeta {
  page: number;
  current_page?: number;
  limit: number;
  page_size?: number;
  total_records: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  duplicate?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface TransactionResult extends Transaction {
  new_balance?: number;
}

export interface TransferResult {
  debit_transaction: Transaction;
  credit_transaction: Transaction;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  from_balance: number;
  to_balance: number;
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'ACCOUNT_NOT_FOUND'
  | 'INSUFFICIENT_BALANCE'
  | 'DUPLICATE_TRANSACTION'
  | 'INVALID_TRANSFER'
  | 'INTERNAL_ERROR';
