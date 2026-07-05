import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Alert, Box, Button, Grid, MenuItem, Paper, Stack, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminApi } from "@/features/admin/api";
import { aidApi } from "@/features/aid/api";
import { donationApi } from "@/features/donations/api";
import { inventoryApi } from "@/features/inventory/api";
import { missionApi } from "@/features/missions/api";
import { monitoringApi } from "@/features/monitoring/api";
import { organizationApi } from "@/features/organizations/api";
import { sosApi } from "@/features/sos/api";
import { volunteerApi } from "@/features/volunteers/api";
import { ROLE_IDS, ROLE_LABELS, ROLES } from "@/shared/constants/roles";
import { CAMPAIGN_STATUS, MISSION_STATUS, PRIORITY, SHIPMENT_STATUS, SOS_STATUS } from "@/shared/constants/statuses";
import { formatDate, formatMoney } from "@/shared/utils/format";
import { MetricCard } from "@/shared/ui/MetricCard";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { SectionPaper } from "@/shared/ui/SectionPaper";
import { StatusChip } from "@/shared/ui/StatusChip";
import { useToast } from "@/shared/ui/toast";

export function OpsDashboardPage() {
  const dashboard = useQuery({ queryKey: ["dashboard-summary"], queryFn: adminApi.dashboard, refetchInterval: 60000 });
  return (
    <>
      <PageHeader title="Operations Dashboard" description="Role-filtered operational health pulled from `/api/dashboard/summary`." />
      <QueryState isLoading={dashboard.isLoading} error={dashboard.error} refetch={dashboard.refetch}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}><MetricCard label="Active campaigns" value={dashboard.data?.activeCampaigns} /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><MetricCard label="Total donations" value={formatMoney(dashboard.data?.totalDonations)} tone="green" /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><MetricCard label="Pending SOS" value={dashboard.data?.pendingRequests} tone="orange" /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><MetricCard label="Active missions" value={dashboard.data?.activeMissions} /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><MetricCard label="Warehouses" value={dashboard.data?.totalWarehouses} tone="neutral" /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><MetricCard label="Low stock items" value={dashboard.data?.lowStockItems} tone="red" /></Grid>
        </Grid>
      </QueryState>
    </>
  );
}

