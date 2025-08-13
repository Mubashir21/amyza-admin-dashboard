import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  Calendar,
  Trophy,
} from "lucide-react";

interface DashboardStats {
  totalStudents: {
    count: number;
    trend: number;
    trendDirection: "up" | "down";
    progress: number;
  };
  activeBatches: {
    count: number;
    newThisQuarter: number;
    progress: number;
  };
  avgAttendance: {
    percentage: number;
    trend: number;
    trendDirection: "up" | "down";
  };
  performanceScore: {
    score: number;
    maxScore: number;
    trend: number;
    trendDirection: "up" | "down";
  };
}

interface DashboardStatsProps {
  stats: DashboardStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <GraduationCap className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalStudents.count}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            {stats.totalStudents.trendDirection === "up" ? (
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
            )}
            <span
              className={
                stats.totalStudents.trendDirection === "up"
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {stats.totalStudents.trendDirection === "up" ? "+" : ""}
              {stats.totalStudents.trend}%
            </span>
            <span className="ml-1">from last month</span>
          </div>
          <Progress value={stats.totalStudents.progress} className="mt-2 h-1" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
          <Users className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeBatches.count}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
            <span className="text-green-600">
              +{stats.activeBatches.newThisQuarter}
            </span>
            <span className="ml-1">new this quarter</span>
          </div>
          <Progress value={stats.activeBatches.progress} className="mt-2 h-1" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
          <Calendar className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.avgAttendance.percentage}%
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            {stats.avgAttendance.trendDirection === "up" ? (
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
            )}
            <span
              className={
                stats.avgAttendance.trendDirection === "up"
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {stats.avgAttendance.trendDirection === "up" ? "+" : ""}
              {stats.avgAttendance.trend}%
            </span>
            <span className="ml-1">from last week</span>
          </div>
          <Progress
            value={stats.avgAttendance.percentage}
            className="mt-2 h-1"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Performance Score
          </CardTitle>
          <Trophy className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.performanceScore.score}/{stats.performanceScore.maxScore}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            {stats.performanceScore.trendDirection === "up" ? (
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
            )}
            <span
              className={
                stats.performanceScore.trendDirection === "up"
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {stats.performanceScore.trendDirection === "up" ? "+" : ""}
              {stats.performanceScore.trend}
            </span>
            <span className="ml-1">this month</span>
          </div>
          <Progress
            value={
              (stats.performanceScore.score / stats.performanceScore.maxScore) *
              100
            }
            className="mt-2 h-1"
          />
        </CardContent>
      </Card>
    </div>
  );
}
