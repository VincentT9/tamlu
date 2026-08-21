import { getData, postData, putData } from "@/shared/api/client";
import type { AllocationPlan, AreaAssessment, Disbursement, Procurement } from "@/shared/api/domain";
import type { PaginatedResult, QueryParams } from "@/shared/api/types";

export interface CreateAllocationPlanRequest {
  campaignId: string;
  assessmentId: string;
  items: Array<{
    areaNeedId?: string | null;
    itemType: string;
    quantity: number;
    approvedAmount: number;
  }>;
}

export const aidApi = {
  suppliers: () => getData<Array<{ id: string; name: string; phone?: string; address?: string; isTrusted: boolean }>>("/api/suppliers"),
  createSupplier: (body: { name: string; phone?: string; address?: string; isTrusted: boolean }) =>
    postData("/api/suppliers", body),
  procurements: (params?: QueryParams) => getData<PaginatedResult<Procurement>>("/api/procurements", params),
  procurement: (id: string) => getData<Procurement>(`/api/procurements/${id}`),
  createProcurement: (body: unknown) => postData<Procurement>("/api/procurements", body),
  approveProcurement: (id: string) => putData<Procurement>(`/api/procurements/${id}/approve`),
  payProcurement: (id: string, method: string, invoiceUrl?: string) =>
    putData<Procurement>(`/api/procurements/${id}/pay`, { method, invoiceUrl, paymentReceiptUrl: invoiceUrl }, { method }),
  deliverProcurement: (id: string) => putData<Procurement>(`/api/procurements/${id}/deliver`),
  areaAssessments: (params?: QueryParams) => getData<PaginatedResult<AreaAssessment>>("/api/area-assessments", params),
  createAreaAssessment: (body: Partial<AreaAssessment>) => postData<AreaAssessment>("/api/area-assessments", body),
  addAreaNeed: (id: string, body: { itemType: string; quantity: number; unit: string; notes?: string }) =>
    postData(`/api/area-assessments/${id}/needs`, body),
  verifyAreaAssessment: (id: string, body: { status: "VERIFIED" | "REJECTED"; notes?: string }) =>
    putData<AreaAssessment>(`/api/area-assessments/${id}/verify`, body),
  allocationPlans: (params?: QueryParams) => getData<PaginatedResult<AllocationPlan>>("/api/allocation-plans", params),
  allocationPlan: (id: string) => getData<AllocationPlan>(`/api/allocation-plans/${id}`),
  createAllocationPlan: (body: CreateAllocationPlanRequest) => postData<AllocationPlan>("/api/allocation-plans", body),
  submitAllocationPlan: (id: string) => putData<AllocationPlan>(`/api/allocation-plans/${id}/submit`),
  approveAllocationPlan: (id: string, body: { status: "APPROVED" | "REJECTED"; note?: string }) =>
    putData<AllocationPlan>(`/api/allocation-plans/${id}/approve`, body),
  closeAllocationPlan: (id: string) => putData<AllocationPlan>(`/api/allocation-plans/${id}/close`),
  disbursements: (params?: QueryParams) => getData<PaginatedResult<Disbursement>>("/api/disbursements", params),
  createDisbursement: (body: Partial<Disbursement>) => postData<Disbursement>("/api/disbursements", body),
  executeDisbursement: (id: string, body: { invoiceUrl: string; actualAmount: number }) =>
    putData<Disbursement>(`/api/disbursements/${id}/execute`, body),
  createProof: (id: string) => postData(`/api/disbursements/${id}/proofs`),
  addProofMedia: (id: string, fileUrls: string[], fileType: string, caption?: string) =>
    postData(`/api/proof-packages/${id}/media`, fileUrls, { fileType, caption }),
  addProofGeotag: (id: string, body: { latitude: number; longitude: number; accuracy: number }) =>
    postData(`/api/proof-packages/${id}/geotag`, body),
  addProofSignature: (id: string, body: { signerName: string; signerRole: string; signatureUrl: string }) =>
    postData(`/api/proof-packages/${id}/signature`, body),
};
