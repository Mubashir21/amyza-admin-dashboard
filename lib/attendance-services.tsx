import { supabase } from "@/lib/supabase/client";

export interface AttendanceRecord {
  id: string;
  student_id: string;
  batch_id: string;
  status: "present" | "absent" | "late";
  date: string;
  day_of_week: string;
  notes?: string;
  created_at: string;
  student: {
    id: string;
    first_name: string;
    last_name: string;
    student_id: string;
  };
  batch: {
    batch_code: string;
  };
}

export interface AttendanceStats {
  todayAttendance: {
    percentage: number;
    present: number;
    total: number;
  };
  weeklyAverage: number;
  lateArrivals: number;
  absentStudents: number;
}

interface AttendanceFilters {
  search?: string;
  batch?: string;
  status?: string;
  date?: string;
}

export async function getAttendanceFiltered(
  filters: AttendanceFilters = {}
): Promise<AttendanceRecord[]> {
  try {
    // Base query with required relationships
    let query = supabase.from("attendance").select(`
  *,
  student:students!inner(id, first_name, last_name, student_id),
  batch:batches!inner(batch_code)
`);

    // Apply filters
    if (filters.batch && filters.batch !== "all") {
      query = query.eq("batch_id", filters.batch);
    }

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters.date) {
      query = query.eq("date", filters.date);
    }

    if (filters.search) {
      query = query.or(
        `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,student_id.ilike.%${filters.search}%`,
        { foreignTable: "students" }
      );
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);

    // Add null check in the component or handle empty student data here
    return data || [];
  } catch (error) {
    console.error("Failed to fetch attendance:", error);
    throw error;
  }
}

export async function getAttendanceStats(): Promise<AttendanceStats> {
  try {
    // Get today's date
    const today = new Date().toISOString().split("T")[0];

    // Get today's attendance
    const { data: todayData, error: todayError } = await supabase
      .from("attendance")
      .select("status")
      .eq("date", today);

    if (todayError) {
      console.error("Error fetching today's attendance:", todayError);
      throw new Error(todayError.message);
    }

    const todayRecords = todayData || [];
    const presentToday = todayRecords.filter(
      (record) => record.status === "present"
    ).length;
    const lateToday = todayRecords.filter(
      (record) => record.status === "late"
    ).length;
    const absentToday = todayRecords.filter(
      (record) => record.status === "absent"
    ).length;
    const totalToday = todayRecords.length;

    const todayPercentage =
      totalToday > 0
        ? Math.round(((presentToday + lateToday) / totalToday) * 100)
        : 0;

    // Get this week's average
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfWeekStr = startOfWeek.toISOString().split("T")[0];

    const { data: weekData, error: weekError } = await supabase
      .from("attendance")
      .select("status, date")
      .gte("date", startOfWeekStr)
      .lte("date", today);

    if (weekError) {
      console.error("Error fetching weekly attendance:", weekError);
      throw new Error(weekError.message);
    }

    const weekRecords = weekData || [];

    // Calculate daily averages for the week
    const dailyStats: { [key: string]: { present: number; total: number } } =
      {};

    weekRecords.forEach((record) => {
      if (!dailyStats[record.date]) {
        dailyStats[record.date] = { present: 0, total: 0 };
      }
      dailyStats[record.date].total++;
      if (record.status === "present" || record.status === "late") {
        dailyStats[record.date].present++;
      }
    });

    const dailyPercentages = Object.values(dailyStats).map((day) =>
      day.total > 0 ? (day.present / day.total) * 100 : 0
    );

    const weeklyAverage =
      dailyPercentages.length > 0
        ? Math.round(
            dailyPercentages.reduce((sum, pct) => sum + pct, 0) /
              dailyPercentages.length
          )
        : 0;

    return {
      todayAttendance: {
        percentage: todayPercentage,
        present: presentToday + lateToday, // Include late as "present" for main stat
        total: totalToday,
      },
      weeklyAverage,
      lateArrivals: lateToday,
      absentStudents: absentToday,
    };
  } catch (error) {
    console.error("Failed to fetch attendance stats:", error);
    throw error;
  }
}

export async function getStudentsForAttendance() {
  try {
    const { data, error } = await supabase
      .from("students")
      .select(
        `
        id,
        first_name,
        last_name,
        student_id,
        batch_id
      `
      )
      .eq("is_active", "true")
      .order("first_name");

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

export async function getBatchesForAttendance() {
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