export const ROLES = {
  admin: "ADMIN",
  coordinator: "COORDINATOR",
  rescueTeam: "RESCUE_TEAM",
  financialOfficer: "FINANCIAL_OFFICER",
  volunteer: "VOLUNTEER",
  citizen: "CITIZEN",
  donor: "DONOR",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Quản trị viên",
  COORDINATOR: "Điều phối viên",
  RESCUE_TEAM: "Đội cứu hộ",
  FINANCIAL_OFFICER: "Nhân sự tài chính",
  VOLUNTEER: "Tình nguyện viên",
  CITIZEN: "Người dân",
  DONOR: "Nhà hảo tâm",
};

export const ROLE_IDS: Record<Role, number> = {
  CITIZEN: 1,
  RESCUE_TEAM: 2,
  COORDINATOR: 3,
  ADMIN: 4,
  DONOR: 5,
  FINANCIAL_OFFICER: 6,
  VOLUNTEER: 7,
};
