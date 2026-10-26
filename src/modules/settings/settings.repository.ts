import { AllowedSettingKey, SchoolProfile, SettingRecord } from './settings.types';

export interface SettingsRepository {
  get(key: string): Promise<SettingRecord | null>;
  getAll(category?: string): Promise<SettingRecord[]>;
  set(key: string, value: any, updatedBy?: string): Promise<SettingRecord>;
  getSchoolProfile(): Promise<SchoolProfile>;
  updateSchoolProfile(profile: Partial<SchoolProfile>, updatedBy?: string): Promise<SchoolProfile>;
  reset(): void;
  seedDefaults(): void;
}

export class InMemorySettingsRepository implements SettingsRepository {
  private settings: Map<string, SettingRecord> = new Map();
  private schoolProfile: SchoolProfile = {
    schoolName: 'Greenwood High International School',
    schoolCode: 'GW-2026',
    address: '100 Academic Boulevard, Edu City',
    contactNumber: '+1-555-0199',
    officialEmail: 'info@greenwoodhigh.edu',
    logoUrl: 'https://assets.schoolerp.edu/logos/gw-logo.png',
    principalName: 'Dr. Arthur Evans',
    website: 'https://greenwoodhigh.edu'
  };

  constructor() {
    this.seedDefaults();
  }

  public reset(): void {
    this.settings.clear();
    this.seedDefaults();
  }

  public seedDefaults(): void {
    const now = new Date().toISOString();

    const defaults: Array<Omit<SettingRecord, 'updatedAt'>> = [
      // Academic
      {
        key: 'academic.currentYear',
        value: 'ay-2025-26',
        category: 'academic',
        description: 'Active academic year record ID'
      },
      {
        key: 'academic.defaultExamPeriod',
        value: 'ep-term1',
        category: 'academic',
        description: 'Default examination period'
      },
      {
        key: 'academic.defaultGradingScheme',
        value: 'gs-standard',
        category: 'academic',
        description: 'Default percentage grading scheme'
      },
      // Examination Policies
      {
        key: 'examination.allowConsecutiveSchedules',
        value: true,
        category: 'examination',
        description: 'Allow back-to-back exams when start equals previous end'
      },
      {
        key: 'examination.maxExamsPerDayPerClass',
        value: 2,
        category: 'examination',
        description: 'Maximum scheduled exams per day for a single class'
      },
      {
        key: 'examination.allowInvigilatorOverlap',
        value: false,
        category: 'examination',
        description: 'Disallow invigilators from overlapping supervision'
      },
      {
        key: 'examination.allowResultCorrectionAfterPublish',
        value: true,
        category: 'examination',
        description: 'Require authorized correction workflow after results are published'
      },
      // Localization
      {
        key: 'localization.timeZone',
        value: 'UTC',
        category: 'localization',
        description: 'System timezone for schedule evaluations'
      },
      {
        key: 'localization.dateFormat',
        value: 'YYYY-MM-DD',
        category: 'localization',
        description: 'Preferred date display format'
      },
      {
        key: 'localization.timeFormat',
        value: 'HH:mm',
        category: 'localization',
        description: 'Preferred time display format'
      }
    ];

    for (const item of defaults) {
      this.settings.set(item.key, {
        ...item,
        updatedAt: now
      });
    }
  }

  async get(key: string): Promise<SettingRecord | null> {
    const item = this.settings.get(key);
    return item ? { ...item } : null;
  }

  async getAll(category?: string): Promise<SettingRecord[]> {
    let list = Array.from(this.settings.values());
    if (category) {
      list = list.filter((s) => s.category === category);
    }
    return list.map((s) => ({ ...s }));
  }

  async set(key: string, value: any, updatedBy?: string): Promise<SettingRecord> {
    const existing = this.settings.get(key);
    const category = key.split('.')[0] as any;
    const record: SettingRecord = {
      key,
      value,
      category: existing?.category || (['school', 'academic', 'examination', 'localization'].includes(category) ? category : 'general'),
      description: existing?.description,
      isSecret: existing?.isSecret || false,
      updatedBy,
      updatedAt: new Date().toISOString()
    };
    this.settings.set(key, record);
    return { ...record };
  }

  async getSchoolProfile(): Promise<SchoolProfile> {
    return { ...this.schoolProfile };
  }

  async updateSchoolProfile(profile: Partial<SchoolProfile>, _updatedBy?: string): Promise<SchoolProfile> {
    this.schoolProfile = {
      ...this.schoolProfile,
      ...profile
    };
    return { ...this.schoolProfile };
  }
}
