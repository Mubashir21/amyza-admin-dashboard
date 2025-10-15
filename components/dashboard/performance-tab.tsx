// components/dashboard/performance-tab.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type {
  TopPerformer,
  PerformanceCategory,
} from "@/lib/dashboard-services";

interface PerformanceTabProps {
  topPerformers: TopPerformer[];
  performanceCategories: PerformanceCategory[];
}

export function PerformanceTab({
  topPerformers,
  performanceCategories,
}: PerformanceTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>
            Students with highest scores this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((performer) => (
              <div key={performer.id} className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      performer.rank === 1
                        ? "bg-yellow-100 text-yellow-800"
                        : performer.rank === 2
                        ? "bg-gray-100 text-gray-800"
                        : performer.rank === 3
                        ? "bg-orange-100 text-orange-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {performer.rank}
                  </div>
                  {performer.rank <= 3 && (
                    <Star className="h-3 w-3 text-yellow-500" />
                  )}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {performer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{performer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {performer.student_id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{performer.score}/10</p>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUpRight className="h-3 w-3 mr-1" />+{performer.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Categories</CardTitle>
          <CardDescription>Average scores by skill category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceCategories.map((category, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">
                      {category.score}/10
                    </span>
                    {category.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                </div>
                <Progress value={category.score * 10} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