export function OpsSosPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const [status, setStatus] = useState("");
  const cases = useQuery({ queryKey: ["ops-sos", status], queryFn: () => sosApi.coordinatorList({ status, page: 1, limit: 50 }), refetchInterval: 30000 });
  const verify = useMutation({
    mutationFn: ({ id, result }: { id: string; result: "APPROVED" | "REJECTED" }) => sosApi.verify(id, { result }),
    onSuccess: () => {
      showToast("SOS verification updated.", "success");
      queryClient.invalidateQueries({ queryKey: ["ops-sos"] });
    },
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) => sosApi.updateStatus(id, { status: next }),
    onSuccess: () => {
      showToast("SOS status updated.", "success");
      queryClient.invalidateQueries({ queryKey: ["ops-sos"] });
    },
  });

  return (
    <>
      <PageHeader title="SOS Management" description="Verify emergency requests and move cases through the backend state machine." />
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField select label="Status" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 220 }}>
          <MenuItem value="">All</MenuItem>
          {Object.values(SOS_STATUS).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
      </Stack>
      <QueryState isLoading={cases.isLoading} error={cases.error} empty={!cases.data?.data.length} refetch={cases.refetch}>
        <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Case</TableCell><TableCell>People</TableCell><TableCell>Priority</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead><TableBody>
          {cases.data?.data.map((item) => (
            <TableRow key={item.id}>
              <TableCell><Typography fontWeight={800}>{item.title}</Typography><Typography variant="body2" color="text.secondary">{item.contactName} - {item.contactPhone}</Typography></TableCell>
              <TableCell>{item.numPeople}</TableCell>
              <TableCell><StatusChip value={item.priorityLevel} /></TableCell>
              <TableCell><StatusChip value={item.status} /></TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  {item.status === SOS_STATUS.pending ? (
                    <>
                      <Button size="small" startIcon={<CheckIcon />} onClick={() => verify.mutate({ id: item.id, result: "APPROVED" })}>Verify</Button>
                      <Button size="small" color="error" startIcon={<CloseIcon />} onClick={() => verify.mutate({ id: item.id, result: "REJECTED" })}>Reject</Button>
                    </>
                  ) : null}
                  {item.status === SOS_STATUS.verified ? <Button size="small" onClick={() => updateStatus.mutate({ id: item.id, next: SOS_STATUS.assigned })}>Mark assigned</Button> : null}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody></Table></Paper>
      </QueryState>
    </>
  );
}

export function OpsMissionsPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const [form, setForm] = useState<{ emergencyCaseId: string; rescueTeamId: string; priority: string; title: string }>({
    emergencyCaseId: "",
    rescueTeamId: "",
    priority: PRIORITY.high,
    title: "",
  });
  const missions = useQuery({ queryKey: ["ops-missions"], queryFn: () => missionApi.coordinatorList({ page: 1, limit: 50 }), refetchInterval: 30000 });
  const teams = useQuery({ queryKey: ["rescue-teams"], queryFn: () => missionApi.rescueTeams({ page: 1, limit: 50 }) });
  const create = useMutation({
    mutationFn: () => missionApi.create({ ...form, vehicleIds: [] }),
    onSuccess: () => {
      showToast("Mission created.", "success");
      setForm({ emergencyCaseId: "", rescueTeamId: "", priority: PRIORITY.high, title: "" });
      queryClient.invalidateQueries({ queryKey: ["ops-missions"] });
    },
  });

  return (
    <>
      <PageHeader title="Mission Assignment" description="Create rescue missions from verified SOS cases and monitor mission progress." />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionPaper>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={900}>Assign mission</Typography>
              <TextField label="Emergency case ID" value={form.emergencyCaseId} onChange={(e) => setForm({ ...form, emergencyCaseId: e.target.value })} />
              <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <TextField select label="Rescue team" value={form.rescueTeamId} onChange={(e) => setForm({ ...form, rescueTeamId: e.target.value })}>
                <MenuItem value="" disabled>{teams.isLoading ? "Loading rescue teams..." : "Select rescue team"}</MenuItem>
                {(teams.data?.data ?? []).map((team) => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>)}
              </TextField>
              <TextField select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {Object.values(PRIORITY).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <Button variant="contained" startIcon={<AddIcon />} disabled={!form.emergencyCaseId || !form.rescueTeamId || create.isPending} onClick={() => create.mutate()}>
                Create mission
              </Button>
            </Stack>
          </SectionPaper>
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <QueryState isLoading={missions.isLoading} error={missions.error} empty={!missions.data?.data.length} refetch={missions.refetch}>
            <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Mission</TableCell><TableCell>Team</TableCell><TableCell>Priority</TableCell><TableCell>Status</TableCell><TableCell>Updated</TableCell></TableRow></TableHead><TableBody>
              {missions.data?.data.map((mission) => (
                <TableRow key={mission.id}>
                  <TableCell>{mission.code}</TableCell>
                  <TableCell>{mission.rescueTeamName}</TableCell>
                  <TableCell><StatusChip value={mission.priority} /></TableCell>
                  <TableCell><StatusChip value={mission.status} /></TableCell>
                  <TableCell>{formatDate(mission.completedAt ?? mission.assignedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody></Table></Paper>
          </QueryState>
        </Grid>
      </Grid>
    </>
  );
}

export function WarehousesPage() {
  const warehouses = useQuery({ queryKey: ["warehouses"], queryFn: inventoryApi.warehouses });
  const lowStock = useQuery({ queryKey: ["low-stock"], queryFn: inventoryApi.lowStock });
  return (
    <>
      <PageHeader title="Warehouse & Inventory" description="Monitor warehouse coverage and low-stock risks." />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}><MetricCard label="Warehouses" value={warehouses.data?.length ?? 0} /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><MetricCard label="Low stock" value={lowStock.data?.length ?? 0} tone="red" /></Grid>
        <Grid size={{ xs: 12 }}><QueryState isLoading={warehouses.isLoading} error={warehouses.error} empty={!warehouses.data?.length} refetch={warehouses.refetch}>
          <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Address</TableCell><TableCell>Manager</TableCell><TableCell>Status</TableCell></TableRow></TableHead><TableBody>
            {warehouses.data?.map((warehouse) => (
              <TableRow key={warehouse.id}><TableCell>{warehouse.name}</TableCell><TableCell>{warehouse.address}</TableCell><TableCell>{warehouse.managerName}</TableCell><TableCell><StatusChip value={warehouse.status} /></TableCell></TableRow>
            ))}
          </TableBody></Table></Paper>
        </QueryState></Grid>
      </Grid>
    </>
  );
}

export function InventoryPage() {
  const warehouses = useQuery({ queryKey: ["warehouses"], queryFn: inventoryApi.warehouses });
  const [warehouseId, setWarehouseId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const selectedId = warehouseId || warehouses.data?.[0]?.id || "";
  const items = useQuery({ queryKey: ["warehouse-items", selectedId], queryFn: () => inventoryApi.warehouseItems(selectedId, { page: 1, limit: 50 }), enabled: Boolean(selectedId) });
  const selectedItem = items.data?.data.find((item) => item.id === selectedItemId) ?? items.data?.data[0];
  return (
    <>
      <PageHeader title="Inventory Items" description="Inspect stock, reservation, and low stock thresholds by warehouse." />
      <Stack spacing={2}>
        <TextField select label="Warehouse" value={selectedId} onChange={(event) => setWarehouseId(event.target.value)} sx={{ maxWidth: 420 }}>
          <MenuItem value="" disabled>{warehouses.isLoading ? "Loading warehouses..." : "Select warehouse"}</MenuItem>
          {(warehouses.data ?? []).map((warehouse) => <MenuItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</MenuItem>)}
        </TextField>
        <QueryState isLoading={items.isLoading} error={items.error} empty={!items.data?.data.length} refetch={items.refetch}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Item</TableCell><TableCell>Quantity</TableCell><TableCell>Reserved</TableCell><TableCell>Minimum</TableCell><TableCell>Status</TableCell></TableRow></TableHead><TableBody>
                {items.data?.data.map((item) => (
                  <TableRow key={item.id} hover selected={selectedItem?.id === item.id} onClick={() => setSelectedItemId(item.id)} sx={{ cursor: "pointer" }}><TableCell>{item.itemName}</TableCell><TableCell>{item.quantity} {item.unit}</TableCell><TableCell>{item.reservedQuantity}</TableCell><TableCell>{item.minQuantity}</TableCell><TableCell><StatusChip value={item.status} /></TableCell></TableRow>
                ))}
              </TableBody></Table></Paper>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <SectionPaper>
                <Stack spacing={1.5}>
                  <Typography variant="h6" fontWeight={900}>{selectedItem?.itemName ?? "Item detail"}</Typography>
                  {selectedItem ? (
                    <>
                      <StatusChip value={selectedItem.status} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Warehouse</Typography>
                        <Typography fontWeight={800}>{selectedItem.warehouseName}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Category</Typography>
                        <Typography fontWeight={800}>{selectedItem.categoryName ?? "Uncategorized"}</Typography>
                      </Box>
                      <Grid container spacing={1.5}>
                        <Grid size={6}>
                          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1.5 }}>
                            <Typography variant="caption" color="text.secondary">Available</Typography>
                            <Typography fontWeight={900}>{selectedItem.quantity} {selectedItem.unit}</Typography>
                          </Box>
                        </Grid>
                        <Grid size={6}>
                          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1.5 }}>
                            <Typography variant="caption" color="text.secondary">Reserved</Typography>
                            <Typography fontWeight={900}>{selectedItem.reservedQuantity}</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      <Typography variant="body2" color="text.secondary">Minimum stock: {selectedItem.minQuantity} {selectedItem.unit}</Typography>
                      <Typography variant="body2" color="text.secondary">Expiry: {selectedItem.expiryDate ? formatDate(selectedItem.expiryDate) : "No expiry date"}</Typography>
                    </>
                  ) : (
                    <Typography color="text.secondary">Select an item to inspect stock details.</Typography>
                  )}
                </Stack>
              </SectionPaper>
            </Grid>
          </Grid>
        </QueryState>
      </Stack>
    </>
  );
}

export function ShipmentsPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const [status, setStatus] = useState("");
  const shipments = useQuery({ queryKey: ["shipments", status], queryFn: () => inventoryApi.shipments({ status, page: 1, limit: 50 }), refetchInterval: 30000 });
  const update = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) => inventoryApi.updateShipmentStatus(id, { status: next }),
    onSuccess: () => {
      showToast("Shipment status updated.", "success");
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
  });
  return (
    <>
      <PageHeader title="Shipment Management" description="Track delivery and update shipment status through the backend logistics state machine." />
      <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 220, mb: 2 }}>
        <MenuItem value="">All</MenuItem>{Object.values(SHIPMENT_STATUS).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
      </TextField>
      <QueryState isLoading={shipments.isLoading} error={shipments.error} empty={!shipments.data?.data.length} refetch={shipments.refetch}>
        <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Shipment</TableCell><TableCell>From</TableCell><TableCell>Driver</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead><TableBody>
          {shipments.data?.data.map((shipment) => (
            <TableRow key={shipment.id}><TableCell>{shipment.emergencyCaseTitle ?? shipment.id}</TableCell><TableCell>{shipment.warehouseName}</TableCell><TableCell>{shipment.driverName}</TableCell><TableCell><StatusChip value={shipment.status} /></TableCell><TableCell>
              <Stack direction="row" spacing={1}>
                {Object.values(SHIPMENT_STATUS).map((next) => <Button key={next} size="small" disabled={shipment.status === next || update.isPending} onClick={() => update.mutate({ id: shipment.id, next })}>{next}</Button>)}
              </Stack>
            </TableCell></TableRow>
          ))}
        </TableBody></Table></Paper>
      </QueryState>
    </>
  );
}

