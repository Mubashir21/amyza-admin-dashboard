import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Calendar, Trophy, AlertTriangle } from "lucide-react";

interface ActivityItem {
  id: string;
  action: string;
  time: string;
  type: "success" | "info" | "warning" | "error";
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "success":
        return CheckCircle;
      case "info":
        return Calendar;
      case "warning":
        return Trophy;
      case "error":
        return AlertTriangle;
      default:
        return CheckCircle;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-600";
      case "info":
        return "bg-blue-100 text-blue-600";
      case "warning":
        return "bg-orange-100 text-orange-600";
      case "error":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates from your system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((item) => {
            const IconComponent = getActivityIcon(item.type);
            return (
              <div key={item.id} className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${getActivityColor(item.type)}`}
                >
                  <IconComponent className="h-3 w-3" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
