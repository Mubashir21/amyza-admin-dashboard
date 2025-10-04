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
import { exportTeachers } from "@/lib/export-services";
import { Teacher } from "@/lib/teachers-services";

interface TeachersSearchClientProps {
  onSearch?: (query: string) => void;
  onStatusFilter?: (status: string) => void;
  teachers?: Teacher[];
}

export function TeachersSearchClient({ onSearch, onStatusFilter, teachers = [] }: TeachersSearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");

  const updateURL = (search: string, status: string) => {
    const params = new URLSearchParams();
    
    if (search) {
      params.set("search", search);
    }
    
    if (status !== "all") {
      params.set("status", status);
    }

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/dashboard/teachers${newUrl}`, { scroll: false });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateURL(value, statusFilter);
    if (onSearch) onSearch(value);
  };

  const handleStatusToggle = () => {
    const statuses = ["all", "active", "inactive"];
    const currentIndex = statuses.indexOf(statusFilter);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    setStatusFilter(nextStatus);
    updateURL(searchQuery, nextStatus);
    if (onStatusFilter) onStatusFilter(nextStatus);
  };

  const handleExport = () => {
    if (!teachers || teachers.length === 0) {
      alert('No teachers data available to export');
      return;
    }
    
    // Filter teachers based on current search criteria
    let filteredTeachers = teachers;
    
    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filteredTeachers = filteredTeachers.filter(teacher => 
        teacher.first_name.toLowerCase().includes(searchLower) ||
        teacher.last_name.toLowerCase().includes(searchLower) ||
        teacher.teacher_id.toLowerCase().includes(searchLower) ||
        (teacher.email && teacher.email.toLowerCase().includes(searchLower)) ||
        (teacher.department && teacher.department.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filteredTeachers = filteredTeachers.filter(teacher => teacher.is_active === isActive);
    }
    
    exportTeachers(filteredTeachers);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    router.push("/dashboard/teachers");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
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
        {statusFilter !== "all" && (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
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
    </div>
  );
}