export function CampaignAdminPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const campaigns = useQuery({ queryKey: ["campaigns-admin"], queryFn: () => donationApi.campaigns({ page: 1, limit: 50 }) });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => donationApi.updateCampaignStatus(id, status),
    onSuccess: () => {
      showToast("Campaign status updated.", "success");
      queryClient.invalidateQueries({ queryKey: ["campaigns-admin"] });
    },
  });

  return (
    <>
      <PageHeader title="Campaign Administration" description="Review campaign status and public donation progress." />
      <QueryState isLoading={campaigns.isLoading} error={campaigns.error} empty={!campaigns.data?.data.length} refetch={campaigns.refetch}>
        <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Raised</TableCell><TableCell>Target</TableCell><TableCell>Status</TableCell><TableCell>Area</TableCell><TableCell>Actions</TableCell></TableRow></TableHead><TableBody>
          {campaigns.data?.data.map((campaign) => <TableRow key={campaign.id}><TableCell>{campaign.name}</TableCell><TableCell>{formatMoney(campaign.currentAmount)}</TableCell><TableCell>{formatMoney(campaign.targetAmount)}</TableCell><TableCell><StatusChip value={campaign.status} /></TableCell><TableCell>{campaign.affectedArea}</TableCell><TableCell><Stack direction="row" spacing={1}><Button size="small" disabled={campaign.status === CAMPAIGN_STATUS.active || updateStatus.isPending} onClick={() => updateStatus.mutate({ id: campaign.id, status: CAMPAIGN_STATUS.active })}>Activate</Button><Button size="small" disabled={campaign.status === CAMPAIGN_STATUS.paused || updateStatus.isPending} onClick={() => updateStatus.mutate({ id: campaign.id, status: CAMPAIGN_STATUS.paused })}>Pause</Button><Button size="small" color="error" disabled={campaign.status === CAMPAIGN_STATUS.closed || updateStatus.isPending} onClick={() => updateStatus.mutate({ id: campaign.id, status: CAMPAIGN_STATUS.closed })}>Close</Button></Stack></TableCell></TableRow>)}
        </TableBody></Table></Paper>
      </QueryState>
    </>
  );
}

