import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store";
import { ROLES } from "@/shared/constants/roles";

export function DashboardIndexPage() {
  const roles = useAuthStore((state) => state.roles);

  if (roles.includes(ROLES.rescueTeam)) return <Navigate to="/team/missions" replace />;
  if (roles.includes(ROLES.admin) || roles.includes(ROLES.coordinator) || roles.includes(ROLES.financialOfficer)) {
    return <Navigate to="/ops" replace />;
  }
  if (roles.includes(ROLES.donor)) return <Navigate to="/donor/donations" replace />;

  return <Navigate to="/citizen/sos" replace />;
}
