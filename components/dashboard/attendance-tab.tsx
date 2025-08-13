// components/dashboard/attendance-tab.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import type { AttendanceSummary } from "@/lib/dashboard-services";

interface AttendanceTabProps {
  attendanceSummary: AttendanceSummary | null;
}

export function AttendanceTab({ attendanceSummary }: AttendanceTabProps) {
  if (!attendanceSummary) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading attendance data...</p>
      </div>
    );
  }

  return (
    <>
      {/* Attendance Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">
                {attendanceSummary.todayPercentage}%
              </div>
              <p className="text-sm text-muted-foreground">Students Present</p>
              <div className="text-xs text-muted-foreground">
                {attendanceSummary.todayPresent} of{" "}
                {attendanceSummary.todayTotal} students
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600">
                {attendanceSummary.weeklyAverage}%
              </div>
              <p className="text-sm text-muted-foreground">
                Average Attendance
              </p>
              <div className="text-xs text-muted-foreground">
                Across all batches
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-orange-600">
                {attendanceSummary.trendDirection === "up" ? "+" : ""}
                {attendanceSummary.weeklyTrend}%
              </div>
              <p className="text-sm text-muted-foreground">vs Last Week</p>
              <div className="text-xs text-muted-foreground">
                {attendanceSummary.trendDirection === "up"
                  ? "Improvement"
                  : "Slight decrease"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Heatmap</CardTitle>
          <CardDescription>
            Attendance patterns by day and batch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center bg-muted/50 rounded-lg">
            <div className="text-center space-y-2">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Attendance Heatmap
              </p>
              <p className="text-xs text-muted-foreground">
                Visual attendance patterns would display here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
