"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { getTeachers, Teacher } from "@/lib/teachers-services";
import { TeachersHeader } from "@/components/teachers/teachers-header";
import { TeachersGrid } from "@/components/teachers/teachers-grid";
import { TeachersStats } from "@/components/teachers/teachers-stats";
import { TeachersSearchClient } from "@/components/teachers/teachers-search";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer } from "@/components/responsive-container";

function TeachersLoading() {
  return (
    <div className="space-y-6">
      <ResponsiveContainer>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mt-2"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </ResponsiveContainer>
      
      <ResponsiveContainer>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ResponsiveContainer>

      <ResponsiveContainer>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ResponsiveContainer>
    </div>
  );
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    totalTeachers: 0,
    activeTeachers: 0,
    inactiveTeachers: 0,
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setIsLoading(true);
      const teachersData = await getTeachers();
      setTeachers(teachersData);
      
      // Calculate stats
      const totalTeachers = teachersData.length;
      const activeTeachers = teachersData.filter(t => t.is_active).length;
      const inactiveTeachers = totalTeachers - activeTeachers;
      
      setStats({
        totalTeachers,
        activeTeachers,
        inactiveTeachers,
      });
    } catch (error) {
      console.error("Error loading teachers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherUpdated = () => {
    loadTeachers();
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleStatusFilter = useCallback((status: string) => {
    setStatusFilter(status);
  }, []);

  // Filter teachers based on search and status
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesSearch = searchQuery === "" || 
        teacher.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.department?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = 
        (statusFilter === "all") ||
        (statusFilter === "active" && teacher.is_active) ||
        (statusFilter === "inactive" && !teacher.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [teachers, searchQuery, statusFilter]);

  // Calculate filtered stats
  const filteredStats = useMemo(() => {
    const totalTeachers = filteredTeachers.length;
    const activeTeachers = filteredTeachers.filter(t => t.is_active).length;
    const inactiveTeachers = totalTeachers - activeTeachers;
    
    return {
      totalTeachers,
      activeTeachers,
      inactiveTeachers,
    };
  }, [filteredTeachers]);

  if (isLoading) {
    return <TeachersLoading />;
  }

  return (
    <div className="space-y-6">
      <ResponsiveContainer>
        <TeachersHeader onTeacherAdded={handleTeacherUpdated} />
      </ResponsiveContainer>

      <ResponsiveContainer>
        <TeachersSearchClient onSearch={handleSearch} onStatusFilter={handleStatusFilter} teachers={teachers} />
      </ResponsiveContainer>

      <ResponsiveContainer>
        <TeachersStats stats={searchQuery || statusFilter !== "all" ? filteredStats : stats} />
      </ResponsiveContainer>
      
      <ResponsiveContainer>
        {filteredTeachers.length === 0 && !isLoading ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <div className="text-muted-foreground text-lg">
                  {searchQuery || statusFilter !== "all" ? "No teachers match your search" : "No teachers found"}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {searchQuery || statusFilter !== "all" 
                    ? "Try adjusting your search criteria" 
                    : "Add your first teacher to get started"
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <TeachersGrid teachers={filteredTeachers as Teacher[]} onTeachersUpdated={handleTeacherUpdated} />
        )}
      </ResponsiveContainer>
    </div>
  );
}
