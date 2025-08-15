import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, Calendar } from "lucide-react";

interface AttendanceStats {
  todayAttendance: {
    percentage: number;
    present: number;
    total: number;
  };
  weeklyAverage: number;
  lateArrivals: number;
  absentStudents: number;
}

interface AttendanceStatsProps {
  stats: AttendanceStats;
}

export function AttendanceStats({ stats }: AttendanceStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Today&apos;s Attendance
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.todayAttendance.percentage}%
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.todayAttendance.present} of {stats.todayAttendance.total}{" "}
            students present
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <Calendar className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {stats.weeklyAverage}%
          </div>
          <p className="text-xs text-muted-foreground">Average attendance</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
          <Clock className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {stats.lateArrivals}
          </div>
          <p className="text-xs text-muted-foreground">
            Students arrived late today
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Absent Students</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {stats.absentStudents}
          </div>
          <p className="text-xs text-muted-foreground">Students absent today</p>
        </CardContent>
      </Card>
    </div>
  );
}
