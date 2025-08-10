"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ChevronRight, SkipForward } from "lucide-react";
import { BatchActions } from "./batches-actions";

interface BatchCardProps {
  batch: {
    id: string;
    batch_code: string;
    status: "active" | "upcoming" | "completed";
    progress: number;
    current_module: number;
    student_count: number;
    start_date: string;
    avg_attendance: number;
    description: string;
    module_1: string;
    module_2: string;
    module_3: string;
  };
  onModuleAdvance?: (batchId: string, currentModule: number) => void;
}

export function BatchCard({ batch, onModuleAdvance }: BatchCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{batch.batch_code}</CardTitle>
          <Badge className={getStatusColor(batch.status)}>
            {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
          </Badge>
        </div>
        <CardDescription>{batch.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Batch Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Students</span>
                <span className="font-medium">{batch.student_count}</span>
              </div>
              <div className="flex justify-between">
                <span>Start Date</span>
                <span className="font-medium">{batch.start_date}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Progress</span>
                <span className="font-medium">{batch.progress}%</span>
              </div>
              <div className="flex justify-between">
                <span>Attendance</span>
                <span className="font-medium">{batch.avg_attendance}%</span>
              </div>
            </div>
          </div>

          <Progress value={batch.progress} className="h-2" />

          {/* Current Module Display */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-medium">Current Module</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {batch.current_module} of 3
              </span>
            </div>

            <div className="space-y-1">
              <div className="font-medium">
                Module {batch.current_module}:{" "}
                {batch[`module_${batch.current_module}` as keyof typeof batch]}
              </div>
              <div className="text-xs text-muted-foreground">
                {
                  batch[
                    `module_${batch.current_module}_desc` as keyof typeof batch
                  ]
                }
              </div>
            </div>
          </div>

          {/* Module Progression */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Module Progression</span>
            <div className="space-y-1">
              {[1, 2, 3].map((moduleNum) => (
                <div key={moduleNum} className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      moduleNum < batch.current_module
                        ? "bg-green-500"
                        : moduleNum === batch.current_module
                        ? "bg-blue-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {batch[`module_${moduleNum}` as keyof typeof batch]}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {moduleNum < batch.current_module
                      ? "Completed"
                      : moduleNum === batch.current_module
                      ? "Current"
                      : "Upcoming"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <BatchActions
              batchId={batch.id}
              currentModule={batch.current_module}
              status={batch.status}
              batch={batch}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
