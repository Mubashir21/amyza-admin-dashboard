/**
 * Tasks Services
 * Handles task management CRUD operations
 */

import { supabase } from "./supabase/client";

// Task status enum
export type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

// Task type definition
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_by: string | null;
  assigned_to: string | null;
  deadline: string | null;
  deadline_locked: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

// Create task data
export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  assigned_to?: string;
  deadline?: string;
  deadline_locked?: boolean;
  created_by: string;
}

// Update task data
export interface UpdateTaskData {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  assigned_to?: string | null;
  deadline?: string | null;
  deadline_locked?: boolean;
}

/**
 * Get all tasks
 */
export async function getTasks(): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Failed to get tasks:", error);
    throw error;
  }
}

/**
 * Create a new task
 */
export async function createTask(taskData: CreateTaskData): Promise<Task> {
  try {
    const now = new Date().toISOString();
    
    const insertData: Record<string, unknown> = {
      title: taskData.title,
      description: taskData.description || null,
      status: taskData.status || "NOT_STARTED",
      assigned_to: taskData.assigned_to || null,
      deadline: taskData.deadline || null,
      deadline_locked: taskData.deadline_locked || false,
      created_by: taskData.created_by,
      created_at: now,
      updated_at: now,
      completed_at: taskData.status === "COMPLETED" ? now : null,
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert([insertData])
      .select("*")
      .single();

    if (error) {
      console.error("Error creating task:", error);
      throw new Error(`Failed to create task: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Failed to create task:", error);
    throw error;
  }
}

/**
 * Update a task
 */
export async function updateTask(
  taskId: string,
  updates: UpdateTaskData
): Promise<Task> {
  try {
    const now = new Date().toISOString();
    
    // Get current task to check status change
    const { data: currentTask } = await supabase
      .from("tasks")
      .select("status")
      .eq("id", taskId)
      .single();

    const updateData: Record<string, unknown> = {
      ...updates,
      updated_at: now,
    };

    // Handle completed_at based on status change
    if (updates.status !== undefined) {
      if (updates.status === "COMPLETED" && currentTask?.status !== "COMPLETED") {
        // Status changed to COMPLETED - set completed_at
        updateData.completed_at = now;
      } else if (updates.status !== "COMPLETED") {
        // Status changed to NOT_STARTED or IN_PROGRESS - clear completed_at
        updateData.completed_at = null;
      }
    }

    const { data, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", taskId)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating task:", error);
      throw new Error(`Failed to update task: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Failed to update task:", error);
    throw error;
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  } catch (error) {
    console.error("Failed to delete task:", error);
    throw error;
  }
}

/**
 * Get task statistics
 */
export async function getTaskStats(): Promise<{
  total: number;
  notStarted: number;
  inProgress: number;
  completed: number;
}> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("status");

    if (error) {
      console.error("Error fetching task stats:", error);
      throw new Error(`Failed to fetch task stats: ${error.message}`);
    }

    const stats = {
      total: data?.length || 0,
      notStarted: data?.filter((t) => t.status === "NOT_STARTED").length || 0,
      inProgress: data?.filter((t) => t.status === "IN_PROGRESS").length || 0,
      completed: data?.filter((t) => t.status === "COMPLETED").length || 0,
    };

    return stats;
  } catch (error) {
    console.error("Failed to fetch task stats:", error);
    throw error;
  }
}
