// components/dashboard/overview-tab.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { BatchOverview } from "./batch-overview";
import { RecentActivity } from "./recent-activity";
import type { ActivityItem, BatchInfo } from "@/lib/dashboard-services";

interface OverviewTabProps {
  activities: ActivityItem[];
  batches: BatchInfo[];
}

export function OverviewTab({ activities, batches }: OverviewTabProps) {
  return (
    <>
      {/* Main Chart and Activity Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart Area */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Student Progress Analytics</CardTitle>
            <CardDescription>
              Performance trends across all batches over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center space-y-2">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Chart Component</p>
                <p className="text-xs text-muted-foreground">
                  Interactive analytics would go here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <RecentActivity activities={activities} />
      </div>

      {/* Batch Performance Grid */}
      <BatchOverview batches={batches} />
    </>
  );
}
