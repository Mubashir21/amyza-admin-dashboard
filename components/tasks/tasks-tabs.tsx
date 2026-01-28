"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { Task } from "@/lib/tasks-services";
import { AdminUser } from "@/lib/admin-services";
import { TasksTable } from "@/components/tasks/tasks-table";

interface TasksTabsProps {
  tasks: Task[];
  admins: AdminUser[];
}

export function TasksTabs({ tasks, admins }: TasksTabsProps) {
  const { adminProfile, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState("my-tasks");

  const isSuperAdmin = userRole === "super_admin";

  // Filter tasks for current user
  const myTasks = tasks.filter(
    (task) => task.assigned_to === adminProfile?.user_id
  );

  // SuperAdmin: Show tabs with "My Tasks" and "All Tasks"
  if (isSuperAdmin) {
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="my-tasks">
            My Tasks ({myTasks.length})
          </TabsTrigger>
          <TabsTrigger value="all-tasks">
            All Tasks ({tasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-tasks">
          <TasksTable tasks={myTasks} admins={admins} />
        </TabsContent>

        <TabsContent value="all-tasks">
          <TasksTable tasks={tasks} admins={admins} />
        </TabsContent>
      </Tabs>
    );
  }

  // Admin: Only show their own tasks (no tabs)
  return <TasksTable tasks={myTasks} admins={admins} />;
}
