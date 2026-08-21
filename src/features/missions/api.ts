import { deleteData, getData, postData, postFormData, putData } from "@/shared/api/client";
import type { Mission, MyRescueTeamResponse, RescueTeam, RescueUpdate, Shelter, Vehicle } from "@/shared/api/domain";
import type { PaginatedResult, QueryParams } from "@/shared/api/types";
import { appendFiles, appendIfPresent } from "@/shared/utils/formData";

export interface ShelterCheckIn {
  id: string;
  personName?: string | null;
  householdId?: string | null;
  numPeople?: number | null;
  status?: string | null;
  action?: string | null;
  createdAt?: string | null;
  checkedInAt?: string | null;
  checkedOutAt?: string | null;
}

export interface ShelterSuggestion {
  shelter: Shelter;
  distanceKm: number;
  remainingCapacity: number;
}

export const missionApi = {
  create: (body: {
    emergencyCaseId: string;
    title?: string;
    description?: string;
    priority: string;
    rescueTeamId: string;
    vehicleIds: string[];
    destinationShelterId?: string | null;
    volunteerProfileIds?: string[];
  }) => postData<Mission>("/api/missions", body),
  assignVolunteers: (id: string, volunteerIds: string[]) =>
    postData<Mission>(`/api/missions/${id}/volunteers`, { volunteerIds }),
  byId: (id: string) => getData<Mission>(`/api/missions/${id}`),
  coordinatorList: (params?: QueryParams) => getData<PaginatedResult<Mission>>("/api/coordinator/missions", params),
  teamList: (params?: QueryParams) => getData<PaginatedResult<Mission>>("/api/team/missions", params),
  teamById: (id: string) => getData<Mission>(`/api/team/missions/${id}`),
  update: (id: string, body: { status: string; note?: string; latitude: number; longitude: number }) =>
    postData<RescueUpdate>(`/api/team/missions/${id}/updates`, body),
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
  createShelter: (body: Partial<Shelter>) => postData<Shelter>("/api/shelters", body),
  shelterMap: () => getData<Shelter[]>("/api/shelters/map"),
  shelterSuggest: (params: { latitude: number; longitude: number; numPeople: number }) =>
    getData<ShelterSuggestion[]>("/api/shelters/suggest", params),
  shelterCheckIns: (id: string, params?: QueryParams) =>
    getData<PaginatedResult<ShelterCheckIn>>(`/api/shelters/${id}/occupancy-logs`, params),
  checkInShelter: (id: string, body: { personName?: string; numPeople: number; householdId?: string | null }) =>
    postData<ShelterCheckIn>(`/api/shelters/${id}/check-in`, body),
  checkOutShelter: (id: string, body: { personName?: string; householdId?: string; numPeople: number }) =>
    postData<ShelterCheckIn>(`/api/shelters/${id}/check-out`, body),
  rescueTeams: (params?: QueryParams) => getData<PaginatedResult<RescueTeam>>("/api/rescue-teams", params),
  vehicles: (params?: QueryParams) => getData<PaginatedResult<Vehicle>>("/api/vehicles", params),
  createVehicle: (body: Partial<Vehicle>) => postData<Vehicle>("/api/vehicles", body),
  updateVehicle: (id: string, body: Partial<Vehicle>) => putData<Vehicle>(`/api/vehicles/${id}`, body),
  deleteVehicle: (id: string) => deleteData<void>(`/api/vehicles/${id}`),
  myTeam: () => getData<MyRescueTeamResponse>("/api/team/my-team"),
};
