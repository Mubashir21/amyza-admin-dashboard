/**
 * Admin Services
 * Handles admin user management operations
 */

import { supabase } from "./supabase/client";

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'admin' | 'viewer';
  created_at: string;
  updated_at: string;
}

/**
 * Get all admin users from the admins table
 */
export async function getAllAdminUsers(): Promise<AdminUser[]> {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin users:', error);
      throw new Error(`Failed to fetch admin users: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Failed to get admin users:', error);
    throw error;
  }
}

/**
 * Update a user's role
 */
export async function updateUserRole(
  userId: string,
  newRole: 'admin' | 'viewer'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('admins')
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  } catch (error) {
    console.error('Failed to update role:', error);
    throw error;
  }
}

/**
 * Delete an admin user
 * 
 * Uses the cascade delete trigger from sql/03_cascade_delete_trigger.sql
 * When we delete from admins table, the trigger automatically deletes from auth.users
 * 
 * Prerequisites:
 * - Run sql/03_cascade_delete_trigger.sql in your Supabase SQL Editor
 * - The trigger has SECURITY DEFINER so it can delete from auth.users
 */
export async function deleteAdminUser(userId: string): Promise<void> {
  try {
    // Delete from admins table
    // The cascade trigger will automatically delete from auth.users
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting admin user:', error);
      throw new Error(`Failed to delete admin user: ${error.message}`);
    }

    console.log('User deleted successfully (cascade trigger will handle auth.users deletion)');
  } catch (error) {
    console.error('Failed to delete admin user:', error);
    throw error;
  }
}
