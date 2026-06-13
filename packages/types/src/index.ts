export * from './entities/user.types';
export * from './entities/company.types';
export * from './entities/product.types';

// API Response envelopes
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
    requestId: string;
  };
}