export function ProcurementPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const procurements = useQuery({ queryKey: ["procurements"], queryFn: () => aidApi.procurements({ page: 1, limit: 50 }) });
  const action = useMutation({
    mutationFn: ({ id, type }: { id: string; type: "approve" | "pay" | "deliver" }) =>
      type === "approve" ? aidApi.approveProcurement(id) : type === "pay" ? aidApi.payProcurement(id, "BANK_TRANSFER") : aidApi.deliverProcurement(id),
    onSuccess: () => {
      showToast("Procurement updated.", "success");
      queryClient.invalidateQueries({ queryKey: ["procurements"] });
    },
  });
  return <WorkflowTable title="Procurements" rows={procurements.data?.data ?? []} loading={procurements.isLoading} error={procurements.error} refetch={procurements.refetch} actions={(row) => (
    <Stack direction="row" spacing={1}><Button size="small" onClick={() => action.mutate({ id: row.id, type: "approve" })}>Approve</Button><Button size="small" onClick={() => action.mutate({ id: row.id, type: "pay" })}>Pay</Button><Button size="small" onClick={() => action.mutate({ id: row.id, type: "deliver" })}>Deliver</Button></Stack>
  )} />;
}

export function AllocationPlansPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const plans = useQuery({ queryKey: ["allocation-plans"], queryFn: () => aidApi.allocationPlans({ page: 1, limit: 50 }) });
  const action = useMutation({
    mutationFn: ({ id, type }: { id: string; type: "submit" | "approve" | "close" }) =>
      type === "submit" ? aidApi.submitAllocationPlan(id) : type === "approve" ? aidApi.approveAllocationPlan(id, { status: "APPROVED" }) : aidApi.closeAllocationPlan(id),
    onSuccess: () => {
      showToast("Allocation plan updated.", "success");
      queryClient.invalidateQueries({ queryKey: ["allocation-plans"] });
    },
  });
  return <WorkflowTable title="Allocation Plans" rows={plans.data?.data ?? []} loading={plans.isLoading} error={plans.error} refetch={plans.refetch} actions={(row) => (
    <Stack direction="row" spacing={1}><Button size="small" onClick={() => action.mutate({ id: row.id, type: "submit" })}>Submit</Button><Button size="small" onClick={() => action.mutate({ id: row.id, type: "approve" })}>Approve</Button><Button size="small" onClick={() => action.mutate({ id: row.id, type: "close" })}>Close</Button></Stack>
  )} />;
}

