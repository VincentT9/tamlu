import { getData, putData } from "@/shared/api/client";
import type { Notification } from "@/shared/api/domain";
import type { PaginatedResult, QueryParams } from "@/shared/api/types";

export const notificationApi = {
  list: (params?: QueryParams) => getData<PaginatedResult<Notification>>("/api/notifications", params),
  markRead: (id: string) => putData(`/api/notifications/${id}/read`),
};
