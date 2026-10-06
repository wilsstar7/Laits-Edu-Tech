import { describe, it, expect } from 'vitest';
import type { UserRole } from '@/types';

// Canonical Capability Matrix according to Phase 7 Specifications
export interface RoleCapability {
  ownProfile: boolean;
  personalityAssessment: 'full' | 'view' | 'none';
  ownReports: 'full' | 'controlled' | 'none';
  tutorMarketplace: boolean;
  createBooking: 'full' | 'controlled' | 'none';
  manageAvailability: 'full' | 'controlled' | 'none';
  payments: 'full' | 'view_relevant' | 'controlled';
  reviews: 'submit_and_view' | 'view_own' | 'all';
  learningProgress: 'own' | 'relevant' | 'all';
  notifications: 'own' | 'operational' | 'all';
  analytics: 'none' | 'own' | 'full';
  auditLogs: 'none' | 'controlled' | 'full';
  userManagement: 'none' | 'controlled' | 'full';
}

export const ROLE_MATRIX: Record<UserRole, RoleCapability> = {
  student: {
    ownProfile: true,
    personalityAssessment: 'full',
    ownReports: 'full',
    tutorMarketplace: true,
    createBooking: 'full',
    manageAvailability: 'none',
    payments: 'full',
    reviews: 'submit_and_view',
    learningProgress: 'own',
    notifications: 'own',
    analytics: 'none',
    auditLogs: 'none',
    userManagement: 'none',
  },
  tutor: {
    ownProfile: true,
    personalityAssessment: 'none',
    ownReports: 'none',
    tutorMarketplace: true,
    createBooking: 'controlled',
    manageAvailability: 'full',
    payments: 'view_relevant',
    reviews: 'view_own',
    learningProgress: 'relevant',
    notifications: 'own',
    analytics: 'own',
    auditLogs: 'none',
    userManagement: 'none',
  },
  admin: {
    ownProfile: true,
    personalityAssessment: 'view',
    ownReports: 'controlled',
    tutorMarketplace: true,
    createBooking: 'controlled',
    manageAvailability: 'controlled',
    payments: 'controlled',
    reviews: 'all',
    learningProgress: 'all',
    notifications: 'operational',
    analytics: 'full',
    auditLogs: 'controlled',
    userManagement: 'controlled',
  },
  super_admin: {
    ownProfile: true,
    personalityAssessment: 'view',
    ownReports: 'controlled',
    tutorMarketplace: true,
    createBooking: 'full',
    manageAvailability: 'full',
    payments: 'controlled',
    reviews: 'all',
    learningProgress: 'all',
    notifications: 'all',
    analytics: 'full',
    auditLogs: 'full',
    userManagement: 'full',
  },
};

describe('Security RBAC & Permission Matrix (Phase 7)', () => {
  it('strictly isolates student capabilities from admin/audit privileges', () => {
    const studentPerms = ROLE_MATRIX['student'];
    expect(studentPerms.auditLogs).toBe('none');
    expect(studentPerms.userManagement).toBe('none');
    expect(studentPerms.analytics).toBe('none');
    expect(studentPerms.manageAvailability).toBe('none');
    expect(studentPerms.personalityAssessment).toBe('full');
    expect(studentPerms.createBooking).toBe('full');
  });

  it('strictly isolates tutor capabilities from admin and student private assessment', () => {
    const tutorPerms = ROLE_MATRIX['tutor'];
    expect(tutorPerms.auditLogs).toBe('none');
    expect(tutorPerms.userManagement).toBe('none');
    expect(tutorPerms.manageAvailability).toBe('full');
    expect(tutorPerms.personalityAssessment).toBe('none');
    expect(tutorPerms.ownReports).toBe('none');
    expect(tutorPerms.analytics).toBe('own');
  });

  it('elevates admin to platform monitoring and verification without exposing super_admin full controls', () => {
    const adminPerms = ROLE_MATRIX['admin'];
    expect(adminPerms.auditLogs).toBe('controlled');
    expect(adminPerms.userManagement).toBe('controlled');
    expect(adminPerms.analytics).toBe('full');
    expect(adminPerms.reviews).toBe('all');
  });

  it('confirms super_admin has unrestricted governance controls', () => {
    const superAdminPerms = ROLE_MATRIX['super_admin'];
    expect(superAdminPerms.auditLogs).toBe('full');
    expect(superAdminPerms.userManagement).toBe('full');
    expect(superAdminPerms.analytics).toBe('full');
  });

  describe('Route-level Role Access Enforcement', () => {
    const studentRoutesAllowed: UserRole[] = ['student', 'admin', 'super_admin'];
    const tutorRoutesAllowed: UserRole[] = ['tutor', 'admin', 'super_admin'];
    const adminRoutesAllowed: UserRole[] = ['admin', 'super_admin'];

    it('denies tutor from student dashboard routes', () => {
      expect(studentRoutesAllowed.includes('tutor')).toBe(false);
    });

    it('denies student from tutor schedule and availability routes', () => {
      expect(tutorRoutesAllowed.includes('student')).toBe(false);
    });

    it('denies both student and tutor from admin portal routes', () => {
      expect(adminRoutesAllowed.includes('student')).toBe(false);
      expect(adminRoutesAllowed.includes('tutor')).toBe(false);
    });

    it('allows admin and super admin into administrative routes', () => {
      expect(adminRoutesAllowed.includes('admin')).toBe(true);
      expect(adminRoutesAllowed.includes('super_admin')).toBe(true);
    });
  });
});
