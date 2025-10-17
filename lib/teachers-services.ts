import { supabase } from "@/lib/supabase/client";

// Teacher interface matching your exact table structure
export interface Teacher {
  id: string;
  teacher_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  nationality?: string;
  age?: number;
  department?: string;
  position?: string;
  hire_date?: string;
  is_active: boolean;
  profile_picture?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Teacher attendance interface matching your exact table structure
export interface TeacherAttendance {
  id: string;
  teacher_id: string;
  date: string;
  day_of_week: number;
  status: 'present' | 'late' | 'absent'; // Your exact 3 statuses
  notes?: string;
  marked_by?: string;
  created_at: string;
  updated_at: string;
  teacher?: {
    id: string;
    teacher_id: string;
    first_name: string;
    last_name: string;
    department?: string;
  };
}

export interface CreateTeacherData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  nationality?: string;
  age?: number;
  department?: string;
  position?: string;
  hire_date?: string;
  notes?: string;
  profile_picture?: string;
  status?: 'active' | 'inactive';
}

/**
 * Generate unique teacher ID
 */
async function generateUniqueTeacherId(): Promise<string> {
  const year = new Date().getFullYear();
  let isUnique = false;
  let counter = 1;
  let teacherId = "";

  while (!isUnique) {
    teacherId = `TCH-${year}-${counter.toString().padStart(3, "0")}`;
    
    const { data } = await supabase
      .from("teachers")
      .select("teacher_id")
      .eq("teacher_id", teacherId)
      .single();

    if (!data) {
      isUnique = true;
    } else {
      counter++;
    }
  }

  return teacherId;
}

/**
 * Get all teachers
 */
export async function getTeachers(filters: {
  department?: string;
  is_active?: boolean;
  search?: string;
} = {}): Promise<Teacher[]> {
  try {
    let query = supabase
      .from("teachers")
      .select("*")
      .order("first_name");

    if (filters.department) {
      query = query.eq("department", filters.department);
    }

    if (filters.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active);
    }

    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,teacher_id.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching teachers:", error);
    throw error;
  }
}

/**
 * Get teacher by ID
 */
export async function getTeacherById(id: string): Promise<Teacher | null> {
  try {
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return null;
  }
}

/**
 * Create a new teacher (super_admin only)
 */
export async function createTeacher(teacherData: CreateTeacherData): Promise<Teacher> {
  try {
    console.log("createTeacher called with:", teacherData);
    const teacherId = await generateUniqueTeacherId();
    console.log("Generated teacher ID:", teacherId);

    // Prepare the data for insertion, excluding 'status' and using 'is_active'
    const { status, ...dataWithoutStatus } = teacherData;
    const insertData = {
      teacher_id: teacherId,
      ...dataWithoutStatus,
      is_active: status === 'active', // Convert status to boolean
    };

    console.log("Insert data:", insertData);

    const { data, error } = await supabase
      .from("teachers")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    
    console.log("Teacher created successfully:", data);
    return data;
  } catch (error) {
    console.error("Error creating teacher:", error);
    throw error;
  }
}

/**
 * Update teacher (super_admin only)
 */
export async function updateTeacher(id: string, updates: Partial<CreateTeacherData>): Promise<Teacher> {
  try {
    console.log("updateTeacher called with:", { id, updates });
    
    // Transform the data for database (convert status to is_active)
    const dbUpdates: Record<string, unknown> = { ...updates };
    
    // Convert status to is_active boolean
    if (updates.status !== undefined) {
      dbUpdates.is_active = updates.status === 'active';
      delete dbUpdates.status; // Remove status field as it doesn't exist in DB
    }
    
    console.log("Transformed updates for database:", dbUpdates);

    const { data, error } = await supabase
      .from("teachers")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw error;
    }
    
    console.log("Teacher updated successfully:", data);
    return data;
  } catch (error) {
    console.error("Error updating teacher:", error);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    throw error;
  }
}

/**
 * Upload teacher profile picture to Supabase storage
 */
