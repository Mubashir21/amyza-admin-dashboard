import { Button } from "@/components/ui/button";
import { BarChart3, Users } from "lucide-react";

interface DashboardHeaderProps {
  title?: string;
  description?: string;
}

export function DashboardHeader({
  title = "Dashboard",
  description = "Welcome back! Here's what's happening in your student portfolio system.",
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm">
          <BarChart3 className="mr-2 h-4 w-4" />
          View Reports
        </Button>
        <Button size="sm">
          <Users className="mr-2 h-4 w-4" />
          Quick Actions
        </Button>
      </div>
    </div>
  );
}
