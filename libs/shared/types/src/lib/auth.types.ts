import { AccountStatus, Role } from '@prisma/client';

// What the CLIENT sends to the SERVER
export interface RegisterDto {
  email: string;
  password: string;
  username: string;
  fullName: string;
  branch?: string;
  batch?: number;
  rollNumber?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// What the SERVER sends back to the CLIENT
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: Role;
  status: AccountStatus;
  universityId: string;
  emailVerified: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

// Internal JWT structure - decoded from tokens
export interface JwtPayload {
  sub: string;         // User ID
  email: string;
  role: Role;
  universityId: string;
  sessionId: string;
}

// Re-export enums
export { AccountStatus };