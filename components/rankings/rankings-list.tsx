"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Award } from "lucide-react";

interface RankedStudent {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  batch_code: string;
  batch_id?: string;
  overall_score: number;
  attendance_percentage: number;
  technical_score: number;
  communication_score: number;
  creativity: number;
  leadership: number;
  behavior: number;
  presentation: number;
  general_performance: number;
  rank: number;
}

interface Batch {
  id: string;
  batch_code: string;
}

interface RankingsListProps {
  students: RankedStudent[];
  batches?: Batch[];
}

export function RankingsList({ students, batches = [] }: RankingsListProps) {
  // Get unique batches from students if batches prop is not provided
  const availableBatches = useMemo(() => {
    if (batches.length > 0) return batches;
    
    const uniqueBatches = Array.from(
      new Set(students.map((s) => s.batch_code))
    ).map((batch_code) => ({
      id: batch_code,
      batch_code,
    }));
    return uniqueBatches;
  }, [students, batches]);

  // Set default to first batch
  const [selectedBatch, setSelectedBatch] = useState<string>("");

  // Update selected batch when available batches change
  useEffect(() => {
    if (availableBatches.length > 0 && !selectedBatch) {
      setSelectedBatch(availableBatches[0].batch_code);
    }
  }, [availableBatches, selectedBatch]);

  // Filter and re-rank students by selected batch
  const batchStudents = useMemo(() => {
    if (!selectedBatch) return [];
    
    const filtered = students.filter((s) => s.batch_code === selectedBatch);
    
    // Re-rank within the batch
    const sorted = [...filtered].sort((a, b) => b.overall_score - a.overall_score);
    return sorted.map((student, index) => ({
      ...student,
      rank: index + 1,
    }));
  }, [students, selectedBatch]);
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-orange-500" />;
    return (
      <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
        #{rank}
      </div>
    );
  };

  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performers by Batch</CardTitle>
          <CardDescription>
            Students ranked by overall performance score within their batch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-lg text-gray-500">
              No rankings data available
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Student performance scores need to be calculated
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Top Performers by Batch</CardTitle>
            <CardDescription>
              Top {Math.min(batchStudents.length, 10)} students in {selectedBatch}
            </CardDescription>
          </div>
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select batch" />
            </SelectTrigger>
            <SelectContent>
              {availableBatches.map((batch) => (
                <SelectItem key={batch.id} value={batch.batch_code}>
                  {batch.batch_code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {batchStudents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-500">
              No students in this batch
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {batchStudents.slice(0, 10).map((student) => (
            <div
              key={student.id}
              className="border rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Header section with student info */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-4">
                  {getRankIcon(student.rank)}
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {student.first_name[0]}
                      {student.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {student.student_id} • {student.batch_code}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {student.overall_score.toFixed(1)}/10
                    </p>
                    <p className="text-xs text-muted-foreground">Overall Score</p>
                  </div>

                  <div className="w-24 hidden sm:block">
                    <Progress
                      value={student.overall_score * 10}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>

              {/* Metrics grid */}
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  <div className="text-center">
                    <p className="text-lg font-bold">
                      {student.attendance_percentage}%
                    </p>
                    <p className="text-xs text-muted-foreground">Attendance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">
                      {student.technical_score.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Technical</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">
                      {student.communication_score.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Communication</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">
                      {student.creativity.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Creativity</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">
                      {student.leadership.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Leadership</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">
                      {student.behavior.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Behavior</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">
                      {student.presentation.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Presentation</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">
                      {student.general_performance.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">General</p>
                  </div>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
