"use client";
import { useState } from "react";
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
import { MoreVertical, Edit, Trash2, Mail, Phone } from "lucide-react";
import { Student, deleteStudent } from "@/lib/students-services";
import { EditStudentDialog } from "@/components/students/students-edit-dialog";

interface StudentCardProps {
  student: Student;
  batches?: Array<{ id: string; batch_code: string }>;
}

export function StudentCard({ student, batches = [] }: StudentCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRankBadgeVariant = (rank: number) => {
    if (rank === 1) return "default";
    if (rank === 2) return "secondary";
    if (rank === 3) return "outline";
    return "secondary";
  };

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1)
      return "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600";
    if (rank === 2)
      return "bg-blue-600 hover:bg-blue-700 text-white border-blue-600";
    if (rank === 3)
      return "bg-purple-600 hover:bg-purple-700 text-white border-purple-600";
    return "";
  };

  const getGenderBadgeClass = (gender: string) => {
    if (gender === "male") {
      return "bg-sky-200 text-sky-800 border-sky-300 hover:bg-sky-300";
    }
    if (gender === "female") {
      return "bg-pink-200 text-pink-800 border-pink-300 hover:bg-pink-300";
    }
    return "bg-gray-200 text-gray-800 border-gray-300";
  };

  const calculateOverallScore = () => {
    const scores = [
      student.creativity || 0,
      student.leadership || 0,
      student.behavior || 0,
      student.presentation || 0,
      student.communication || 0,
      student.technical_skills || 0,
      student.general_performance || 0,
    ];

    const total = scores.reduce((sum, score) => sum + score, 0);
    const average = total / scores.length;

    return average;
  };

  const overallScore = calculateOverallScore();

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteStudent(student.id);

      // Close the dialog
      setShowDeleteDialog(false);

      // Refresh the page to show updated list
      router.refresh();

      // Optional: Show success message
      console.log("Student deleted successfully");
    } catch (error) {
      console.error("Failed to delete student:", error);
      // Optional: Show error message to user
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={student.profile_picture || undefined}
                  className="object-cover object-center"
                />
                <AvatarFallback>
                  {getInitials(student.first_name, student.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {student.first_name} {student.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {student.student_id}
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
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Student
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Student
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={getRankBadgeVariant(student.rank || 0)}
              className={
                (student.rank || 0) <= 3
                  ? getRankBadgeClass(student.rank || 0)
                  : ""
              }
            >
              Rank #{student.rank || "N/A"}
            </Badge>
            <Badge variant="outline">
              {student.batch?.batch_code || "No Batch"}
            </Badge>
            <Badge variant={student.is_active ? "default" : "secondary"}>
              {student.is_active ? "Active" : "Inactive"}
            </Badge>
            <Badge
              variant="outline"
              className={getGenderBadgeClass(student.gender)}
            >
              {student.gender?.charAt(0).toUpperCase() +
                student.gender?.slice(1) || "N/A"}
            </Badge>
          </div>

          {/* Contact */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{student.email || "No email"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{student.phone || "No phone"}</span>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold">
                {overallScore.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">Performance</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {student.attendance_percentage || 0}%
              </div>
              <div className="text-xs text-muted-foreground">Attendance</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                Mod {student.batch?.current_module || 1}
              </div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <EditStudentDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        student={student}
        batches={batches}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{student.first_name}{" "}
              {student.last_name}" (ID: {student.student_id})? This action
              cannot be undone and will also delete all associated attendance
              records and performance data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Student"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
