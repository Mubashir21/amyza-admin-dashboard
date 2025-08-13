import { UpdatePerformanceDialog } from "@/components/rankings/update-performance-dialog";

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

interface RankingsHeaderProps {
  title?: string;
  description?: string;
  students?: Student[];
  batches?: Batch[];
  onPerformanceUpdated?: () => void;
}

export function RankingsHeader({
  title = "Rankings",
  description = "View student rankings and performance metrics across all batches",
  students,
  batches,
  onPerformanceUpdated,
}: RankingsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <UpdatePerformanceDialog
        students={students}
        batches={batches}
        onPerformanceUpdated={onPerformanceUpdated}
      />
    </div>
  );
}
