import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Trophy, TrendingUp, TrendingDown } from "lucide-react";

interface StudentsStatsData {
  totalStudents: number;
  activeStudents: number;
  averagePerformance: number;
  averageAttendance: number;
  newStudentsThisMonth: number;
  performanceTrend: number;
  performanceTrendDirection: "up" | "down";
}

interface StudentsStatsProps {
  stats: StudentsStatsData;
}

export function StudentsStats({ stats }: StudentsStatsProps) {
  const activePercentage =
    stats.totalStudents > 0
      ? Math.round((stats.activeStudents / stats.totalStudents) * 100)
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalStudents}</div>
          <p className="text-xs text-muted-foreground">
            {stats.newStudentsThisMonth > 0
              ? `+${stats.newStudentsThisMonth} new this month`
              : "No new students this month"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Students</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeStudents}</div>
          <p className="text-xs text-muted-foreground">
            {activePercentage}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Average Performance
          </CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.averagePerformance}/10
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            {stats.performanceTrend > 0 ? (
              <>
                {stats.performanceTrendDirection === "up" ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                )}
                <span
                  className={
                    stats.performanceTrendDirection === "up"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {stats.performanceTrendDirection === "up" ? "+" : ""}
                  {stats.performanceTrend}
                </span>
                <span className="ml-1">from last month</span>
              </>
            ) : (
              <span>No change from last month</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageAttendance}%</div>
          <p className="text-xs text-muted-foreground">
            Average across all students
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
