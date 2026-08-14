import { deleteData, getData, postData, putData } from "@/shared/api/client";
import type { Category, InventoryItem, Shipment, Warehouse } from "@/shared/api/domain";
import type { PaginatedResult, QueryParams } from "@/shared/api/types";

export const inventoryApi = {
  warehouses: () => getData<Warehouse[]>("/api/warehouses"),
  warehouseItems: (id: string, params?: QueryParams) =>
    getData<PaginatedResult<InventoryItem>>(`/api/warehouses/${id}/items`, params),
  createWarehouse: (body: Partial<Warehouse>) => postData<Warehouse>("/api/warehouses", body),
  updateWarehouse: (id: string, body: Partial<Warehouse>) => putData<Warehouse>(`/api/warehouses/${id}`, body),
  deleteWarehouse: (id: string) => deleteData<void>(`/api/warehouses/${id}`),
  suggestWarehouses: (body: {
    latitude: number;
    longitude: number;
    items: Array<{ categoryId?: string; itemName?: string; quantity: number }>;
  }) => postData<Warehouse[]>("/api/warehouses/suggest", body),
  createInventoryItem: (body: Partial<InventoryItem>) => postData<InventoryItem>("/api/inventory-items", body),
  updateInventoryItem: (id: string, body: Partial<InventoryItem>) =>
    putData<InventoryItem>(`/api/inventory-items/${id}`, body),
  lowStock: () => getData<InventoryItem[]>("/api/inventory/low-stock"),
  createTransaction: (id: string, body: { type: string; quantity: number; reason?: string }) =>
    postData(`/api/inventory-items/${id}/transactions`, body),
  itemTransactions: (id: string, params?: QueryParams) =>
    getData<PaginatedResult<unknown>>(`/api/inventory-items/${id}/transactions`, params),
  shipments: (params?: QueryParams) => getData<PaginatedResult<Shipment>>("/api/shipments", params),
  createShipment: (body: {
    warehouseId: string;
    targetWarehouseId?: string | null;
    aidAllocationPlanId?: string | null;
    vehicleId?: string | null;
    driverId?: string | null;
    emergencyCaseId?: string | null;
    items: Array<{ inventoryItemId: string; quantity: number }>;
  }) => postData<Shipment>("/api/shipments", body),
  updateShipmentStatus: (id: string, body: { status: string; trackingNote?: string }) =>
    putData<Shipment>(`/api/shipments/${id}/status`, body),
  categories: () => getData<Category[]>("/api/categories"),
};
