import { Injectable } from '@nestjs/common';

export interface SchoolSettings {
  schoolId: string;
  schoolName: string;
  affiliationNumber: string;
  currency: string;
  timezone: string;
  academicYearId: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  houses: string[];
  bloodGroups: string[];
}

@Injectable()
export class MastersSettingsService {
  private settings: SchoolSettings = {
    schoolId: 'SCH-001',
    schoolName: 'Horizon International School',
    affiliationNumber: 'CBSE-992014',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    academicYearId: 'ay-2026',
    contactEmail: 'contact@horizonschool.internal',
    contactPhone: '+91-11-23456789',
    address: 'Plot 42, Institutional Area, Sector 5, New Delhi',
    houses: ['Ruby', 'Emerald', 'Sapphire', 'Topaz'],
    bloodGroups: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
  };

  async getSettings(): Promise<SchoolSettings> {
    return this.settings;
  }

  async updateSettings(updates: Partial<SchoolSettings>): Promise<SchoolSettings> {
    this.settings = { ...this.settings, ...updates };
    return this.settings;
  }
}
