import bcrypt from 'bcryptjs';
import { UpdateProfileInput, UserAccount, UserPreferences } from './account.types';

export interface AccountRepository {
  findById(id: string): Promise<UserAccount | null>;
  findByEmail(email: string): Promise<UserAccount | null>;
  updateProfile(id: string, input: UpdateProfileInput): Promise<UserAccount | null>;
  updatePreferences(id: string, preferences: Partial<UserPreferences>): Promise<UserAccount | null>;
  updatePassword(id: string, newPasswordHash: string): Promise<UserAccount | null>;
  create(account: Omit<UserAccount, 'createdAt' | 'updatedAt'>): Promise<UserAccount>;
  reset(): void;
  seedDefaults(): void;
}

export class InMemoryAccountRepository implements AccountRepository {
  private accounts: Map<string, UserAccount> = new Map();

  constructor() {
    this.seedDefaults();
  }

  public reset(): void {
    this.accounts.clear();
    this.seedDefaults();
  }

  public seedDefaults(): void {
    const now = new Date().toISOString();
    const salt = bcrypt.genSaltSync(10);

    const defaultAccounts: Array<Omit<UserAccount, 'createdAt' | 'updatedAt'>> = [
      {
        id: 'usr-admin-01',
        email: 'admin@schoolerp.edu',
        name: 'System Administrator',
        contactNumber: '+1-555-0101',
        profileImageUrl: 'https://assets.schoolerp.edu/avatars/admin.png',
        role: 'ADMIN',
        schoolId: 'SCH-001',
        status: 'ACTIVE',
        passwordHash: bcrypt.hashSync('Admin123!', salt),
        preferences: {
          theme: 'system',
          notificationsEnabled: true,
          emailDigest: true,
          language: 'en'
        }
      },
      {
        id: 'usr-teacher-01',
        email: 'teacher@schoolerp.edu',
        name: 'Sarah Jenkins',
        contactNumber: '+1-555-0102',
        profileImageUrl: 'https://assets.schoolerp.edu/avatars/teacher.png',
        role: 'TEACHER',
        schoolId: 'SCH-001',
        status: 'ACTIVE',
        passwordHash: bcrypt.hashSync('Teacher123!', salt),
        preferences: {
          theme: 'light',
          notificationsEnabled: true,
          emailDigest: false,
          language: 'en'
        }
      },
      {
        id: 'usr-student-01',
        email: 'student@schoolerp.edu',
        name: 'Alex Johnson',
        contactNumber: '+1-555-0103',
        profileImageUrl: 'https://assets.schoolerp.edu/avatars/student.png',
        role: 'STUDENT',
        schoolId: 'SCH-001',
        status: 'ACTIVE',
        passwordHash: bcrypt.hashSync('Student123!', salt),
        preferences: {
          theme: 'dark',
          notificationsEnabled: true,
          emailDigest: false,
          language: 'en'
        }
      }
    ];

    for (const acc of defaultAccounts) {
      this.accounts.set(acc.id, {
        ...acc,
        createdAt: now,
        updatedAt: now
      });
    }
  }

  async findById(id: string): Promise<UserAccount | null> {
    const acc = this.accounts.get(id);
    return acc ? { ...acc, preferences: { ...acc.preferences } } : null;
  }

  async findByEmail(email: string): Promise<UserAccount | null> {
    for (const acc of this.accounts.values()) {
      if (acc.email.toLowerCase() === email.toLowerCase()) {
        return { ...acc, preferences: { ...acc.preferences } };
      }
    }
    return null;
  }

  async updateProfile(id: string, input: UpdateProfileInput): Promise<UserAccount | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updated: UserAccount = {
      ...existing,
      name: input.name !== undefined ? input.name : existing.name,
      contactNumber: input.contactNumber !== undefined ? input.contactNumber : existing.contactNumber,
      profileImageUrl: input.profileImageUrl !== undefined ? input.profileImageUrl : existing.profileImageUrl,
      updatedAt: now
    };

    this.accounts.set(id, updated);
    return { ...updated };
  }

  async updatePreferences(id: string, preferences: Partial<UserPreferences>): Promise<UserAccount | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updated: UserAccount = {
      ...existing,
      preferences: {
        ...existing.preferences,
        ...preferences
      },
      updatedAt: now
    };

    this.accounts.set(id, updated);
    return { ...updated };
  }

  async updatePassword(id: string, newPasswordHash: string): Promise<UserAccount | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updated: UserAccount = {
      ...existing,
      passwordHash: newPasswordHash,
      lastPasswordChangeAt: now,
      updatedAt: now
    };

    this.accounts.set(id, updated);
    return { ...updated };
  }

  async create(account: Omit<UserAccount, 'createdAt' | 'updatedAt'>): Promise<UserAccount> {
    const now = new Date().toISOString();
    const created: UserAccount = {
      ...account,
      createdAt: now,
      updatedAt: now
    };
    this.accounts.set(created.id, created);
    return { ...created };
  }
}
