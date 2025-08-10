// Update components/students/students-header.tsx:
import { AddStudentDialog } from "@/components/add-student-dialogue";

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
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <AddStudentDialog batches={batches} />
    </div>
  );
}
