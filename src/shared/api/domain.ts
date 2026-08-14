import type { PaginatedResult } from "@/shared/api/types";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role?: string | null;
  roleName?: string | null;
  roleCode?: string | null;
  roles?: string[] | null;
  roleId?: number | string | null;
  roleIds?: Array<number | string> | null;
  userRoles?: Array<string | number | Record<string, unknown>> | null;
  avatarUrl?: string | null;
  status: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  roles: string[];
  token: string | null;
  message?: string | null;
}

export interface EmergencyCase {
  id: string;
  requesterId?: string | null;
  contactName: string;
  contactPhone: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  emergencyType: string;
  numPeople: number;
  hasElderly: boolean;
  hasChildren: boolean;
  hasInjured: boolean;
  hasDisabled: boolean;
  priorityLevel: string;
  status: string;
  createdAt: string;
  updatedAt?: string | null;
  media: EmergencyMedia[];
  statusLogs: StatusLog[];
}

export interface EmergencyMedia {
  id: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
}

export interface StatusLog {
  id: string;
  status: string;
  note?: string | null;
  updatedByUserName?: string | null;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string | null;
  coverImageUrl?: string | null;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  affectedArea?: string | null;
  organizationName?: string | null;
  status: string;
  createdByName?: string | null;
  createdAt: string;
  stats?: {
    totalDonated: number;
    donorCount: number;
    disbursedAmount: number;
    progressPct: number;
  } | null;
}

export interface Donation {
  id: string;
  orderCode: number;
  campaignId: string;
  campaignName?: string | null;
  donorName?: string | null;
  donorEmail?: string | null;
  donorPhone?: string | null;
  amount: number;
  paymentMethod: string;
  isAnonymous: boolean;
  message?: string | null;
  status: string;
  donatedAt?: string | null;
  createdAt: string;
  paymentUrl?: string | null;
}

export interface PublicLedger {
  id: string;
  campaignId: string;
  transactionType: string;
  amount: number;
  runningBalance: number;
  verifiedByName?: string | null;
  verifiedBy?: string | null;
  entryDate: string;
  description?: string | null;
}

export interface PublicCampaignDetail {
  campaign: Campaign;
  ledgerSummary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
  recentDonations: Donation[];
  recentExpenses: PublicLedger[];
}

export interface Mission {
  id: string;
  emergencyCaseId: string;
  code: string;
  rescueTeamId?: string | null;
  rescueTeamName?: string | null;
  priority: string;
  status: string;
  destinationShelterId?: string | null;
  destinationShelterName?: string | null;
  assignedByUserName?: string | null;
  assignedAt: string;
  completedAt?: string | null;
  peopleRescued?: number | null;
  notes?: string | null;
  vehicles: Vehicle[];
  updates: RescueUpdate[];
}

export interface RescueUpdate {
  id: string;
  missionId: string;
  status: string;
  latitude: number;
  longitude: number;
  note?: string | null;
  updatedByUserName?: string | null;
  createdAt: string;
  media: { id: string; fileUrl: string; fileType: string }[];
}

export interface RescueTeam {
  id: string;
  name: string;
  leaderName?: string | null;
  phone?: string | null;
  specialty: string;
  status: string;
}

export interface Vehicle {
  id: string;
  vehicleName: string;
  vehicleType: string;
  status: string;
  driverName?: string | null;
  driverPhone?: string | null;
  assignedDriverName?: string | null;
  assignedDriverPhone?: string | null;
  licensePlate?: string | null;
}

export interface Shelter {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
  contactPerson?: string | null;
  contactPhone?: string | null;
  hasElectricity: boolean;
  hasCleanWater: boolean;
  hasMedical: boolean;
  status: string;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  managerName?: string | null;
  phone?: string | null;
  status: string;
}

export interface InventoryItem {
  id: string;
  warehouseId: string;
  warehouseName?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  itemName: string;
  quantity: number;
  reservedQuantity: number;
  minQuantity: number;
  unit: string;
  expiryDate?: string | null;
  source?: string | null;
  status: string;
}

