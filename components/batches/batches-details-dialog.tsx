"use client";

import { useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
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

interface BatchDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: any;
}

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  is_active: boolean;
  // Performance metrics
  creativity: number;
  leadership: number;
  behavior: number;
  presentation: number;
  communication: number;
  technical_skills: number;
  general_performance: number;
}

export function BatchDetailsDialog({
  open,
  onOpenChange,
  batch,
}: BatchDetailsDialogProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch students when dialog opens
  useEffect(() => {
    if (open && batch?.id) {
      fetchBatchStudents();
    }
  }, [open, batch?.id]);

  const fetchBatchStudents = async () => {
    setLoading(true);
    try {
      // You'll implement this function in your service
      // const studentsData = await getStudentsByBatchId(batch.id);
      // setStudents(studentsData);

      // Mock data for now
      setStudents([
        {
          id: "1",
          student_id: "STU-001",
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "+1234567890",
          gender: "male",
          is_active: true,
          creativity: 8.5,
          leadership: 7.0,
          behavior: 9.5,
          presentation: 6.5,
          communication: 8.0,
          technical_skills: 7.5,
          general_performance: 8.0,
        },
        // Add more mock students...
      ]);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

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
      student.creativity,
      student.leadership,
      student.behavior,
      student.presentation,
      student.communication,
      student.technical_skills,
      student.general_performance,
    ];
    return (
      metrics.reduce((sum, metric) => sum + metric, 0) / metrics.length
    ).toFixed(1);
  };

  if (!batch) return null;

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
                      {batch.start_date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">3 months</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Students</p>
                    <p className="text-sm text-muted-foreground">
                      {batch.student_count}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Attendance</p>
                    <p className="text-sm text-muted-foreground">
                      {batch.avg_attendance}%
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
                    {batch.progress}%
                  </span>
                </div>
                <Progress value={batch.progress} className="h-2" />

                <div className="grid gap-3 mt-4">
                  {[1, 2, 3].map((moduleNum) => (
                    <div key={moduleNum} className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          moduleNum < batch.current_module
                            ? "bg-green-500"
                            : moduleNum === batch.current_module
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {batch[`module_${moduleNum}`]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {moduleNum < batch.current_module
                              ? "Completed"
                              : moduleNum === batch.current_module
                              ? "Current"
                              : "Upcoming"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {batch[`module_${moduleNum}_desc`]}
                        </p>
                      </div>
                    </div>
                  ))}
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
                    No students enrolled yet
                  </p>
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
