/**
 * Export utilities for generating CSV files from data
 */

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  delimiter?: string;
}

/**
 * Convert data array to CSV format
 */
export function arrayToCSV(
  data: Record<string, unknown>[],
  options: ExportOptions = {}
): string {
  const {
    includeHeaders = true,
    delimiter = ','
  } = options;

  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from first object
  const headers = includeHeaders ? Object.keys(data[0]) : [];
  
  // Create CSV rows
  const csvRows: string[] = [];
  
  // Add headers if requested
  if (includeHeaders && headers.length > 0) {
    csvRows.push(headers.map(header => `"${header}"`).join(delimiter));
  }
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Handle null/undefined values
      if (value === null || value === undefined) {
        return '""';
      }
      // Convert to string and escape quotes
      const stringValue = String(value);
      // Escape quotes and wrap in quotes if contains delimiter, newline, or quote
      if (stringValue.includes(delimiter) || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return `"${stringValue}"`;
    });
    csvRows.push(values.join(delimiter));
  });
  
  return csvRows.join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(
  csvContent: string,
  filename: string = 'export.csv'
): void {
  // Create blob with CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up URL object
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(
  prefix: string,
  extension: string = 'csv'
): string {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const time = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  }).replace(':', '-'); // HH-MM
  
  return `${prefix}_${timestamp}_${time}.${extension}`;
}

/**
 * Format date for CSV export
 */
export function formatDateForExport(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Format performance score for CSV export
 */
export function formatScoreForExport(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'N/A';
  return score.toFixed(1);
}

/**
 * Format attendance percentage for CSV export
 */
export function formatPercentageForExport(percentage: number | null | undefined): string {
  if (percentage === null || percentage === undefined) return 'N/A';
  return `${percentage.toFixed(1)}%`;
}

/**
 * Clean text for CSV export (remove HTML, normalize whitespace)
 */
export function cleanTextForExport(text: string | null | undefined): string {
  if (!text) return '';
  
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}


