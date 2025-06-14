import { Password } from '../types/password';

// Export to generic CSV format
export const exportToCsv = (passwords: Password[], filename: string): void => {
  // Create CSV header
  const headers = ['Title', 'URL', 'Username', 'Password', 'Notes', 'OTPAuth', 'Source'];
  
  // Convert passwords to CSV rows
  const csvRows = passwords.map(password => [
    escapeCSVField(password.title),
    escapeCSVField(password.url),
    escapeCSVField(password.username),
    escapeCSVField(password.password),
    escapeCSVField(password.notes || ''),
    escapeCSVField(password.otpAuth || ''),
    escapeCSVField(password.source)
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...csvRows]
    .map(row => row.join(','))
    .join('\n');

  if (window.electronAPI) {
    // Use Electron's save dialog
    window.electronAPI.saveFile({
      content: csvContent,
      filename: filename
    });
  } else {
    // Fallback to browser download
    downloadCSV(csvContent, filename);
  }
};

// Export to Apple format
export const exportToAppleFormat = (passwords: Password[], filename: string): void => {
  // Create CSV header
  const headers = ['Title', 'URL', 'Username', 'Password', 'Notes', 'OTPAuth'];
  
  // Convert passwords to Apple CSV rows
  const csvRows = passwords.map(password => [
    escapeCSVField(password.title),
    escapeCSVField(password.url),
    escapeCSVField(password.username),
    escapeCSVField(password.password),
    escapeCSVField(password.notes || ''),
    escapeCSVField(password.otpAuth || '')
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...csvRows]
    .map(row => row.join(','))
    .join('\n');

  if (window.electronAPI) {
    // Use Electron's save dialog
    window.electronAPI.saveFile({
      content: csvContent,
      filename: filename,
      filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    });
  } else {
    // Fallback to browser download
    downloadCSV(csvContent, filename);
  }
};

// Export to Google format
export const exportToGoogleFormat = (passwords: Password[], filename: string): void => {
  // Create CSV header
  const headers = ['name', 'url', 'username', 'password'];
  
  // Convert passwords to Google CSV rows
  const csvRows = passwords.map(password => [
    escapeCSVField(password.title),
    escapeCSVField(password.url),
    escapeCSVField(password.username),
    escapeCSVField(password.password)
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...csvRows]
    .map(row => row.join(','))
    .join('\n');

  if (window.electronAPI) {
    // Use Electron's save dialog
    window.electronAPI.saveFile({
      content: csvContent,
      filename: filename,
      filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    });
  } else {
    // Fallback to browser download
    downloadCSV(csvContent, filename);
  }
};

const downloadCSV = (csvContent: string, filename: string): void => {
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

const escapeCSVField = (field: string): string => {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
};