// lib/supabase/dashboard.ts
import { supabase } from "@/lib/supabase/client";

export interface DashboardStats {
  totalStudents: {
    count: number;
    trend: number;
    trendDirection: "up" | "down";
    progress: number;
  };
  activeBatches: {
    count: number;
    newThisQuarter: number;
    progress: number;
  };
  avgAttendance: {
    percentage: number;
    trend: number;
    trendDirection: "up" | "down";
  };
  performanceScore: {
    score: number;
    maxScore: number;
    trend: number;
    trendDirection: "up" | "down";
  };
}

export interface ActivityItem {
  id: string;
  action: string;
  time: string;
  type: "success" | "info" | "warning" | "error";
}

export interface BatchInfo {
  id: string;
  batch_code: string;
  studentCount: number;
  progress: number;
  attendance: number;
  avgScore: number;
}

export interface TopPerformer {
  id: string;
  name: string;
  student_id: string;
  score: number;
  trend: number;
  rank: number;
}

export interface PerformanceCategory {
  skill: string;
  score: number;
  trend: "up" | "down";
}

export interface AttendanceSummary {
  todayPercentage: number;
  todayPresent: number;
  todayTotal: number;
  weeklyAverage: number;
  weeklyTrend: number;
  trendDirection: "up" | "down";
}

export interface SystemAlert {
  id: string;
  type: "warning" | "info" | "success" | "error";
  title: string;
  message: string;
  time: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get total students
    const { count: totalStudents, error: studentsError } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (studentsError) throw studentsError;

    // Get active batches
    const { count: activeBatches, error: batchesError } = await supabase
      .from("batches")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    if (batchesError) throw batchesError;

    // Get attendance average for current month
    const currentMonth = new Date();
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );

    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance")
      .select("status")
      .gte("date", startOfMonth.toISOString().split("T")[0]);

    if (attendanceError) throw attendanceError;

    const totalAttendanceRecords = attendanceData?.length || 0;
    const presentRecords =
      attendanceData?.filter(
        (record) => record.status === "present" || record.status === "late"
      ).length || 0;

    const avgAttendance =
      totalAttendanceRecords > 0
        ? Math.round((presentRecords / totalAttendanceRecords) * 100)
        : 0;

    // Get average performance score
    const { data: studentsData, error: performanceError } = await supabase
      .from("students")
      .select(
        "creativity, leadership, behavior, presentation, communication, technical_skills, general_performance"
      )
      .eq("is_active", true);

    if (performanceError) throw performanceError;

    let avgPerformanceScore = 0;
    if (studentsData && studentsData.length > 0) {
      const totalScore = studentsData.reduce((sum, student) => {
        const studentScore =
          ((student.creativity || 0) +
            (student.leadership || 0) +
            (student.behavior || 0) +
            (student.presentation || 0) +
            (student.communication || 0) +
            (student.technical_skills || 0) +
            (student.general_performance || 0)) /
          7;
        return sum + studentScore;
      }, 0);
      avgPerformanceScore = parseFloat(
        (totalScore / studentsData.length).toFixed(1)
      );
    }

    return {
      totalStudents: {
        count: totalStudents || 0,
        trend: 12, // This would be calculated from historical data
        trendDirection: "up",
        progress: 75,
      },
      activeBatches: {
        count: activeBatches || 0,
        newThisQuarter: 2, // This would be calculated from quarter data
        progress: 80,
      },
      avgAttendance: {
        percentage: avgAttendance,
        trend: -2.1, // This would be calculated from week-over-week data
        trendDirection: "down",
      },
      performanceScore: {
        score: avgPerformanceScore,
        maxScore: 10,
        trend: 0.3, // This would be calculated from month-over-month data
        trendDirection: "up",
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    throw error;
  }
}

