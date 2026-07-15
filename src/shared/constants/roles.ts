export const ROLES = {
  admin: "ADMIN",
  coordinator: "COORDINATOR",
  rescueTeam: "RESCUE_TEAM",
  financialOfficer: "FINANCIAL_OFFICER",
  citizen: "CITIZEN",
  donor: "DONOR",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  COORDINATOR: "Coordinator",
  RESCUE_TEAM: "Rescue Team",
  FINANCIAL_OFFICER: "Financial Officer",
  CITIZEN: "Citizen",
  DONOR: "Donor",
};

export const ROLE_IDS: Record<Role, number> = {
  CITIZEN: 1,
  RESCUE_TEAM: 2,
  COORDINATOR: 3,
  ADMIN: 4,
  DONOR: 5,
  FINANCIAL_OFFICER: 6,
};
