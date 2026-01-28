"use client";

import { useAuth } from "@/lib/auth-context";
import { canManageTasks } from "@/lib/roles";
import { PermissionWrapper } from "@/components/ui/permission-wrapper";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import { AdminUser } from "@/lib/admin-services";

interface TasksHeaderProps {
  admins: AdminUser[];
  title?: string;
  description?: string;
}

export function TasksHeader({
  admins,
  title = "Tasks",
  description = "Manage and track team tasks",
}: TasksHeaderProps) {
  const { userRole } = useAuth();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <PermissionWrapper
        hasPermission={canManageTasks(userRole)}
        permissionMessage="Only Admins can create tasks"
      >
        <AddTaskDialog admins={admins} />
      </PermissionWrapper>
    </div>
  );
}