export async function uploadTeacherProfilePicture(
  file: File,
  teacherId: string
): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `teacher-${teacherId}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('teacher-profile')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('teacher-profile')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error uploading teacher profile picture:", error);
    throw error;
  }
}

/**
 * Delete teacher profile picture from storage
 */
export async function deleteTeacherProfilePicture(pictureUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(pictureUrl);
    const pathSegments = url.pathname.split('/');
    const fileName = pathSegments[pathSegments.length - 1];

    const { error } = await supabase.storage
      .from('teacher-profile')
      .remove([fileName]);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting teacher profile picture:", error);
    throw error;
  }
}

/**
 * Update teacher profile picture (handles cleanup of old picture)
 */
export async function updateTeacherProfilePicture(
  teacherId: string,
  newProfilePicture: File
): Promise<string> {
  try {
    // First, get the current teacher data to find existing profile picture
    const { data: teacher, error: fetchError } = await supabase
      .from("teachers")
      .select("profile_picture")
      .eq("id", teacherId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch teacher: ${fetchError.message}`);
    }

    // Delete the old profile picture if it exists
    if (teacher.profile_picture) {
      try {
        await deleteTeacherProfilePicture(teacher.profile_picture);
      } catch (deleteError) {
        console.warn("Failed to delete old profile picture:", deleteError);
        // Continue with upload even if delete fails
      }
    }

    // Upload the new profile picture
    const newProfileUrl = await uploadTeacherProfilePicture(
      newProfilePicture,
      teacherId
    );

    // Update the teacher record with new profile picture URL
    const { error: updateError } = await supabase
      .from("teachers")
      .update({ profile_picture: newProfileUrl })
      .eq("id", teacherId);

    if (updateError) {
      // If database update fails, clean up the newly uploaded file
      try {
        await deleteTeacherProfilePicture(newProfileUrl);
      } catch (cleanupError) {
        console.error(
          "Failed to cleanup new profile picture after database error:",
          cleanupError
        );
      }
      throw new Error(`Failed to update teacher: ${updateError.message}`);
    }

    return newProfileUrl;
  } catch (error) {
    console.error("Error updating teacher profile picture:", error);
    throw error;
  }
}

/**
 * Remove teacher profile picture
 */
