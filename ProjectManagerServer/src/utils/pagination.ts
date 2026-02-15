export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const getPaginationOptions = (query: any): PaginationOptions => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  return { page, limit };
};

export const createPaginationInfo = (
  page?: number,
  limit?: number,
  total?: number
): PaginationInfo => {
  // Apply defaults and constraints
  const validatedPage = Math.max(1, page || 1);
  const validatedLimit = Math.min(100, Math.max(1, limit || 10));
  const validatedTotal = total || 0;

  // Calculate total pages
  const totalPages = Math.ceil(validatedTotal / validatedLimit);

  return {
    page: validatedPage,
    limit: validatedLimit,
    total: validatedTotal,
    totalPages,
  };
};

export const paginate = <T>(
  data: T[],
  total: number,
  options: PaginationOptions
): PaginatedResult<T> => {
  const { page = 1, limit = 10 } = options;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
  };
};