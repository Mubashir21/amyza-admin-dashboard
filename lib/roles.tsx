// Simple role-based access control for the admin dashboard
import React from "react";
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type UserRole = 'super_admin' | 'admin' | 'viewer';

export interface AdminProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

/**
 * Get admin profile for current user
 */
export async function getCurrentUserProfile(user: User): Promise<AdminProfile | null> {
  if (!user) return null;

  try {
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data as AdminProfile;
  } catch (error) {
    console.error("Error in getCurrentUserProfile:", error);
    return null;
  }
}

/**
 * Check if user can mark teacher attendance (only super_admin)
 */
export function canMarkTeacherAttendance(role: UserRole | null): boolean {
  return role === 'super_admin';
}

/**
 * Check if user can view teacher attendance (all roles)
 */
export function canViewTeacherAttendance(role: UserRole | null): boolean {
  return role !== null; // All authenticated users can view
}

/**
 * Check if user can manage teachers (add/edit/delete) (only super_admin)
 */
export function canManageTeachers(role: UserRole | null): boolean {
  return role === 'super_admin';
}

/**
 * Check if user can manage students (super_admin and admin)
 */
export function canManageStudents(role: UserRole | null): boolean {
  return role === 'super_admin' || role === 'admin';
}

/**
 * Check if user can view students (all roles)
 */
export function canViewStudents(role: UserRole | null): boolean {
  return role !== null; // All authenticated users can view
}

/**
 * Check if user can mark student attendance (super_admin and admin)
 */
export function canMarkStudentAttendance(role: UserRole | null): boolean {
  return role === 'super_admin' || role === 'admin';
}

/**
 * Check if user has any edit permissions (not viewer)
 */
export function canEdit(role: UserRole | null): boolean {
  return role === 'super_admin' || role === 'admin';
}

/**
 * Check if user is viewer only
 */
export function isViewerOnly(role: UserRole | null): boolean {
  return role === 'viewer';
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    case 'viewer':
      return 'Viewer';
    default:
      return 'Unknown';
  }
}

/**
 * Get role color for UI
 */
export function getRoleColor(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'admin':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'viewer':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get disabled styling classes for unauthorized actions
 */
export function getDisabledClasses(isDisabled: boolean): string {
  if (isDisabled) {
    return 'opacity-50 cursor-not-allowed pointer-events-none';
  }
  return '';
}

/**
 * Get tooltip message for disabled actions
 */
export function getPermissionTooltip(action: string, requiredRole: string): string {
  return `Only ${requiredRole} can ${action}`;
}

/**
 * Component wrapper that disables content based on permission
 */
export function withPermissionCheck<T extends Record<string, unknown>>(
  WrappedComponent: React.ComponentType<T>,
  permissionCheck: (role: UserRole | null) => boolean,
  fallbackMessage?: string
) {
  return function PermissionCheckedComponent(props: T & { userRole?: UserRole | null }) {
    const { userRole, ...componentProps } = props;
    const hasPermission = permissionCheck(userRole || null);
    
    return (
      <div className={`relative ${!hasPermission ? 'opacity-50' : ''}`}>
        <WrappedComponent {...(componentProps as T)} />
        {!hasPermission && (
          <div 
            className="absolute inset-0 cursor-not-allowed z-10"
            title={fallbackMessage || 'You do not have permission for this action'}
          />
        )}
      </div>
    );
  };
}
