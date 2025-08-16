import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, TrendingUp, Users } from "lucide-react";

interface RankingsStats {
  topPerformer: {
    name: string;
    score: number;
  };
  averageScore: number;
  mostImproved: {
    name: string;
    improvement: number;
  };
  totalStudents: number;
  activeBatches: number;
  completedBatches: number;
}

interface RankingsStatsProps {
  stats: RankingsStats;
  currentFilter?: "all" | "active" | "completed";
}

export function RankingsStats({
  stats,
  currentFilter = "all",
}: RankingsStatsProps) {
  // Dynamic text based on current filter
  const getStudentsText = () => {
    switch (currentFilter) {
      case "active":
        return `From ${stats.activeBatches} active batch${
          stats.activeBatches !== 1 ? "es" : ""
        }`;
      case "completed":
        return `From ${stats.completedBatches} completed batch${
          stats.completedBatches !== 1 ? "es" : ""
        }`;
      default:
        return `From ${
          stats.activeBatches + stats.completedBatches
        } total batches`;
    }
  };

  const getAverageText = () => {
    switch (currentFilter) {
      case "active":
        return "Active students average";
      case "completed":
        return "Completed students average";
      default:
        return "Overall average score";
    }
  };

  const getTopPerformerText = () => {
    switch (currentFilter) {
      case "active":
        return "Top active student";
      case "completed":
        return "Top completed student";
      default:
        return "Overall top performer";
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
          <Trophy className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.topPerformer.name || "No data"}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.topPerformer.score > 0
              ? `${stats.topPerformer.score}/10 • ${getTopPerformerText()}`
              : getTopPerformerText()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <Target className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.averageScore > 0 ? `${stats.averageScore}/10` : "No data"}
          </div>
          <p className="text-xs text-muted-foreground">{getAverageText()}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Improved</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.mostImproved.name || "No data"}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.mostImproved.improvement > 0
              ? `+${stats.mostImproved.improvement} points this month`
              : "Improvement tracking"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {currentFilter === "active"
              ? "Active Students"
              : currentFilter === "completed"
              ? "Completed Students"
              : "Total Students"}
          </CardTitle>
          <Users className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalStudents}</div>
          <p className="text-xs text-muted-foreground">{getStudentsText()}</p>
        </CardContent>
      </Card>
    </div>
  );
}
