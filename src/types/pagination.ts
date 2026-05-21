export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export function buildPagination(
    page: number,
    total: number,
    limit: number,
): PaginationInfo {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
    };
}
