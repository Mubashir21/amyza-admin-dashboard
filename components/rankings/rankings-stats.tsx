import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, TrendingUp, Award } from "lucide-react";

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
}

interface RankingsStatsProps {
  stats: RankingsStats;
}

export function RankingsStats({ stats }: RankingsStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
          <Trophy className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.topPerformer.name}</div>
          <p className="text-xs text-muted-foreground">
            {stats.topPerformer.score}/10 overall score
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <Target className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageScore}/10</div>
          <p className="text-xs text-muted-foreground">Across all students</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Improved</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.mostImproved.name}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.mostImproved.improvement} points this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Award className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalStudents}</div>
          <p className="text-xs text-muted-foreground">
            Across {stats.activeBatches} active batches
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
