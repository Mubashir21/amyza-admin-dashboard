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
import { BookOpen, CheckCircle } from "lucide-react";
import { BatchActions } from "./batches-actions";
import { Batch } from "@/lib/batches-services";

interface BatchCardProps {
  batch: Batch & {
    student_count: number;
    avg_attendance: number;
    progress: number;
    description: string;
  };
  onModuleAdvance?: (batchId: string, currentModule: number) => void;
}

export function BatchCard({ batch }: BatchCardProps) {
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

  const isCompleted = batch.status === "completed";
  const currentModuleText = isCompleted
    ? "All modules completed"
    : `Module ${batch.current_module}: ${
        batch[`module_${batch.current_module}` as keyof typeof batch]
      }`;

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
                <span className="font-medium">
                  {isCompleted ? "100%" : `${batch.progress}%`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Attendance</span>
                <span className="font-medium">{batch.avg_attendance}%</span>
              </div>
            </div>
          </div>

          <Progress
            value={isCompleted ? 100 : batch.progress}
            className="h-2"
          />

          {/* Current Module Display */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <BookOpen className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {isCompleted ? "Status" : "Current Module"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {isCompleted ? "Completed" : `${batch.current_module} of 3`}
              </span>
            </div>

            <div className="space-y-1">
              <div className="font-medium">{currentModuleText}</div>
              {!isCompleted && (
                <div className="text-xs text-muted-foreground">
                  {
                    batch[
                      `module_${batch.current_module}_desc` as keyof typeof batch
                    ]
                  }
                </div>
              )}
            </div>
          </div>

          {/* Module Progression */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Module Progression</span>
            <div className="space-y-1">
              {[1, 2, 3].map((moduleNum) => {
                let moduleStatus = "";
                let moduleColor = "";

                if (isCompleted) {
                  // All modules are completed when batch is completed
                  moduleStatus = "Completed";
                  moduleColor = "bg-green-500";
                } else if (moduleNum < batch.current_module) {
                  moduleStatus = "Completed";
                  moduleColor = "bg-green-500";
                } else if (moduleNum === batch.current_module) {
                  moduleStatus = "Current";
                  moduleColor = "bg-blue-500";
                } else {
                  moduleStatus = "Upcoming";
                  moduleColor = "bg-gray-300";
                }

                return (
                  <div key={moduleNum} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${moduleColor}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {batch[`module_${moduleNum}` as keyof typeof batch]}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {moduleStatus}
                    </span>
                  </div>
                );
              })}
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
