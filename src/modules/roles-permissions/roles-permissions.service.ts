import { Injectable } from '@nestjs/common';

export interface RoleDefinition {
  role: string;
  displayName: string;
  description: string;
  permissions: string[];
}

@Injectable()
export class RolesPermissionsService {
  private readonly rolesCatalog: RoleDefinition[] = [
    {
      role: 'SUPER_ADMIN',
      displayName: 'Super Admin',
      description: 'System-wide administrator with unrestricted capabilities',
      permissions: ['*'],
    },
    {
      role: 'SCHOOL_ADMIN',
      displayName: 'School Admin / Principal',
      description: 'Head administrator for a specific school institution',
      permissions: [
        'users:read', 'users:write',
        'students:read', 'students:write',
        'staff:read', 'staff:write',
        'academics:manage', 'exams:manage',
        'fees:read', 'fees:write',
        'attendance:read', 'attendance:write',
        'dashboard:read', 'reports:read',
      ],
    },
    {
      role: 'ACCOUNTANT',
      displayName: 'Accountant / Bursar',
      description: 'Manages school financial ledgers, invoicing, and fee reconciliation',
      permissions: [
        'fees:read', 'fees:write',
        'invoices:read', 'invoices:write',
        'payments:reconcile', 'expenses:manage',
        'reports:financial',
      ],
    },
    {
      role: 'TEACHER',
      displayName: 'Teaching Faculty',
      description: 'Manages classrooms, schedules, daily attendance, marks, and student assessments',
      permissions: [
        'attendance:read', 'attendance:write',
        'exams:schedules:read', 'marks:entry',
        'students:read', 'timetable:read',
      ],
    },
    {
      role: 'HR_STAFF',
      displayName: 'Human Resources / Payroll Specialist',
      description: 'Oversees employee onboarding, contracts, leave approvals, and payroll runs',
      permissions: [
        'staff:read', 'staff:write',
        'payroll:read', 'payroll:write', 'payroll:approve',
        'leaves:manage',
      ],
    },
    {
      role: 'LIBRARIAN',
      displayName: 'Librarian',
      description: 'Manages physical library catalog, book loans, returns, and overdue fines',
      permissions: [
        'library:books:read', 'library:books:write',
        'library:circulation:manage', 'library:fines:manage',
      ],
    },
    {
      role: 'TRANSPORT_MANAGER',
      displayName: 'Transport Coordinator',
      description: 'Oversees bus fleet, drivers, routes, stops, and student transit allocations',
      permissions: [
        'transport:routes:read', 'transport:routes:write',
        'transport:allocations:manage',
      ],
    },
    {
      role: 'FRONT_DESK',
      displayName: 'Front Desk / Receptionist',
      description: 'Manages visitor logs, admissions inquiries, and daily front office phone logs',
      permissions: [
        'frontdesk:visitors:manage',
        'frontdesk:enquiries:manage',
        'students:read',
      ],
    },
    {
      role: 'PARENT',
      displayName: 'Parent / Guardian',
      description: 'Guardian view for enrolled wards fee balances, attendance, and report cards',
      permissions: [
        'parent:ward:attendance:read',
        'parent:ward:marks:read',
        'parent:ward:fees:read',
        'parent:ward:pay',
      ],
    },
    {
      role: 'STUDENT',
      displayName: 'Student',
      description: 'Student view for individual attendance, timetable, results, and library books',
      permissions: [
        'student:self:attendance:read',
        'student:self:timetable:read',
        'student:self:results:read',
        'student:self:library:read',
      ],
    },
  ];

  async getRoles(): Promise<RoleDefinition[]> {
    return this.rolesCatalog;
  }

  async getPermissions(): Promise<string[]> {
    const allPermissions = new Set<string>();
    for (const r of this.rolesCatalog) {
      r.permissions.forEach((p) => allPermissions.add(p));
    }
    return Array.from(allPermissions);
  }
}
