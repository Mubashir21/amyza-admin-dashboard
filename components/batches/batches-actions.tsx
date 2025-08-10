"use client";

import { useState } from "react";
import {
  deleteBatch,
  updateBatchModule,
  updateBatchStatus,
} from "@/lib/batches-services";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  SkipForward,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { BatchDetailsDialog } from "@/components/batches/batches-details-dialog";
import { EditBatchDialog } from "@/components/batches/batches-edit-dialog";

interface BatchActionsProps {
  batchId: string;
  currentModule: number;
  status: string;
  batch: any; // Full batch data for details dialog
}

export function BatchActions({
  batchId,
  currentModule,
  status,
  batch,
}: BatchActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const router = useRouter();

  const handleModuleAdvance = async () => {
    if (currentModule >= 3) return;

    try {
      setIsLoading(true);
      const newModule = currentModule + 1;
      await updateBatchModule(batchId, newModule);

      // Refresh the page to show updated data
      router.refresh();
    } catch (error: any) {
      console.error("Failed to advance module:", error);
      // You could show a toast error message here
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteBatch = async () => {
    try {
      setIsLoading(true);
      await updateBatchStatus(batchId, "completed");

      router.refresh();
      setShowCompleteDialog(false);
    } catch (error: any) {
      console.error("Failed to complete batch:", error);
      // You could show a toast error message here
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      // Call your delete function here
      await deleteBatch(batchId);
      console.log("Deleting batch:", batchId);

      router.refresh();
      setShowDeleteDialog(false);
    } catch (error: any) {
      console.error("Failed to delete batch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2 w-full">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setShowDetailsDialog(true)}
        >
          <Eye className="h-3 w-3 mr-1" />
          View Details
        </Button>

        {status === "active" && currentModule < 3 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleModuleAdvance}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <SkipForward className="h-3 w-3" />
            {isLoading ? "Updating..." : "Next Module"}
          </Button>
        )}

        {status === "active" && currentModule === 3 && (
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowCompleteDialog(true)}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            {isLoading ? "Completing..." : "Complete Batch"}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Batch
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Batch
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Complete Batch Confirmation Dialog */}
      <AlertDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to complete batch "{batch.batch_code}"? This
              will mark the batch as finished and move it to completed status.
              You can still view the batch data but won't be able to make
              further changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCompleteBatch}
              disabled={isLoading}
            >
              {isLoading ? "Completing..." : "Complete Batch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete batch "{batch.batch_code}"? This
              action cannot be undone and will also delete all associated
              students and attendance records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Details Dialog */}
      <BatchDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        batch={batch}
      />

      {/* Edit Dialog */}
      <EditBatchDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        batch={batch}
      />
    </>
  );
}
