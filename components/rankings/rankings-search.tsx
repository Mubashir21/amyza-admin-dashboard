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
import { Search, Filter, Download, Calendar } from "lucide-react";
import { exportRankings } from "@/lib/export-services";
import { Student } from "@/lib/students-services";

interface Batch {
  id: string;
  batch_code: string;
  status: string; // Changed from is_active to status
}

interface RankingsSearchClientProps {
  batches: Batch[];
  currentBatchStatus: "all" | "active" | "completed";
  students?: Student[];
}

export function RankingsSearchClient({
  batches,
  currentBatchStatus,
  students = [],
}: RankingsSearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [batchStatusFilter, setBatchStatusFilter] = useState(currentBatchStatus);

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

  const handleBatchStatusToggle = () => {
    const statuses = ["all", "active", "completed"];
    const currentIndex = statuses.indexOf(batchStatusFilter);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length] as "all" | "active" | "completed";
    setBatchStatusFilter(nextStatus);
    
    const params = new URLSearchParams(searchParams);
    if (nextStatus === "all") {
      params.delete("batchStatus");
    } else {
      params.set("batchStatus", nextStatus);
    }
    // Clear specific batch filter when changing status
    params.delete("batch");
    router.push(`?${params.toString()}`);
  };

  const handleBatchFilter = (batchId: string) => {
    const params = new URLSearchParams(searchParams);
    if (batchId === "all") {
      params.delete("batch");
    } else {
      params.set("batch", batchId);
    }
    router.push(`?${params.toString()}`);
  };

  const handleExport = () => {
    if (!students || students.length === 0) {
      alert('No rankings data available to export');
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
        (student.batch?.batch_code && student.batch.batch_code.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply batch filter
    const selectedBatch = searchParams.get("batch");
    if (selectedBatch && selectedBatch !== "all") {
      filteredStudents = filteredStudents.filter(student => student.batch_id === selectedBatch);
    }
    
    exportRankings(filteredStudents);
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
            {/* Batch Status Filter */}
            <Button variant="outline" onClick={handleBatchStatusToggle}>
              {batchStatusFilter === "all"
                ? "All"
                : `Status: ${batchStatusFilter}`}
            </Button>

            {/* Specific Batch Filter */}
            <Select
              onValueChange={handleBatchFilter}
              value={searchParams.get("batch") ?? "all"}
            >
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Specific Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Listed</SelectItem>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.batch_code}
                    {batch.status === "active" && (
                      <span className="ml-2 text-xs text-green-600">●</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
      {currentBatchStatus !== "all" && (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
          Batch Status: {currentBatchStatus}
        </span>
      )}
      {searchParams.get("batch") && searchParams.get("batch") !== "all" && (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
          Batch: {batches.find(b => b.id === searchParams.get("batch"))?.batch_code || searchParams.get("batch")}
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
          setBatchStatusFilter("all");
          router.push("/dashboard/rankings");
        }}
        className="text-blue-600 hover:underline"
      >
        Clear all
      </button>
    </div>
  </div>
  );
}
