"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CalendarIcon,
  Save,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  batch_id: string;
}

interface Batch {
  id: string;
  batch_code: string;
}

interface AttendanceState {
  [studentId: string]: "present" | "absent" | "late";
}

interface BulkAttendanceMarkerProps {
  batches: Batch[];
  onAttendanceMarked?: () => void;
}

export function BulkAttendanceMarker({
  batches,
  onAttendanceMarked,
}: BulkAttendanceMarkerProps) {
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();

  // Load students and existing attendance when batch and date are selected
  const loadStudentsAndAttendance = useCallback(async () => {
    if (!selectedBatch) return;

    setIsLoading(true);
    try {
      // Load students
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("id, student_id, first_name, last_name, batch_id")
        .eq("batch_id", selectedBatch)
        .eq("is_active", true)
        .order("first_name");

      if (studentsError) throw studentsError;

      setStudents(studentsData || []);

      // Load existing attendance for the selected date
      const formatDateSafely = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const formattedDate = formatDateSafely(selectedDate);

      const { data: existingAttendance, error: attendanceError } = await supabase
        .from("attendance")
        .select("student_id, status")
        .eq("batch_id", selectedBatch)
        .eq("date", formattedDate);

      if (attendanceError) throw attendanceError;

      // Initialize attendance state with existing data or empty
      const initialAttendance: AttendanceState = {};
      if (existingAttendance) {
        existingAttendance.forEach((record) => {
          initialAttendance[record.student_id] = record.status as "present" | "absent" | "late";
        });
      }
      setAttendance(initialAttendance);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load students and attendance");
    } finally {
      setIsLoading(false);
    }
  }, [selectedBatch, selectedDate]); // Add both selectedBatch and selectedDate as dependencies

  // Load students and attendance when batch or date changes
  useEffect(() => {
    if (selectedBatch) {
      loadStudentsAndAttendance();
    } else {
      setStudents([]);
      setAttendance({});
    }
  }, [selectedBatch, selectedDate, loadStudentsAndAttendance]); // Add selectedDate and loadStudentsAndAttendance to dependencies

  const updateAttendance = (
    studentId: string,
    status: "present" | "absent" | "late"
  ) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const markAllAs = (status: "present" | "absent" | "late") => {
    const newAttendance: AttendanceState = {};
    students.forEach((student) => {
      newAttendance[student.id] = status;
    });
    setAttendance(newAttendance);
  };

  const saveAttendance = async () => {
    if (!selectedBatch || students.length === 0) {
      toast.error("Please select a batch and ensure students are loaded");
      return;
    }

    // Validate class day
    const dayOfWeek =
      selectedDate.getDay() === 0 ? 1 : selectedDate.getDay() + 1;
    if (![1, 3, 5].includes(dayOfWeek)) {
      toast.error(
        "Attendance can only be marked for Sunday, Tuesday, and Thursday"
      );
      return;
    }

    setIsSaving(true);
    try {
      // Format date safely without timezone conversion
      const formatDateSafely = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const formattedDate = formatDateSafely(selectedDate);

      const attendanceRecords = students.map((student) => ({
        student_id: student.id,
        batch_id: selectedBatch,
        date: formattedDate,
        day_of_week: dayOfWeek,
        status: attendance[student.id],
        notes: null,
      }));

      // Use upsert to handle both new and existing attendance records
      const { error } = await supabase
        .from("attendance")
        .upsert(attendanceRecords, {
          onConflict: "student_id,date,batch_id",
          ignoreDuplicates: false
        });

      if (error) throw error;

      toast.success(`Attendance saved for ${students.length} students`);
      router.refresh();
      onAttendanceMarked?.();

      // Reset the form
      setAttendance({});
      setStudents([]);
      setSelectedBatch("");
    } catch (error: unknown) {
      console.error("Error saving attendance:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save attendance";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusIcon = (status: "present" | "absent" | "late") => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-3 w-3" />;
      case "absent":
        return <XCircle className="h-3 w-3" />;
      case "late":
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (
    status: "present" | "absent" | "late" | undefined
  ) => {
    switch (status) {
      case "present":
        return "border-green-300 bg-green-50/50";
      case "absent":
        return "border-red-300 bg-red-50/50";
      case "late":
        return "border-yellow-300 bg-yellow-50/50";
      default:
        return "border-gray-200 bg-gray-50/50"; // For unmarked students
    }
  };

  const getDayName = (date: Date) => {
    const dayOfWeek = date.getDay() === 0 ? 1 : date.getDay() + 1;
    const days = { 1: "Sunday", 3: "Tuesday", 5: "Thursday" };
    return days[dayOfWeek as keyof typeof days] || "Non-class day";
  };

  const isClassDay = (date: Date) => {
    const dayOfWeek = date.getDay() === 0 ? 1 : date.getDay() + 1;
    return [1, 3, 5].includes(dayOfWeek);
  };

  const presentCount = Object.values(attendance).filter(
    (s) => s === "present"
  ).length;
  const absentCount = Object.values(attendance).filter(
    (s) => s === "absent"
  ).length;
  const lateCount = Object.values(attendance).filter(
    (s) => s === "late"
  ).length;
  const unmarkedCount =
    students.length - (presentCount + absentCount + lateCount);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Attendance Marking
          </CardTitle>
          <CardDescription>
            Select a batch and date to mark attendance for all students at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Batch *</label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.batch_code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      <div className="flex justify-between w-full">
                        <span>{format(selectedDate, "PPP")}</span>
                        <span
                          className={cn(
                            "text-xs",
                            isClassDay(selectedDate)
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                        >
                          {getDayName(selectedDate)}
                        </span>
                      </div>
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {selectedDate && !isClassDay(selectedDate) && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ This is not a class day. Classes are held on Sunday,
                  Tuesday, and Thursday.
                </p>
              )}
            </div>
          </div>

          {students.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAs("present")}
                className="text-green-700 border-green-200 hover:bg-green-50"
              >
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Mark All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAs("absent")}
                className="text-red-700 border-red-200 hover:bg-red-50"
              >
                <XCircle className="mr-1 h-4 w-4" />
                Mark All Absent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAs("late")}
                className="text-yellow-700 border-yellow-200 hover:bg-yellow-50"
              >
                <Clock className="mr-1 h-4 w-4" />
                Mark All Late
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Students List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Loading students...
            </div>
          </CardContent>
        </Card>
      ) : students.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Students ({students.length})</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-green-700">
                  Present: {presentCount}
                </Badge>
                <Badge variant="outline" className="text-red-700">
                  Absent: {absentCount}
                </Badge>
                <Badge variant="outline" className="text-yellow-700">
                  Late: {lateCount}
                </Badge>
                {unmarkedCount > 0 && (
                  <Badge variant="outline" className="text-gray-700">
                    Unmarked: {unmarkedCount}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className={cn(
                    "flex items-center justify-between p-3 border rounded-lg transition-colors",
                    getStatusColor(attendance[student.id])
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {student.first_name[0]}
                        {student.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {student.student_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {(["present", "absent", "late"] as const).map((status) => (
                      <Button
                        key={status}
                        variant={
                          attendance[student.id] === status
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => updateAttendance(student.id, status)}
                        className={cn(
                          "h-8 px-2",
                          attendance[student.id] === status &&
                            status === "present" &&
                            "bg-green-600 hover:bg-green-700",
                          attendance[student.id] === status &&
                            status === "absent" &&
                            "bg-red-600 hover:bg-red-700",
                          attendance[student.id] === status &&
                            status === "late" &&
                            "bg-yellow-600 hover:bg-yellow-700"
                        )}
                      >
                        {getStatusIcon(status)}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setAttendance({});
                  setStudents([]);
                  setSelectedBatch("");
                }}
                disabled={isSaving}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button
                onClick={saveAttendance}
                disabled={
                  isSaving ||
                  !selectedBatch ||
                  students.length === 0 ||
                  unmarkedCount > 0
                }
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving
                  ? "Saving..."
                  : unmarkedCount > 0
                  ? `Mark all students (${unmarkedCount} unmarked)`
                  : `Save Attendance (${students.length})`}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : selectedBatch ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              No active students found in this batch
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
