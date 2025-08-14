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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarIcon, BookOpen, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { updateBatch } from "@/lib/batches-services";

const formSchema = z
  .object({
    batch_code: z
      .string()
      .min(1, {
        message: "Batch code is required.",
      })
      .regex(/^\d{4}-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/, {
        message: "Batch code should be in format YYYY-MMM (e.g., 2025-Aug).",
      }),
    start_date: z.date({
      message: "Please select a start date.",
    }),
    end_date: z.date({
      message: "Please select an end date.",
    }),
    status: z.enum(["upcoming", "active", "completed"], {
      message: "Please select a status.",
    }),
    max_students: z
      .number()
      .min(1, {
        message: "Maximum students must be at least 1.",
      })
      .max(100, {
        message: "Maximum students cannot exceed 100.",
      }),
    current_module: z.number().min(1).max(3),
    // Module names
    module_1_name: z.string().min(1, "Module 1 name is required"),
    module_2_name: z.string().min(1, "Module 2 name is required"),
    module_3_name: z.string().min(1, "Module 3 name is required"),
  })
  .refine((data) => data.end_date > data.start_date, {
    message: "End date must be after start date.",
    path: ["end_date"],
  });

type FormValues = z.infer<typeof formSchema>;

interface EditBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: any;
}

export function EditBatchDialog({
  open,
  onOpenChange,
  batch,
}: EditBatchDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReactivationWarning, setShowReactivationWarning] = useState(false);
  const router = useRouter();

  console.log("EditBatchDialog batch:", batch);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
  });

  const watchedStatus = form.watch("status");
  const watchedCurrentModule = form.watch("current_module");

  // Check if we're reactivating a completed batch
  useEffect(() => {
    const isReactivating =
      batch?.status === "completed" &&
      (watchedStatus === "active" || watchedStatus === "upcoming");
    setShowReactivationWarning(isReactivating);
  }, [batch?.status, watchedStatus]);

  // Populate form when batch data changes
  useEffect(() => {
    if (batch && open) {
      // Helper function to safely parse dates
      const parseDate = (dateString: string) => {
        if (!dateString) return new Date();
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? new Date() : date;
      };

      form.reset({
        batch_code: batch.batch_code || "",
        start_date: parseDate(batch.start_date),
        end_date: parseDate(batch.end_date),
        status: batch.status || "upcoming",
        max_students: batch.max_students || 30,
        current_module: batch.current_module || 1,
        module_1_name: batch.module_1_name || batch.module_1 || "",
        module_2_name: batch.module_2_name || batch.module_2 || "",
        module_3_name: batch.module_3_name || batch.module_3 || "",
      });
    }
  }, [batch, open, form]);

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const updateData = {
        batch_code: values.batch_code,
        start_date: values.start_date.toISOString().split("T")[0],
        end_date: values.end_date.toISOString().split("T")[0],
        status: values.status,
        max_students: values.max_students,
        current_module: values.current_module,
        module_1: values.module_1_name,
        module_2: values.module_2_name,
        module_3: values.module_3_name,
        updated_at: new Date().toISOString(),
      };

      console.log("Updating batch:", updateData);
      console.log(
        "Original status:",
        batch.status,
        "New status:",
        values.status
      );

      await updateBatch(batch.id, updateData);

      onOpenChange(false);
      router.refresh();

      // Show success message
      // toast.success("Batch updated successfully!");
    } catch (err: any) {
      console.error("Error updating batch:", err);
      setError(err.message || "An error occurred while updating the batch");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Batch</DialogTitle>
          <DialogDescription>
            Update batch information and module details.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {showReactivationWarning && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Reactivating Completed Batch</AlertTitle>
            <AlertDescription>
              Changing this batch from "completed" to "active" or "upcoming"
              will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  Reactivate all students in this batch (set is_active = true)
                </li>
                <li>Allow the batch to progress through modules again</li>
                <li>Reset attendance tracking and performance evaluations</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Batch Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Batch Information</h3>

              <FormField
                control={form.control}
                name="batch_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="2025-Aug" {...field} />
                    </FormControl>
                    <FormDescription>
                      Format: YYYY-MMM (e.g., 2025-Aug, 2025-Dec)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PP")
                              ) : (
                                <span>Pick start date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PP")
                              ) : (
                                <span>Pick end date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_students"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Students *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="current_module"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Module *</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select module" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Module 1</SelectItem>
                          <SelectItem value="2">Module 2</SelectItem>
                          <SelectItem value="3">Module 3</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {watchedStatus === "completed" && (
                        <FormDescription>
                          For completed batches, this represents the final
                          module reached.
                        </FormDescription>
                      )}
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Module Configuration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <h3 className="text-lg font-medium">Module Names</h3>
              </div>

              {[1, 2, 3].map((moduleNum) => (
                <FormField
                  key={moduleNum}
                  control={form.control}
                  name={`module_${moduleNum}_name` as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Module {moduleNum} Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`e.g., ${
                            moduleNum === 1
                              ? "Foundation"
                              : moduleNum === 2
                              ? "Intermediate"
                              : "Advanced"
                          } Module`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* Batch Summary */}
            {form.watch("start_date") && form.watch("end_date") && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium">Batch Summary</p>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Duration:</span>{" "}
                    {format(form.watch("start_date"), "PP")} to{" "}
                    {format(form.watch("end_date"), "PP")}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    {watchedStatus?.charAt(0).toUpperCase() +
                      watchedStatus?.slice(1)}
                  </div>
                  <div>
                    <span className="font-medium">Current Module:</span>{" "}
                    {watchedStatus === "completed"
                      ? "All modules completed"
                      : form.watch("module_1_name") &&
                        watchedCurrentModule === 1
                      ? form.watch("module_1_name")
                      : form.watch("module_2_name") &&
                        watchedCurrentModule === 2
                      ? form.watch("module_2_name")
                      : form.watch("module_3_name") &&
                        watchedCurrentModule === 3
                      ? form.watch("module_3_name")
                      : ""}
                  </div>
                  <div>
                    <span className="font-medium">Max Students:</span>{" "}
                    {form.watch("max_students")}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Module Progression:</span>{" "}
                    {form.watch("module_1_name")} →{" "}
                    {form.watch("module_2_name")} →{" "}
                    {form.watch("module_3_name")}
                  </div>
                </div>
              </div>
            )}

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
                {isLoading ? "Updating..." : "Update Batch"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
