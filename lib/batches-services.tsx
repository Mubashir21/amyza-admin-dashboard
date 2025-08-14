import { supabase } from "@/lib/supabase/client";

// Types for better TypeScript support
export interface Batch {
  id: string;
  batch_code: string;
  start_date: string;
  end_date: string;
  status: "upcoming" | "active" | "completed";
  max_students: number;
  current_module: number;
  module_1: string;
  module_2: string;
  module_3: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBatchData {
  batch_code: string;
  start_date: string;
  end_date: string;
  status: "upcoming" | "active" | "completed";
  max_students: number;
  current_module: number;
  module_1: string;
  module_2: string;
  module_3: string;
}

// Fetch all batches
export async function getAllBatches(): Promise<Batch[]> {
  try {
    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching batches:", error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error("Failed to fetch batches:", error);
    throw error;
  }
}

// Fetch batches with optional filtering
export async function getBatchesFiltered(filters?: {
  status?: string;
  search?: string;
}): Promise<Batch[]> {
  try {
    let query = supabase.from("batches").select("*");

    // Apply status filter
    if (filters?.status && filters.status !== "all") {
      console.log("Applying status filter:", filters.status);
      query = query.eq("status", filters.status);
    }

    // Apply search filter
    if (filters?.search) {
      console.log("Applying search filter:", filters.search);
      query = query.or(
        `batch_code.ilike.%${filters.search}%,module_1.ilike.%${filters.search}%,module_2.ilike.%${filters.search}%,module_3.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching batches:", error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error("Failed to fetch batches:", error);
    throw error;
  }
}

// Get single batch by ID
export async function getBatchById(id: string): Promise<Batch | null> {
  try {
    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching batch:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch batch:", error);
    throw error;
  }
}

// Create a new batch
export async function createBatch(batchData: CreateBatchData): Promise<Batch> {
  try {
    // Check if batch code already exists
    const { data: existingBatch } = await supabase
      .from("batches")
      .select("id")
      .eq("batch_code", batchData.batch_code)
      .single();

    if (existingBatch) {
      throw new Error("A batch with this code already exists");
    }

    const { data, error } = await supabase
      .from("batches")
      .insert([
        {
          ...batchData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating batch:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Failed to create batch:", error);
    throw error;
  }
}

// Update entire batch
export async function updateBatch(
  batchId: string,
  updateData: Partial<{
    batch_code: string;
    start_date: string;
    end_date: string;
    status: "upcoming" | "active" | "completed";
    max_students: number;
    current_module: number;
    module_1: string;
    module_2: string;
    module_3: string;
  }>
): Promise<Batch> {
  try {
    // Get current batch data to compare status changes
    const { data: currentBatch } = await supabase
      .from("batches")
      .select("status, current_module")
      .eq("id", batchId)
      .single();

    const { data, error } = await supabase
      .from("batches")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", batchId)
      .select()
      .single();

    if (error) {
      console.error("Error updating batch:", error);
      throw new Error(error.message);
    }

    // Handle status change implications
    if (currentBatch && updateData.status !== currentBatch.status) {
      await handleBatchStatusChange(
        batchId,
        updateData.status!,
        currentBatch.status
      );
    }

    return data;
  } catch (error) {
    console.error("Failed to update batch:", error);
    throw error;
  }
}

// Handle batch status changes and their implications
async function handleBatchStatusChange(
  batchId: string,
  newStatus: "upcoming" | "active" | "completed",
  oldStatus: "upcoming" | "active" | "completed"
): Promise<void> {
  try {
    console.log(
      `Handling status change from ${oldStatus} to ${newStatus} for batch ${batchId}`
    );

    if (newStatus === "completed" && oldStatus !== "completed") {
      // When marking as completed: deactivate all students
      await deactivateStudentsInBatch(batchId);
    } else if (newStatus === "active" && oldStatus === "completed") {
      // When reactivating from completed: reactivate all students
      await reactivateStudentsInBatch(batchId);
    }
  } catch (error) {
    console.error("Failed to handle batch status change:", error);
    throw error;
  }
}

// Complete a batch (set status to completed and deactivate students)
export async function completeBatch(batchId: string): Promise<void> {
  try {
    console.log(`Completing batch ${batchId}`);

    // Update batch status to completed
    const { error: batchError } = await supabase
      .from("batches")
      .update({
        status: "completed",
        current_module: 3, // Set to final module
        updated_at: new Date().toISOString(),
      })
      .eq("id", batchId);

    if (batchError) {
      console.error("Error updating batch status:", batchError);
      throw new Error(batchError.message);
    }

    // Deactivate all students in this batch
    await deactivateStudentsInBatch(batchId);

    console.log(`Batch ${batchId} completed successfully`);
  } catch (error) {
    console.error("Failed to complete batch:", error);
    throw error;
  }
}

// Deactivate all students in a batch
async function deactivateStudentsInBatch(batchId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("students")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("batch_id", batchId);

    if (error) {
      console.error("Error deactivating students:", error);
      throw new Error(error.message);
    }

    console.log(`Deactivated all students in batch ${batchId}`);
  } catch (error) {
    console.error("Failed to deactivate students:", error);
    throw error;
  }
}

// Reactivate all students in a batch
async function reactivateStudentsInBatch(batchId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("students")
      .update({
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("batch_id", batchId);

    if (error) {
      console.error("Error reactivating students:", error);
      throw new Error(error.message);
    }

    console.log(`Reactivated all students in batch ${batchId}`);
  } catch (error) {
    console.error("Failed to reactivate students:", error);
    throw error;
  }
}

// Update batch module progression
export async function updateBatchModule(
  batchId: string,
  newModule: number
): Promise<void> {
  try {
    if (newModule < 1 || newModule > 3) {
      throw new Error("Module must be between 1 and 3");
    }

    const { error } = await supabase
      .from("batches")
      .update({
        current_module: newModule,
        updated_at: new Date().toISOString(),
      })
      .eq("id", batchId);

    if (error) {
      console.error("Error updating batch module:", error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Failed to update batch module:", error);
    throw error;
  }
}

// Update batch status
export async function updateBatchStatus(
  batchId: string,
  status: "upcoming" | "active" | "completed"
): Promise<void> {
  try {
    // Get current status to handle implications
    const { data: currentBatch } = await supabase
      .from("batches")
      .select("status")
      .eq("id", batchId)
      .single();

    const { error } = await supabase
      .from("batches")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", batchId);

    if (error) {
      console.error("Error updating batch status:", error);
      throw new Error(error.message);
    }

    // Handle status change implications
    if (currentBatch) {
      await handleBatchStatusChange(batchId, status, currentBatch.status);
    }
  } catch (error) {
    console.error("Failed to update batch status:", error);
    throw error;
  }
}

// Delete a batch
export async function deleteBatch(batchId: string): Promise<void> {
  try {
    const { error } = await supabase.from("batches").delete().eq("id", batchId);

    if (error) {
      console.error("Error deleting batch:", error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Failed to delete batch:", error);
    throw error;
  }
}

// Get batch statistics
export async function getBatchStats() {
  try {
    const { data: batches, error } = await supabase
      .from("batches")
      .select("status, current_module");

    if (error) {
      console.error("Error fetching batch stats:", error);
      throw new Error(error.message);
    }

    const stats = {
      activeBatches: batches?.filter((b) => b.status === "active").length || 0,
      upcomingBatches:
        batches?.filter((b) => b.status === "upcoming").length || 0,
      completedBatches:
        batches?.filter((b) => b.status === "completed").length || 0,
      totalBatches: batches?.length || 0,
      activeModules: batches?.filter((b) => b.status === "active").length || 0,
    };

    return stats;
  } catch (error) {
    console.error("Failed to fetch batch stats:", error);
    throw error;
  }
}

// Get student count for each batch
export async function getBatchStudentCounts(): Promise<{
  [batchId: string]: number;
}> {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("batch_id")
      .not("batch_id", "is", null);

    if (error) {
      console.error("Error fetching student counts:", error);
      return {};
    }

    // Count students per batch
    const counts: { [batchId: string]: number } = {};
    data?.forEach((student) => {
      if (student.batch_id) {
        counts[student.batch_id] = (counts[student.batch_id] || 0) + 1;
      }
    });

    return counts;
  } catch (error) {
    console.error("Failed to fetch student counts:", error);
    return {};
  }
}

// Get attendance percentage for each batch
export async function getBatchAttendanceRates(): Promise<{
  [batchId: string]: number;
}> {
  try {
    const { data, error } = await supabase.from("attendance").select(`
        id,
        student_id,
        status,
        students!inner(batch_id)
      `);

    if (error) {
      console.error("Error fetching attendance:", error);
      return {};
    }

    const batchStats: {
      [batchId: string]: { total: number; present: number };
    } = {};

    data?.forEach((record: any) => {
      const batchId = record.students?.batch_id;
      if (batchId) {
        if (!batchStats[batchId]) {
          batchStats[batchId] = { total: 0, present: 0 };
        }
        batchStats[batchId].total++;
        if (record.status === "present") {
          batchStats[batchId].present++;
        }
      }
    });

    const attendanceRates: { [batchId: string]: number } = {};
    Object.entries(batchStats).forEach(([batchId, stats]) => {
      attendanceRates[batchId] =
        stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
    });

    return attendanceRates;
  } catch (error) {
    console.error("Failed to fetch attendance rates:", error);
    return {};
  }
}

// Get total student count across all batches
export async function getTotalStudentCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching total student count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Failed to fetch total student count:", error);
    return 0;
  }
}