export async function getRecentActivity(): Promise<ActivityItem[]> {
  try {
    // This would typically come from an activity log table
    // For now, we'll return sample data that would be generated from actual events
    const activities: ActivityItem[] = [
      {
        id: "1",
        action: "New student enrolled",
        time: "2 min ago",
        type: "success",
      },
      {
        id: "2",
        action: "Attendance marked for Batch A",
        time: "15 min ago",
        type: "info",
      },
      {
        id: "3",
        action: "Performance updated",
        time: "1 hour ago",
        type: "warning",
      },
      {
        id: "4",
        action: "Low attendance alert",
        time: "2 hours ago",
        type: "error",
      },
    ];

    return activities;
  } catch (error) {
    console.error("Failed to fetch recent activity:", error);
    throw error;
  }
}

export async function getBatchOverview(): Promise<BatchInfo[]> {
  try {
    const { data: batches, error: batchesError } = await supabase
      .from("batches")
      .select("id, batch_code, current_module")
      .eq("status", "active")
      .order("batch_code");

    if (batchesError) throw batchesError;

    if (!batches) return [];

    // Get student counts and performance data for each batch
    const batchInfo = await Promise.all(
      batches.map(async (batch) => {
        // Get student count
        const { count: studentCount, error: countError } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("batch_id", batch.id)
          .eq("is_active", true);

        if (countError) {
          console.error("Error fetching student count:", countError);
        }

        // Get attendance percentage for this batch
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("attendance")
          .select("status")
          .eq("batch_id", batch.id);

        let attendancePercentage = 0;
        if (attendanceData && attendanceData.length > 0) {
          const presentCount = attendanceData.filter(
            (record) => record.status === "present" || record.status === "late"
          ).length;
          attendancePercentage = Math.round(
            (presentCount / attendanceData.length) * 100
          );
        }

        // Get average score for this batch
        const { data: studentsData, error: studentsError } = await supabase
          .from("students")
          .select(
            "creativity, leadership, behavior, presentation, communication, technical_skills, general_performance"
          )
          .eq("batch_id", batch.id)
          .eq("is_active", true);

        let avgScore = 0;
        if (studentsData && studentsData.length > 0) {
          const totalScore = studentsData.reduce((sum, student) => {
            const studentScore =
              ((student.creativity || 0) +
                (student.leadership || 0) +
                (student.behavior || 0) +
                (student.presentation || 0) +
                (student.communication || 0) +
                (student.technical_skills || 0) +
                (student.general_performance || 0)) /
              7;
            return sum + studentScore;
          }, 0);
          avgScore = parseFloat((totalScore / studentsData.length).toFixed(1));
        }

        // Calculate progress based on current module (assuming 3 modules total)
        const progress = ((batch.current_module || 1) / 3) * 100;

        return {
          id: batch.id,
          batch_code: batch.batch_code,
          studentCount: studentCount || 0,
          progress: Math.round(progress),
          attendance: attendancePercentage,
          avgScore,
        };
      })
    );

    return batchInfo;
  } catch (error) {
    console.error("Failed to fetch batch overview:", error);
    throw error;
  }
}

