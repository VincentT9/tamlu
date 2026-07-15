import { downloadBlob, getData } from "@/shared/api/client";
import type {
  TransparencyEvidence,
  TransparencyFinancials,
  TransparencyInventory,
  TransparencyMap,
} from "@/shared/api/domain";
import type { QueryParams } from "@/shared/api/types";

export const transparencyApi = {
  financials: (campaignId: string, params?: QueryParams) =>
    getData<TransparencyFinancials>(`/api/public/transparency/campaigns/${campaignId}/financials`, params),
  inventory: (campaignId: string) =>
    getData<TransparencyInventory>(`/api/public/transparency/campaigns/${campaignId}/inventory`),
  map: (campaignId: string) => getData<TransparencyMap>(`/api/public/transparency/campaigns/${campaignId}/map`),
  evidence: (campaignId: string) =>
    getData<TransparencyEvidence>(`/api/public/transparency/campaigns/${campaignId}/evidence`),
  exportReport: (campaignId: string, format: "csv" | "pdf") =>
    downloadBlob(`/api/public/transparency/campaigns/${campaignId}/export`, { format }),
};
