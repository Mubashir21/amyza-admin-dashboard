"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { exportBatches } from "@/lib/export-services";

interface BatchesSearchClientProps {
  batches?: Array<{
    id: string;
    batch_code: string;
    start_date?: string;
    end_date?: string;
    status: string;
    current_module?: number;
    total_modules?: number;
    student_count?: number;
    created_at: string;
    updated_at: string;
  }>;
}

export function BatchesSearchClient({ batches = [] }: BatchesSearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "active"
  );

  // Update URL when filters change
  const updateURL = (search: string, status: string) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "active") params.set("status", status);

    const newURL = params.toString() ? `?${params.toString()}` : "";
    router.push(`/dashboard/batches${newURL}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Debounce the URL update
    setTimeout(() => {
      updateURL(value, statusFilter);
    }, 300);
  };

  const handleFilter = () => {
    const statuses = ["all", "active", "upcoming", "completed"];
    const currentIndex = statuses.indexOf(statusFilter);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    setStatusFilter(nextStatus);
    updateURL(searchQuery, nextStatus);
  };

  const handleExport = () => {
    if (!batches || batches.length === 0) {
      alert('No batches data available to export');
      return;
    }
    
    // Filter batches based on current search criteria
    let filteredBatches = batches;
    
    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filteredBatches = filteredBatches.filter(batch => 
        batch.batch_code.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      filteredBatches = filteredBatches.filter(batch => batch.status === statusFilter);
    }
    
    exportBatches(filteredBatches);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("active");
    router.push("/dashboard/batches");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search batches..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleFilter}>
                {statusFilter === "all"
                  ? "Filter by Status"
                  : `Status: ${statusFilter}`}
              </Button>
              <Button variant="outline" onClick={handleExport}>
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters Display */}
      {(searchQuery || statusFilter !== "all") && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Active filters:</span>
          {statusFilter !== "all" && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
              Status: {statusFilter}
            </span>
          )}
          {searchQuery && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
              Search: &quot;{searchQuery}&quot;
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
