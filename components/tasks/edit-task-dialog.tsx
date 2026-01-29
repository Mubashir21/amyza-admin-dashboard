"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardList, Lock } from "lucide-react";
import { toast } from "sonner";
import { updateTask, Task, TaskStatus } from "@/lib/tasks-services";
import { AdminUser } from "@/lib/admin-services";
import { useAuth } from "@/lib/auth-context";

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required.",
  }),
  description: z.string().optional(),
  assigned_to: z.string().optional(),
  deadline: z.string().optional(),
  deadline_locked: z.boolean(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  admins: AdminUser[];
}

export function EditTaskDialog({
  open,
  onOpenChange,
  task,
  admins,
}: EditTaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { adminProfile, userRole } = useAuth();

  const isSuperAdmin = userRole === "super_admin";

  // SuperAdmin: can assign to admins and themselves (not other superadmins)
  // Admin: can only assign to themselves
  const availableAdmins = isSuperAdmin
    ? admins.filter((a) => a.role === "admin" || a.user_id === adminProfile?.user_id)
    : admins.filter((a) => a.user_id === adminProfile?.user_id);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      description: "",
      assigned_to: "",
      deadline: "",
      deadline_locked: false,
      status: "NOT_STARTED",
    },
  });

  // Helper to format date for date input
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Format: YYYY-MM-DD
    return date.toISOString().slice(0, 10);
  };

  // Check if deadline is locked for this user
  const isDeadlineLocked = task.deadline_locked && !isSuperAdmin;

  // Populate form when task changes
  useEffect(() => {
    if (task && open) {
      form.reset({
        title: task.title || "",
        description: task.description || "",
        assigned_to: task.assigned_to || "",
        deadline: formatDateForInput(task.deadline),
        deadline_locked: task.deadline_locked || false,
        status: task.status || "NOT_STARTED",
      });
    }

    if (!open) {
      setError(null);
    }
  }, [task, open, form]);

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const updateData: Parameters<typeof updateTask>[1] = {
        title: values.title,
        description: values.description || null,
        status: values.status as TaskStatus,
        assigned_to: values.assigned_to || null,
      };

      // Only update deadline if not locked for this user, or if superadmin
      if (!isDeadlineLocked) {
        updateData.deadline = values.deadline ? new Date(values.deadline).toISOString() : null;
      }

      // Only superadmins can change the lock status
      if (isSuperAdmin) {
        updateData.deadline_locked = values.deadline_locked;
      }

      // Pass isSuperAdmin to enforce deadline lock check on server
      await updateTask(task.id, updateData, isSuperAdmin);

      toast.success("Task updated successfully!", {
        description: `"${values.title}" has been updated.`,
      });

      onOpenChange(false);
      router.refresh();
    } catch (err: unknown) {
      console.error("Error updating task:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while updating the task";
      setError(errorMessage);
      toast.error("Failed to update task", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Edit Task
          </DialogTitle>
          <DialogDescription>
            Update task details and assignment.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter task description..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Only show Assign To field for SuperAdmins */}
            {isSuperAdmin && (
              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === "unassigned" ? "" : value)} 
                      value={field.value || "unassigned"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {availableAdmins.map((admin) => (
                          <SelectItem key={admin.user_id} value={admin.user_id}>
                            {admin.first_name} {admin.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Deadline
                    {isDeadlineLocked && (
                      <span className="flex items-center gap-1 text-xs text-orange-600 font-normal">
                        <Lock className="h-3 w-3" />
                        Locked
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={isDeadlineLocked}
                      className={isDeadlineLocked ? "bg-muted cursor-not-allowed" : ""}
                      {...field}
                    />
                  </FormControl>
                  {isDeadlineLocked && (
                    <FormDescription className="text-orange-600">
                      This deadline has been locked by a Super Admin.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Only show Lock Deadline checkbox for SuperAdmins */}
            {isSuperAdmin && (
              <FormField
                control={form.control}
                name="deadline_locked"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Lock Deadline
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Task"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
