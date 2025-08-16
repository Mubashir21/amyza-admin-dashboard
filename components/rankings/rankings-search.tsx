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

interface Batch {
  id: string;
  batch_code: string;
  status: string; // Changed from is_active to status
}

interface RankingsSearchClientProps {
  batches: Batch[];
  currentBatchStatus: "all" | "active" | "completed";
}

export function RankingsSearchClient({
  batches,
  currentBatchStatus,
}: RankingsSearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

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

  const handleBatchStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status === "all") {
      params.delete("batchStatus");
    } else {
      params.set("batchStatus", status);
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
    console.log("Export rankings");
    // Implement export functionality
  };

  return (
    <Card>
      <CardContent className="pt-6">
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
            <Select
              onValueChange={handleBatchStatusFilter}
              value={currentBatchStatus}
            >
              <SelectTrigger className="w-[160px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Batch Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="completed">Completed Only</SelectItem>
              </SelectContent>
            </Select>

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
  );
}
