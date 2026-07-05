import { getData, postData, postFormData, putData } from "@/shared/api/client";
import type { Mission, RescueTeam, Shelter, Vehicle } from "@/shared/api/domain";
import type { PaginatedResult, QueryParams } from "@/shared/api/types";
import { appendFiles, appendIfPresent } from "@/shared/utils/formData";

export const missionApi = {
  create: (body: {
    emergencyCaseId: string;
    title?: string;
    description?: string;
    priority: string;
    rescueTeamId: string;
    vehicleIds: string[];
    destinationShelterId?: string | null;
  }) => postData<Mission>("/api/missions", body),
  byId: (id: string) => getData<Mission>(`/api/missions/${id}`),
  coordinatorList: (params?: QueryParams) => getData<PaginatedResult<Mission>>("/api/coordinator/missions", params),
  teamList: (params?: QueryParams) => getData<PaginatedResult<Mission>>("/api/team/missions", params),
  teamById: (id: string) => getData<Mission>(`/api/team/missions/${id}`),
  update: (id: string, body: { status: string; note?: string; latitude: number; longitude: number }) =>
    postData(`/api/team/missions/${id}/updates`, body),
  uploadUpdateMedia: (id: string, updateId: string, files: FileList | File[], fileType?: string) => {
    const formData = new FormData();
    appendFiles(formData, "files", files);
    appendIfPresent(formData, "fileType", fileType);
    return postFormData(`/api/team/missions/${id}/updates/${updateId}/media`, formData);
  },
  complete: (id: string, body: { peopleRescued: number; notes?: string }) =>
    putData<Mission>(`/api/team/missions/${id}/complete`, body),
  reassign: (id: string, body: { rescueTeamId: string; vehicleIds: string[] }) =>
    putData<Mission>(`/api/coordinator/missions/${id}/reassign`, body),
  cancel: (id: string, reason: string) => putData<Mission>(`/api/coordinator/missions/${id}/cancel`, { reason }),
  shelters: (params?: QueryParams) => getData<PaginatedResult<Shelter>>("/api/shelters", params),
  shelterMap: () => getData<Shelter[]>("/api/shelters/map"),
  shelterSuggest: (params: { latitude: number; longitude: number; numPeople: number }) =>
    getData<Shelter[]>("/api/shelters/suggest", params),
  rescueTeams: (params?: QueryParams) => getData<PaginatedResult<RescueTeam>>("/api/rescue-teams", params),
  vehicles: (params?: QueryParams) => getData<PaginatedResult<Vehicle>>("/api/vehicles", params),
  myTeam: () => getData<unknown>("/api/team/my-team"),
};
