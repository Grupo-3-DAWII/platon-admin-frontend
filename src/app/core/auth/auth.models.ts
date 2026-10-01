export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  authenticated: boolean;
  user?: AuthUser;
  accessToken?: string;
  tokenType?: string;
}
