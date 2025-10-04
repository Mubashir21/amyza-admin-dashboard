/**
 * Export services for different data types
 */

import { arrayToCSV, downloadCSV, generateFilename, formatDateForExport, formatScoreForExport, formatPercentageForExport, cleanTextForExport } from './export-utils';
import { Student } from './students-services';
import { Teacher } from './teachers-services';

/**
 * Export students data to CSV
 */
export function exportStudents(
  students: Student[],
  filename?: string
): void {
  if (!students || students.length === 0) {
    alert('No students data to export');
    return;
  }

  const exportData = students.map(student => ({
    'Student ID': student.student_id,
    'First Name': student.first_name,
    'Last Name': student.last_name,
    'Email': student.email || 'N/A',
    'Phone': student.phone || 'N/A',
    'Gender': student.gender?.charAt(0).toUpperCase() + student.gender?.slice(1) || 'N/A',
    'Batch': student.batch?.batch_code || 'N/A',
    'Status': student.is_active ? 'Active' : 'Inactive',
    'Creativity': formatScoreForExport(student.creativity),
    'Leadership': formatScoreForExport(student.leadership),
    'Behavior': formatScoreForExport(student.behavior),
    'Presentation': formatScoreForExport(student.presentation),
    'Communication': formatScoreForExport(student.communication),
    'Technical Skills': formatScoreForExport(student.technical_skills),
    'General Performance': formatScoreForExport(student.general_performance),
    'Overall Score': formatScoreForExport((student.creativity + student.leadership + student.behavior + student.presentation + student.communication + student.technical_skills + student.general_performance) / 7),
    'Attendance %': formatPercentageForExport(student.attendance_percentage),
    'Rank': student.rank || 'N/A',
    'Notes': cleanTextForExport(student.notes),
    'Joined Date': formatDateForExport(student.created_at),
    'Last Updated': formatDateForExport(student.updated_at)
  }));

  const csvContent = arrayToCSV(exportData);
  const finalFilename = filename || generateFilename('students');
  
  downloadCSV(csvContent, finalFilename);
}

/**
 * Export teachers data to CSV
 */
export function exportTeachers(
  teachers: Teacher[],
  filename?: string
): void {
  if (!teachers || teachers.length === 0) {
    alert('No teachers data to export');
    return;
  }

  const exportData = teachers.map(teacher => ({
    'Teacher ID': teacher.teacher_id,
    'First Name': teacher.first_name,
    'Last Name': teacher.last_name,
    'Email': teacher.email || 'N/A',
    'Phone': teacher.phone || 'N/A',
    'Department': teacher.department || 'N/A',
    'Position': teacher.position || 'N/A',
    'Hire Date': teacher.hire_date ? formatDateForExport(teacher.hire_date) : 'N/A',
    'Status': teacher.is_active ? 'Active' : 'Inactive',
    'Notes': cleanTextForExport(teacher.notes),
    'Created Date': formatDateForExport(teacher.created_at),
    'Last Updated': formatDateForExport(teacher.updated_at)
  }));

  const csvContent = arrayToCSV(exportData);
  const finalFilename = filename || generateFilename('teachers');
  
  downloadCSV(csvContent, finalFilename);
}

/**
 * Export batches data to CSV
 */
export function exportBatches(
  batches: Array<{
    id: string;
    batch_code: string;
    start_date?: string;
    end_date?: string;
    status: string;
    current_module?: number;
    total_modules?: number;
    student_count?: number;
    created_at: string;
    updated_at: string;
  }>,
  filename?: string
): void {
  if (!batches || batches.length === 0) {
    alert('No batches data to export');
    return;
  }

  const exportData = batches.map(batch => ({
    'Batch Code': batch.batch_code,
    'Status': batch.status.charAt(0).toUpperCase() + batch.status.slice(1),
    'Start Date': batch.start_date ? formatDateForExport(batch.start_date) : 'N/A',
    'End Date': batch.end_date ? formatDateForExport(batch.end_date) : 'N/A',
    'Current Module': batch.current_module || 'N/A',
    'Total Modules': batch.total_modules || 'N/A',
    'Progress': batch.current_module && batch.total_modules 
      ? `${Math.round((batch.current_module / batch.total_modules) * 100)}%`
      : 'N/A',
    'Student Count': batch.student_count || 'N/A',
    'Created Date': formatDateForExport(batch.created_at),
    'Last Updated': formatDateForExport(batch.updated_at)
  }));

  const csvContent = arrayToCSV(exportData);
  const finalFilename = filename || generateFilename('batches');
  
  downloadCSV(csvContent, finalFilename);
}

