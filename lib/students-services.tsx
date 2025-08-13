import { supabase } from "@/lib/supabase/client";

export interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  batch_id: string;
  profile_picture: string | null;
  is_active: boolean;
  creativity: number;
  leadership: number;
  behavior: number;
  presentation: number;
  communication: number;
  technical_skills: number;
  general_performance: number;
  created_at: string;
  updated_at: string;
  batch?: {
    id: string;
    batch_code: string;
    current_module: number; // Get current module from batch
  };
  attendance_percentage: number;
  rank?: number;
  picture_url?: string;
}

export interface StudentsStatsData {
  totalStudents: number;
  activeStudents: number;
  averagePerformance: number;
  averageAttendance: number;
}

export interface CreateStudentData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  gender: string;
  batch_id: string;
  profile_picture?: File | null;
}

// Generate unique student ID
export async function generateUniqueStudentId(): Promise<string> {
  const year = new Date().getFullYear();

  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    // Generate random 4-digit number
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const studentId = `STU-${year}-${randomNum}`;

    try {
      // Check if this ID already exists
      const { data, error } = await supabase
        .from("students")
        .select("id")
        .eq("student_id", studentId)
        .single();

      if (error && error.code === "PGRST116") {
        // No row found - ID is unique
        return studentId;
      }

      if (error) {
        console.error("Error checking student ID uniqueness:", error);
        throw new Error("Failed to generate unique student ID");
      }

      // If we get here, the ID exists, so try again
      attempts++;
    } catch (error) {
      console.error("Error in student ID generation:", error);
      throw error;
    }
  }

  throw new Error(
    "Unable to generate unique student ID after multiple attempts"
  );
}

