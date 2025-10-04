import { ResponsiveContainer } from "@/components/responsive-container";
import { RankingsHeader } from "@/components/rankings/rankings-header";
import { RankingsSearchClient } from "@/components/rankings/rankings-search";
import { RankingsStats } from "@/components/rankings/rankings-stats";
import { RankingsList } from "@/components/rankings/rankings-list";
import { PerformanceCategories } from "@/components/rankings/performance-categories";
import {
  getRankingsFiltered,
  getRankingsStats,
  getPerformanceCategories,
  getBatchesForRankings,
} from "@/lib/rankings-services";
import { getStudentsWithMetrics } from "@/lib/students-services";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    batch?: string;
    batchStatus?: "all" | "active" | "completed";
  }>;
}

export default async function RankingsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const batchStatus = resolvedSearchParams.batchStatus || "all";

  const [rankings, stats, categories, batches, students] = await Promise.all([
    getRankingsFiltered(resolvedSearchParams),
    getRankingsStats(resolvedSearchParams),
    getPerformanceCategories(resolvedSearchParams),
    getBatchesForRankings(batchStatus),
    getStudentsWithMetrics({}),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <ResponsiveContainer>
        <RankingsHeader students={students} batches={batches} />
      </ResponsiveContainer>

      {/* Search/Filter Bar */}
      <ResponsiveContainer>
        <RankingsSearchClient
          batches={batches}
          currentBatchStatus={batchStatus}
          students={students}
        />
      </ResponsiveContainer>

      {/* Rankings Stats */}
      <ResponsiveContainer>
        <RankingsStats stats={stats} currentFilter={batchStatus} />
      </ResponsiveContainer>

      {/* Rankings List */}
      <ResponsiveContainer>
        <RankingsList students={rankings} />
      </ResponsiveContainer>

      {/* Performance Categories */}
      <ResponsiveContainer>
        <PerformanceCategories categories={categories} />
      </ResponsiveContainer>
    </div>
  );
}
