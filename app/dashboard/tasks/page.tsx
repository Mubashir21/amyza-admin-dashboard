import { ResponsiveContainer } from "@/components/responsive-container";
import { TasksHeader } from "@/components/tasks/tasks-header";
import { TasksTabs } from "@/components/tasks/tasks-tabs";
import { TasksStats } from "@/components/tasks/tasks-stats";
import { TasksAccessGuard } from "@/components/tasks/tasks-access-guard";
import { getTasks, getTaskStats } from "@/lib/tasks-services";
import { getAllAdminUsers } from "@/lib/admin-services";

export default async function TasksPage() {
  const [tasks, stats, admins] = await Promise.all([
    getTasks(),
    getTaskStats(),
    getAllAdminUsers(),
  ]);

  return (
    <TasksAccessGuard>
      <div className="space-y-6">
        {/* Page Header */}
        <ResponsiveContainer>
          <TasksHeader admins={admins} />
        </ResponsiveContainer>

        {/* Task Stats */}
        <ResponsiveContainer>
          <TasksStats stats={stats} />
        </ResponsiveContainer>

        {/* Tasks Table with Tabs for SuperAdmin */}
        <ResponsiveContainer>
          <TasksTabs tasks={tasks} admins={admins} />
        </ResponsiveContainer>
      </div>
    </TasksAccessGuard>
  );
}
