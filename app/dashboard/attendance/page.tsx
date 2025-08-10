import { ResponsiveContainer } from "@/components/responsive-container";
import { Button } from "@/components/ui/button";
import { MarkAttendanceDialog } from "@/components/mark-attendance-dialogue";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const sampleStudents = [
  {
    id: "1",
    first_name: "John",
    last_name: "Doe",
    student_id: "STU001",
    batch_id: "batch1",
  },
  {
    id: "2",
    first_name: "Jane",
    last_name: "Smith",
    student_id: "STU002",
    batch_id: "batch1",
  },
  {
    id: "3",
    first_name: "Mike",
    last_name: "Johnson",
    student_id: "STU003",
    batch_id: "batch2",
  },
];

const sampleBatches = [
  { id: "batch1", batch_code: "2024-Q1-A", name: "Morning Batch" },
  { id: "batch2", batch_code: "2024-Q1-B", name: "Evening Batch" },
];

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <ResponsiveContainer>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
            <p className="text-muted-foreground">
              Track student attendance for Sunday, Tuesday, and Thursday classes
            </p>
          </div>
          <MarkAttendanceDialog
            students={sampleStudents}
            batches={sampleBatches}
          />
        </div>
      </ResponsiveContainer>

      <ResponsiveContainer>
        <Card>
          <CardContent className="">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search students or batches..."
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Filter by Date
                </Button>
                <Button variant="outline">Export</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </ResponsiveContainer>

      {/* Attendance Stats */}
      <ResponsiveContainer>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Attendance
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">85%</div>
              <p className="text-xs text-muted-foreground">
                17 of 20 students present
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">92%</div>
              <p className="text-xs text-muted-foreground">
                Average attendance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Late Arrivals
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">3</div>
              <p className="text-xs text-muted-foreground">
                Students arrived late today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Absent Students
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">3</div>
              <p className="text-xs text-muted-foreground">
                Students absent today
              </p>
            </CardContent>
          </Card>
        </div>
      </ResponsiveContainer>

      {/* Recent Attendance Records */}
      <ResponsiveContainer>
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance Records</CardTitle>
            <CardDescription>
              Latest attendance entries across all batches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => {
                const statuses = ["present", "absent", "late"];
                const status = statuses[i % 3];
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case "present":
                      return "bg-green-100 text-green-800";
                    case "absent":
                      return "bg-red-100 text-red-800";
                    case "late":
                      return "bg-orange-100 text-orange-800";
                    default:
                      return "bg-gray-100 text-gray-800";
                  }
                };

                const getStatusIcon = (status: string) => {
                  switch (status) {
                    case "present":
                      return <CheckCircle className="h-4 w-4" />;
                    case "absent":
                      return <XCircle className="h-4 w-4" />;
                    case "late":
                      return <Clock className="h-4 w-4" />;
                    case "excused":
                      return <AlertCircle className="h-4 w-4" />;
                    default:
                      return null;
                  }
                };

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">S{i + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">Student {i + 1}</p>
                        <p className="text-sm text-muted-foreground">
                          STU00{i + 1} • Batch 2024-A
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">Today, 10:00 AM</p>
                        <p className="text-xs text-muted-foreground">
                          Sunday Class
                        </p>
                      </div>
                      <Badge className={getStatusColor(status)}>
                        {getStatusIcon(status)}
                        <span className="ml-1 capitalize">{status}</span>
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </ResponsiveContainer>
    </div>
  );
}
