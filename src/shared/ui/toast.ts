import { create } from "zustand";

interface ToastState {
  message: string;
  severity: "success" | "info" | "warning" | "error";
  open: boolean;
  showToast: (message: string, severity?: ToastState["severity"]) => void;
  closeToast: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: "",
  severity: "info",
  open: false,
  showToast: (message, severity = "info") => set({ message, severity, open: true }),
  closeToast: () => set({ open: false }),
}));
