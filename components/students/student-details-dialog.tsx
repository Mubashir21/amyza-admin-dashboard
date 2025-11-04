"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Calendar, Mail, Phone, User, BookOpen, Eye, UserCircle2, Globe, Cake } from "lucide-react";
import { Student } from "@/lib/students-services";
import { getRankingsFiltered } from "@/lib/rankings-services";
import { supabase } from "@/lib/supabase/client";

interface StudentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: "present" | "absent" | "late";
  day_of_week: string;
}

export function StudentDetailsDialog({ open, onOpenChange, student }: StudentDetailsDialogProps) {
//   const [notes, setNotes] = useState("");
  const [batchRank, setBatchRank] = useState<number | null>(null);
  const [totalInBatch, setTotalInBatch] = useState<number | null>(null);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600";
    if (rank === 2) return "bg-blue-600 hover:bg-blue-700 text-white border-blue-600";
    if (rank === 3) return "bg-purple-600 hover:bg-purple-700 text-white border-purple-600";
    return "bg-gray-600 hover:bg-gray-700 text-white border-gray-600";
  };

  const performanceMetrics = [
    { label: "Creativity", value: student.creativity || 0 },
    { label: "Leadership", value: student.leadership || 0 },
    { label: "Behavior", value: student.behavior || 0},
    { label: "Presentation", value: student.presentation || 0},
    { label: "Communication", value: student.communication || 0},
    { label: "Technical Skills", value: student.technical_skills || 0 },
    { label: "General Performance", value: student.general_performance || 0 },
  ];

  const overallScore = performanceMetrics.reduce((sum, metric) => sum + metric.value, 0) / performanceMetrics.length;

  // Fetch batch-specific ranking and attendance when dialog opens
  useEffect(() => {
    if (open && student.batch_id) {
      const fetchData = async () => {
        try {
          // Fetch batch ranking - try with different batch statuses
          console.log("Fetching batch ranking for student:", student.id, "batch:", student.batch_id);
          
          let batchRankings = await getRankingsFiltered({
            batch: student.batch_id,
            batchStatus: "active"
          });
          
          // If no results with active, try with all statuses
          if (!batchRankings || batchRankings.length === 0) {
            console.log("No active batch rankings found, trying with 'all' status");
            batchRankings = await getRankingsFiltered({
              batch: student.batch_id,
              batchStatus: "all"
            });
          }
          
          console.log("Batch rankings:", batchRankings);
          const studentRanking = batchRankings.find(r => r.id === student.id);
          console.log("Student ranking found:", studentRanking);
          
          if (studentRanking) {
            setBatchRank(studentRanking.rank);
            setTotalInBatch(batchRankings.length);
          } else {
            console.log("Student not found in batch rankings, setting fallback rank");
            setBatchRank(null);
            setTotalInBatch(batchRankings.length);
          }

          // Fetch recent attendance (last 5 class sessions)
          console.log("Fetching attendance for student:", student.id);
          const { data: attendanceData, error: attendanceError } = await supabase
            .from("attendance")
            .select("id, date, status, day_of_week")
            .eq("student_id", student.id)
            .order("date", { ascending: false })
            .limit(20); // Get more to account for weekends

          if (attendanceError) {
            console.error("Error fetching attendance:", attendanceError);
          } else {
            console.log("Raw attendance data:", attendanceData);
            
            // First, let's see all the day_of_week values
            if (attendanceData) {
              const uniqueDays = [...new Set(attendanceData.map(r => r.day_of_week))];
              console.log("Unique day_of_week values:", uniqueDays);
            }
            
            // Filter for only class days (Saturday, Monday, Thursday) and limit to 5
            const classDayAttendance = (attendanceData || [])
              .filter(record => {
                console.log("Processing record:", record);
                if (record.day_of_week === null || record.day_of_week === undefined) {
                  console.log("No day_of_week for record:", record.id);
                  return false;
                }
                
                // Handle both numeric and string day_of_week values
                let dayOfWeek;
                if (typeof record.day_of_week === 'number') {
                  dayOfWeek = record.day_of_week;
                } else {
                  const dayStr = String(record.day_of_week).toLowerCase();
                  // Convert string to number if needed
                  if (dayStr === 'saturday' || dayStr === 'sat') dayOfWeek = 7;
                  else if (dayStr === 'monday' || dayStr === 'mon') dayOfWeek = 2;
                  else if (dayStr === 'thursday' || dayStr === 'thu') dayOfWeek = 5;
                  else dayOfWeek = parseInt(record.day_of_week) || -1;
                }
                
                console.log("Day of week (normalized):", dayOfWeek);
                const isClassDay = [7, 2, 5].includes(dayOfWeek);
                console.log("Is class day:", isClassDay);
                return isClassDay;
              })
              .slice(0, 5);
            
            console.log("Filtered class day attendance:", classDayAttendance);
            
            // If no class day records found, show all recent attendance
            if (classDayAttendance.length === 0 && attendanceData && attendanceData.length > 0) {
              console.log("No class day records found, showing all recent attendance");
              setRecentAttendance(attendanceData.slice(0, 5));
            } else {
              setRecentAttendance(classDayAttendance);
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setBatchRank(null);
          setTotalInBatch(null);
          setRecentAttendance([]);
        }
      };

      fetchData();
    }
  }, [open, student.batch_id, student.id]);

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

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'present': 
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100';
      case 'late': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100';
      case 'absent': 
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
            Student Details
          </DialogTitle>
          <DialogDescription className="text-sm">
            View comprehensive information about {student.first_name} {student.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Profile Information */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium">Profile Information</h3>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                <AvatarImage
                  src={student.profile_picture || undefined}
                  className="object-cover object-center"
                />
                <AvatarFallback className="text-lg sm:text-xl">
                  {getInitials(student.first_name, student.last_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3 sm:space-y-4 text-center sm:text-left">
                <div>
                  <h4 className="text-lg sm:text-xl font-semibold">
                    {student.first_name} {student.last_name}
                  </h4>
                  <p className="text-muted-foreground text-sm">{student.student_id}</p>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <Badge 
                    className={`px-2 py-1 text-xs sm:px-3 sm:text-sm ${getRankBadgeClass(batchRank || 0)}`}
                  >
                    Rank #{batchRank || "N/A"}{totalInBatch ? ` of ${totalInBatch}` : ""}
                  </Badge>
                  <Badge variant="outline" className="text-xs sm:text-sm">
                    {student.batch?.batch_code || "No Batch"}
                  </Badge>
                  <Badge variant={student.is_active ? "default" : "secondary"} className="text-xs sm:text-sm">
                    {student.is_active ? "Active" : "Inactive"}
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
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium min-w-0">Full Name:</span>
                  <span className="truncate">{student.first_name} {student.last_name}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium min-w-0">Email:</span>
                  <span className="truncate">{student.email || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium min-w-0">Phone:</span>
                  <span className="truncate">{student.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium min-w-0">Batch:</span>
                  <span className="truncate">{student.batch?.batch_code || "No Batch"}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <UserCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium min-w-0">Gender:</span>
                  <span>{student.gender?.charAt(0).toUpperCase() + student.gender?.slice(1) || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <Cake className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium min-w-0">Age:</span>
                  <span>{student.age || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium min-w-0">Nationality:</span>
                  <span className="truncate">{student.nationality || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium min-w-0">Joined:</span>
                  <span className="truncate">{new Date(student.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {student.notes && (
            <>
              <Separator />
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-medium">Notes</h3>
                <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-foreground whitespace-pre-wrap">
                    {student.notes}
                  </p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Performance Metrics */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium">Performance Metrics</h3>
            
            <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
              <div className="text-center mb-3 sm:mb-4">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {overallScore.toFixed(1)}/10
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Overall Score</div>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                {performanceMetrics.map((metric) => (
                  <div key={metric.label} className="space-y-1 sm:space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-medium truncate">{metric.label}</span>
                      <span className="font-semibold ml-2">{metric.value}/10</span>
                    </div>
                    <Progress value={metric.value * 10} className="h-1.5 sm:h-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Attendance */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium">Recent Attendance</h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-center gap-4 sm:gap-8">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">
                    {student.attendance_percentage || 0}%
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Overall</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-green-600">
                    {recentAttendance.length > 0 
                      ? Math.round((recentAttendance.filter(r => r.status === 'present' || r.status === 'late').length / recentAttendance.length) * 100)
                      : 0}%
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Recent 5</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-purple-600">
                    3
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Classes/Week</div>
                </div>
              </div>

              <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
                <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                  Recent Classes (Sat, Mon, Thu)
                </h4>
                <div className="space-y-1.5 sm:space-y-2">
                  {recentAttendance.length > 0 ? (
                    recentAttendance.map((record) => (
                      <div key={record.id} className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                          <span className="truncate">{new Date(record.date).toLocaleDateString()}</span>
                          <span className="text-muted-foreground">
                            ({getDayDisplayName(record.day_of_week)})
                          </span>
                        </div>
                        <Badge className={`text-xs ml-2 flex-shrink-0 ${getStatusColor(record.status)}`}>
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

          {/* Current Status */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium">Current Status</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                <div className="text-base sm:text-lg font-semibold">
                  Mod {student.batch?.current_module || 1}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Current Module</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                <div className="text-base sm:text-lg font-semibold">
                  #{batchRank || "N/A"}{totalInBatch ? `/${totalInBatch}` : ""}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Batch Rank</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                <div className="text-base sm:text-lg font-semibold">
                  {student.is_active ? "Active" : "Inactive"}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Status</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