export async function getTopPerformers(): Promise<TopPerformer[]> {
  try {
    const { data: students, error } = await supabase
      .from("students")
      .select(
        "id, first_name, last_name, student_id, creativity, leadership, behavior, presentation, communication, technical_skills, general_performance"
      )
      .eq("is_active", true);

    if (error) throw error;

    if (!students) return [];

    // Calculate overall scores and sort
    const studentsWithScores = students
      .map((student) => {
        const overallScore =
          ((student.creativity || 0) +
            (student.leadership || 0) +
            (student.behavior || 0) +
            (student.presentation || 0) +
            (student.communication || 0) +
            (student.technical_skills || 0) +
            (student.general_performance || 0)) /
          7;

        return {
          id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          student_id: student.student_id,
          score: parseFloat(overallScore.toFixed(1)),
          trend: 0.2, // This would be calculated from historical data
          rank: 0, // Will be set after sorting
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // Top 5 performers
      .map((student, index) => ({
        ...student,
        rank: index + 1,
      }));

    return studentsWithScores;
  } catch (error) {
    console.error("Failed to fetch top performers:", error);
    throw error;
  }
}

export async function getPerformanceCategories(): Promise<
  PerformanceCategory[]
> {
  try {
    const { data: students, error } = await supabase
      .from("students")
      .select(
        "creativity, leadership, behavior, presentation, communication, technical_skills, general_performance"
      )
      .eq("is_active", true);

    if (error) throw error;

    if (!students || students.length === 0) {
      return [
        { skill: "Technical Skills", score: 0, trend: "up" },
        { skill: "Communication", score: 0, trend: "up" },
        { skill: "Leadership", score: 0, trend: "down" },
        { skill: "Creativity", score: 0, trend: "up" },
        { skill: "Presentation", score: 0, trend: "down" },
      ];
    }

    const categories = [
      {
        skill: "Technical Skills",
        score: parseFloat(
          (
            students.reduce((sum, s) => sum + (s.technical_skills || 0), 0) /
            students.length
          ).toFixed(1)
        ),
        trend: "up" as const,
      },
      {
        skill: "Communication",
        score: parseFloat(
          (
            students.reduce((sum, s) => sum + (s.communication || 0), 0) /
            students.length
          ).toFixed(1)
        ),
        trend: "up" as const,
      },
      {
        skill: "Leadership",
        score: parseFloat(
          (
            students.reduce((sum, s) => sum + (s.leadership || 0), 0) /
            students.length
          ).toFixed(1)
        ),
        trend: "down" as const,
      },
      {
        skill: "Creativity",
        score: parseFloat(
          (
            students.reduce((sum, s) => sum + (s.creativity || 0), 0) /
            students.length
          ).toFixed(1)
        ),
        trend: "up" as const,
      },
      {
        skill: "Presentation",
        score: parseFloat(
          (
            students.reduce((sum, s) => sum + (s.presentation || 0), 0) /
            students.length
          ).toFixed(1)
        ),
        trend: "down" as const,
      },
    ];

    return categories;
  } catch (error) {
    console.error("Failed to fetch performance categories:", error);
    throw error;
  }
}

export async function getAttendanceSummary(): Promise<AttendanceSummary> {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Get today's attendance
    const { data: todayData, error: todayError } = await supabase
      .from("attendance")
      .select("status")
      .eq("date", today);

    if (todayError) throw todayError;

    const todayTotal = todayData?.length || 0;
    const todayPresent =
      todayData?.filter(
        (record) => record.status === "present" || record.status === "late"
      ).length || 0;
    const todayPercentage =
      todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 0;

    // Get this week's average
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfWeekStr = startOfWeek.toISOString().split("T")[0];

    const { data: weekData, error: weekError } = await supabase
      .from("attendance")
      .select("status")
      .gte("date", startOfWeekStr)
      .lte("date", today);

    if (weekError) throw weekError;

    const weekTotal = weekData?.length || 0;
    const weekPresent =
      weekData?.filter(
        (record) => record.status === "present" || record.status === "late"
      ).length || 0;
    const weeklyAverage =
      weekTotal > 0 ? Math.round((weekPresent / weekTotal) * 100) : 0;

    return {
      todayPercentage,
      todayPresent,
      todayTotal,
      weeklyAverage,
      weeklyTrend: -2.1, // This would be calculated from historical data
      trendDirection: "down",
    };
  } catch (error) {
    console.error("Failed to fetch attendance summary:", error);
    throw error;
  }
}

export async function getSystemAlerts(): Promise<SystemAlert[]> {
  try {
    // This would typically come from a system alerts/notifications table
    // For now, we'll return sample data that would be generated from actual system monitoring
    const alerts: SystemAlert[] = [
      {
        id: "1",
        type: "warning",
        title: "Low Attendance Alert",
        message: "Batch 2024-Q1-B has attendance below 80% this week",
        time: "2 hours ago",
      },
      {
        id: "2",
        type: "info",
        title: "Module Completion",
        message: "Batch 2024-Q1-A completed Module 2",
        time: "1 day ago",
      },
      {
        id: "3",
        type: "success",
        title: "Performance Milestone",
        message: "Average class performance reached 8.5/10",
        time: "2 days ago",
      },
      {
        id: "4",
        type: "error",
        title: "System Maintenance",
        message: "Scheduled maintenance on Sunday 2 AM - 4 AM",
        time: "3 days ago",
      },
    ];

    return alerts;
  } catch (error) {
    console.error("Failed to fetch system alerts:", error);
    throw error;
  }
}
