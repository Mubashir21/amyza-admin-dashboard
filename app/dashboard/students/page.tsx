import { ResponsiveContainer } from "@/components/responsive-container";
import { StudentsHeader } from "@/components/students/students-header";
import { StudentsSearchClient } from "@/components/students/students-search";
import { StudentsStats } from "@/components/students/students-stats";
import { StudentCard } from "@/components/students/students-card";
import { Button } from "@/components/ui/button";
import {
  getStudentsFiltered,
  getStudentsStats,
  getStudentsWithMetrics,
  type Student,
} from "@/lib/students-services";
import { getAllBatches } from "@/lib/batches-services";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    batch?: string;
    status?: string;
  }>;
}

export default async function StudentsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  const [students, stats, batches] = await Promise.all([
    getStudentsFiltered(resolvedSearchParams),
    getStudentsStats(),
    getAllBatches(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <ResponsiveContainer>
        <StudentsHeader batches={batches} />
      </ResponsiveContainer>

      {/* Search/Filter Bar */}
      <ResponsiveContainer>
        <StudentsSearchClient batches={batches} />
      </ResponsiveContainer>

      {/* Students Stats */}
      <ResponsiveContainer>
        <StudentsStats stats={stats} />
      </ResponsiveContainer>

      {/* Students List */}
      <ResponsiveContainer>
        {students.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-500">
              {resolvedSearchParams.search ||
              resolvedSearchParams.batch ||
              resolvedSearchParams.status
                ? "No students match your filters"
                : "No students found"}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {!resolvedSearchParams.search &&
                !resolvedSearchParams.batch &&
                !resolvedSearchParams.status &&
                "Add your first student to get started"}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                batches={batches}
              />
            ))}
          </div>
        )}
      </ResponsiveContainer>

      {/* Pagination */}
      <ResponsiveContainer>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing 1 to {students.length} of {students.length} students
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  );
}
