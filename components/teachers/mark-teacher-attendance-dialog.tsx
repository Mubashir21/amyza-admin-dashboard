"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { getTeachers, markTeacherAttendance, Teacher } from "@/lib/teachers-services";
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
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, UserCheck, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  teacher_id: z.string().min(1, { message: "Please select a teacher." }),
  date: z.date({ message: "Please select a date." }),
  status: z.enum(["present", "absent", "late"], {
    message: "Please select attendance status.",
  }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function MarkTeacherAttendanceDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacher_id: "",
      date: new Date(),
      status: "present",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      loadTeachers();
    }
  }, [open]);

  const loadTeachers = async () => {
    setIsLoadingTeachers(true);
    try {
      console.log("Loading teachers...");
      const teachersData = await getTeachers();
      console.log("Raw teachers data:", teachersData);
      
      const activeTeachers = teachersData.filter(t => t.is_active === true);
      console.log("Active teachers:", activeTeachers);
      
      setTeachers(activeTeachers);
      
      if (activeTeachers.length === 0) {
        toast.info("No active teachers found. Please add teachers first.");
      } else {
        console.log(`Loaded ${activeTeachers.length} active teachers`);
      }
    } catch (error) {
      console.error("Error loading teachers:", error);
      toast.error(`Failed to load teachers: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTeachers([]);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  // Helper function to check if date is a class day (exactly like student attendance)
  const isClassDay = (date: Date) => {
    const dayOfWeek = date.getDay() === 0 ? 1 : date.getDay() + 1;
    return [7, 2, 5].includes(dayOfWeek);
  };

  async function onSubmit(values: FormValues) {
    // Validate class day
    if (!isClassDay(values.date)) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const selectedDayName = dayNames[values.date.getDay()];
      toast.error(
        `Attendance can only be marked for Saturday, Monday, and Thursday. You selected ${selectedDayName}.`
      );
      return;
    }

    setIsLoading(true);
    try {
      // Calculate day of week from the original Date object (exactly like student attendance)
      const dayOfWeek = values.date.getDay() === 0 ? 1 : values.date.getDay() + 1;
      
      const attendanceData = {
        teacher_id: values.teacher_id,
        date: values.date.toISOString().split('T')[0], // Format date for API
        day_of_week: dayOfWeek, // Pass calculated day_of_week
        status: values.status,
        notes: values.notes,
      };
      
      console.log("Submitting teacher attendance:", attendanceData);
      
      await markTeacherAttendance(attendanceData);
      
      toast.success("Teacher attendance marked successfully!");
      
      form.reset({
        teacher_id: "",
        date: new Date(),
        status: "present",
        notes: "",
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error marking attendance:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      
      let errorMessage = "Failed to mark attendance. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = `Failed to mark attendance: ${error.message}`;
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase error objects
        const supabaseError = error as { code?: string; message?: string; details?: string; hint?: string };
        
        if (supabaseError.code === '42P01') {
          errorMessage = "Teacher attendance table not found. Please run the setup SQL script.";
        } else if (supabaseError.code === '23503') {
          errorMessage = "Teacher not found or invalid teacher ID.";
        } else if (supabaseError.code === '23505') {
          errorMessage = "Attendance already marked for this teacher on this date.";
        } else if (supabaseError.message) {
          errorMessage = `Database error: ${supabaseError.message}`;
        } else if (supabaseError.details) {
          errorMessage = `Error: ${supabaseError.details}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserCheck className="mr-2 h-4 w-4" />
          Mark Attendance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mark Teacher Attendance</DialogTitle>
          <DialogDescription>
            Mark attendance for a teacher. Attendance can only be marked for class days (Saturday, Monday, Thursday).
          </DialogDescription>
        </DialogHeader>

        {/* Class Days Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Class Days</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Saturday (7), Monday (2), Thursday (5) - Only these days are valid for attendance
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="teacher_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingTeachers}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={
                            isLoadingTeachers 
                              ? "Loading teachers..." 
                              : teachers.length === 0 
                                ? "No active teachers found" 
                                : "Select a teacher"
                          } 
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingTeachers ? (
                        <SelectItem value="loading" disabled>
                          Loading teachers...
                        </SelectItem>
                      ) : teachers.length === 0 ? (
                        <SelectItem value="no-teachers" disabled>
                          No active teachers found
                        </SelectItem>
                      ) : (
                        teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.first_name} {teacher.last_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {teachers.length === 0 && !isLoadingTeachers && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Please add teachers first before marking attendance.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-3 border-b">
                        <p className="text-xs text-muted-foreground">
                          <span className="inline-block w-2 h-2 bg-blue-200 rounded-full mr-1"></span>
                          Class days are highlighted
                        </p>
                      </div>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        modifiers={{
                          classDay: (date) => isClassDay(date),
                        }}
                        modifiersStyles={{
                          classDay: { 
                            backgroundColor: '#dbeafe', 
                            color: '#1e40af',
                            fontWeight: 'bold'
                          },
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {field.value && (
                    <div className={`text-xs mt-1 flex items-center gap-1 ${
                      isClassDay(field.value) 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        isClassDay(field.value) 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                      }`}></div>
                      {isClassDay(field.value) 
                        ? 'Valid class day' 
                        : 'Not a class day (Sat, Mon, Thu only)'
                      }
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attendance Status</FormLabel>
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
                      <SelectItem value="late">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          Late
                        </div>
                      </SelectItem>
                      <SelectItem value="absent">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Absent
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
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about the attendance..."
                      className="resize-none"
                      rows={3}
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
