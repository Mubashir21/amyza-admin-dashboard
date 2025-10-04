"use client";

import { AddTeacherDialog } from "./add-teacher-dialog";
import { MarkTeacherAttendanceDialog } from "./mark-teacher-attendance-dialog";
import { useAuth } from "@/lib/auth-context";
import { canManageTeachers, canMarkTeacherAttendance } from "@/lib/roles";
import { PermissionWrapper } from "@/components/ui/permission-wrapper";

interface TeachersHeaderProps {
  title?: string;
  description?: string;
  onTeacherAdded?: () => void;
}

export function TeachersHeader({
  title = "Teachers",
  description = "Manage teacher profiles and track attendance",
  onTeacherAdded,
}: TeachersHeaderProps) {
  const { userRole } = useAuth();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex gap-2">
        <PermissionWrapper
          hasPermission={canMarkTeacherAttendance(userRole)}
          permissionMessage="Only Super Admins can mark teacher attendance"
        >
          <MarkTeacherAttendanceDialog />
        </PermissionWrapper>
        <PermissionWrapper
          hasPermission={canManageTeachers(userRole)}
          permissionMessage="Only Super Admins can add teachers"
        >
          <AddTeacherDialog onTeacherAdded={onTeacherAdded} />
        </PermissionWrapper>
      </div>
    </div>
  );
}
