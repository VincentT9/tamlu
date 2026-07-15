import dayjs from "dayjs";

export function formatMoney(value?: number | null) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
}

export function formatDate(value?: string | Date | null) {
  return value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "-";
}

export function percent(value?: number | null) {
  return `${Math.round(value ?? 0)}%`;
}

export function truncate(value?: string | null, length = 90) {
  if (!value) return "-";
  return value.length > length ? `${value.slice(0, length - 1)}...` : value;
}
