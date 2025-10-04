"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTeacherAttendance, Teacher } from "@/lib/teachers-services";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  created_at: string;
}

interface TeacherAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher;
}

export function TeacherAttendanceDialog({
  open,
  onOpenChange,
  teacher,
}: TeacherAttendanceDialogProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && teacher) {
      loadAttendance();
    }
  }, [open, teacher]);

  const loadAttendance = async () => {
    setIsLoading(true);
    try {
      const records = await getTeacherAttendance({ teacher_id: teacher.id });
      setAttendance(records);
    } catch (error) {
      console.error("Error loading attendance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "late":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string) => {
    if (!status) return "outline";
    switch (status) {
      case "present":
        return "default";
      case "absent":
        return "destructive";
      case "late":
        return "secondary";
      default:
        return "outline";
    }
  };

  const calculateStats = () => {
    if (attendance.length === 0) {
      return { present: 0, absent: 0, late: 0, percentage: 0 };
    }

    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const percentage = Math.round(((present + late) / attendance.length) * 100);

    return { present, absent, late, percentage };
  };

  const stats = calculateStats();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Attendance History</DialogTitle>
          <DialogDescription>
            Attendance records for {teacher.first_name} {teacher.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                  <div className="text-xs text-muted-foreground">Present</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                  <div className="text-xs text-muted-foreground">Absent</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                  <div className="text-xs text-muted-foreground">Late</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.percentage}%</div>
                  <div className="text-xs text-muted-foreground">Attendance</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Records */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Attendance Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading attendance records...
                </div>
              ) : attendance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records found
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {attendance
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(record.status)}
                          <div>
                            <div className="font-medium">
                              {new Date(record.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Marked on {new Date(record.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Badge variant={getStatusVariant(record.status)}>
                          {record.status ? (record.status.charAt(0).toUpperCase() + record.status.slice(1)) : 'Unknown'}
                        </Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
