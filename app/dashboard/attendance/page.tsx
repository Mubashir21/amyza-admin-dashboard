// import { ResponsiveContainer } from "@/components/responsive-container";
// import { AttendanceHeader } from "@/components/attendance/attendance-header";
// import { AttendanceSearchClient } from "@/components/attendance/attendance-search";
// import { AttendanceStats } from "@/components/attendance/attendance-stats";
// import { AttendanceList } from "@/components/attendance/attendance-list";
// import { Button } from "@/components/ui/button";
// import {
//   getAttendanceFiltered,
//   getAttendanceStats,
//   getStudentsForAttendance,
//   getBatchesForAttendance,
// } from "@/lib/attendance-services";

// interface PageProps {
//   searchParams: Promise<{
//     search?: string;
//     batch?: string;
//     status?: string;
//     date?: string;
//   }>;
// }

// export default async function AttendancePage({ searchParams }: PageProps) {
//   const resolvedSearchParams = await searchParams;

//   const [attendance, stats, students, batches] = await Promise.all([
//     getAttendanceFiltered(resolvedSearchParams),
//     getAttendanceStats(),
//     getStudentsForAttendance(),
//     getBatchesForAttendance(),
//   ]);

//   console.log("Fetched attendance records:", attendance);
//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <ResponsiveContainer>
//         <AttendanceHeader students={students} batches={batches} />
//       </ResponsiveContainer>

//       {/* Search/Filter Bar */}
//       <ResponsiveContainer>
//         <AttendanceSearchClient batches={batches} />
//       </ResponsiveContainer>

//       {/* Attendance Stats */}
//       <ResponsiveContainer>
//         <AttendanceStats stats={stats} />
//       </ResponsiveContainer>

//       {/* Attendance Records */}
//       <ResponsiveContainer>
//         <AttendanceList records={attendance} />
//       </ResponsiveContainer>

//       {/* Pagination */}
//       <ResponsiveContainer>
//         <div className="flex items-center justify-between">
//           <div className="text-sm text-muted-foreground">
//             Showing {attendance.length > 0 ? 1 : 0} to {attendance.length} of{" "}
//             {attendance.length} records
//           </div>
//           <div className="flex items-center gap-2">
//             <Button variant="outline" size="sm" disabled>
//               Previous
//             </Button>
//             <Button variant="outline" size="sm" disabled>
//               Next
//             </Button>
//           </div>
//         </div>
//       </ResponsiveContainer>
//     </div>
//   );
// }

import { ResponsiveContainer } from "@/components/responsive-container";
import { AttendanceSearchClient } from "@/components/attendance/attendance-search";
import { AttendanceStats } from "@/components/attendance/attendance-stats";
import { AttendanceAnalytics } from "@/components/attendance/attendance-list";
import { BulkAttendanceMarker } from "@/components/attendance/bulk-attendance-marker";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getAttendanceFiltered,
  getAttendanceStats,
  getBatchesForAttendance,
} from "@/lib/attendance-services";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    batch?: string;
    status?: string;
    date?: string;
  }>;
}

export default async function AttendancePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  const [attendance, stats, batches] = await Promise.all([
    getAttendanceFiltered(resolvedSearchParams),
    getAttendanceStats(),
    getBatchesForAttendance(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <ResponsiveContainer>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
            <p className="text-muted-foreground">
              Track student attendance for Saturday, Monday, and Thursday classes
            </p>
          </div>
        </div>
      </ResponsiveContainer>

      {/* Attendance Stats */}
      <ResponsiveContainer>
        <AttendanceStats stats={stats} />
      </ResponsiveContainer>

      {/* Main Content with Tabs */}
      <ResponsiveContainer>
        <Tabs defaultValue="mark" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
            <TabsTrigger value="records">View Records</TabsTrigger>
          </TabsList>

          <TabsContent value="mark" className="space-y-6">
            <BulkAttendanceMarker batches={batches} />
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            {/* Search/Filter Bar */}
            <AttendanceSearchClient batches={batches} />

            {/* Attendance Records */}
            <AttendanceAnalytics records={attendance} />

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {attendance.length > 0 ? 1 : 0} to {attendance.length}{" "}
                of {attendance.length} records
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </ResponsiveContainer>
    </div>
  );
}
