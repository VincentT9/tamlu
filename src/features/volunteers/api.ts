import { getData, postData, putData } from "@/shared/api/client";
import type { VolunteerProfile } from "@/shared/api/domain";
import type { PaginatedResult, QueryParams } from "@/shared/api/types";

export const volunteerApi = {
  create: (body: { skills: string; experience?: string; availableAreas?: string }) =>
    postData<VolunteerProfile>("/api/volunteer-profiles", body),
  my: () => getData<VolunteerProfile>("/api/volunteer-profiles/my"),
  updateMy: (body: Partial<VolunteerProfile>) => putData<VolunteerProfile>("/api/volunteer-profiles/my", body),
  coordinatorList: (params?: QueryParams) =>
    getData<PaginatedResult<VolunteerProfile>>("/api/coordinator/volunteers", params),
  coordinatorAvailable: (params?: QueryParams) =>
    getData<PaginatedResult<VolunteerProfile>>("/api/coordinator/volunteers", { ...params, status: "AVAILABLE" }),
  verify: (id: string, idVerified: boolean) =>
    putData<VolunteerProfile>(`/api/admin/volunteer-profiles/${id}/verify`, { idVerified }),
};
