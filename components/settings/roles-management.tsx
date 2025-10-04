"use client";

import { useState, useEffect } from "react";
import { getAllAdminUsers, updateUserRole, deleteAdminUser, type AdminUser } from "@/lib/admin-services";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Shield, User, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function RolesManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const adminUsers = await getAllAdminUsers();
      setUsers(adminUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'viewer') => {
    try {
      setUpdatingUserId(userId);
      await updateUserRole(userId, newRole);
      
      // Update local state
      setUsers(users.map(user => 
        user.user_id === userId 
          ? { ...user, role: newRole, updated_at: new Date().toISOString() }
          : user
      ));
      
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user role");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setDeletingUserId(userToDelete.user_id);
      await deleteAdminUser(userToDelete.user_id);
      
      // Remove from local state
      setUsers(users.filter(user => user.user_id !== userToDelete.user_id));
      
      toast.success("User deleted successfully");
      setShowDeleteDialog(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

  const openDeleteDialog = (user: AdminUser) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case "super_admin":
        return { 
          label: "Super Admin", 
          color: "bg-red-100 text-red-800 border-red-200",
          icon: Shield 
        };
      case "admin":
        return { 
          label: "Admin", 
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: User 
        };
      case "viewer":
        return { 
          label: "Viewer", 
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Eye 
        };
      default:
        return { 
          label: "Unknown", 
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: User 
        };
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading users...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Role Management</CardTitle>
          <CardDescription>
            Manage user roles and permissions. You can change roles between Admin and Viewer, or remove users entirely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found in the admins table</p>
                <p className="text-xs mt-2">Check the console for debug information</p>
              </div>
            ) : (
              users.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                const RoleIcon = roleInfo.icon;
                const isCurrentUser = user.user_id === currentUser?.id;
                const canModify = !isCurrentUser && user.role !== 'super_admin';
                
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {getInitials(user.first_name, user.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">
                            {user.first_name} {user.last_name}
                            {isCurrentUser && (
                              <span className="text-xs text-muted-foreground ml-2">(You)</span>
                            )}
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Created {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge className={roleInfo.color}>
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {roleInfo.label}
                      </Badge>

                      {canModify && (
                        <>
                          <Select
                            value={user.role}
                            onValueChange={(newRole: 'admin' | 'viewer') => 
                              handleRoleChange(user.user_id, newRole)
                            }
                            disabled={updatingUserId === user.user_id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog(user)}
                            disabled={deletingUserId === user.user_id}
                          >
                            {deletingUserId === user.user_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      )}

                      {!canModify && user.role === 'super_admin' && (
                        <span className="text-xs text-muted-foreground">
                          Cannot modify
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{userToDelete?.first_name} {userToDelete?.last_name}&quot;?
              <br /><br />
              <strong>This action cannot be undone!</strong>
              <br /><br />
              This will permanently remove:
              <br />• The user from the admin system
              <br />• Their authentication account
              <br />• All associated permissions
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingUserId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={!!deletingUserId}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingUserId ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
