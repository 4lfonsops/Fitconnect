/**
 * CSV Export utility
 * Converts data arrays to CSV format and triggers download
 */

export interface CSVRow {
  [key: string]: string | number | boolean | null | undefined
}

/**
 * Escapes CSV field values and handles special characters
 */
export const escapeCSVField = (field: string | number | boolean | null | undefined): string => {
  if (field === null || field === undefined) return ''
  const str = String(field)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Converts an array of objects to CSV format with header row
 */
export const arrayToCSV = (data: CSVRow[], headers?: string[]): string => {
  if (!data.length) {
    console.warn('No data provided to arrayToCSV')
    return ''
  }

  // Determine headers from first row if not provided
  const finalHeaders = headers || Object.keys(data[0])
  console.log('CSV headers:', finalHeaders)
  console.log('CSV rows:', data.length)

  // Create header row
  const headerRow = finalHeaders.map(escapeCSVField).join(',')

  // Create data rows
  const dataRows = data.map((row) => finalHeaders.map((header) => escapeCSVField(row[header])).join(','))

  const csv = [headerRow, ...dataRows].join('\n')
  console.log('Generated CSV length:', csv.length, 'bytes')
  return csv
}

/**
 * Triggers download of CSV file
 */
export const downloadCSV = (csv: string, filename: string): void => {
  try {
    if (!csv || csv.trim() === '') {
      console.warn('CSV content is empty')
      alert('No hay datos para exportar')
      return
    }

    console.log('Starting CSV download:', filename, 'Size:', csv.length)
    
    // Add BOM for Excel compatibility
    const BOM = '\uFEFF'
    const fullCSV = BOM + csv
    
    const blob = new Blob([fullCSV], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.href = url
    link.download = filename
    link.style.display = 'none'

    document.body.appendChild(link)
    console.log('Link created and appended to body')
    
    link.click()
    console.log('Click triggered')
    
    // Clean up after a brief delay to ensure the download starts
    window.setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      console.log('Cleanup completed')
    }, 200)
    
    console.log('CSV download initiated successfully')
  } catch (error) {
    console.error('Error downloading CSV:', error)
    alert(`Error al descargar: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  }
}

/**
 * Formats currency values for CSV export
 */
export const formatCurrencyForCSV = (amount: number): string => {
  return amount.toFixed(2)
}

/**
 * Formats date for CSV export (YYYY-MM-DD)
 */
export const formatDateForCSV = (date: string | Date): string => {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

/**
 * Formats time for CSV export (HH:MM:SS)
 */
export const formatTimeForCSV = (time: string): string => {
  if (!time) return ''
  return time.substring(0, 8) // HH:MM:SS format
}

/**
 * Main export function - converts data to CSV and downloads
 */
export const exportToCSV = (
  data: CSVRow[],
  filename: string,
  headers?: string[]
): void => {
  console.log('exportToCSV called with:', data.length, 'rows, filename:', filename)
  const csv = arrayToCSV(data, headers)
  console.log('CSV generated, size:', csv.length)
  downloadCSV(csv, filename)
}
