import bcrypt from 'bcryptjs';
import { BadRequestError, NotFoundError } from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-codes';
import { AccountRepository } from './account.repository';
import {
  ChangePasswordInput,
  PublicUserProfile,
  UpdateProfileInput,
  UserAccount,
  UserPreferences
} from './account.types';

export class AccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

  private sanitizeUser(user: UserAccount): PublicUserProfile {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  async getProfile(userId: string): Promise<PublicUserProfile> {
    const user = await this.accountRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User account '${userId}' not found`, ErrorCode.ACCOUNT_NOT_FOUND);
    }
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<PublicUserProfile> {
    const user = await this.accountRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User account '${userId}' not found`, ErrorCode.ACCOUNT_NOT_FOUND);
    }

    const updated = await this.accountRepository.updateProfile(userId, input);
    if (!updated) {
      throw new NotFoundError(`User account '${userId}' not found`, ErrorCode.ACCOUNT_NOT_FOUND);
    }
    return this.sanitizeUser(updated);
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    const user = await this.accountRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User account '${userId}' not found`, ErrorCode.ACCOUNT_NOT_FOUND);
    }
    return user.preferences || {};
  }

  async updatePreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const user = await this.accountRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User account '${userId}' not found`, ErrorCode.ACCOUNT_NOT_FOUND);
    }

    const updated = await this.accountRepository.updatePreferences(userId, preferences);
    if (!updated) {
      throw new NotFoundError(`User account '${userId}' not found`, ErrorCode.ACCOUNT_NOT_FOUND);
    }
    return updated.preferences;
  }

  async changePassword(userId: string, input: ChangePasswordInput): Promise<{ message: string }> {
    const user = await this.accountRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User account '${userId}' not found`, ErrorCode.ACCOUNT_NOT_FOUND);
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new BadRequestError(
        'The current password provided is incorrect',
        ErrorCode.ACCOUNT_INVALID_CURRENT_PASSWORD
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(input.newPassword, salt);

    await this.accountRepository.updatePassword(userId, newPasswordHash);

    return {
      message: 'Password changed successfully'
    };
  }
}
