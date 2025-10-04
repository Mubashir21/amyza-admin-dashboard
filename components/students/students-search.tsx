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
import { Search, Filter, Download } from "lucide-react";
import { exportStudents } from "@/lib/export-services";
import { Student } from "@/lib/students-services";

interface Batch {
  id: string;
  batch_code: string;
}

interface StudentsSearchClientProps {
  batches: Batch[];
  students?: Student[];
}

export function StudentsSearchClient({ batches, students = [] }: StudentsSearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
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
    const statuses = ["all", "active", "inactive"];
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

  const handleExport = () => {
    if (!students || students.length === 0) {
      alert('No students data available to export');
      return;
    }
    
    // Filter students based on current search criteria
    let filteredStudents = students;
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredStudents = filteredStudents.filter(student => 
        student.first_name.toLowerCase().includes(searchLower) ||
        student.last_name.toLowerCase().includes(searchLower) ||
        student.student_id.toLowerCase().includes(searchLower) ||
        (student.email && student.email.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply batch filter
    const selectedBatch = searchParams.get("batch");
    if (selectedBatch && selectedBatch !== "all") {
      filteredStudents = filteredStudents.filter(student => student.batch_id === selectedBatch);
    }
    
    // Apply status filter
    const selectedStatus = searchParams.get("status");
    if (selectedStatus && selectedStatus !== "all") {
      const isActive = selectedStatus === "active";
      filteredStudents = filteredStudents.filter(student => student.is_active === isActive);
    }
    
    exportStudents(filteredStudents);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, student ID, or email..."
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
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Batch" />
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
          router.push("/dashboard/students");
        }}
        className="text-blue-600 hover:underline"
      >
        Clear all
      </button>
    </div>
  </div>
  );
}
