import { supabase } from "@/lib/supabase/client";
import { Student } from "./students-services";

export interface RankedStudent {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  batch_code: string;
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

export interface RankingsStats {
  topPerformer: {
    name: string;
    score: number;
  };
  averageScore: number;
  mostImproved: {
    name: string;
    improvement: number;
  };
  totalStudents: number;
  activeBatches: number;
  completedBatches: number;
}

export interface PerformanceCategory {
  category: string;
  score: number;
  color: string;
}

interface RankingsFilters {
  search?: string;
  batchStatus?: "all" | "active" | "completed";
  batch?: string;
}

export async function getRankingsFiltered(
  filters: RankingsFilters = {}
): Promise<RankedStudent[]> {
  try {
    let query = supabase.from("students").select(`
        *,
        batch:batches!inner(batch_code, status)
      `);

    // Apply batch status filter at SQL level
    if (filters.batchStatus === "active") {
      query = query.eq("batches.status", "active");
    } else if (filters.batchStatus === "completed") {
      query = query.eq("batches.status", "completed");
    } else {
      // Default: exclude upcoming batches at SQL level
      query = query.in("batches.status", ["active", "completed"]);
    }

    // Apply specific batch filter
    if (filters.batch && filters.batch !== "all") {
      query = query.eq("batch_id", filters.batch);
    }

    const { data, error } = await query.order("first_name");

    if (error) {
      console.error("Error fetching students for rankings:", error);
      throw new Error(error.message);
    }

    let students = data || [];

    // ✅ Apply is_active filter intelligently based on batch status
    if (filters.batchStatus === "active") {
      // For active batches, only show active students
      students = students.filter((s) => s.is_active === true);
    } else if (filters.batchStatus === "completed") {
      // For completed batches, show ALL students (regardless of is_active)
      // Because completed batch students are automatically set to inactive
    } else {
      // For "all" - show active students from active batches + all students from completed batches
      students = students.filter(
        (s) =>
          (s.batch?.status === "active" && s.is_active === true) ||
          s.batch?.status === "completed" // Show all students from completed batches
      );
    }

    // Apply search filter (keep this in JavaScript)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      students = students.filter((student: Student) => {
        return (
          student.first_name?.toLowerCase().includes(searchTerm) ||
          student.last_name?.toLowerCase().includes(searchTerm) ||
          student.student_id?.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Calculate rankings for each student
    const rankedStudents: RankedStudent[] = await Promise.all(
      students.map(async (student: Student) => {
        const attendancePercentage = await calculateAttendancePercentage(
          student.id
        );
        const overallScore = calculateOverallScore({
          creativity: student.creativity || 0,
          leadership: student.leadership || 0,
          behavior: student.behavior || 0,
          presentation: student.presentation || 0,
          communication: student.communication || 0,
          technical_skills: student.technical_skills || 0,
          general_performance: student.general_performance || 0,
        });

        return {
          id: student.id,
          student_id: student.student_id,
          first_name: student.first_name,
          last_name: student.last_name,
          batch_code: student.batch?.batch_code || "N/A",
          overall_score: overallScore,
          attendance_percentage: attendancePercentage,
          technical_score: student.technical_skills || 0,
          communication_score: student.communication || 0,
          creativity: student.creativity || 0,
          leadership: student.leadership || 0,
          behavior: student.behavior || 0,
          presentation: student.presentation || 0,
          general_performance: student.general_performance || 0,
          rank: 0,
        };
      })
    );

    rankedStudents.sort((a, b) => b.overall_score - a.overall_score);
    rankedStudents.forEach((student, index) => {
      student.rank = index + 1;
    });

    return rankedStudents;
  } catch (error) {
    console.error("Failed to fetch rankings:", error);
    throw error;
  }
}

export async function getRankingsStats(
  filters: RankingsFilters = {}
): Promise<RankingsStats> {
  try {
    const students = await getRankingsFiltered(filters);

    if (students.length === 0) {
      return {
        topPerformer: { name: "No students", score: 0 },
        averageScore: 0,
        mostImproved: { name: "No data", improvement: 0 },
        totalStudents: 0,
        activeBatches: 0,
        completedBatches: 0,
      };
    }

    const topPerformer = students[0];
    const averageScore =
      students.reduce((sum, student) => sum + student.overall_score, 0) /
      students.length;

    // Get batch counts based on current filter
    let activeBatchesCount = 0;
    let completedBatchesCount = 0;

    if (filters.batchStatus === "active") {
      const { data: activeBatches } = await supabase
        .from("batches")
        .select("id")
        .eq("status", "active");
      activeBatchesCount = activeBatches?.length || 0;
    } else if (filters.batchStatus === "completed") {
      const { data: completedBatches } = await supabase
        .from("batches")
        .select("id")
        .eq("status", "completed");
      completedBatchesCount = completedBatches?.length || 0;
    } else {
      // For "all", get both counts
      const [activeBatches, completedBatches] = await Promise.all([
        supabase.from("batches").select("id").eq("status", "active"),
        supabase.from("batches").select("id").eq("status", "completed"),
      ]);
      activeBatchesCount = activeBatches.data?.length || 0;
      completedBatchesCount = completedBatches.data?.length || 0;
    }

    return {
      topPerformer: {
        name: `${topPerformer.first_name} ${topPerformer.last_name}`,
        score: topPerformer.overall_score,
      },
      averageScore: parseFloat(averageScore.toFixed(1)),
      mostImproved: {
        name: "Coming soon", // This needs historical data tracking
        improvement: 0,
      },
      totalStudents: students.length,
      activeBatches: activeBatchesCount,
      completedBatches: completedBatchesCount,
    };
  } catch (error) {
    console.error("Failed to fetch rankings stats:", error);
    throw error;
  }
}

export async function getPerformanceCategories(
  filters: RankingsFilters = {}
): Promise<PerformanceCategory[]> {
  try {
    const students = await getRankingsFiltered(filters);

    if (students.length === 0) {
      return [
        { category: "Creativity", score: 0, color: "bg-purple-500" },
        { category: "Leadership", score: 0, color: "bg-blue-500" },
        { category: "Behavior", score: 0, color: "bg-green-500" },
        { category: "Presentation", score: 0, color: "bg-orange-500" },
        { category: "Communication", score: 0, color: "bg-pink-500" },
        { category: "Technical Skills", score: 0, color: "bg-indigo-500" },
        { category: "General Performance", score: 0, color: "bg-red-500" },
      ];
    }

    const categories = [
      {
        category: "Creativity",
        score:
          students.reduce((sum, s) => sum + s.creativity, 0) / students.length,
        color: "bg-purple-500",
      },
      {
        category: "Leadership",
        score:
          students.reduce((sum, s) => sum + s.leadership, 0) / students.length,
        color: "bg-blue-500",
      },
      {
        category: "Behavior",
        score:
          students.reduce((sum, s) => sum + s.behavior, 0) / students.length,
        color: "bg-green-500",
      },
      {
        category: "Presentation",
        score:
          students.reduce((sum, s) => sum + s.presentation, 0) /
          students.length,
        color: "bg-orange-500",
      },
      {
        category: "Communication",
        score:
          students.reduce((sum, s) => sum + s.communication_score, 0) /
          students.length,
        color: "bg-pink-500",
      },
      {
        category: "Technical Skills",
        score:
          students.reduce((sum, s) => sum + s.technical_score, 0) /
          students.length,
        color: "bg-indigo-500",
      },
      {
        category: "General Performance",
        score:
          students.reduce((sum, s) => sum + s.general_performance, 0) /
          students.length,
        color: "bg-red-500",
      },
    ];

    return categories;
  } catch (error) {
    console.error("Failed to fetch performance categories:", error);
    throw error;
  }
}

export async function getBatchesForRankings(
  status?: "all" | "active" | "completed"
) {
  let query = supabase.from("batches").select("*");

  if (status === "active") {
    // Show only active batches
    query = query.eq("status", "active");
  } else if (status === "completed") {
    // Show only completed batches
    query = query.eq("status", "completed");
  } else {
    // For "all" (or no status) - show ONLY active and completed, NEVER upcoming
    query = query.in("status", ["active", "completed"]);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching batches:", error);
    return [];
  }
  return data || [];
}

// Helper function to calculate attendance percentage for a student
async function calculateAttendancePercentage(
  studentId: string
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("attendance")
      .select("status")
      .eq("student_id", studentId);

    if (error) {
      console.error("Error fetching attendance:", error);
      return 0;
    }

    if (!data || data.length === 0) {
      return 0;
    }

    const presentCount = data.filter(
      (record) => record.status === "present" || record.status === "late"
    ).length;

    return Math.round((presentCount / data.length) * 100);
  } catch (error) {
    console.error("Error calculating attendance:", error);
    return 0;
  }
}

// Helper function to calculate overall score from performance metrics
function calculateOverallScore(metrics: {
  creativity: number;
  leadership: number;
  behavior: number;
  presentation: number;
  communication: number;
  technical_skills: number;
  general_performance: number;
}): number {
  // Weight the different metrics (you can adjust these weights)
  const weights = {
    creativity: 0.15,
    leadership: 0.15,
    behavior: 0.1,
    presentation: 0.15,
    communication: 0.15,
    technical_skills: 0.2,
    general_performance: 0.1,
  };

  const weightedSum =
    metrics.creativity * weights.creativity +
    metrics.leadership * weights.leadership +
    metrics.behavior * weights.behavior +
    metrics.presentation * weights.presentation +
    metrics.communication * weights.communication +
    metrics.technical_skills * weights.technical_skills +
    metrics.general_performance * weights.general_performance;

  return parseFloat(weightedSum.toFixed(1));
}
