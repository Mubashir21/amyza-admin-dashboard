"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  student_id: z.string().min(1, { message: "Please select a student." }),
  batch_id: z.string().min(1, { message: "Please select a batch." }),
  date: z.date({ message: "Please select a date." }),
  status: z.enum(["present", "absent", "late"], {
    message: "Please select attendance status.",
  }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MarkAttendanceDialogProps {
  students?: Array<{
    id: string;
    first_name: string;
    last_name: string;
    student_id: string;
    batch_id: string;
  }>;
  batches?: Array<{
    id: string;
    batch_code: string;
  }>;
  onAttendanceMarked?: () => void;
}

export function MarkAttendanceDialog({
  students = [],
  batches = [],
  onAttendanceMarked,
}: MarkAttendanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      student_id: "",
      batch_id: "",
      date: new Date(),
      status: undefined,
      notes: "",
    },
  });

  // Watch batch_id to filter students
  const selectedBatchId = form.watch("batch_id");
  const filteredStudents = selectedBatchId
    ? students.filter((student) => student.batch_id === selectedBatchId)
    : students;

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setError(null);

    try {
      // Calculate day of week (Sunday = 1, Monday = 2, etc.)
      const dayOfWeek =
        values.date.getDay() === 0 ? 1 : values.date.getDay() + 1;

      // Validate it's a class day (Sunday=1, Tuesday=3, Thursday=5)
      if (![1, 3, 5].includes(dayOfWeek)) {
        throw new Error(
          "Attendance can only be marked for Sunday, Tuesday, and Thursday"
        );
      }

      const attendanceData = {
        student_id: values.student_id,
        batch_id: values.batch_id,
        date: values.date.toISOString().split("T")[0], // Format as YYYY-MM-DD
        day_of_week: dayOfWeek,
        status: values.status,
        notes: values.notes || null,
      };

      console.log("Marking attendance:", attendanceData);

      // Insert attendance record into Supabase
      const { data, error: insertError } = await supabase
        .from("attendance")
        .insert([attendanceData])
        .select();

      if (insertError) {
        throw new Error(insertError.message);
      }

      console.log("Attendance marked successfully:", data);

      // Reset form and close dialog on success
      form.reset({
        student_id: "",
        batch_id: "",
        date: new Date(),
        status: undefined,
        notes: "",
      });
      setOpen(false);

      router.refresh();

      // Notify parent component to refresh data
      onAttendanceMarked?.();

      // Show success toast
      toast.success("Attendance marked successfully!");
    } catch (err: unknown) {
      console.error("Error marking attendance:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while marking attendance";
      setError(errorMessage);
      toast.error(
        err instanceof Error ? err.message : "Failed to mark attendance"
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Helper function to get day name
  const getDayName = (date: Date) => {
    const dayOfWeek = date.getDay() === 0 ? 1 : date.getDay() + 1;
    const days = { 1: "Sunday", 3: "Tuesday", 5: "Thursday" };
    return days[dayOfWeek as keyof typeof days] || "Non-class day";
  };

  // Helper function to check if date is a class day
  const isClassDay = (date: Date) => {
    const dayOfWeek = date.getDay() === 0 ? 1 : date.getDay() + 1;
    return [1, 3, 5].includes(dayOfWeek);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserCheck className="mr-2 h-4 w-4" />
          Mark Attendance
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
          <DialogDescription>
            Record student attendance for a specific date. Classes are held on
            Sunday, Tuesday, and Thursday.
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
              name="batch_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset student selection when batch changes
                      form.setValue("student_id", "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.batch_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="student_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedBatchId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            selectedBatchId
                              ? "Select student"
                              : "Select a batch first"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.student_id} - {student.first_name}{" "}
                          {student.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date *</FormLabel>
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
                            <div className="flex justify-between w-full">
                              <span>{format(field.value, "PPP")}</span>
                              <span
                                className={cn(
                                  "text-xs",
                                  isClassDay(field.value)
                                    ? "text-green-600"
                                    : "text-red-600"
                                )}
                              >
                                {getDayName(field.value)}
                              </span>
                            </div>
                          ) : (
                            <span>Pick a date</span>
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
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {field.value && !isClassDay(field.value) && (
                    <p className="text-xs text-red-600">
                      ⚠️ This is not a class day. Classes are held on Sunday,
                      Tuesday, and Thursday.
                    </p>
                  )}
                  <FormDescription>
                    Classes are held on Sunday, Tuesday, and Thursday only
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="present">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Present
                        </div>
                      </SelectItem>
                      <SelectItem value="absent">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Absent
                        </div>
                      </SelectItem>
                      <SelectItem value="late">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Late
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes about attendance (e.g., 'Called in sick', 'Left early for appointment')"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isLoading ? "Marking..." : "Mark Attendance"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
