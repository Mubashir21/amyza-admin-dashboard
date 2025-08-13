import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

interface AttendanceRecord {
  id: string;
  student_id: string;
  batch_id: string;
  status: "present" | "absent" | "late" | "excused";
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

export function AttendanceList({ records }: AttendanceListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "absent":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "late":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "excused":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
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

  const formatClassDay = (dayOfWeek: string) => {
    const dayMap: { [key: string]: string } = {
      "1": "Sunday",
      "3": "Tuesday",
      "5": "Thursday",
    };
    return dayMap[dayOfWeek] || dayOfWeek;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance Records</CardTitle>
          <CardDescription>
            Latest attendance entries across all batches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-lg text-gray-500">
              No attendance records found
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Mark attendance to see records here
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Attendance Records</CardTitle>
        <CardDescription>
          Latest attendance entries across all batches
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {records.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {record.student.first_name[0]}
                    {record.student.last_name[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    {record.student.first_name} {record.student.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {record.student.student_id} • {record.batch.batch_code}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatDate(record.date)}, {formatTime(record.created_at)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatClassDay(record.day_of_week)} Class
                  </p>
                </div>
                <Badge className={getStatusColor(record.status)}>
                  {getStatusIcon(record.status)}
                  <span className="ml-1 capitalize">{record.status}</span>
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
