import { getData, postData, postFormData, putData } from "@/shared/api/client";
import type { EmergencyCase } from "@/shared/api/domain";
import type { PaginatedResult, QueryParams } from "@/shared/api/types";
import { appendFiles, appendIfPresent } from "@/shared/utils/formData";

export interface CreateSosBody {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  emergencyType: string;
  numPeople: number;
  hasElderly: boolean;
  hasChildren: boolean;
  hasInjured: boolean;
  hasDisabled: boolean;
  contactName?: string;
  contactPhone?: string;
  files?: FileList | File[];
}

export const sosApi = {
  create: (body: CreateSosBody) => {
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (key !== "files") appendIfPresent(formData, key, value);
    });
    appendFiles(formData, "files", body.files);
    return postFormData<EmergencyCase>("/api/emergency-cases", formData);
  },
  my: (params?: QueryParams) => getData<PaginatedResult<EmergencyCase>>("/api/emergency-cases/my", params),
  byId: (id: string) => getData<EmergencyCase>(`/api/emergency-cases/${id}`),
  confirm: (id: string, body: { note?: string; rating?: number }) => postData(`/api/emergency-cases/${id}/confirm`, body),
  updateCitizenStatus: (id: string, body: { status: string; note?: string }) =>
    putData<EmergencyCase>(`/api/emergency-cases/${id}/status`, body),
  coordinatorList: (params?: QueryParams) =>
    getData<PaginatedResult<EmergencyCase>>("/api/coordinator/emergency-cases", params),
  verify: (id: string, body: { result: "APPROVED" | "REJECTED"; note?: string }) =>
    postData<EmergencyCase>(`/api/coordinator/emergency-cases/${id}/verify`, body),
  updateStatus: (id: string, body: { status: string; note?: string }) =>
    putData<EmergencyCase>(`/api/coordinator/emergency-cases/${id}/status`, body),
  updatePriority: (id: string, body: { priorityLevel: string; note?: string }) =>
    putData<EmergencyCase>(`/api/coordinator/emergency-cases/${id}/priority`, body),
};
