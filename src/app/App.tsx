import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/app/layouts/DashboardLayout";
import { MainLayout } from "@/app/layouts/MainLayout";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { AppProviders } from "@/app/providers";
import { DashboardIndexPage } from "@/app/pages/DashboardIndexPage";
import { LandingPage } from "@/app/pages/LandingPage";
import { NotFoundPage } from "@/app/pages/NotFoundPage";
import {
  AllocationPlansPage,
  AreaAssessmentsPage,
  AuditLogsPage,
  CampaignAdminPage,
  ComplaintsPage,
  DisbursementsPage,
  FraudPage,
  InventoryPage,
  OpsDashboardPage,
  OpsMissionsPage,
  OpsSosPage,
  OrganizationsPage,
  ProcurementPage,
  ShipmentsPage,
  UsersPage,
  VehiclesPage,
  VolunteersPage,
  WarehousesPage,
} from "@/features/admin/pages/OpsPages";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProfilePage } from "@/features/auth/pages/ProfilePage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { CampaignDetailPage } from "@/features/donations/pages/CampaignDetailPage";
import { CampaignListPage } from "@/features/donations/pages/CampaignListPage";
import { DonatePage } from "@/features/donations/pages/DonatePage";
import { DonationHistoryPage } from "@/features/donations/pages/DonationHistoryPage";
import { PaymentResultPage } from "@/features/donations/pages/PaymentResultPage";
import { SheltersPage } from "@/features/missions/pages/SheltersPage";
import { CitizenComplaintsPage } from "@/features/monitoring/pages/CitizenComplaintsPage";
import { NotificationsPage } from "@/features/notifications/pages/NotificationsPage";
import {
  TeamAreaAssessmentsPage,
  TeamMissionDetailPage,
  TeamMissionsPage,
  TeamProfilePage,
  TeamProofsPage,
  TeamShipmentsPage,
} from "@/features/rescue-team/pages/TeamPages";
import { CitizenSosPage } from "@/features/sos/pages/CitizenSosPage";
import { CreateSosPage } from "@/features/sos/pages/CreateSosPage";
import { SosDetailPage } from "@/features/sos/pages/SosDetailPage";
import { PublicReliefMapPage } from "@/features/transparency/pages/PublicReliefMapPage";
import { TransparencyPage } from "@/features/transparency/pages/TransparencyPage";
import { VolunteerProfilePage } from "@/features/volunteers/pages/VolunteerProfilePage";
import { ROLES } from "@/shared/constants/roles";

const citizenRoles = [ROLES.citizen, ROLES.volunteer];
const donorRoles = [ROLES.donor, ROLES.citizen, ROLES.volunteer, ROLES.coordinator, ROLES.admin];
const financialRoleAliases = [ROLES.financialOfficer, "FINANCE", "FINANCIAL", "ACCOUNTANT", "ACCOUNTING", "KE_TOAN", "KETOAN"];
const complaintRoles = [ROLES.citizen];
const opsRoles = [ROLES.admin, ROLES.coordinator, ...financialRoleAliases];
const coordinatorRoles = [ROLES.admin, ROLES.coordinator];
const adminRoles = [ROLES.admin];
const financeRoles = [ROLES.admin, ROLES.coordinator, ...financialRoleAliases];
const teamRoles = [ROLES.rescueTeam];
const allRoles = Object.values(ROLES);

