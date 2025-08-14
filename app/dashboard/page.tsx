import { ResponsiveContainer } from "@/components/responsive-container";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { PerformanceTab } from "@/components/dashboard/performance-tab";
import { AttendanceTab } from "@/components/dashboard/attendance-tab";
import { AlertsTab } from "@/components/dashboard/alerts-tab";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getDashboardStats,
  getRecentActivity,
  getBatchOverview,
  getTopPerformers,
  getPerformanceCategories,
  getAttendanceSummary,
  getSystemAlerts,
} from "@/lib/dashboard-services";

export default async function DashboardPage() {
  try {
    // Fetch all dashboard data server-side
    const [
      stats,
      activities,
      batches,
      topPerformers,
      performanceCategories,
      attendanceSummary,
      systemAlerts,
    ] = await Promise.all([
      getDashboardStats(),
      getRecentActivity(),
      getBatchOverview(),
      getTopPerformers(),
      getPerformanceCategories(),
      getAttendanceSummary(),
      getSystemAlerts(),
    ]);

    return (
      <div className="space-y-6">
        {/* Dashboard Header */}
        <ResponsiveContainer>
          <DashboardHeader />
        </ResponsiveContainer>

        {/* Stats Cards */}
        <ResponsiveContainer>
          <DashboardStats stats={stats} />
        </ResponsiveContainer>

        {/* Main Content Tabs */}
        <ResponsiveContainer>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              {/* <TabsTrigger value="alerts">Alerts</TabsTrigger> */}
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <OverviewTab activities={activities} batches={batches} />
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <PerformanceTab
                topPerformers={topPerformers}
                performanceCategories={performanceCategories}
              />
            </TabsContent>

            <TabsContent value="attendance" className="space-y-4">
              <AttendanceTab attendanceSummary={attendanceSummary} />
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <AlertsTab alerts={systemAlerts} />
            </TabsContent>
          </Tabs>
        </ResponsiveContainer>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);

    return (
      <div className="space-y-6">
        <ResponsiveContainer>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Dashboard
            </h2>
            <p className="text-muted-foreground">
              Failed to load dashboard data. Please try refreshing the page.
            </p>
          </div>
        </ResponsiveContainer>
      </div>
    );
  }
}
