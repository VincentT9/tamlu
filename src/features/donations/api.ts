import { getData, postData, putData } from "@/shared/api/client";
import type { Campaign, Donation, PublicCampaignDetail, PublicLedger } from "@/shared/api/domain";
import type { PaginatedResult, QueryParams } from "@/shared/api/types";

export interface CreateDonationBody {
  campaignId: string;
  amount: number;
  paymentMethod: string;
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  isAnonymous: boolean;
  message?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export const donationApi = {
  publicCampaigns: (params?: QueryParams) => getData<PaginatedResult<Campaign>>("/api/public/campaigns", params),
  publicCampaign: (id: string) => getData<PublicCampaignDetail>(`/api/public/campaigns/${id}`),
  campaigns: (params?: QueryParams) => getData<PaginatedResult<Campaign>>("/api/campaigns", params),
  createCampaign: (body: Partial<Campaign>) => postData<Campaign>("/api/campaigns", body),
  updateCampaignStatus: (id: string, status: string) =>
    putData<Campaign>(`/api/campaigns/${id}/status`, { status }),
  createDonation: (body: CreateDonationBody) => postData<Donation>("/api/donations", body),
  myDonations: (params?: QueryParams) => getData<PaginatedResult<Donation>>("/api/donations/my", params),
  campaignDonations: (id: string, params?: QueryParams) =>
    getData<PaginatedResult<Donation>>(`/api/campaigns/${id}/donations`, params),
  campaignLedger: (id: string, params?: QueryParams) =>
    getData<PaginatedResult<PublicLedger>>(`/api/campaigns/${id}/ledger`, params),
};
