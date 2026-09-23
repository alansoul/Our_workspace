export enum Role {
  STUDENT = 'STUDENT',
  FACULTY = 'FACULTY',
  CLUB_HEAD = 'CLUB_HEAD',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

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

export interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}