"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Shield } from "lucide-react";
import { RolesManagement } from "@/components/settings/roles-management";
import { ResponsiveContainer } from "@/components/responsive-container";

export default function SettingsPage() {
  const { user, userRole, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Debug logging
  console.log('Settings Page - Auth State:', { user: !!user, userRole, loading });
  
  // Show loading state while auth is initializing
  if (loading) {
    console.log('Settings Page - Still loading auth...');
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
          <p className="text-xs text-muted-foreground mt-2">If this takes too long, check the console</p>
        </div>
      </div>
    );
  }
  
  // Don't render if no user after loading completes
  if (!user) {
    console.log('Settings Page - No user found');
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">No user found. Please log in.</p>
        </div>
      </div>
    );
  }
  
  console.log('Settings Page - Rendering with user:', user.email);

  // Check if user is super admin
  const isSuperAdmin = userRole === "super_admin";

  // Create user display name
  const displayName =
    user.user_metadata?.first_name && user.user_metadata?.last_name
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
      : user.email?.split("@")[0] || "User";

  // Create initials for avatar
  const initials =
    user.user_metadata?.first_name && user.user_metadata?.last_name
      ? `${user.user_metadata.first_name[0]}${user.user_metadata.last_name[0]}`
      : user.email?.slice(0, 2).toUpperCase() || "U";

  // Get role display info
  const getRoleInfo = (role: string | null) => {
    switch (role) {
      case "super_admin":
        return { label: "Super Admin", color: "bg-red-100 text-red-800" };
      case "admin":
        return { label: "Admin", color: "bg-blue-100 text-blue-800" };
      case "viewer":
        return { label: "Viewer", color: "bg-gray-100 text-gray-800" };
      default:
        return { label: "Unknown", color: "bg-gray-100 text-gray-800" };
    }
  };

  const roleInfo = getRoleInfo(userRole);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <ResponsiveContainer>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
      </ResponsiveContainer>

      {/* Settings Tabs */}
      <ResponsiveContainer>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                View your account information and current role.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture and Basic Info */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={user.user_metadata?.avatar_url}
                    alt={displayName}
                  />
                  <AvatarFallback className="text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{displayName}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <Badge className={roleInfo.color}>
                    {roleInfo.label}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Account Details */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </label>
                  <p className="mt-1 text-sm">
                    {displayName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email Address
                  </label>
                  <p className="mt-1 text-sm">
                    {user.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Role
                  </label>
                  <p className="mt-1 text-sm">
                    {roleInfo.label}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Account Created
                  </label>
                  <p className="mt-1 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Sign In
                  </label>
                  <p className="mt-1 text-sm">
                    {user.last_sign_in_at 
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : "Never"
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    User ID
                  </label>
                  <p className="mt-1 text-sm font-mono text-xs">
                    {user.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab (Super Admin Only) */}
        {isSuperAdmin && (
          <TabsContent value="roles" className="space-y-6">
            {activeTab === "roles" ? (
              <RolesManagement />
            ) : null}
          </TabsContent>
        )}
        </Tabs>
      </ResponsiveContainer>
    </div>
  );
}
