import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Clock, BookOpen } from "lucide-react";

interface BatchesStatsProps {
  stats?: {
    activeBatches: number;
    totalStudents: number;
    activeModules: number;
    avgDuration: number;
  };
}

export function BatchesStats({ stats }: BatchesStatsProps) {
  // Default stats if none provided
  const defaultStats = {
    activeBatches: 4,
    totalStudents: 127,
    activeModules: 8,
    avgDuration: 3,
  };

  const currentStats = stats || defaultStats;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
          <Users className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentStats.activeBatches}</div>
          <p className="text-xs text-muted-foreground">Currently running</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <GraduationCap className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentStats.totalStudents}</div>
          <p className="text-xs text-muted-foreground">Across all batches</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <BookOpen className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentStats.activeModules}</div>
          <p className="text-xs text-muted-foreground">Active modules</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          <Clock className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentStats.avgDuration}</div>
          <p className="text-xs text-muted-foreground">Months per batch</p>
        </CardContent>
      </Card>
    </div>
  );
}
