import { UserRole } from '../../common/interfaces/auth-context.interface';

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notificationsEnabled?: boolean;
  emailDigest?: boolean;
  language?: string;
  [key: string]: any;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  contactNumber?: string;
  profileImageUrl?: string;
  role: UserRole;
  schoolId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  passwordHash: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
  lastPasswordChangeAt?: string;
}

// Sanitized public user profile (NEVER contains passwordHash)
export type PublicUserProfile = Omit<UserAccount, 'passwordHash'>;

export interface UpdateProfileInput {
  name?: string;
  contactNumber?: string;
  profileImageUrl?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
