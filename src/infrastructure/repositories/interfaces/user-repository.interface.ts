import { IBaseRepository } from './base-repository.interface';

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: string;
  schoolId: string;
  refreshTokenHash?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRepository extends IBaseRepository<UserEntity> {
  findByEmail(email: string): Promise<UserEntity | null>;
  updateRefreshToken(userId: string, refreshTokenHash: string | null): Promise<void>;
}
