"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Edit, Trash2, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { canManageTasks } from "@/lib/roles";
import { Task, deleteTask, TaskStatus } from "@/lib/tasks-services";
import { AdminUser } from "@/lib/admin-services";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";

interface TasksTableProps {
  tasks: Task[];
  admins: AdminUser[];
}

function getStatusBadgeVariant(status: TaskStatus) {
  switch (status) {
    case "NOT_STARTED":
      return "secondary";
    case "IN_PROGRESS":
      return "default";
    case "COMPLETED":
      return "outline";
    default:
      return "secondary";
  }
}

function getStatusBadgeClass(status: TaskStatus) {
  switch (status) {
    case "NOT_STARTED":
      return "bg-gray-100 text-gray-800 border-gray-300";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "COMPLETED":
      return "bg-green-100 text-green-800 border-green-300";
    default:
      return "";
  }
}

function getStatusDisplayName(status: TaskStatus) {
  switch (status) {
    case "NOT_STARTED":
      return "Not Started";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    default:
      return status;
  }
}

function formatShortDate(dateString: string | null) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function TasksTable({ tasks, admins }: TasksTableProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { adminProfile, userRole } = useAuth();
  const isSuperAdmin = userRole === "super_admin";
  const canManage = canManageTasks(userRole);

  // Helper to find admin by user_id (auth.users.id)
  const getAdminByUserId = (userId: string | null) => {
    if (!userId) return null;
    return admins.find((a) => a.user_id === userId) || null;
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setShowEditDialog(true);
  };

  const handleDeleteClick = (task: Task) => {
    setSelectedTask(task);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedTask) return;

    setIsDeleting(true);
    try {
      await deleteTask(selectedTask.id);

      toast.success("Task deleted successfully!", {
        description: `"${selectedTask.title}" has been removed.`,
      });

      setShowDeleteDialog(false);
      setSelectedTask(null);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete task:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while deleting the task";
      toast.error("Failed to delete task", {
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">No tasks found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first task to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            All Tasks ({tasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Completed At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const assignee = getAdminByUserId(task.assigned_to);
                return (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium max-w-[200px]">
                      <div className="truncate" title={task.title}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div
                          className="text-xs text-muted-foreground truncate"
                          title={task.description}
                        >
                          {task.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(task.status)}
                        className={getStatusBadgeClass(task.status)}
                      >
                        {getStatusDisplayName(task.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {assignee ? (
                        <div>
                          <div className="font-medium">
                            {assignee.first_name} {assignee.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {assignee.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {task.deadline ? (
                        <span className={
                          new Date(task.deadline) < new Date() && task.status !== "COMPLETED"
                            ? "text-red-600 font-medium"
                            : ""
                        }>
                          {formatShortDate(task.deadline)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatShortDate(task.created_at)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {task.completed_at ? (
                        formatShortDate(task.completed_at)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {(() => {
                        // SuperAdmin can edit/delete any task
                        // Admin can only edit/delete their own tasks
                        const isOwnTask = task.assigned_to === adminProfile?.user_id;
                        const canEditThis = isSuperAdmin || (canManage && isOwnTask);
                        
                        return (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEdit(task)}
                                disabled={!canEditThis}
                                className={
                                  !canEditThis ? "opacity-50 cursor-not-allowed" : ""
                                }
                                title={!canEditThis ? "You can only edit your own tasks" : ""}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Task
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className={`text-destructive ${
                                  !canEditThis ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                                onClick={() => canEditThis && handleDeleteClick(task)}
                                disabled={!canEditThis}
                                title={
                                  !canEditThis ? "You can only delete your own tasks" : ""
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Task
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Task Dialog */}
      {selectedTask && (
        <EditTaskDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          task={selectedTask}
          admins={admins}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedTask?.title}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Task"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
