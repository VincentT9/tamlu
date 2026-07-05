import axios, { AxiosError } from "axios";
import type { ApiErrorPayload, ApiResponse, QueryParams } from "@/shared/api/types";
import { useAuthStore } from "@/features/auth/store";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://exe201-floodrescue-be.onrender.com";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(toApiError(error));
  },
);

export function cleanParams(params?: QueryParams) {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

export async function getData<T>(url: string, params?: QueryParams): Promise<T> {
  const response = await apiClient.get<ApiResponse<T>>(url, { params: cleanParams(params) });
  return unwrap(response.data);
}

export async function postData<T, B = unknown>(url: string, body?: B, params?: QueryParams): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(url, body, { params: cleanParams(params) });
  return unwrap(response.data);
}

export async function putData<T, B = unknown>(url: string, body?: B, params?: QueryParams): Promise<T> {
  const response = await apiClient.put<ApiResponse<T>>(url, body, { params: cleanParams(params) });
  return unwrap(response.data);
}

export async function deleteData<T>(url: string): Promise<T> {
  const response = await apiClient.delete<ApiResponse<T>>(url);
  return unwrap(response.data);
}

export async function postFormData<T>(url: string, formData: FormData): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrap(response.data);
}

export async function downloadBlob(url: string, params?: QueryParams): Promise<Blob> {
  const response = await apiClient.get(url, { params: cleanParams(params), responseType: "blob" });
  return response.data;
}

export function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.isSuccess) {
    throw { message: response.message ?? "Request failed", details: response } satisfies ApiErrorPayload;
  }
  return response.data;
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message ?? "Something went wrong");
  }
  return "Something went wrong";
}

export function isBackendConnectionError(error: unknown): boolean {
  return Boolean(
    typeof error === "object" &&
      error &&
      "code" in error &&
      (error as { code?: unknown }).code === "BACKEND_CONNECTION_REFUSED",
  );
}

function toApiError(error: AxiosError<ApiResponse<unknown>>): ApiErrorPayload {
  if (!error.response) {
    return {
      code: "BACKEND_CONNECTION_REFUSED",
      message: `Cannot connect to TamLu backend at ${API_BASE_URL}. Start the backend server or set VITE_API_BASE_URL to the correct API URL.`,
      details: error,
    };
  }

  return {
    status: error.response?.status,
    message:
      error.response?.data?.message ??
      error.message ??
      "Unable to reach TamLu backend. Please check the server connection.",
    details: error.response?.data,
  };
}
