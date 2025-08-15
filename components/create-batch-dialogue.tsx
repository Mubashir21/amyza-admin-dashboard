"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { CalendarIcon, Plus, BookOpen } from "lucide-react";
import { format, addMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { CreateBatchData } from "@/lib/batches-services";
import { useRouter } from "next/navigation";

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
    // Module names
    module_1: z.string().min(1, "Module 1 name is required"),
    module_2: z.string().min(1, "Module 2 name is required"),
    module_3: z.string().min(1, "Module 3 name is required"),
  })
  .refine((data) => data.end_date > data.start_date, {
    message: "End date must be after start date.",
    path: ["end_date"],
  });

type FormValues = z.infer<typeof formSchema>;

interface CreateBatchDialogProps {
  onBatchCreated?: () => void; // Callback to refresh the batch list
}

export function CreateBatchDialog({ onBatchCreated }: CreateBatchDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      batch_code: "",
      start_date: new Date(),
      end_date: addMonths(new Date(), 3),
      status: "upcoming",
      max_students: 30,
      module_1: "Intro to AI",
      module_2: "Vibe Coding + APIs",
      module_3: "AI Agents",
    },
  });

  // Watch start_date to auto-update end_date
  const startDate = form.watch("start_date");

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      form.setValue("start_date", date);
      // Auto-set end date to 3 months later
      form.setValue("end_date", addMonths(date, 3));
    }
  };

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare batch data for the service function
      const batchData: CreateBatchData = {
        batch_code: values.batch_code,
        start_date: values.start_date.toISOString().split("T")[0],
        end_date: values.end_date.toISOString().split("T")[0],
        status: values.status,
        max_students: values.max_students,
        current_module: 1, // Always start at module 1
        module_1: values.module_1,
        module_2: values.module_2,
        module_3: values.module_3,
      };

      console.log("Creating batch:", batchData);

      // Use the service function
      // const newBatch = await createBatch(batchData);

      // Reset form and close dialog on success
      form.reset();
      setOpen(false);

      router.refresh();

      // Call the callback to refresh the batch list
      onBatchCreated?.();

      // You could also show a success toast here
      toast.success("Batch created successfully!");
    } catch (err: unknown) {
      console.error("Error creating batch:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while creating the batch";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const generateBatchCode = () => {
    const now = new Date();
    const year = now.getFullYear();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[now.getMonth()];

    const suggestedCode = `${year}-${month}`;
    form.setValue("batch_code", suggestedCode);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Batch
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Batch</DialogTitle>
          <DialogDescription>
            Create a new student batch with 3 custom modules. You&apos;ll
            manually control progression through each module.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
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
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="2025-Aug"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateBatchCode}
                      >
                        Generate
                      </Button>
                    </div>
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
                            onSelect={handleStartDateChange}
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
                            disabled={(date) =>
                              date < startDate || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="upcoming">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              Upcoming
                            </div>
                          </SelectItem>
                          <SelectItem value="active">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Active
                            </div>
                          </SelectItem>
                          <SelectItem value="completed">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              Completed
                            </div>
                          </SelectItem>
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
              </div>
            </div>

            {/* Module Configuration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <h3 className="text-lg font-medium">Module Names</h3>
                <span className="text-sm text-muted-foreground">
                  (customize for this batch)
                </span>
              </div>

              {[1, 2, 3].map((moduleNum) => (
                <div
                  key={moduleNum}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <h4 className="font-medium">Module {moduleNum}</h4>

                  <FormField
                    control={form.control}
                    name={`module_${moduleNum}_name` as keyof FormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Module Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`e.g., ${
                              moduleNum === 1
                                ? "HTML & CSS"
                                : moduleNum === 2
                                ? "JavaScript Basics"
                                : "React Projects"
                            }`}
                            {...field}
                            value={String(field.value || "")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                    <span className="font-medium">Starting Module:</span>{" "}
                    {form.watch("module_1")}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Progression:</span>{" "}
                    {form.watch("module_1")} → {form.watch("module_2")} →{" "}
                    {form.watch("module_3")}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Batch"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
