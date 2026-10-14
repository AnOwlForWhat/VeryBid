import { apiClient } from "@/lib/apiClient";

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  userId: string;
  email: string;
  fullName: string;
  role: "ROLE_BIDDER" | "ROLE_SELLER" | "ROLE_ADMIN";
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: AuthResponse["role"];
  balance: number;
  reputationScore: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string>;
  timestamp: string;
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/api/v1/auth/register",
      data
    );
    return response.data;
  },

  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/api/v1/auth/login",
      data
    );
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>(
      "/api/v1/auth/me"
    );
    return response.data;
  },
};
