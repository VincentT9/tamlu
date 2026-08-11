import { getData, postData, putData } from "@/shared/api/client";
import type { Complaint } from "@/shared/api/domain";
import type { PaginatedResult, QueryParams } from "@/shared/api/types";

export const monitoringApi = {
  createComplaint: (body: {
    title: string;
    description: string;
    complaintType: string;
    referenceType?: string;
    referenceId?: string | null;
  }) => postData<Complaint>("/api/complaints", body),
  myComplaints: (params?: QueryParams) => getData<PaginatedResult<Complaint>>("/api/complaints/my", params),
  adminComplaints: (params?: QueryParams) => getData<PaginatedResult<Complaint>>("/api/admin/complaints", params),
  updateComplaint: (id: string, body: { status: "INVESTIGATING" | "RESOLVED" | "REJECTED"; assignedTo?: string | null; resolution?: string }) =>
    putData<Complaint>(`/api/admin/complaints/${id}`, body),
  fraudCases: (params?: QueryParams) => getData<PaginatedResult<unknown>>("/api/admin/fraud-cases", params),
  createFraudCase: (body: unknown) => postData("/api/admin/fraud-cases", body),
  updateFraudCase: (id: string, body: unknown) => putData(`/api/admin/fraud-cases/${id}`, body),
};
