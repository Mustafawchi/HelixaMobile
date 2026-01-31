import type { User as FirebaseUser } from 'firebase/auth';

// --- Login Flow (OTP-based) ---

export interface SendLoginCodeRequest {
  email: string;
}

export interface SendLoginCodeResponse {
  success: boolean;
  message: string;
  twoFactorEnabled: boolean;
}

export interface VerifyLoginCodeRequest {
  email: string;
  code: string;
  twoFactorCode?: string;
}

export interface VerifyLoginCodeResponse {
  success: boolean;
  customToken: string;
  uid: string;
  message: string;
}

// --- Signup Flow ---

export interface SendSignupCodeRequest {
  email: string;
  firstName: string;
  lastName: string;
}

export interface SendSignupCodeResponse {
  success: boolean;
  message: string;
}

export interface VerifySignupCodeRequest {
  email: string;
  code: string;
  firstName: string;
  lastName: string;
}

export interface VerifySignupCodeResponse {
  success: boolean;
  customToken: string;
  uid: string;
  message: string;
}

// --- Auth State ---

export type AuthUser = FirebaseUser;

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
