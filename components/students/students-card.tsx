"use client";
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
import { MoreVertical, Eye, Edit, Trash2, Mail, Phone } from "lucide-react";

// Import the Student type from services instead of defining it locally
import { Student } from "@/lib/students-services";

interface StudentCardProps {
  student: Student;
}

export function StudentCard({ student }: StudentCardProps) {
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

  //   const overallScore = student.total_score / 7; // Average of 7 metrics

  const handleView = () => {
    console.log("View student:", student);
    // Implement view functionality
  };

  const handleEdit = () => {
    console.log("Edit student:", student);
    // Implement edit functionality
  };

  const handleDelete = () => {
    console.log("Delete student:", student);
    // Implement delete functionality
  };

  return (
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
              <DropdownMenuItem onClick={handleView}>
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Student
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDelete}
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
  );
}