export function DisbursementsPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const rows = useQuery({ queryKey: ["disbursements"], queryFn: () => aidApi.disbursements({ page: 1, limit: 50 }) });
  const execute = useMutation({
    mutationFn: (id: string) => aidApi.executeDisbursement(id, { invoiceUrl: "https://example.com/invoice-placeholder.png", actualAmount: 0 }),
    onSuccess: () => {
      showToast("Disbursement execution submitted.", "success");
      queryClient.invalidateQueries({ queryKey: ["disbursements"] });
    },
  });
  return <WorkflowTable title="Disbursements" rows={rows.data?.data ?? []} loading={rows.isLoading} error={rows.error} refetch={rows.refetch} actions={(row) => <Button size="small" onClick={() => execute.mutate(row.id)}>Execute</Button>} />;
}

interface WorkflowRow {
  id: string;
  campaignName?: string | null;
  areaName?: string | null;
  itemName?: string;
  totalAmount?: number;
  totalPlannedAmount?: number;
  amount?: number;
  status: string;
  createdAt: string;
}

function WorkflowTable({ title, rows, loading, error, refetch, actions }: { title: string; rows: WorkflowRow[]; loading: boolean; error: unknown; refetch: () => void; actions: (row: WorkflowRow) => React.ReactNode }) {
  return (
    <>
      <PageHeader title={title} description="Financial and aid workflow records backed by TamLu ERP endpoints." />
      <QueryState isLoading={loading} error={error} empty={!rows.length} refetch={refetch}>
        <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Record</TableCell><TableCell>Amount</TableCell><TableCell>Status</TableCell><TableCell>Created</TableCell><TableCell>Actions</TableCell></TableRow></TableHead><TableBody>
          {rows.map((row) => <TableRow key={row.id}><TableCell>{row.campaignName ?? row.areaName ?? row.itemName ?? row.id}</TableCell><TableCell>{formatMoney(row.totalAmount ?? row.totalPlannedAmount ?? row.amount ?? 0)}</TableCell><TableCell><StatusChip value={row.status} /></TableCell><TableCell>{formatDate(row.createdAt)}</TableCell><TableCell>{actions(row)}</TableCell></TableRow>)}
        </TableBody></Table></Paper>
      </QueryState>
    </>
  );
}