export async function removeTeacherProfilePicture(teacherId: string): Promise<void> {
  try {
    // First, get the current teacher data to find existing profile picture
    const { data: teacher, error: fetchError } = await supabase
      .from("teachers")
      .select("profile_picture")
      .eq("id", teacherId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch teacher: ${fetchError.message}`);
    }

    // Delete the profile picture from storage if it exists
    if (teacher.profile_picture) {
      try {
        await deleteTeacherProfilePicture(teacher.profile_picture);
      } catch (deleteError) {
        console.warn("Failed to delete profile picture from storage:", deleteError);
        // Continue with database update even if storage delete fails
      }
    }

    // Update the teacher record to remove profile picture URL
    const { error: updateError } = await supabase
      .from("teachers")
      .update({ profile_picture: null })
      .eq("id", teacherId);

    if (updateError) {
      throw new Error(`Failed to update teacher: ${updateError.message}`);
    }
  } catch (error) {
    console.error("Error removing teacher profile picture:", error);
    throw error;
  }
}

/**
 * Delete teacher (hard delete - super_admin only)
 * This performs a hard delete, completely removing the teacher record
 * Database CASCADE will automatically delete related attendance records
 */
export async function deleteTeacher(id: string): Promise<boolean> {
  try {
    console.log("Hard deleting teacher with ID:", id);

    // First, check if teacher exists
    const { data: teacher, error: fetchError } = await supabase
      .from("teachers")
      .select("id, first_name, last_name, teacher_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching teacher:", fetchError);
      throw new Error("Teacher not found");
    }

    // Perform hard delete - this will CASCADE and delete attendance records automatically
    const { error: deleteError } = await supabase
      .from("teachers")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Supabase delete error:", deleteError);
      console.error("Error details:", JSON.stringify(deleteError, null, 2));
      throw deleteError;
    }

    console.log("Teacher hard deleted successfully:", teacher.first_name, teacher.last_name);
    console.log("Database CASCADE automatically deleted related attendance records");
    
    return true;
  } catch (error) {
    console.error("Error deleting teacher:", error);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    throw error; // Re-throw to let the UI handle it
  }
}

/**
 * Get teacher attendance
 */
export async function getTeacherAttendance(filters: {
  teacher_id?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  limit?: number;
} = {}): Promise<TeacherAttendance[]> {
  try {
    let query = supabase
      .from("teacher_attendance")
      .select(`
        *,
        teacher:teachers (
          id,
          teacher_id,
          first_name,
          last_name,
          department
        )
      `)
      .order("date", { ascending: false });

    if (filters.teacher_id) {
      query = query.eq("teacher_id", filters.teacher_id);
    }

    if (filters.date_from) {
      query = query.gte("date", filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte("date", filters.date_to);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching teacher attendance:", error);
    throw error;
  }
}

/**
 * Mark teacher attendance (super_admin only)
 */
export async function markTeacherAttendance(attendanceData: {
  teacher_id: string;
  date: string;
  day_of_week: number;
  status: 'present' | 'late' | 'absent';
  notes?: string;
}): Promise<TeacherAttendance> {
  try {
    console.log("markTeacherAttendance called with:", attendanceData);
    
    // Use the day_of_week passed from client (already calculated correctly)
    const dayOfWeek = attendanceData.day_of_week;
    
    // Validate it's a class day (Saturday=7, Monday=2, Thursday=5)
    if (![7, 2, 5].includes(dayOfWeek)) {
      throw new Error(`Attendance can only be marked for Saturday, Monday, and Thursday. Invalid day_of_week: ${dayOfWeek}`);
    }
    
    console.log("Using day_of_week from client:", dayOfWeek, "for date:", attendanceData.date);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Auth error:", userError);
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    console.log("Current user:", user?.id);

    // First, verify the teacher exists
    const { data: teacherCheck, error: teacherError } = await supabase
      .from("teachers")
      .select("id, teacher_id, first_name, last_name")
      .eq("id", attendanceData.teacher_id)
      .single();
      
    if (teacherError) {
      console.error("Teacher check error:", teacherError);
      throw new Error(`Teacher not found: ${teacherError.message}`);
    }
    
    console.log("Teacher found:", teacherCheck);

    const insertData = {
      teacher_id: attendanceData.teacher_id,
      date: attendanceData.date,
      day_of_week: dayOfWeek,
      status: attendanceData.status,
      notes: attendanceData.notes || null,
      marked_by: user?.id || null,
    };
    
    console.log("About to insert/upsert:", insertData);

    const { data, error } = await supabase
      .from("teacher_attendance")
      .upsert([insertData], {
        onConflict: "teacher_id,date",
      })
      .select(`
        *,
        teacher:teachers (
          id,
          teacher_id,
          first_name,
          last_name,
          department
        )
      `)
      .single();

    if (error) {
      console.error("Supabase upsert error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw error;
    }
    
    console.log("Successfully marked attendance:", data);
    return data;
  } catch (error) {
    console.error("Error in markTeacherAttendance:", error);
    console.error("Error type:", typeof error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}

/**
 * Get individual teacher attendance percentage
 */
export async function getTeacherAttendancePercentage(teacherId: string): Promise<number> {
  try {
    // Get all attendance records for this teacher
    const { data: attendanceRecords, error } = await supabase
      .from("teacher_attendance")
      .select("status")
      .eq("teacher_id", teacherId);

    if (error) {
      console.error("Error fetching teacher attendance:", error);
      return 0;
    }

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return 0; // No attendance records
    }

    // Calculate percentage (present + late = attended)
    const totalRecords = attendanceRecords.length;
    const attendedRecords = attendanceRecords.filter(
      record => record.status === 'present' || record.status === 'late'
    ).length;

    const percentage = Math.round((attendedRecords / totalRecords) * 100);
    return percentage;
  } catch (error) {
    console.error("Error calculating teacher attendance percentage:", error);
    return 0;
  }
}

/**
 * Get teacher attendance statistics for dashboard
 */
export async function getTeacherAttendanceStats() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get total active teachers
    const { data: teachers, error: teachersError } = await supabase
      .from("teachers")
      .select("id")
      .eq("is_active", true);

    if (teachersError) throw teachersError;

    const totalTeachers = teachers?.length || 0;

    // Get today's attendance
    const { data: todayAttendance, error: attendanceError } = await supabase
      .from("teacher_attendance")
      .select("status")
      .eq("date", today);

    if (attendanceError) throw attendanceError;

    const presentToday = todayAttendance?.filter(a => a.status === 'present').length || 0;
    const absentToday = todayAttendance?.filter(a => a.status === 'absent').length || 0;
    const lateToday = todayAttendance?.filter(a => a.status === 'late').length || 0;

    return {
      totalTeachers,
      presentToday,
      absentToday,
      lateToday,
    };
  } catch (error) {
    console.error("Error fetching teacher attendance stats:", error);
    throw error;
  }
}

/**
 * Get unique departments
 */
export async function getTeacherDepartments(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("teachers")
      .select("department")
      .not("department", "is", null)
      .eq("is_active", true);

    if (error) throw error;

    const departments = [...new Set(data?.map(t => t.department).filter(Boolean))];
    return departments.sort();
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
}
