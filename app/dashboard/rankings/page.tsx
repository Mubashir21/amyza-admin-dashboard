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
import { getStudentsForAttendance } from "@/lib/attendance-services";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    batch?: string;
  }>;
}

export default async function RankingsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  const [rankings, stats, categories, batches, students] = await Promise.all([
    getRankingsFiltered(resolvedSearchParams),
    getRankingsStats(),
    getPerformanceCategories(),
    getBatchesForRankings(),
    getStudentsForAttendance(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <ResponsiveContainer>
        <RankingsHeader students={students} batches={batches} />
      </ResponsiveContainer>

      {/* Search/Filter Bar */}
      <ResponsiveContainer>
        <RankingsSearchClient batches={batches} />
      </ResponsiveContainer>

      {/* Rankings Stats */}
      <ResponsiveContainer>
        <RankingsStats stats={stats} />
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
