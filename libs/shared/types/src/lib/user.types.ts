import { Role } from '@prisma/client';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  universityId: string;
  universityName?: string;
  branch?: string;
  batch?: number;
  role: Role;
}

// Re-export Prisma enums for frontend use
export { Role };