import { NotFoundError, UnprocessableEntityError } from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-codes';
import { SettingsRepository } from './settings.repository';
import {
  ALLOWED_SETTING_KEYS,
  AllowedSettingKey,
  BulkUpdateSettingsInput,
  SchoolProfile,
  SettingRecord
} from './settings.types';

export interface ISettingsService {
  getSetting<T = any>(key: string, defaultValue?: T): Promise<T>;
  getAllSettings(category?: string): Promise<SettingRecord[]>;
  updateSetting(key: string, value: any, updatedBy?: string): Promise<SettingRecord>;
  bulkUpdateSettings(input: BulkUpdateSettingsInput, updatedBy?: string): Promise<SettingRecord[]>;
  getSchoolProfile(): Promise<SchoolProfile>;
  updateSchoolProfile(profile: Partial<SchoolProfile>, updatedBy?: string): Promise<SchoolProfile>;
}

export class SettingsService implements ISettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  private validateKey(key: string): asserts key is AllowedSettingKey {
    if (!ALLOWED_SETTING_KEYS.includes(key as AllowedSettingKey)) {
      throw new UnprocessableEntityError(
        `Setting key '${key}' is unsupported. Allowed keys: ${ALLOWED_SETTING_KEYS.join(', ')}`,
        ErrorCode.SETTING_INVALID_KEY
      );
    }
  }

  private sanitizeSetting(record: SettingRecord): SettingRecord {
    if (record.isSecret) {
      return {
        ...record,
        value: '********'
      };
    }
    return record;
  }

  private validateValue(key: AllowedSettingKey, value: any): void {
    if (key === 'examination.maxExamsPerDayPerClass') {
      if (typeof value !== 'number' || value <= 0 || !Number.isInteger(value)) {
        throw new UnprocessableEntityError(
          'examination.maxExamsPerDayPerClass must be a positive integer',
          ErrorCode.SETTING_INVALID_VALUE
        );
      }
    }
    if (key === 'examination.allowConsecutiveSchedules' || key === 'examination.autoPublishResults') {
      if (typeof value !== 'boolean') {
        throw new UnprocessableEntityError(
          `${key} must be a boolean`,
          ErrorCode.SETTING_INVALID_VALUE
        );
      }
    }
    if (key === 'localization.timeZone') {
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw new UnprocessableEntityError(
          'localization.timeZone must be a non-empty string',
          ErrorCode.SETTING_INVALID_VALUE
        );
      }
    }
  }

  async getSetting<T = any>(key: string, defaultValue?: T): Promise<T> {
    this.validateKey(key);
    const item = await this.settingsRepository.get(key);
    if (!item) {
      if (defaultValue !== undefined) return defaultValue;
      throw new NotFoundError(`Setting '${key}' not found`, ErrorCode.SETTING_NOT_FOUND);
    }
    return item.value as T;
  }

  async getSettingRecord(key: string): Promise<SettingRecord> {
    this.validateKey(key);
    const item = await this.settingsRepository.get(key);
    if (!item) {
      throw new NotFoundError(`Setting '${key}' not found`, ErrorCode.SETTING_NOT_FOUND);
    }
    return this.sanitizeSetting(item);
  }

  async getAllSettings(category?: string): Promise<SettingRecord[]> {
    const records = await this.settingsRepository.getAll(category);
    return records.map((r) => this.sanitizeSetting(r));
  }

  async updateSetting(key: string, value: any, updatedBy?: string): Promise<SettingRecord> {
    this.validateKey(key);
    this.validateValue(key, value);

    const updated = await this.settingsRepository.set(key, value, updatedBy);
    return this.sanitizeSetting(updated);
  }

  async bulkUpdateSettings(input: BulkUpdateSettingsInput, updatedBy?: string): Promise<SettingRecord[]> {
    const results: SettingRecord[] = [];
    for (const item of input.settings) {
      this.validateKey(item.key);
      this.validateValue(item.key as AllowedSettingKey, item.value);
      const updated = await this.settingsRepository.set(item.key, item.value, updatedBy);
      results.push(this.sanitizeSetting(updated));
    }
    return results;
  }

  async getSchoolProfile(): Promise<SchoolProfile> {
    return this.settingsRepository.getSchoolProfile();
  }

  async updateSchoolProfile(profile: Partial<SchoolProfile>, updatedBy?: string): Promise<SchoolProfile> {
    return this.settingsRepository.updateSchoolProfile(profile, updatedBy);
  }
}