export function UsersPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const [role, setRole] = useState("");
  const users = useQuery({ queryKey: ["admin-users", role], queryFn: () => adminApi.users({ role, page: 1, limit: 50 }) });
  const approve = useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) => adminApi.approveUser(id, isApproved),
    onSuccess: () => {
      showToast("User approval updated.", "success");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
  return (
    <>
      <PageHeader title="User Management" description="Approve operational accounts and inspect role access." />
      <TextField select label="Role" value={role} onChange={(e) => setRole(e.target.value)} sx={{ minWidth: 240, mb: 2 }}>
        <MenuItem value="">All</MenuItem>{Object.values(ROLES).map((item) => <MenuItem key={item} value={item}>{ROLE_LABELS[item]}</MenuItem>)}
      </TextField>
      <QueryState isLoading={users.isLoading} error={users.error} empty={!users.data?.data.length} refetch={users.refetch}>
        <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Phone</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead><TableBody>
          {users.data?.data.map((user) => <TableRow key={user.id}><TableCell>{user.fullName}</TableCell><TableCell>{user.email}</TableCell><TableCell>{user.phone}</TableCell><TableCell><StatusChip value={user.status} /></TableCell><TableCell><Stack direction="row" spacing={1}><Button size="small" onClick={() => approve.mutate({ id: user.id, isApproved: true })}>Approve</Button><Button size="small" color="error" onClick={() => approve.mutate({ id: user.id, isApproved: false })}>Reject</Button></Stack></TableCell></TableRow>)}
        </TableBody></Table></Paper>
      </QueryState>
      <Alert severity="info" sx={{ mt: 2 }}>Role IDs: {Object.entries(ROLE_IDS).map(([key, value]) => `${key}=${value}`).join(", ")}</Alert>
    </>
  );
}

export function VolunteersPage() {
  const rows = useQuery({ queryKey: ["volunteers"], queryFn: () => volunteerApi.coordinatorList({ page: 1, limit: 50 }) });
  return <SimpleObjectList title="Volunteers" query={rows} primaryKey="skills" />;
}

