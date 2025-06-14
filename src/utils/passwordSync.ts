import Papa from 'papaparse';
import { Password, ApplePasswordRow, GooglePasswordRow, SyncResult, ConflictedPassword, ProcessingState } from '../types/password';
import { v4 as uuidv4 } from 'uuid';

export const syncPasswords = async (
  appleFile: File,
  googleFile: File,
  onProgress: (stage: string, progress: number) => void
): Promise<SyncResult> => {
  onProgress('Parsing Apple passwords...', 25);
  const applePasswords = await parseAppleFile(appleFile);
  
  onProgress('Parsing Google passwords...', 50);
  const googlePasswords = await parseGoogleFile(googleFile);
  
  onProgress('Syncing passwords...', 75);
  const result = mergePasswords(applePasswords, googlePasswords);
  
  onProgress('Complete!', 100);
  return result;
};

const parseAppleFile = (file: File): Promise<Password[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const passwords: Password[] = results.data.map((row: any, index) => {
            const appleRow = row as ApplePasswordRow;
            return {
              id: `apple-${index}`,
              title: appleRow.Title || '',
              url: appleRow.URL || '',
              username: appleRow.Username || '',
              password: appleRow.Password || '',
              notes: appleRow.Notes || '',
              otpAuth: appleRow.OTPAuth || '',
              source: 'apple' as const
            };
          });
          resolve(passwords.filter(p => p.url && p.username));
        } catch (error) {
          reject(new Error('Failed to parse Apple passwords file'));
        }
      },
      error: (error) => {
        reject(new Error(`Error reading Apple file: ${error.message}`));
      }
    });
  });
};

const parseGoogleFile = (file: File): Promise<Password[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const passwords: Password[] = results.data.map((row: any, index) => {
            const googleRow = row as GooglePasswordRow;
            return {
              id: `google-${index}`,
              title: googleRow.name || '',
              url: googleRow.url || '',
              username: googleRow.username || '',
              password: googleRow.password || '',
              notes: '',
              source: 'google' as const
            };
          });
          resolve(passwords.filter(p => p.url && p.username));
        } catch (error) {
          reject(new Error('Failed to parse Google passwords file'));
        }
      },
      error: (error) => {
        reject(new Error(`Error reading Google file: ${error.message}`));
      }
    });
  });
};

const mergePasswords = (applePasswords: Password[], googlePasswords: Password[]): SyncResult => {
  const merged: Password[] = [];
  const conflicts: ConflictedPassword[] = [];
  const processedGoogleIds = new Set<string>();

  // Create lookup map for Google passwords
  const googleMap = new Map<string, Password>();
  googlePasswords.forEach(password => {
    const key = generateKey(password.url, password.username);
    googleMap.set(key, password);
  });

  // Process Apple passwords first
  applePasswords.forEach(applePassword => {
    const key = generateKey(applePassword.url, applePassword.username);
    const googleMatch = googleMap.get(key);

    if (googleMatch) {
      processedGoogleIds.add(googleMatch.id);
      
      // Check for conflicts
      if (applePassword.password !== googleMatch.password) {
        conflicts.push({
          apple: applePassword,
          google: googleMatch,
          reason: 'Different passwords for same account'
        });
        // In case of conflict, prefer Apple version (you can modify this logic)
        merged.push(applePassword);
      } else {
        // Merge compatible data, preferring Apple's richer data
        merged.push({
          ...applePassword,
          id: `merged-${merged.length}`,
          title: applePassword.title || googleMatch.title
        });
      }
    } else {
      // Unique Apple password
      merged.push(applePassword);
    }
  });

  // Add unique Google passwords
  const uniqueGooglePasswords = googlePasswords.filter(
    password => !processedGoogleIds.has(password.id)
  );
  merged.push(...uniqueGooglePasswords);

  return {
    merged,
    conflicts,
    stats: {
      appleCount: applePasswords.length,
      googleCount: googlePasswords.length,
      mergedCount: merged.length,
      conflictCount: conflicts.length,
      uniqueFromApple: applePasswords.length - conflicts.length,
      uniqueFromGoogle: uniqueGooglePasswords.length
    }
  };
};

const generateKey = (url: string, username: string): string => {
  // Normalize URL by removing protocol and www
  const normalizedUrl = url.replace(/^https?:\/\/(www\.)?/, '').toLowerCase();
  return `${normalizedUrl}::${username.toLowerCase()}`;
};

// Export functions for Apple format
export const exportToAppleFormat = (passwords: Password[]): string => {
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
  return [headers, ...csvRows]
    .map(row => row.join(','))
    .join('\n');
};

// Export functions for Google format
export const exportToGoogleFormat = (passwords: Password[]): string => {
  const headers = ['name', 'url', 'username', 'password'];
  
  // Convert passwords to Google CSV rows
  const csvRows = passwords.map(password => [
    escapeCSVField(password.title),
    escapeCSVField(password.url),
    escapeCSVField(password.username),
    escapeCSVField(password.password)
  ]);

  // Combine headers and rows
  return [headers, ...csvRows]
    .map(row => row.join(','))
    .join('\n');
};

const escapeCSVField = (field: string): string => {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
};