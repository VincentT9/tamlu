import { getData, postData, putData } from "@/shared/api/client";
import type { Organization } from "@/shared/api/domain";
import type { PaginatedResult } from "@/shared/api/types";

export const organizationApi = {
  list: () => getData<PaginatedResult<Organization> | Organization[]>("/api/organizations"),
  create: (body: Partial<Organization>) => postData<Organization>("/api/organizations", body),
  verify: (id: string, isVerified: boolean) =>
    putData<Organization>(`/api/admin/organizations/${id}/verify`, { isVerified }),
  members: (id: string) => getData<PaginatedResult<unknown>>(`/api/organizations/${id}/members`),
  addMember: (id: string, body: { userId: string; role: string }) =>
    postData(`/api/organizations/${id}/members`, body),
};
