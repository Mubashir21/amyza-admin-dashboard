"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
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
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, User, Target } from "lucide-react";

const formSchema = z.object({
  student_id: z.string().min(1, { message: "Please select a student." }),
  batch_id: z.string().min(1, { message: "Please select a batch." }),
  creativity: z.number().min(0).max(10),
  leadership: z.number().min(0).max(10),
  behavior: z.number().min(0).max(10),
  presentation: z.number().min(0).max(10),
  communication: z.number().min(0).max(10),
  technical_skills: z.number().min(0).max(10),
  general_performance: z.number().min(0).max(10),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_id: string;
  batch_id: string;
}

interface Batch {
  id: string;
  batch_code: string;
}

interface UpdatePerformanceDialogProps {
  students?: Student[];
  batches?: Batch[];
  onPerformanceUpdated?: () => void;
}

export function UpdatePerformanceDialog({
  students = [],
  batches = [],
  onPerformanceUpdated,
}: UpdatePerformanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>(students);
  const [allBatches, setAllBatches] = useState<Batch[]>(batches);

  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      student_id: "",
      batch_id: "",
      creativity: 8,
      leadership: 8,
      behavior: 10, // Behavior starts at 10 as mentioned in your schema
      presentation: 8,
      communication: 8,
      technical_skills: 8,
      general_performance: 8,
      notes: "",
    },
  });

  // Watch batch_id to filter students
  const selectedBatchId = form.watch("batch_id");
  const filteredStudents = selectedBatchId
    ? allStudents.filter((student) => student.batch_id === selectedBatchId)
    : allStudents;

  // Load data when dialog opens if not provided
  useEffect(() => {
    if (!open || (allStudents.length > 0 && allBatches.length > 0)) return;

    const loadData = async () => {
      try {
        if (allStudents.length === 0) {
          const { data: studentsData, error: studentsError } = await supabase
            .from("students")
            .select("id, first_name, last_name, student_id, batch_id")
            .eq("is_active", true)
            .order("first_name");

          if (studentsError) throw studentsError;
          setAllStudents(studentsData || []);
        }

        if (allBatches.length === 0) {
          const { data: batchesData, error: batchesError } = await supabase
            .from("batches")
            .select("id, batch_code")
            .eq("status", "active")
            .order("batch_code");

          if (batchesError) throw batchesError;
          setAllBatches(batchesData || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load students and batches");
      }
    };

    loadData();
  }, [open, allStudents.length, allBatches.length]);

  // Load current performance when student is selected
  const selectedStudentId = form.watch("student_id");
  useEffect(() => {
    if (!selectedStudentId) return;

    const loadCurrentPerformance = async (studentId: string) => {
      try {
        const { data, error } = await supabase
          .from("students")
          .select(
            "creativity, leadership, behavior, presentation, communication, technical_skills, general_performance"
          )
          .eq("id", studentId)
          .single();

        if (error) throw error;

        if (data) {
          // Update form with current values
          form.setValue("creativity", data.creativity || 8);
          form.setValue("leadership", data.leadership || 8);
          form.setValue("behavior", data.behavior || 10);
          form.setValue("presentation", data.presentation || 8);
          form.setValue("communication", data.communication || 8);
          form.setValue("technical_skills", data.technical_skills || 8);
          form.setValue("general_performance", data.general_performance || 8);
        }
      } catch (error) {
        console.error("Error loading current performance:", error);
      }
    };

    loadCurrentPerformance(selectedStudentId);
  }, [selectedStudentId, form]);

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const performanceData = {
        creativity: values.creativity,
        leadership: values.leadership,
        behavior: values.behavior,
        presentation: values.presentation,
        communication: values.communication,
        technical_skills: values.technical_skills,
        general_performance: values.general_performance,
        updated_at: new Date().toISOString(),
      };

      console.log("Updating performance:", performanceData);

      // Update student performance metrics
      const { error } = await supabase
        .from("students")
        .update(performanceData)
        .eq("id", values.student_id);

      if (error) throw error;

      // Optionally save notes to a separate notes table
      if (values.notes?.trim()) {
        await supabase.from("student_notes").insert({
          student_id: values.student_id,
          note: values.notes,
          created_by: "admin", // You might want to get this from auth context
          type: "performance_update",
        });
      }

      const student = filteredStudents.find((s) => s.id === values.student_id);
      toast.success(
        `Performance updated for ${student?.first_name} ${student?.last_name}`
      );

      router.refresh();
      onPerformanceUpdated?.();

      // Reset form and close dialog
      form.reset();
      setOpen(false);
    } catch (err: unknown) {
      console.error("Error updating performance:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update performance";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const performanceMetrics = [
    {
      name: "creativity",
      label: "Creativity",
      description: "Innovation and creative thinking",
    },
    {
      name: "leadership",
      label: "Leadership",
      description: "Leadership skills and team collaboration",
    },
    {
      name: "behavior",
      label: "Behavior",
      description: "Professional conduct and attitude",
    },
    {
      name: "presentation",
      label: "Presentation",
      description: "Presentation and public speaking skills",
    },
    {
      name: "communication",
      label: "Communication",
      description: "Written and verbal communication",
    },
    {
      name: "technical_skills",
      label: "Technical Skills",
      description: "Technical proficiency and problem-solving",
    },
    {
      name: "general_performance",
      label: "General Performance",
      description: "Overall performance and work quality",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Trophy className="mr-2 h-4 w-4" />
          Update Performance
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Student Performance</DialogTitle>
          <DialogDescription>
            Update performance metrics for a student. All scores are on a scale
            of 0-10.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Student Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <h3 className="text-lg font-medium">Student Selection</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          {allBatches.map((batch) => (
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
              </div>
            </div>

            {/* Performance Metrics */}
            {selectedStudentId && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  <h3 className="text-lg font-medium">Performance Metrics</h3>
                  <span className="text-sm text-muted-foreground">
                    (Scale: 0-10)
                  </span>
                </div>

                <div className="grid gap-4">
                  {performanceMetrics.map((metric) => (
                    <Card key={metric.name}>
                      <CardContent className="pt-4">
                        <FormField
                          control={form.control}
                          name={metric.name as keyof FormValues}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex justify-between items-center mb-2">
                                <FormLabel className="text-base">
                                  {metric.label}
                                </FormLabel>
                                <span className="text-lg font-bold">
                                  {typeof field.value === "number"
                                    ? field.value.toFixed(1)
                                    : "0.0"}
                                  /10
                                </span>
                              </div>
                              <FormControl>
                                <Slider
                                  min={0}
                                  max={10}
                                  step={0.1}
                                  value={[
                                    typeof field.value === "number"
                                      ? field.value
                                      : 0,
                                  ]}
                                  onValueChange={(value) =>
                                    field.onChange(value[0])
                                  }
                                  className="w-full"
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                {metric.description}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {/* {selectedStudentId && (
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Optional notes about this performance update..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Any additional comments or observations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )} */}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !selectedStudentId}>
                {isLoading ? "Updating..." : "Update Performance"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
