import { supabase } from "@/lib/supabase/client";

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
}

export interface PerformanceCategory {
  category: string;
  score: number;
  color: string;
}

interface RankingsFilters {
  search?: string;
  batch?: string;
}

export async function getRankingsFiltered(
  filters: RankingsFilters = {}
): Promise<RankedStudent[]> {
  try {
    let query = supabase.from("students").select(`
        *,
        batch:batches(batch_code)
      `);

    // Apply batch filter
    if (filters.batch && filters.batch !== "all") {
      console.log("Applying batch filter:", filters.batch);
      query = query.eq("batch_id", filters.batch);
    }

    // Only get active students
    query = query.eq("is_active", true);

    const { data, error } = await query.order("first_name");

    if (error) {
      console.error("Error fetching students for rankings:", error);
      throw new Error(error.message);
    }

    console.log("Fetched students for rankings:", data);

    let students = data || [];

    // Apply search filter on the client side
    if (filters.search) {
      console.log("Applying search filter:", filters.search);
      const searchTerm = filters.search.toLowerCase();
      students = students.filter((student: any) => {
        return (
          student.first_name?.toLowerCase().includes(searchTerm) ||
          student.last_name?.toLowerCase().includes(searchTerm) ||
          student.student_id?.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Calculate rankings for each student
    const rankedStudents: RankedStudent[] = await Promise.all(
      students.map(async (student: any) => {
        // Calculate attendance percentage
        const attendancePercentage = await calculateAttendancePercentage(
          student.id
        );

        // Calculate overall score from performance metrics
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
          rank: 0, // Will be set after sorting
        };
      })
    );

    // Sort by overall score and assign ranks
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

export async function getRankingsStats(): Promise<RankingsStats> {
  try {
    const students = await getRankingsFiltered();

    if (students.length === 0) {
      return {
        topPerformer: { name: "N/A", score: 0 },
        averageScore: 0,
        mostImproved: { name: "N/A", improvement: 0 },
        totalStudents: 0,
        activeBatches: 0,
      };
    }

    const topPerformer = students[0];
    const averageScore =
      students.reduce((sum, student) => sum + student.overall_score, 0) /
      students.length;

    // Get active batches count
    const { data: batches, error: batchError } = await supabase
      .from("batches")
      .select("id")
      .eq("status", "active");

    if (batchError) {
      console.error("Error fetching active batches:", batchError);
    }

    return {
      topPerformer: {
        name: `${topPerformer.first_name} ${topPerformer.last_name}`,
        score: topPerformer.overall_score,
      },
      averageScore: parseFloat(averageScore.toFixed(1)),
      mostImproved: {
        name: "Mike Davis", // This would need tracking over time
        improvement: 1.5,
      },
      totalStudents: students.length,
      activeBatches: batches?.length || 0,
    };
  } catch (error) {
    console.error("Failed to fetch rankings stats:", error);
    throw error;
  }
}

export async function getPerformanceCategories(): Promise<
  PerformanceCategory[]
> {
  try {
    const students = await getRankingsFiltered();

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

export async function getBatchesForRankings() {
  try {
    const { data, error } = await supabase
      .from("batches")
      .select(
        `
        id,
        batch_code
      `
      )
      .eq("status", "active")
      .order("batch_code");

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
