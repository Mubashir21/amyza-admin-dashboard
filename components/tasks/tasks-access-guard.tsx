"use client";

import { useAuth } from "@/lib/auth-context";
import { canAccessTasks } from "@/lib/roles";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

interface TasksAccessGuardProps {
  children: React.ReactNode;
}

export function TasksAccessGuard({ children }: TasksAccessGuardProps) {
  const { userRole, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  // Check access permission
  if (!canAccessTasks(userRole)) {
    return (
      <Card className="max-w-md mx-auto mt-12">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground text-center">
            You don&apos;t have permission to access the Tasks page.
          </p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Only Admins and Super Admins can view and manage tasks.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
