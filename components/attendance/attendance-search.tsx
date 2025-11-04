"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, Calendar as CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { exportAttendance } from "@/lib/export-services";

interface Batch {
  id: string;
  batch_code: string;
}

interface AttendanceSearchClientProps {
  batches: Batch[];
  attendanceRecords?: Array<{
    id: string;
    student_id: string;
    student_name: string;
    batch_code: string;
    date: string;
    status: string;
    day_of_week?: string;
    created_at: string;
  }>;
}

export function AttendanceSearchClient({
  batches,
  attendanceRecords = [],
}: AttendanceSearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [date, setDate] = useState<Date>();
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "all");

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`);
  }, [search, searchParams, router]);

  const handleBatchFilter = (batchId: string) => {
    const params = new URLSearchParams(searchParams);
    if (batchId === "all") {
      params.delete("batch");
    } else {
      params.set("batch", batchId);
    }
    router.push(`?${params.toString()}`);
  };

  const handleStatusToggle = () => {
    const statuses = ["all", "present", "absent", "late"];
    const currentIndex = statuses.indexOf(statusFilter);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    setStatusFilter(nextStatus);
    
    const params = new URLSearchParams(searchParams);
    if (nextStatus === "all") {
      params.delete("status");
    } else {
      params.set("status", nextStatus);
    }
    router.push(`?${params.toString()}`);
  };

  const handleDateFilter = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    const params = new URLSearchParams(searchParams);
    if (selectedDate) {
      params.set("date", format(selectedDate, "yyyy-MM-dd"));
    } else {
      params.delete("date");
    }
    router.push(`?${params.toString()}`);
  };

  const handleExport = () => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      alert('No attendance data available to export');
      return;
    }
    
    // Filter attendance records based on current search criteria
    let filteredRecords = attendanceRecords;
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredRecords = filteredRecords.filter(record => 
        record.student_name.toLowerCase().includes(searchLower) ||
        record.student_id.toLowerCase().includes(searchLower) ||
        record.batch_code.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply batch filter
    const selectedBatch = searchParams.get("batch");
    if (selectedBatch && selectedBatch !== "all") {
      filteredRecords = filteredRecords.filter(record => record.batch_code === selectedBatch);
    }
    
    // Apply date filter
    const selectedDate = searchParams.get("date");
    if (selectedDate) {
      filteredRecords = filteredRecords.filter(record => record.date === selectedDate);
    }
    
    exportAttendance(filteredRecords);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select
              onValueChange={handleBatchFilter}
              defaultValue={searchParams.get("batch") ?? "all"}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Batches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.batch_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleStatusToggle}>
              {statusFilter === "all"
                ? "All"
                : `Status: ${statusFilter}`}
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "MMM dd, yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateFilter}
                  modifiers={{
                    classDay: (date) => {
                      const jsDay = date.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
                      // Saturday (6), Monday (1), Thursday (4)
                      return [6, 1, 4].includes(jsDay);
                    },
                    nonClassDay: (date) => {
                      const jsDay = date.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
                      // Not Saturday, Monday, or Thursday
                      return ![6, 1, 4].includes(jsDay);
                    },
                  }}
                  modifiersClassNames={{
                    classDay: "bg-green-100 text-green-900 hover:bg-green-200 font-semibold",
                    nonClassDay: "bg-red-50 text-red-400 hover:bg-red-100",
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        </CardContent>
      </Card>

    {/* Active Filters Display */}
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span>Active filters:</span>
      {searchParams.get("batch") && searchParams.get("batch") !== "all" && (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
          Batch: {batches.find(b => b.id === searchParams.get("batch"))?.batch_code || searchParams.get("batch")}
        </span>
      )}
      {searchParams.get("status") && searchParams.get("status") !== "all" && (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
          Status: {searchParams.get("status")}
        </span>
      )}
      {search && (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
          Search: &quot;{search}&quot;
        </span>
      )}
      <button
        onClick={() => {
          setSearch("");
          setStatusFilter("all");
          router.push("/dashboard/attendance");
        }}
        className="text-blue-600 hover:underline"
      >
        Clear all
      </button>
    </div>
  </div>
  );
}
