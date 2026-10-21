export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
  user: {
    idUser: number;
    username: string;
    name: string;
    lastname: string;
    role: 'ADMIN' | 'SELLER';
  };
}
