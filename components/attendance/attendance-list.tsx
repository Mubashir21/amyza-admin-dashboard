"use client"
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Users,
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface AttendanceRecord {
  id: string;
  student_id: string;
  batch_id: string;
  status: "present" | "absent" | "late";
  date: string;
  day_of_week: string;
  notes?: string;
  created_at: string;
  student: {
    id: string;
    first_name: string;
    last_name: string;
    student_id: string;
  };
  batch: {
    batch_code: string;
  };
}

interface AttendanceListProps {
  records: AttendanceRecord[];
}

export function AttendanceAnalytics({ records }: AttendanceListProps) {
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());

  const toggleBatch = (batchCode: string) => {
    const newExpanded = new Set(expandedBatches);
    if (newExpanded.has(batchCode)) {
      newExpanded.delete(batchCode);
    } else {
      newExpanded.add(batchCode);
    }
    setExpandedBatches(newExpanded);
  };

  // Calculate analytics
  const totalRecords = records.length;
  const presentCount = records.filter(r => r.status === "present").length;
  const absentCount = records.filter(r => r.status === "absent").length;
  const lateCount = records.filter(r => r.status === "late").length;
  
  const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;
  const lateRate = totalRecords > 0 ? Math.round((lateCount / totalRecords) * 100) : 0;

  // Group by batch
  const batchStats = records.reduce((acc, record) => {
    const batchCode = record.batch.batch_code;
    if (!acc[batchCode]) {
      acc[batchCode] = { total: 0, present: 0, absent: 0, late: 0 };
    }
    acc[batchCode].total++;
    acc[batchCode][record.status as keyof typeof acc[typeof batchCode]]++;
    return acc;
  }, {} as Record<string, { total: number; present: number; absent: number; late: number }>);

  // Find students with attendance issues (more than 1 absence in recent records)
  const studentAttendance = records.reduce((acc, record) => {
    const studentKey = `${record.student.first_name} ${record.student.last_name}`;
    if (!acc[studentKey]) {
      acc[studentKey] = { total: 0, absent: 0, late: 0, batch: record.batch.batch_code };
    }
    acc[studentKey].total++;
    if (record.status === "absent") acc[studentKey].absent++;
    if (record.status === "late") acc[studentKey].late++;
    return acc;
  }, {} as Record<string, { total: number; absent: number; late: number; batch: string }>);

  const atRiskStudents = Object.entries(studentAttendance)
    .filter(([_, stats]) => stats.absent > 1 || stats.late > 2)
    .slice(0, 5); // Show top 5 at-risk students

  // Get students by batch for expanded view
  const getStudentsByBatch = (batchCode: string) => {
    return records
      .filter(record => record.batch.batch_code === batchCode)
      .reduce((acc, record) => {
        const studentKey = `${record.student.first_name} ${record.student.last_name}`;
        if (!acc[studentKey]) {
          acc[studentKey] = {
            student: record.student,
            attendanceRecords: [],
            stats: { present: 0, absent: 0, late: 0, total: 0 }
          };
        }
        acc[studentKey].attendanceRecords.push(record);
        acc[studentKey].stats[record.status as keyof typeof acc[typeof studentKey]['stats']]++;
        acc[studentKey].stats.total++;
        return acc;
      }, {} as Record<string, {
        student: AttendanceRecord['student'];
        attendanceRecords: AttendanceRecord[];
        stats: { present: number; absent: number; late: number; total: number };
      }>);
  };

  if (totalRecords === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Attendance Analytics
          </CardTitle>
          <CardDescription>
            Overall attendance insights and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-lg text-gray-500">
              No attendance data available
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Mark attendance to see analytics here
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Attendance Overview
          </CardTitle>
          <CardDescription>
            Overall attendance statistics across all batches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{attendanceRate}%</div>
              <div className="text-sm text-muted-foreground">Attendance Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalRecords}</div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{lateRate}%</div>
              <div className="text-sm text-muted-foreground">Late Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{absentCount}</div>
              <div className="text-sm text-muted-foreground">Total Absences</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Batch Performance
          </CardTitle>
          <CardDescription>
            Click on any batch to see individual student details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(batchStats).map(([batchCode, stats]) => {
              const batchAttendanceRate = Math.round((stats.present / stats.total) * 100);
              const isExpanded = expandedBatches.has(batchCode);
              const batchStudents = getStudentsByBatch(batchCode);
              
              return (
                <div key={batchCode} className="space-y-3">
                  <div 
                    className="space-y-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleBatch(batchCode)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span className="font-medium">{batchCode}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {stats.present}/{stats.total} ({batchAttendanceRate}%)
                      </span>
                    </div>
                    <Progress value={batchAttendanceRate} className="h-2" />
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        {stats.present} Present
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-yellow-600" />
                        {stats.late} Late
                      </span>
                      <span className="flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-red-600" />
                        {stats.absent} Absent
                      </span>
                    </div>
                  </div>

                  {/* Expanded Students View */}
                  {isExpanded && (
                    <div className="ml-6 space-y-2 border-l-2 border-muted pl-4">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Students in {batchCode}
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(batchStudents).map(([studentName, studentData]) => {
                          const studentAttendanceRate = Math.round(
                            (studentData.stats.present / studentData.stats.total) * 100
                          );
                          
                          return (
                            <div key={studentName} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {studentData.student.first_name[0]}
                                    {studentData.student.last_name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{studentName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {studentData.student.student_id}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-xs text-center">
                                  <div className="font-medium">{studentAttendanceRate}%</div>
                                  <div className="text-muted-foreground">Attendance</div>
                                </div>
                                <div className="flex gap-1">
                                  {studentData.stats.present > 0 && (
                                    <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                                      {studentData.stats.present}P
                                    </Badge>
                                  )}
                                  {studentData.stats.late > 0 && (
                                    <Badge variant="outline" className="text-yellow-600 border-yellow-200 text-xs">
                                      {studentData.stats.late}L
                                    </Badge>
                                  )}
                                  {studentData.stats.absent > 0 && (
                                    <Badge variant="outline" className="text-red-600 border-red-200 text-xs">
                                      {studentData.stats.absent}A
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Students Needing Attention */}
      {atRiskStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Students Needing Attention
            </CardTitle>
            <CardDescription>
              Students with concerning attendance patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {atRiskStudents.map(([studentName, stats]) => (
                <div key={studentName} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{studentName}</p>
                    <p className="text-sm text-muted-foreground">{stats.batch}</p>
                  </div>
                  <div className="flex gap-2">
                    {stats.absent > 1 && (
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        {stats.absent} Absences
                      </Badge>
                    )}
                    {stats.late > 2 && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                        {stats.late} Late
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
