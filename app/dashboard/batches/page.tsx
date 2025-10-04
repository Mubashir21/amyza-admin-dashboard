import { ResponsiveContainer } from "@/components/responsive-container";
import { BatchesHeader } from "@/components/batches/batches-header";
import { BatchesSearchClient } from "@/components/batches/batches-search";
import { BatchesStats } from "@/components/batches/batches-stats";
import { BatchCard } from "@/components/batches/batches-card";
import {
  getBatchAttendanceRates,
  getBatchesFiltered,
  getBatchStats,
  getBatchStudentCounts,
  getTotalStudentCount,
  type Batch,
} from "@/lib/batches-services";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
  }>;
}

// Extended type for display purposes that includes all Batch properties
interface DisplayBatch extends Batch {
  student_count: number;
  avg_attendance: number;
  progress: number;
  description: string;
}

// Transform batch data for display
function transformBatchForDisplay(
  batch: Batch,
  studentCounts: { [batchId: string]: number },
  attendanceRates: { [batchId: string]: number }
): DisplayBatch {
  // Calculate progress based on current module and status
  let progress = 0;
  if (batch.status === "completed") {
    progress = 100;
  } else if (batch.status === "upcoming") {
    progress = 0;
  } else {
    // Active batch - calculate based on current module
    progress = ((batch.current_module - 1) / 3) * 100;
  }

  return {
    ...batch, // Keep all original Batch properties
    student_count: studentCounts[batch.id] || 0,
    avg_attendance: attendanceRates[batch.id] || 0,
    progress: Math.round(progress),
    start_date: new Date(batch.start_date).toLocaleDateString(),
    end_date: new Date(batch.end_date).toLocaleDateString(),
    description:
      batch.status === "active"
        ? "Currently Running"
        : batch.status === "upcoming"
        ? "Starts Soon"
        : "Completed",
  };
}

export default async function BatchesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  const [batches, stats, studentCounts, attendanceRates, totalStudents] =
    await Promise.all([
      getBatchesFiltered(resolvedSearchParams),
      getBatchStats(),
      getBatchStudentCounts(),
      getBatchAttendanceRates(),
      getTotalStudentCount(),
    ]);

  const transformedStats = {
    activeBatches: stats.activeBatches,
    totalStudents: totalStudents,
    activeModules: stats.activeModules,
    avgDuration: 3,
  };

  // Transform batches for display with real data
  const transformedBatches = batches.map((batch) =>
    transformBatchForDisplay(batch, studentCounts, attendanceRates)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <ResponsiveContainer>
        <BatchesHeader />
      </ResponsiveContainer>

      {/* Search/Filter Bar */}
      <ResponsiveContainer>
        <BatchesSearchClient batches={batches} />
      </ResponsiveContainer>

      {/* Batch Stats */}
      <ResponsiveContainer>
        <BatchesStats stats={transformedStats} />
      </ResponsiveContainer>

      {/* Batch List */}
      <ResponsiveContainer>
        {transformedBatches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-500">
              {resolvedSearchParams.search || resolvedSearchParams.status
                ? "No batches match your filters"
                : "No batches found"}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {!resolvedSearchParams.search &&
                !resolvedSearchParams.status &&
                "Create your first batch to get started"}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {transformedBatches.map((batch) => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
}
