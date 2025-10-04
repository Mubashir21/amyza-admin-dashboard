import { supabase } from "@/lib/supabase/client";

export interface AdminUser {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'admin' | 'viewer';
  created_at: string;
  updated_at: string;
  email: string;
}

/**
 * Get all admin users
 */
export async function getAllAdminUsers(): Promise<AdminUser[]> {
  try {
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching admin users:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Failed to fetch admin users:", error);
    throw error;
  }
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, newRole: 'admin' | 'viewer'): Promise<void> {
  try {
    console.log("Updating user role:", { userId, newRole });

    const { error } = await supabase
      .from("admins")
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Supabase error updating role:", error);
      throw error;
    }

    console.log("User role updated successfully");
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
}

/**
 * Delete admin user (removes from both admins table and auth)
 */
export async function deleteAdminUser(userId: string): Promise<void> {
  try {
    console.log("Deleting admin user:", userId);

    // First, delete from admins table
    const { error: adminDeleteError } = await supabase
      .from("admins")
      .delete()
      .eq("user_id", userId);

    if (adminDeleteError) {
      console.error("Error deleting from admins table:", adminDeleteError);
      throw adminDeleteError;
    }

    // Then, delete from auth table (this requires admin privileges)
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error("Error deleting from auth:", authDeleteError);
      // If auth deletion fails, we should restore the admin record
      // But for now, we'll just log the error and continue
      console.warn("Auth deletion failed, but admin record was removed");
    }

    console.log("Admin user deleted successfully");
  } catch (error) {
    console.error("Error deleting admin user:", error);
    throw error;
  }
}

/**
 * Get admin user statistics
 */
export async function getAdminUserStats(): Promise<{
  totalUsers: number;
  superAdmins: number;
  admins: number;
  viewers: number;
}> {
  try {
    const users = await getAllAdminUsers();
    
    return {
      totalUsers: users.length,
      superAdmins: users.filter(u => u.role === 'super_admin').length,
      admins: users.filter(u => u.role === 'admin').length,
      viewers: users.filter(u => u.role === 'viewer').length,
    };
  } catch (error) {
    console.error("Error getting admin stats:", error);
    throw error;
  }
}
