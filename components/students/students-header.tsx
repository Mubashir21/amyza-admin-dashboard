"use client";

import { AddStudentDialog } from "@/components/add-student-dialogue";
import { useAuth } from "@/lib/auth-context";
import { canManageStudents } from "@/lib/roles";
import { PermissionWrapper } from "@/components/ui/permission-wrapper";

interface Batch {
  id: string;
  batch_code: string;
}

interface StudentsHeaderProps {
  batches: Batch[];
  title?: string;
  description?: string;
}

export function StudentsHeader({
  batches,
  title = "Students",
  description = "Manage student profiles and track their academic journey",
}: StudentsHeaderProps) {
  const { userRole } = useAuth();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <PermissionWrapper
        hasPermission={canManageStudents(userRole)}
        permissionMessage="Only Admins can add students"
      >
        <AddStudentDialog batches={batches} />
      </PermissionWrapper>
    </div>
  );
}
