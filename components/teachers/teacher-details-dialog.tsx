"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Calendar, Briefcase, FileText, Eye, Users, Globe, Cake } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Teacher } from "@/lib/teachers-services";

interface TeacherDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: "present" | "absent" | "late";
  day_of_week: string | number;
}

export function TeacherDetailsDialog({
  open,
  onOpenChange,
  teacher,
}: TeacherDetailsDialogProps) {
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState({
    overall: 0,
    recent: 0,
    totalRecords: 0
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusVariant = (isActive: boolean) => {
    return isActive ? "default" : "secondary";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Active" : "Inactive";
  };

  // Fetch teacher attendance when dialog opens
  useEffect(() => {
    if (open && teacher.id) {
      const fetchAttendance = async () => {
        try {
          console.log("Fetching attendance for teacher:", teacher.id);
          
          // Fetch recent attendance (last 10 records)
          const { data: attendanceData, error: attendanceError } = await supabase
            .from("teacher_attendance")
            .select("id, date, status, day_of_week")
            .eq("teacher_id", teacher.id)
            .order("date", { ascending: false })
            .limit(10);

          if (attendanceError) {
            console.error("Error fetching teacher attendance:", attendanceError);
            setRecentAttendance([]);
          } else {
            console.log("Teacher attendance data:", attendanceData);
            setRecentAttendance(attendanceData || []);
            
            // Calculate stats
            if (attendanceData && attendanceData.length > 0) {
              const totalRecords = attendanceData.length;
              const presentCount = attendanceData.filter(r => r.status === 'present' || r.status === 'late').length;
              const overallPercentage = Math.round((presentCount / totalRecords) * 100);
              
              // Recent 5 records
              const recent5 = attendanceData.slice(0, 5);
              const recent5Present = recent5.filter(r => r.status === 'present' || r.status === 'late').length;
              const recentPercentage = recent5.length > 0 ? Math.round((recent5Present / recent5.length) * 100) : 0;
              
              setAttendanceStats({
                overall: overallPercentage,
                recent: recentPercentage,
                totalRecords
              });
            }
          }
        } catch (error) {
          console.error("Error fetching teacher data:", error);
          setRecentAttendance([]);
        }
      };

      fetchAttendance();
    }
  }, [open, teacher.id]);

  const getDayDisplayName = (dayOfWeek: string | number) => {
    if (dayOfWeek === null || dayOfWeek === undefined) return '';
    
    // Handle numeric day values (1=Sunday, 2=Monday, etc.)
    if (typeof dayOfWeek === 'number') {
      switch(dayOfWeek) {
        case 1: return 'Sun';
        case 2: return 'Mon';
        case 3: return 'Tue';
        case 4: return 'Wed';
        case 5: return 'Thu';
        case 6: return 'Fri';
        case 7: return 'Sat';
        default: return String(dayOfWeek);
      }
    }
    
    // Handle string day values
    const day = String(dayOfWeek).toLowerCase();
    switch(day) {
      case 'sunday': case 'sun': return 'Sun';
      case 'monday': case 'mon': return 'Mon';
      case 'tuesday': case 'tue': return 'Tue';
      case 'wednesday': case 'wed': return 'Wed';
      case 'thursday': case 'thu': return 'Thu';
      case 'friday': case 'fri': return 'Fri';
      case 'saturday': case 'sat': return 'Sat';
      default: return String(dayOfWeek);
    }
  };

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch(status) {
      case 'present': return 'default';
      case 'late': return 'secondary';
      case 'absent': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'present': return 'Present';
      case 'late': return 'Late';
      case 'absent': return 'Absent';
      default: return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
            Teacher Details
          </DialogTitle>
          <DialogDescription className="text-sm">
            View comprehensive information about {teacher.first_name} {teacher.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Profile Information */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium">Profile Information</h3>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                <AvatarImage
                  src={teacher.profile_picture || undefined}
                  className="object-cover object-center"
                  alt={`${teacher.first_name} ${teacher.last_name}`}
                />
                <AvatarFallback className="text-lg sm:text-xl bg-blue-100 text-blue-700 font-semibold">
                  {getInitials(teacher.first_name, teacher.last_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3 sm:space-y-4 text-center sm:text-left">
                <div>
                  <h4 className="text-lg sm:text-xl font-semibold">
                    {teacher.first_name} {teacher.last_name}
                  </h4>
                  <p className="text-muted-foreground text-sm">{teacher.teacher_id}</p>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <Badge variant="outline" className="text-xs sm:text-sm">
                    {teacher.department || "No Department"}
                  </Badge>
                  {teacher.position && (
                    <Badge variant="outline" className="text-xs sm:text-sm">
                      {teacher.position}
                    </Badge>
                  )}
                  <Badge variant={getStatusVariant(teacher.is_active)} className="text-xs sm:text-sm">
                    {getStatusText(teacher.is_active)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium min-w-0">Full Name:</span>
                  <span className="truncate">{teacher.first_name} {teacher.last_name}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium min-w-0">Email:</span>
                  <span className="truncate">{teacher.email || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium min-w-0">Phone:</span>
                  <span className="truncate">{teacher.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium min-w-0">Department:</span>
                  <span className="truncate">{teacher.department || "N/A"}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium min-w-0">Position:</span>
                  <span className="truncate">{teacher.position || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <Cake className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium min-w-0">Age:</span>
                  <span>{teacher.age || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium min-w-0">Nationality:</span>
                  <span className="truncate">{teacher.nationality || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium min-w-0">Hire Date:</span>
                  <span className="truncate">
                    {teacher.hire_date ? new Date(teacher.hire_date).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notes Section */}
          {teacher.notes && (
            <>
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-medium">Notes</h3>
                
                <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap flex-1">
                      {teacher.notes}
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Attendance */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium">Recent Attendance</h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-center gap-4 sm:gap-8">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">
                    {attendanceStats.overall}%
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Overall</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-green-600">
                    {attendanceStats.recent}%
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Recent 5</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-purple-600">
                    {attendanceStats.totalRecords}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Total Records</div>
                </div>
              </div>

              <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
                <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                  Recent Classes
                </h4>
                <div className="space-y-1.5 sm:space-y-2">
                  {recentAttendance.length > 0 ? (
                    recentAttendance.slice(0, 5).map((record) => (
                      <div key={record.id} className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                          <span className="truncate">{new Date(record.date).toLocaleDateString()}</span>
                          <span className="text-muted-foreground">
                            ({getDayDisplayName(record.day_of_week)})
                          </span>
                        </div>
                        <Badge variant={getStatusColor(record.status)} className="text-xs ml-2 flex-shrink-0">
                          {getStatusDisplay(record.status)}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs sm:text-sm text-muted-foreground text-center py-3 sm:py-4">
                      No attendance records found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* System Information */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium">System Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                <div className="text-base sm:text-lg font-semibold font-mono">
                  {teacher.teacher_id}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Teacher ID</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                <div className="text-base sm:text-lg font-semibold">
                  {new Date(teacher.created_at).toLocaleDateString()}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Date Added</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
