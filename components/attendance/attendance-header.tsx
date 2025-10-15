"use client";

import { MarkAttendanceDialog } from "@/components/mark-attendance-dialogue";
import { useAuth } from "@/lib/auth-context";
import { canMarkStudentAttendance } from "@/lib/roles";
import { PermissionWrapper } from "@/components/ui/permission-wrapper";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_id: string;
  batch_id: string;
}

interface Batch {
  id: string;
  batch_code: string;
}

interface AttendanceHeaderProps {
  students: Student[];
  batches: Batch[];
  title?: string;
  description?: string;
}

export function AttendanceHeader({
  students,
  batches,
  title = "Attendance",
  description = "Track student attendance for Saturday, Monday, and Thursday classes",
}: AttendanceHeaderProps) {
  const { userRole } = useAuth();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <PermissionWrapper
        hasPermission={canMarkStudentAttendance(userRole)}
        permissionMessage="Only Admins can mark student attendance"
      >
        <MarkAttendanceDialog students={students} batches={batches} />
      </PermissionWrapper>
    </div>
  );
}
