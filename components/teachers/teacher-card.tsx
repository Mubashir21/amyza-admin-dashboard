"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Edit, Trash2, Mail, Phone, Eye, Calendar } from "lucide-react";
import { toast } from "sonner";
import { deleteTeacher, getTeacherAttendancePercentage, Teacher } from "@/lib/teachers-services";
import { EditTeacherDialog } from "./edit-teacher-dialog";
import { TeacherDetailsDialog } from "./teacher-details-dialog";
import { TeacherAttendanceDialog } from "./teacher-attendance-dialog";
import { useAuth } from "@/lib/auth-context";
import { canManageTeachers } from "@/lib/roles";

interface TeacherCardProps {
  teacher: Teacher;
  onTeacherUpdated?: () => void;
}

export function TeacherCard({ teacher, onTeacherUpdated }: TeacherCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [attendancePercentage, setAttendancePercentage] = useState<number>(0);
  const router = useRouter();
  const { userRole } = useAuth();
  const canManage = canManageTeachers(userRole);

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'N/A';
  };

  const getStatusVariant = (isActive: boolean) => {
    return isActive ? "default" : "secondary";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Active" : "Inactive";
  };

  const getDepartmentBadgeClass = () => {
    // Keep all department badges neutral
    return "bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300";
  };

  const getYearsOfService = () => {
    if (!teacher.hire_date) return 0;
    const hireDate = new Date(teacher.hire_date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - hireDate.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
    return diffYears;
  };

  // Fetch real teacher attendance percentage
  useEffect(() => {
    const fetchAttendancePercentage = async () => {
      try {
        const percentage = await getTeacherAttendancePercentage(teacher.id);
        setAttendancePercentage(percentage);
      } catch (error) {
        console.error("Error fetching attendance percentage:", error);
        setAttendancePercentage(0);
      }
    };

    fetchAttendancePercentage();
  }, [teacher.id]);

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      console.log("Attempting to delete teacher:", teacher.first_name, teacher.last_name);
      
      const success = await deleteTeacher(teacher.id);
      
      if (success) {
        toast.success(`Teacher ${teacher.first_name} ${teacher.last_name} has been permanently deleted.`);
        setShowDeleteDialog(false);
        
        // Refresh the data
        if (onTeacherUpdated) {
          onTeacherUpdated();
        }
        router.refresh();
      } else {
        toast.error("Failed to remove teacher. Please try again.");
      }
    } catch (error: unknown) {
      console.error("Error deleting teacher:", error);
      
      // Handle specific error messages
      const err = error as { message?: string; code?: string };
      if (err.message === "Teacher not found") {
        toast.error("Teacher not found. They may have already been deleted.");
      } else if (err.code === '42P01') {
        toast.error("Database table not found. Please contact support.");
      } else if (err.code === '23503') {
        toast.error("Cannot remove teacher due to existing references. Please contact support.");
      } else {
        toast.error(`Failed to remove teacher: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={teacher.profile_picture || undefined}
                  className="object-cover object-center"
                  alt={`${teacher.first_name} ${teacher.last_name}`}
                />
                <AvatarFallback>
                  {getInitials(teacher.first_name, teacher.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {teacher.first_name} {teacher.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {teacher.teacher_id}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowAttendanceDialog(true)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  View Attendance
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleEdit}
                  disabled={!canManage}
                  className={!canManage ? "opacity-50 cursor-not-allowed" : ""}
                  title={!canManage ? "Only Super Admins can edit teachers" : ""}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Teacher
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`text-destructive ${!canManage ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => canManage && setShowDeleteDialog(true)}
                  disabled={!canManage}
                  title={!canManage ? "Only Super Admins can delete teachers" : ""}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Teacher
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={getDepartmentBadgeClass()}
            >
              {teacher.department}
            </Badge>
            <Badge variant="outline">
              {teacher.position}
            </Badge>
            <Badge variant={teacher.is_active ? "default" : "secondary"}>
              {teacher.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Contact */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{teacher.email || "No email"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{teacher.phone || "No phone"}</span>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold">
                {getYearsOfService()}
              </div>
              <div className="text-xs text-muted-foreground">Years</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {attendancePercentage}%
              </div>
              <div className="text-xs text-muted-foreground">Attendance</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {teacher.hire_date ? new Date(teacher.hire_date).getFullYear() : 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">Hired</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <TeacherDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        teacher={teacher}
      />

      {/* Attendance Dialog */}
      <TeacherAttendanceDialog
        open={showAttendanceDialog}
        onOpenChange={setShowAttendanceDialog}
        teacher={teacher}
      />

      {/* Edit Teacher Dialog */}
      <EditTeacherDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        teacher={teacher}
        onTeacherUpdated={onTeacherUpdated}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete &quot;{teacher.first_name}{" "}
              {teacher.last_name}&quot; (ID: {teacher.teacher_id})? 
              <br /><br />
              <strong>This action cannot be undone!</strong>
              <br /><br />
              This will permanently remove:
              <br />• The teacher record
              <br />• All attendance records for this teacher
              <br />• Any other associated data
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Teacher"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