export interface Shipment {
  id: string;
  warehouseId: string;
  warehouseName?: string | null;
  targetWarehouseId?: string | null;
  targetWarehouseName?: string | null;
  aidAllocationPlanId?: string | null;
  status: string;
  trackingNote?: string | null;
  vehicleName?: string | null;
  driverName?: string | null;
  emergencyCaseId?: string | null;
  emergencyCaseTitle?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  items: { id: string; inventoryItemName?: string | null; quantity: number }[];
}

export interface Category {
  id: string;
  name: string;
  type?: string;
}

export interface DashboardSummary {
  activeCampaigns: number;
  totalDonations: number;
  pendingRequests: number;
  activeMissions: number;
  totalWarehouses: number;
  lowStockItems: number;
}

export interface TransparencyFinancials {
  campaignName: string;
  totalIncome: number;
  totalExpense: number;
  remainingBalance: number;
  categoryBreakdown: Record<string, number>;
  ledgerHistory: PaginatedResult<PublicLedger>;
}

export interface TransparencyInventory {
  warehouses: Array<Warehouse & { items: Array<InventoryItem & { availableQuantity: number }> }>;
  transactionHistory: Array<{
    id: string;
    itemName: string;
    type: string;
    quantity: number;
    reason?: string | null;
    referenceType?: string | null;
    performedBy?: string | null;
    createdAt: string;
  }>;
}

export interface TransparencyMap {
  areaNeeds: Array<{
    id: string;
    areaName: string;
    province: string;
    district: string;
    ward: string;
    householdsAffected: number;
    floodSeverity: string;
    priorityLevel: string;
    notes?: string | null;
    needs: Array<{ itemType: string; quantity: number; unit: string }>;
  }>;
  activeRoutes: Array<{
    id: string;
    status: string;
    trackingNote?: string | null;
    sourceWarehouse?: string | null;
    driver?: string | null;
    vehicle?: string | null;
    shippedAt?: string | null;
    createdAt: string;
  }>;
}

export interface TransparencyEvidence {
  invoices: Array<{
    id: string;
    expenseCategory: string;
    itemName: string;
    amount: number;
    invoiceUrl?: string | null;
    executedAt?: string | null;
  }>;
  deliveryProofs: Array<{
    id: string;
    disbursementItem: string;
    uploadedAt: string;
    photos: string[];
    coordinates: Array<{ latitude: number; longitude: number; accuracy: number }>;
    signatures: Array<{ signerName: string; signerRole: string; signatureUrl: string }>;
  }>;
}

export interface Procurement {
  id: string;
  campaignName?: string | null;
  supplierName?: string | null;
  warehouseName?: string | null;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: Array<{ id: string; itemName: string; quantity: number; unit: string; pricePerUnit: number }>;
  invoiceUrl?: string | null;
  paymentReceiptUrl?: string | null;
}

export interface AreaAssessment {
  id: string;
  campaignId: string;
  areaName: string;
  province: string;
  district: string;
  ward: string;
  householdsAffected: number;
  floodSeverity: string;
  priorityLevel: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  needs: Array<{ id: string; itemType: string; quantity: number; unit: string; notes?: string | null }>;
}

export interface AllocationPlan {
  id: string;
  campaignName?: string | null;
  areaName?: string | null;
  totalPlannedAmount: number;
  status: string;
  createdByName?: string | null;
  createdAt: string;
  items: Array<{ id: string; itemType: string; quantity: number; approvedAmount: number }>;
}

export interface Disbursement {
  id: string;
  allocationPlanId?: string | null;
  procurementOrderId?: string | null;
  expenseCategory: string;
  itemName: string;
  invoiceUrl?: string | null;
  type: string;
  method: string;
  amount: number;
  status: string;
  executedByName?: string | null;
  executedAt?: string | null;
  confirmedAt?: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  complaintType: string;
  status: string;
  resolution?: string | null;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  registrationNumber?: string | null;
  description?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status: string;
  isVerified: boolean;
  trustScore: number;
}

export interface VolunteerProfile {
  id: string;
  userId: string;
  skills: string;
  experience?: string | null;
  availableAreas?: string | null;
  idVerified: boolean;
  status: string;
  totalMissions: number;
}