/**
 * Export attendance data to CSV
 */
export function exportAttendance(
  attendanceRecords: Array<{
    id: string;
    student_id: string;
    student_name: string;
    batch_code: string;
    date: string;
    status: string;
    day_of_week?: string;
    created_at: string;
  }>,
  filename?: string
): void {
  if (!attendanceRecords || attendanceRecords.length === 0) {
    alert('No attendance data to export');
    return;
  }

  const exportData = attendanceRecords.map(record => ({
    'Student ID': record.student_id,
    'Student Name': record.student_name,
    'Batch': record.batch_code,
    'Date': formatDateForExport(record.date),
    'Day': record.day_of_week || 'N/A',
    'Status': record.status.charAt(0).toUpperCase() + record.status.slice(1),
    'Recorded Date': formatDateForExport(record.created_at)
  }));

  const csvContent = arrayToCSV(exportData);
  const finalFilename = filename || generateFilename('attendance');
  
  downloadCSV(csvContent, finalFilename);
}

/**
 * Export rankings data to CSV
 */
export function exportRankings(
  students: Student[],
  filename?: string
): void {
  if (!students || students.length === 0) {
    alert('No rankings data to export');
    return;
  }

  // Sort students by overall performance score
  const sortedStudents = [...students].sort((a, b) => {
    const scoreA = (a.creativity + a.leadership + a.behavior + a.presentation + a.communication + a.technical_skills + a.general_performance) / 7;
    const scoreB = (b.creativity + b.leadership + b.behavior + b.presentation + b.communication + b.technical_skills + b.general_performance) / 7;
    return scoreB - scoreA;
  });

  const exportData = sortedStudents.map((student, index) => {
    const overallScore = (student.creativity + student.leadership + student.behavior + student.presentation + student.communication + student.technical_skills + student.general_performance) / 7;
    
    return {
      'Rank': index + 1,
      'Student ID': student.student_id,
      'Student Name': `${student.first_name} ${student.last_name}`,
      'Batch': student.batch?.batch_code || 'N/A',
      'Overall Score': formatScoreForExport(overallScore),
      'Creativity': formatScoreForExport(student.creativity),
      'Leadership': formatScoreForExport(student.leadership),
      'Behavior': formatScoreForExport(student.behavior),
      'Presentation': formatScoreForExport(student.presentation),
      'Communication': formatScoreForExport(student.communication),
      'Technical Skills': formatScoreForExport(student.technical_skills),
      'General Performance': formatScoreForExport(student.general_performance),
      'Attendance %': formatPercentageForExport(student.attendance_percentage),
      'Status': student.is_active ? 'Active' : 'Inactive'
    };
  });

  const csvContent = arrayToCSV(exportData);
  const finalFilename = filename || generateFilename('rankings');
  
  downloadCSV(csvContent, finalFilename);
}

/**
 * Export teacher attendance data to CSV
 */
export function exportTeacherAttendance(
  attendanceRecords: Array<{
    id: string;
    teacher_id: string;
    teacher_name: string;
    department?: string;
    date: string;
    status: string;
    day_of_week?: string;
    notes?: string;
    created_at: string;
  }>,
  filename?: string
): void {
  if (!attendanceRecords || attendanceRecords.length === 0) {
    alert('No teacher attendance data to export');
    return;
  }

  const exportData = attendanceRecords.map(record => ({
    'Teacher ID': record.teacher_id,
    'Teacher Name': record.teacher_name,
    'Department': record.department || 'N/A',
    'Date': formatDateForExport(record.date),
    'Day': record.day_of_week || 'N/A',
    'Status': record.status.charAt(0).toUpperCase() + record.status.slice(1),
    'Notes': cleanTextForExport(record.notes),
    'Recorded Date': formatDateForExport(record.created_at)
  }));

  const csvContent = arrayToCSV(exportData);
  const finalFilename = filename || generateFilename('teacher_attendance');
  
  downloadCSV(csvContent, finalFilename);
}