// Upload profile picture to Supabase Storage
export async function uploadProfilePicture(
  file: File,
  studentId: string
): Promise<string> {
  try {
    // Create unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${studentId}-${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("student-profile")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(
        `Failed to upload profile picture: ${uploadError.message}`
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("student-profile")
      .getPublicUrl(uploadData.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
}

// Delete profile picture from Supabase Storage
export async function deleteProfilePicture(pictureUrl: string): Promise<void> {
  try {
    const fileName = pictureUrl.split("/").pop();

    if (!fileName) {
      throw new Error("Could not extract filename from URL");
    }

    console.log("Extracted filename:", fileName);

    const { data, error } = await supabase.storage
      .from("student-profile")
      .remove([fileName]);

    console.log("Delete response:", { data, error });

    if (error) {
      console.error("Storage delete error:", error);
      throw new Error(`Failed to delete profile picture: ${error.message}`);
    }

    console.log("Successfully deleted from storage:", fileName);
  } catch (error) {
    console.error("Error in deleteProfilePicture:", error);
    throw error;
  }
}

// Update student with new profile picture (handles cleanup of old picture)
export async function updateStudentProfilePicture(
  studentId: string,
  newProfilePicture: File
): Promise<string> {
  try {
    // First, get the current student data to find existing profile picture
    const { data: student, error: fetchError } = await supabase
      .from("students")
      .select("profile_picture")
      .eq("id", studentId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch student: ${fetchError.message}`);
    }

    // Delete the old profile picture if it exists
    if (student.profile_picture) {
      try {
        await deleteProfilePicture(student.profile_picture);
      } catch (deleteError) {
        console.warn("Failed to delete old profile picture:", deleteError);
        // Continue with upload even if delete fails
      }
    }

    // Upload the new profile picture
    const newProfileUrl = await uploadProfilePicture(
      newProfilePicture,
      `student-${studentId}`
    );

    // Update the student record with new profile picture URL
    const { error: updateError } = await supabase
      .from("students")
      .update({ profile_picture: newProfileUrl })
      .eq("id", studentId);

    if (updateError) {
      // If database update fails, clean up the newly uploaded file
      try {
        await deleteProfilePicture(newProfileUrl);
      } catch (cleanupError) {
        console.error(
          "Failed to cleanup new profile picture after database error:",
          cleanupError
        );
      }
      throw new Error(`Failed to update student: ${updateError.message}`);
    }

    return newProfileUrl;
  } catch (error) {
    console.error("Error updating student profile picture:", error);
    throw error;
  }
}

// Also update the createStudent function to be more robust:
export async function createStudent(data: CreateStudentData): Promise<Student> {
  try {
    // Generate unique student ID
    const studentId = await generateUniqueStudentId();

    // Upload profile picture if provided
    let profilePictureUrl = null;
    if (data.profile_picture) {
      profilePictureUrl = await uploadProfilePicture(
        data.profile_picture,
        studentId
      );
    }

    // Prepare student data for database - only include fields that exist
    const studentData = {
      student_id: studentId,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || null,
      phone: data.phone || null,
      gender: data.gender,
      batch_id: data.batch_id,
      profile_picture: profilePictureUrl,
      is_active: true,
    };

    // Insert student into database
    const { data: insertedStudent, error } = await supabase
      .from("students")
      .insert([studentData])
      .select(
        `
        *,
        batch:batches(id, batch_code, current_module)
      `
      )
      .single();

    if (error) {
      if (profilePictureUrl) {
        try {
          await deleteProfilePicture(profilePictureUrl);
        } catch (cleanupError) {
          console.error("Failed to cleanup uploaded picture:", cleanupError);
        }
      }

      console.error("Error creating student:", error);
      throw new Error(`Failed to create student: ${error.message}`);
    }

    return insertedStudent;
  } catch (error) {
    console.error("Error in createStudent:", error);
    throw error;
  }
}

export async function getStudentsFiltered(filters?: {
  search?: string;
  batch?: string;
  status?: string;
}): Promise<Student[]> {
  try {
    let query = supabase.from("students").select(`
        *,
        batch:batches(id, batch_code, current_module)
      `);

    // Apply search filter
    if (filters?.search) {
      console.log("Applying search filter:", filters.search);
      query = query.or(
        `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,student_id.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      );
    }

    // Apply batch filter
    if (filters?.batch && filters.batch !== "all") {
      console.log("Applying batch filter:", filters.batch);
      query = query.eq("batch_id", filters.batch);
    }

    // Apply status filter
    if (filters?.status && filters.status !== "all") {
      console.log("Applying status filter:", filters.status);
      const isActive = filters.status === "active";
      query = query.eq("is_active", isActive);
    }

    const { data, error } = await query.order("first_name", {
      ascending: true,
    });

    if (error) {
      console.error("Error fetching students:", error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error("Failed to fetch students:", error);
    throw error;
  }
}

// Get student statistics
export async function getStudentsStats(): Promise<StudentsStatsData> {
  try {
    const [totalQuery, activeQuery, performanceQuery] = await Promise.all([
      supabase.from("students").select("id", { count: "exact" }),
      supabase
        .from("students")
        .select("id", { count: "exact" })
        .eq("is_active", true),
      supabase
        .from("students")
        .select(
          "creativity,leadership,behavior,presentation,communication,technical_skills,general_performance"
        ),
    ]);

    const totalStudents = totalQuery.count || 0;
    const activeStudents = activeQuery.count || 0;

    // Calculate average performance
    let averagePerformance = 0;
    if (performanceQuery.data && performanceQuery.data.length > 0) {
      const totalScores = performanceQuery.data.reduce((acc, student) => {
        const studentAvg =
          (student.creativity +
            student.leadership +
            student.behavior +
            student.presentation +
            student.communication +
            student.technical_skills +
            student.general_performance) /
          7;
        return acc + studentAvg;
      }, 0);
      averagePerformance =
        Math.round((totalScores / performanceQuery.data.length) * 10) / 10;
    }

    // Calculate average attendance (simplified - you might want to improve this)
    const averageAttendance = 91; // Placeholder - implement proper attendance calculation

    return {
      totalStudents,
      activeStudents,
      averagePerformance,
      averageAttendance,
    };
  } catch (error) {
    console.error("Failed to fetch student stats:", error);
    throw error;
  }
}

// Get students with calculated rankings and attendance
export async function getStudentsWithMetrics(filters?: {
  search?: string;
  batch?: string;
  status?: string;
}): Promise<Student[]> {
  try {
    // Get filtered students first
    const students = await getStudentsFiltered(filters);

    // Add placeholder metrics (replace with real calculations)
    return students.map((student, index) => ({
      ...student,
      attendance_percentage: Math.floor(Math.random() * 20) + 80, // 80-100%
      rank: index + 1,
      total_score:
        student.creativity +
        student.leadership +
        student.behavior +
        student.presentation +
        student.communication +
        student.technical_skills +
        student.general_performance,
    }));
  } catch (error) {
    console.error("Failed to fetch students with metrics:", error);
    throw error;
  }
}

// Delete student and cleanup profile picture
export async function deleteStudent(studentId: string): Promise<void> {
  try {
    // First, get the student data to find profile picture
    const { data: student, error: fetchError } = await supabase
      .from("students")
      .select("profile_picture")
      .eq("id", studentId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw new Error(`Failed to fetch student: ${fetchError.message}`);
    }

    // Delete the student from database
    const { error: deleteError } = await supabase
      .from("students")
      .delete()
      .eq("id", studentId);

    if (deleteError) {
      throw new Error(`Failed to delete student: ${deleteError.message}`);
    }

    // Delete profile picture if it exists
    if (student?.profile_picture) {
      try {
        await deleteProfilePicture(student.profile_picture);
      } catch (cleanupError) {
        console.warn("Failed to delete profile picture:", cleanupError);
        // Don't throw error here - student is already deleted
      }
    }

    console.log("Student deleted successfully");
  } catch (error) {
    console.error("Error deleting student:", error);
    throw error;
  }
}

export interface UpdateStudentData {
  first_name?: string;
  last_name?: string;
  email?: string | null;
  phone?: string | null;
  gender?: string;
  batch_id?: string;
  is_active?: boolean;
  updated_at?: string;
}

// Update student information
export async function updateStudent(
  studentId: string,
  updateData: UpdateStudentData
): Promise<Student> {
  try {
    // Update the student record
    const { data: updatedStudent, error } = await supabase
      .from("students")
      .update(updateData)
      .eq("id", studentId)
      .select(
        `
        *,
        batch:batches(id, batch_code, current_module)
      `
      )
      .single();

    if (error) {
      console.error("Error updating student:", error);
      throw new Error(`Failed to update student: ${error.message}`);
    }

    return updatedStudent;
  } catch (error) {
    console.error("Error in updateStudent:", error);
    throw error;
  }
}

export async function removeStudentProfilePicture(
  studentId: string
): Promise<void> {
  try {
    // Get current student data
    const { data: student, error: fetchError } = await supabase
      .from("students")
      .select("profile_picture")
      .eq("id", studentId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch student: ${fetchError.message}`);
    }

    // Delete the profile picture from storage if it exists (using your existing function)
    if (student.profile_picture) {
      try {
        await deleteProfilePicture(student.profile_picture); // Your existing function
      } catch (deleteError) {
        console.warn(
          "Failed to delete profile picture from storage:",
          deleteError
        );
      }
    }

    // Update the student record to remove profile picture
    const { error: updateError } = await supabase
      .from("students")
      .update({ profile_picture: null })
      .eq("id", studentId);

    if (updateError) {
      throw new Error(`Failed to update student: ${updateError.message}`);
    }
  } catch (error) {
    console.error("Error removing student profile picture:", error);
    throw error;
  }
}
