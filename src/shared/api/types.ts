export interface ApiResponse<T> {
  isSuccess: boolean;
  message?: string | null;
  data: T;
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface ApiErrorPayload {
  status?: number;
  code?: string;
  message: string;
  details?: unknown;
}

export interface IdName {
  id: string;
  name?: string;
}

export type QueryParams = Record<string, string | number | boolean | null | undefined>;
