import { getData, postData, putData } from "@/shared/api/client";
import type { DashboardSummary, User } from "@/shared/api/domain";
import type { PaginatedResult, QueryParams } from "@/shared/api/types";

export const adminApi = {
  dashboard: () => getData<DashboardSummary>("/api/dashboard/summary"),
  users: (params?: QueryParams) => getData<PaginatedResult<User>>("/api/admin/users", params),
  createUser: (body: { fullName: string; email: string; phone: string; password: string; roleIds: number[] }) =>
    postData<User>("/api/admin/users", body),
  approveUser: (id: string, isApproved: boolean) =>
    putData<string>(`/api/admin/users/${id}/approve`, undefined, { isApproved }),
  setUserStatus: (id: string, isActive: boolean) =>
    putData<string>(`/api/admin/users/${id}/status`, undefined, { isActive }),
  updateUserRoles: (id: string, roleIds: number[]) => postData(`/api/admin/users/${id}/roles`, { roleIds }),
  auditLogs: (params?: QueryParams) => getData<PaginatedResult<unknown>>("/api/admin/audit-logs", params),
};
