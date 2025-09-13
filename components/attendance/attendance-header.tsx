import { MarkAttendanceDialog } from "@/components/mark-attendance-dialogue";

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
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <MarkAttendanceDialog students={students} batches={batches} />
    </div>
  );
}