export function OrganizationsPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const rows = useQuery({ queryKey: ["organizations"], queryFn: organizationApi.list });
  const list = Array.isArray(rows.data) ? rows.data : rows.data?.data;
  const verify = useMutation({
    mutationFn: ({ id, isVerified }: { id: string; isVerified: boolean }) => organizationApi.verify(id, isVerified),
    onSuccess: () => {
      showToast("Organization verification updated.", "success");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  return (
    <>
      <PageHeader title="Organizations" description="Review partner organizations and verification status." />
      <QueryState isLoading={rows.isLoading} error={rows.error} empty={!list?.length} refetch={rows.refetch}>
        <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Type</TableCell><TableCell>Trust</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead><TableBody>
          {(list ?? []).map((org) => <TableRow key={org.id}><TableCell>{org.name}</TableCell><TableCell>{org.type}</TableCell><TableCell>{org.trustScore}</TableCell><TableCell><Stack direction="row" spacing={1}><StatusChip value={org.status} /><StatusChip value={org.isVerified ? "VERIFIED" : "PENDING"} /></Stack></TableCell><TableCell><Stack direction="row" spacing={1}><Button size="small" disabled={verify.isPending || org.isVerified} onClick={() => verify.mutate({ id: org.id, isVerified: true })}>Approve</Button><Button size="small" color="error" disabled={verify.isPending || !org.isVerified} onClick={() => verify.mutate({ id: org.id, isVerified: false })}>Reject</Button></Stack></TableCell></TableRow>)}
        </TableBody></Table></Paper>
      </QueryState>
    </>
  );
}

export function ComplaintsPage() {
  const rows = useQuery({ queryKey: ["admin-complaints"], queryFn: () => monitoringApi.adminComplaints({ page: 1, limit: 50 }) });
  return <SimpleObjectList title="Complaints" query={rows} primaryKey="title" />;
}

export function FraudPage() {
  const rows = useQuery({ queryKey: ["fraud-cases"], queryFn: () => monitoringApi.fraudCases({ page: 1, limit: 50 }) });
  return <SimpleObjectList title="Fraud Cases" query={rows} primaryKey="description" />;
}

export function AuditLogsPage() {
  const rows = useQuery({ queryKey: ["audit-logs"], queryFn: () => adminApi.auditLogs({ page: 1, limit: 50 }) });
  return <SimpleObjectList title="Audit Logs" query={rows} primaryKey="action" />;
}

function SimpleObjectList({ title, query, primaryKey }: { title: string; query: { isLoading: boolean; error: unknown; data?: { data: unknown[] }; refetch: () => void }; primaryKey: string }) {
  return <SimpleStaticList title={title} rows={query.data?.data ?? []} loading={query.isLoading} error={query.error} refetch={query.refetch} primaryKey={primaryKey} />;
}

function SimpleStaticList({ title, rows, loading = false, error, refetch, primaryKey = "name" }: { title: string; rows: unknown[]; loading?: boolean; error?: unknown; refetch?: () => void; primaryKey?: string }) {
  return (
    <>
      <PageHeader title={title} description="Operational records from the corresponding backend module." />
      <QueryState isLoading={loading} error={error} empty={!rows.length} refetch={refetch}>
        <Grid container spacing={2}>
          {rows.map((row, index) => {
            const record = row as Record<string, unknown>;
            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={String(record.id ?? index)}>
                <SectionPaper>
                  <Stack spacing={1}>
                    <Typography fontWeight={900}>{String(record[primaryKey] ?? record.name ?? record.id ?? "Record")}</Typography>
                    {record.status ? <StatusChip value={String(record.status)} /> : null}
                    <Typography variant="body2" color="text.secondary">{String(record.email ?? record.description ?? record.notes ?? "")}</Typography>
                  </Stack>
                </SectionPaper>
              </Grid>
            );
          })}
        </Grid>
      </QueryState>
    </>
  );
}
