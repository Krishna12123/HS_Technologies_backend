export const ALLOWED_SETTING_KEYS = [
  // School Profile
  'school.profile',
  'school.name',
  'school.code',
  'school.address',
  'school.contactNumber',
  'school.officialEmail',
  'school.logoUrl',

  // Academic Settings
  'academic.currentYear',
  'academic.defaultExamPeriod',
  'academic.defaultGradingScheme',
  'academic.termDates',

  // Examination Settings
  'examination.allowConsecutiveSchedules',
  'examination.maxExamsPerDayPerClass',
  'examination.allowInvigilatorOverlap',
  'examination.autoPublishResults',
  'examination.allowResultCorrectionAfterPublish',

  // Localization
  'localization.timeZone',
  'localization.dateFormat',
  'localization.timeFormat'
] as const;

export type AllowedSettingKey = typeof ALLOWED_SETTING_KEYS[number];

export interface SchoolProfile {
  schoolName: string;
  schoolCode: string;
  address: string;
  contactNumber: string;
  officialEmail: string;
  logoUrl?: string;
  principalName?: string;
  website?: string;
}

export interface SettingRecord<T = any> {
  key: string;
  value: T;
  category: 'school' | 'academic' | 'examination' | 'localization' | 'general';
  isSecret?: boolean;
  description?: string;
  updatedBy?: string;
  updatedAt: string;
}

export interface BulkUpdateSettingsInput {
  settings: Array<{
    key: string;
    value: any;
  }>;
}
