"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Calendar,
  BookOpen,
  BarChart3,
  GraduationCap,
  Clock,
} from "lucide-react";
import { Batch, Student, getStudentsByBatchId } from "@/lib/batches-services";

interface BatchDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: Batch & {
    student_count?: number;
    avg_attendance?: number;
    progress?: number;
  };
}

export function BatchDetailsDialog({
  open,
  onOpenChange,
  batch,
}: BatchDetailsDialogProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBatchStudents = useCallback(async () => {
    if (!batch?.id) return;

    setLoading(true);
    try {
      const studentsData = await getStudentsByBatchId(batch.id);
      setStudents(studentsData);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [batch?.id]);

  useEffect(() => {
    if (open && batch?.id) {
      fetchBatchStudents();
    }
  }, [open, batch?.id, fetchBatchStudents]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateAveragePerformance = (student: Student) => {
    const metrics = [
      student.creativity || 0,
      student.leadership || 0,
      student.behavior || 0,
      student.presentation || 0,
      student.communication || 0,
      student.technical_skills || 0,
      student.general_performance || 0,
    ];
    const validMetrics = metrics.filter((metric) => metric > 0);
    if (validMetrics.length === 0) return "0.0";

    return (
      validMetrics.reduce((sum, metric) => sum + metric, 0) /
      validMetrics.length
    ).toFixed(1);
  };

  const calculateProgress = () => {
    if (batch.status === "completed") return 100;
    if (batch.status === "upcoming") return 0;
    return Math.round(((batch.current_module - 1) / 3) * 100);
  };

  if (!batch) return null;

  const progress = batch.progress ?? calculateProgress();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Batch Details - {batch.batch_code}
          </DialogTitle>
          <DialogDescription>
            Complete information about this batch including students and
            performance metrics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Batch Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Batch Overview</span>
                <Badge className={getStatusColor(batch.status)}>
                  {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(batch.start_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">End Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(batch.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Students</p>
                    <p className="text-sm text-muted-foreground">
                      {batch.student_count || students.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Max Students</p>
                    <p className="text-sm text-muted-foreground">
                      {batch.max_students}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Module Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />

                <div className="grid gap-3 mt-4">
                  {[1, 2, 3].map((moduleNum) => {
                    let moduleStatus = "";
                    let moduleColor = "";

                    if (batch.status === "completed") {
                      moduleStatus = "Completed";
                      moduleColor = "bg-green-500";
                    } else if (moduleNum < batch.current_module) {
                      moduleStatus = "Completed";
                      moduleColor = "bg-green-500";
                    } else if (moduleNum === batch.current_module) {
                      moduleStatus = "Current";
                      moduleColor = "bg-blue-500";
                    } else {
                      moduleStatus = "Upcoming";
                      moduleColor = "bg-gray-300";
                    }

                    return (
                      <div key={moduleNum} className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${moduleColor}`}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Module {moduleNum}:{" "}
                              {
                                batch[
                                  `module_${moduleNum}` as keyof Batch
                                ] as string
                              }
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {moduleStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Students ({students.length})
              </CardTitle>
              <CardDescription>
                Student roster and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading students...</p>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No students enrolled in this batch yet
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Avg Performance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {student.first_name} {student.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {student.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {student.student_id}
                          </TableCell>
                          <TableCell className="text-sm">
                            {student.phone}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                student.is_active ? "default" : "secondary"
                              }
                            >
                              {student.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {calculateAveragePerformance(student)}/10
                              </span>
                              <div className="w-16">
                                <Progress
                                  value={
                                    parseFloat(
                                      calculateAveragePerformance(student)
                                    ) * 10
                                  }
                                  className="h-2"
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
