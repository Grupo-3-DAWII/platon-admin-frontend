export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthSession {
  username: string;
  authorization: string;
}
