import { Injectable } from '@nestjs/common';
import { BaseInMemoryRepository } from './base-in-memory.repository';
import { IUserRepository, UserEntity } from '../interfaces/user-repository.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InMemoryUserRepository extends BaseInMemoryRepository<UserEntity> implements IUserRepository {
  constructor() {
    super('InMemoryUserRepository');
    this.seedDevUsers();
  }

  private async seedDevUsers() {
    const saltRounds = 10;
    const defaultPasswordHash = await bcrypt.hash('Password@123', saltRounds);

    const devUsers: Partial<UserEntity>[] = [
      {
        id: 'usr-admin-01',
        email: 'superadmin@schoolerp.internal',
        passwordHash: defaultPasswordHash,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        schoolId: 'SCH-001',
        isActive: true,
      },
      {
        id: 'usr-school-admin-01',
        email: 'principal@schoolerp.internal',
        passwordHash: defaultPasswordHash,
        firstName: 'Principal',
        lastName: 'Sharma',
        role: 'SCHOOL_ADMIN',
        schoolId: 'SCH-001',
        isActive: true,
      },
      {
        id: 'usr-teacher-01',
        email: 'teacher@schoolerp.internal',
        passwordHash: defaultPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
        role: 'TEACHER',
        schoolId: 'SCH-001',
        isActive: true,
      },
      {
        id: 'usr-accountant-01',
        email: 'accountant@schoolerp.internal',
        passwordHash: defaultPasswordHash,
        firstName: 'Alice',
        lastName: 'Smith',
        role: 'ACCOUNTANT',
        schoolId: 'SCH-001',
        isActive: true,
      },
      {
        id: 'usr-parent-01',
        email: 'parent@schoolerp.internal',
        passwordHash: defaultPasswordHash,
        firstName: 'Robert',
        lastName: 'Taylor',
        role: 'PARENT',
        schoolId: 'SCH-001',
        isActive: true,
      },
      {
        id: 'usr-student-01',
        email: 'student@schoolerp.internal',
        passwordHash: defaultPasswordHash,
        firstName: 'Leo',
        lastName: 'Taylor',
        role: 'STUDENT',
        schoolId: 'SCH-001',
        isActive: true,
      },
    ];

    for (const u of devUsers) {
      await this.create(u);
    }
    this.logger.log(`[SEED] Initialized ${devUsers.length} development test accounts (Password: Password@123)`);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const users = Array.from(this.items.values());
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user ? { ...user } : null;
  }

  async updateRefreshToken(userId: string, refreshTokenHash: string | null): Promise<void> {
    const user = this.items.get(userId);
    if (user) {
      user.refreshTokenHash = refreshTokenHash;
      user.updatedAt = new Date();
      this.items.set(userId, user);
    }
  }
}