export function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="campaigns" element={<CampaignListPage />} />
            <Route path="campaigns/:id" element={<CampaignDetailPage />} />
            <Route path="campaign/:id" element={<CampaignDetailPage />} />
            <Route path="campaigns/:id/transparency" element={<TransparencyPage />} />
            <Route path="relief-map" element={<PublicReliefMapPage />} />
            <Route path="sos" element={<CreateSosPage />} />
            <Route path="sos/new" element={<CreateSosPage />} />
            <Route path="donor/donate/:campaignId" element={<DonatePage />} />
            <Route path="payment/result" element={<PaymentResultPage />} />
          </Route>

          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardIndexPage />} />
            <Route path="dashboard/profile" element={<ProfilePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="notifications" element={<NotificationsPage />} />

            <Route path="dashboard/sos" element={<ProtectedRoute roles={citizenRoles}><CitizenSosPage /></ProtectedRoute>} />
            <Route path="dashboard/donations" element={<ProtectedRoute roles={donorRoles}><DonationHistoryPage /></ProtectedRoute>} />
            <Route path="dashboard/operations" element={<ProtectedRoute roles={opsRoles}><OpsDashboardPage /></ProtectedRoute>} />
            <Route path="dashboard/campaigns" element={<ProtectedRoute roles={opsRoles}><CampaignAdminPage /></ProtectedRoute>} />
            <Route path="dashboard/sos-queue" element={<ProtectedRoute roles={coordinatorRoles}><OpsSosPage /></ProtectedRoute>} />
            <Route path="dashboard/missions" element={<ProtectedRoute roles={coordinatorRoles}><OpsMissionsPage /></ProtectedRoute>} />
            <Route path="dashboard/inventory" element={<ProtectedRoute roles={opsRoles}><InventoryPage /></ProtectedRoute>} />
            <Route path="dashboard/users" element={<ProtectedRoute roles={adminRoles}><UsersPage /></ProtectedRoute>} />

            <Route path="citizen/profile" element={<ProfilePage />} />
            <Route path="citizen/sos" element={<ProtectedRoute roles={citizenRoles}><CitizenSosPage /></ProtectedRoute>} />
            <Route path="citizen/sos/:id" element={<ProtectedRoute roles={[ROLES.citizen, ROLES.volunteer, ROLES.coordinator, ROLES.rescueTeam]}><SosDetailPage /></ProtectedRoute>} />
            <Route path="citizen/volunteer-profile" element={<ProtectedRoute roles={citizenRoles}><VolunteerProfilePage /></ProtectedRoute>} />
            <Route path="citizen/shelters" element={<ProtectedRoute roles={[ROLES.citizen, ROLES.coordinator, ROLES.admin]}><SheltersPage /></ProtectedRoute>} />
            <Route path="citizen/complaints" element={<ProtectedRoute roles={complaintRoles}><CitizenComplaintsPage /></ProtectedRoute>} />

            <Route path="donor/donations" element={<ProtectedRoute roles={donorRoles}><DonationHistoryPage /></ProtectedRoute>} />
            <Route path="donor/campaigns" element={<ProtectedRoute roles={donorRoles}><CampaignListPage /></ProtectedRoute>} />

            <Route path="ops" element={<ProtectedRoute roles={opsRoles}><OpsDashboardPage /></ProtectedRoute>} />
            <Route path="ops/sos" element={<ProtectedRoute roles={coordinatorRoles}><OpsSosPage /></ProtectedRoute>} />
            <Route path="ops/missions" element={<ProtectedRoute roles={coordinatorRoles}><OpsMissionsPage /></ProtectedRoute>} />
            <Route path="ops/warehouses" element={<ProtectedRoute roles={opsRoles}><WarehousesPage /></ProtectedRoute>} />
            <Route path="ops/vehicles" element={<ProtectedRoute roles={adminRoles}><VehiclesPage /></ProtectedRoute>} />
            <Route path="ops/inventory" element={<ProtectedRoute roles={opsRoles}><InventoryPage /></ProtectedRoute>} />
            <Route path="ops/shipments" element={<ProtectedRoute roles={opsRoles}><ShipmentsPage /></ProtectedRoute>} />
            <Route path="ops/area-assessments" element={<ProtectedRoute roles={coordinatorRoles}><AreaAssessmentsPage /></ProtectedRoute>} />
            <Route path="ops/campaigns" element={<ProtectedRoute roles={opsRoles}><CampaignAdminPage /></ProtectedRoute>} />
            <Route path="ops/procurements" element={<ProtectedRoute roles={financeRoles}><ProcurementPage /></ProtectedRoute>} />
            <Route path="ops/allocation-plans" element={<ProtectedRoute roles={financeRoles}><AllocationPlansPage /></ProtectedRoute>} />
            <Route path="ops/disbursements" element={<ProtectedRoute roles={financeRoles}><DisbursementsPage /></ProtectedRoute>} />
            <Route path="ops/volunteers" element={<ProtectedRoute roles={coordinatorRoles}><VolunteersPage /></ProtectedRoute>} />
            <Route path="ops/organizations" element={<ProtectedRoute roles={adminRoles}><OrganizationsPage /></ProtectedRoute>} />
            <Route path="organizations" element={<ProtectedRoute><OrganizationsPage /></ProtectedRoute>} />
            <Route path="ops/users" element={<ProtectedRoute roles={adminRoles}><UsersPage /></ProtectedRoute>} />
            <Route path="ops/complaints" element={<ProtectedRoute roles={adminRoles}><ComplaintsPage /></ProtectedRoute>} />
            <Route path="ops/fraud" element={<ProtectedRoute roles={adminRoles}><FraudPage /></ProtectedRoute>} />
            <Route path="ops/audit-logs" element={<ProtectedRoute roles={adminRoles}><AuditLogsPage /></ProtectedRoute>} />

            <Route path="team/missions" element={<ProtectedRoute roles={teamRoles}><TeamMissionsPage /></ProtectedRoute>} />
            <Route path="team/missions/:id" element={<ProtectedRoute roles={teamRoles}><TeamMissionDetailPage /></ProtectedRoute>} />
            <Route path="team/shipments" element={<ProtectedRoute roles={teamRoles}><TeamShipmentsPage /></ProtectedRoute>} />
            <Route path="team/area-assessments" element={<ProtectedRoute roles={teamRoles}><TeamAreaAssessmentsPage /></ProtectedRoute>} />
            <Route path="team/proofs" element={<ProtectedRoute roles={teamRoles}><TeamProofsPage /></ProtectedRoute>} />
            <Route path="team/my-team" element={<ProtectedRoute roles={teamRoles}><TeamProfilePage /></ProtectedRoute>} />
          </Route>

          <Route element={<MainLayout />}>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}
