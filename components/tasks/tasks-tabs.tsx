"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Users, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Task } from "@/lib/tasks-services";
import { AdminUser } from "@/lib/admin-services";
import { TasksTable } from "@/components/tasks/tasks-table";
import { cn } from "@/lib/utils";

interface TasksTabsProps {
  tasks: Task[];
  admins: AdminUser[];
}

interface GroupedTasks {
  id: string;
  admin: AdminUser | null;
  tasks: Task[];
  label: string;
}

export function TasksTabs({ tasks, admins }: TasksTabsProps) {
  const { adminProfile, userRole } = useAuth();
  const isSuperAdmin = userRole === "super_admin";
  
  // Default to "My Tasks" for everyone
  const [activeTab, setActiveTab] = useState("my-tasks");
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  // Filter tasks for current user
  const myTasks = tasks.filter(
    (task) => task.assigned_to === adminProfile?.user_id
  );

  // Group tasks by assignee - only admins (not superadmins, not current user)
  const groupTasksByAssignee = (): GroupedTasks[] => {
    const groups: GroupedTasks[] = [];
    
    // Get tasks for each admin only (not super_admins, not current user)
    admins
      .filter((admin) => admin.role === "admin" && admin.user_id !== adminProfile?.user_id)
      .forEach((admin) => {
        const adminTasks = tasks.filter((task) => task.assigned_to === admin.user_id);
        if (adminTasks.length > 0) {
          groups.push({
            id: admin.user_id,
            admin,
            tasks: adminTasks,
            label: `${admin.first_name} ${admin.last_name}`,
          });
        }
      });
    
    return groups;
  };
  
  // Count total team tasks for the tab
  const teamTasksCount = groupTasksByAssignee().reduce((sum, group) => sum + group.tasks.length, 0);

  const groupedTasks = groupTasksByAssignee();

  const toggleRow = (rowId: string) => {
    setExpandedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  };

  // SuperAdmin: Show tabs with "My Tasks" and "All Tasks"
  if (isSuperAdmin) {
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="my-tasks">
            My Tasks ({myTasks.length})
          </TabsTrigger>
          <TabsTrigger value="team-tasks">
            Team Tasks ({teamTasksCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-tasks">
          <TasksTable tasks={myTasks} admins={admins} />
        </TabsContent>

        <TabsContent value="team-tasks">
          {groupedTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">No team tasks found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tasks assigned to admins will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Tasks by Admin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead className="text-center">Tasks</TableHead>
                      <TableHead className="text-center">Completed</TableHead>
                      <TableHead className="text-center">In Progress</TableHead>
                      <TableHead className="text-center">Not Started</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedTasks.map((group) => {
                      const isExpanded = expandedRows.includes(group.id);
                      const completedCount = group.tasks.filter(t => t.status === "COMPLETED").length;
                      const inProgressCount = group.tasks.filter(t => t.status === "IN_PROGRESS").length;
                      const notStartedCount = group.tasks.filter(t => t.status === "NOT_STARTED").length;
                      
                      return (
                        <React.Fragment key={group.id}>
                          <TableRow 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleRow(group.id)}
                          >
                            <TableCell>
                              <ChevronRight
                                className={cn(
                                  "h-4 w-4 transition-transform",
                                  isExpanded && "rotate-90"
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-blue-100">
                                  <User className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{group.label}</p>
                                  {group.admin && (
                                    <p className="text-sm text-muted-foreground">
                                      {group.admin.email}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {group.tasks.length}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                {completedCount}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                {inProgressCount}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                                {notStartedCount}
                              </Badge>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={6} className="p-0 bg-muted/30">
                                <div className="p-4">
                                  <TasksTable tasks={group.tasks} admins={admins} />
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    );
  }

  // Admin: Only show their own tasks (no tabs)
  return <TasksTable tasks={myTasks} admins={admins} />;
}
