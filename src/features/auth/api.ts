import { getData, postData, putData } from "@/shared/api/client";
import type { AuthResponse, User } from "@/shared/api/domain";

export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody extends LoginBody {
  fullName: string;
  phone: string;
  role?: string;
}

export const authApi = {
  login: (body: LoginBody) => postData<AuthResponse, LoginBody>("/api/auth/login", body),
  register: (body: RegisterBody) => postData<User, RegisterBody>("/api/auth/register", body),
  verifyOtp: (body: { email: string; otp: string }) => postData<AuthResponse>("/api/auth/verify-otp", body),
  resendOtp: (body: { email: string }) => postData<null>("/api/auth/resend-otp", body),
  me: () => getData<{ user: User; roles: string[] }>("/api/auth/me"),
  updateMe: (body: { fullName: string; phone: string; avatarUrl?: string | null }) =>
    putData<User>("/api/auth/me", body),
  changePassword: (body: { oldPassword: string; newPassword: string }) =>
    putData<null>("/api/auth/change-password", body),
  forgotPassword: (body: { email: string }) => postData<null>("/api/auth/forgot-password", body),
  resetPassword: (body: { email: string; otp: string; newPassword: string }) =>
    postData<null>("/api/auth/reset-password", body),
  logout: () => postData<null>("/api/auth/logout"),
};
