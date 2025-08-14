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

interface Batch {
  id: string;
  batch_code: string;
}

interface AttendanceSearchClientProps {
  batches: Batch[];
}

export function AttendanceSearchClient({
  batches,
}: AttendanceSearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [date, setDate] = useState<Date>();

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

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
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
    console.log("Export attendance records");
    // Implement export functionality
  };

  return (
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

            <Select
              onValueChange={handleStatusFilter}
              defaultValue={searchParams.get("status") ?? "all"}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                {/* <SelectItem value="excused">Excused</SelectItem> */}
              </SelectContent>
            </Select>

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
  );
}
