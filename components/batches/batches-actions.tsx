"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Edit,
  SkipForward,
  CheckCircle,
  Trash2,
  // Users,
  Play,
  Eye,
} from "lucide-react";
import {
  updateBatchModule,
  updateBatchStatus,
  deleteBatch,
  completeBatch,
  type Batch,
} from "@/lib/batches-services";
import { EditBatchDialog } from "./batches-edit-dialog";
import { BatchDetailsDialog } from "./batches-details-dialog";

interface BatchActionsProps {
  batchId: string;
  currentModule: number;
  status: "active" | "upcoming" | "completed";
  batch: Batch & {
    student_count?: number;
    avg_attendance?: number;
    progress?: number;
    description?: string;
  };
}

export function BatchActions({
  batchId,
  currentModule,
  status,
  batch,
}: BatchActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAdvanceModule = async () => {
    if (currentModule >= 3) return;

    setIsLoading(true);
    try {
      await updateBatchModule(batchId, currentModule + 1);
      router.refresh();
    } catch (error) {
      console.error("Failed to advance module:", error);
      // You can add toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteBatch = async () => {
    setIsLoading(true);
    try {
      await completeBatch(batchId);
      setShowCompleteDialog(false);
      router.refresh();
      // You can add success toast here
    } catch (error) {
      console.error("Failed to complete batch:", error);
      // You can add error toast here
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateBatch = async () => {
    setIsLoading(true);
    try {
      await updateBatchStatus(batchId, "active");
      router.refresh();
    } catch (error) {
      console.error("Failed to activate batch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBatch = async () => {
    setIsLoading(true);
    try {
      await deleteBatch(batchId);
      setShowDeleteDialog(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete batch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2 w-full">
        {/* Quick Action Buttons */}
        {status === "upcoming" && (
          <Button
            onClick={handleActivateBatch}
            disabled={isLoading}
            size="sm"
            className="flex-1"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Batch
          </Button>
        )}

        {status === "active" && currentModule < 3 && (
          <Button
            onClick={handleAdvanceModule}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Next Module
          </Button>
        )}

        {status === "active" && (
          <Button
            onClick={() => setShowCompleteDialog(true)}
            disabled={isLoading}
            size="sm"
            variant="default"
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete
          </Button>
        )}

        {/* More Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuItem onClick={() => setIsDetailsDialogOpen(true)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Batch
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {status === "completed" && (
              <DropdownMenuItem onClick={handleActivateBatch}>
                <Play className="mr-2 h-4 w-4" />
                Reactivate Batch
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Batch
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit Dialog */}
      <EditBatchDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        batch={batch}
      />

      {/* Details Dialog */}
      <BatchDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        batch={batch}
      />

      {/* Complete Batch Confirmation */}
      <AlertDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Batch</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the batch as completed and deactivate all students
              in this batch. Students will no longer appear in active lists and
              their attendance tracking will stop.
              <br />
              <br />
              <strong>
                This action can be reversed by editing the batch status.
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCompleteBatch}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Completing..." : "Complete Batch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Batch Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the batch. All associated data
              including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Student enrollments</li>
                <li>Attendance records</li>
                <li>Performance data</li>
                <li>Module progress</li>
              </ul>
              <br />
              <strong>This action cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBatch}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Deleting..." : "Delete Batch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
