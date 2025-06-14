import Papa from 'papaparse';
import { Password, ApplePasswordRow, GooglePasswordRow, SyncResult, ConflictedPassword, ProcessingState, MergeDirection } from '../types/password';
import { v4 as uuidv4 } from 'uuid';

export const syncPasswords = async (
  appleFile: File,
  googleFile: File,
  direction: MergeDirection,
  onProgress: (stage: string, progress: number) => void
): Promise<SyncResult> => {
  onProgress('Parsing Apple passwords...', 25);
  const applePasswords = await parseAppleFile(appleFile);
  
  onProgress('Parsing Google passwords...', 50);
  const googlePasswords = await parseGoogleFile(googleFile);
  
  onProgress('Syncing passwords...', 75);
  const result = mergePasswords(applePasswords, googlePasswords, direction);
  
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

const mergePasswords = (
  applePasswords: Password[], 
  googlePasswords: Password[], 
  direction: MergeDirection
): SyncResult => {
  const conflicts: ConflictedPassword[] = [];
  let merged: Password[] = [];

  // Create comprehensive lookup maps for both sources
  const googleLookups = createPasswordLookups(googlePasswords);
  const appleLookups = createPasswordLookups(applePasswords);

  switch (direction) {
    case 'apple-to-google':
      merged = mergeIntoTarget(googlePasswords, applePasswords, appleLookups, conflicts, 'google');
      break;
    case 'google-to-apple':
      merged = mergeIntoTarget(applePasswords, googlePasswords, googleLookups, conflicts, 'apple');
      break;
    case 'bidirectional':
    default:
      merged = bidirectionalMerge(applePasswords, googlePasswords, googleLookups, conflicts);
      break;
  }

  // Calculate accurate stats
  const uniqueFromApple = merged.filter(p => p.source === 'apple' && !merged.some(m => m.source === 'google' && passwordsMatch(p, m))).length;
  const uniqueFromGoogle = merged.filter(p => p.source === 'google' && !merged.some(m => m.source === 'apple' && passwordsMatch(p, m))).length;

  return {
    merged,
    conflicts,
    stats: {
      appleCount: applePasswords.length,
      googleCount: googlePasswords.length,
      mergedCount: merged.length,
      conflictCount: conflicts.length,
      uniqueFromApple,
      uniqueFromGoogle
    }
  };
};

const mergeIntoTarget = (
  targetPasswords: Password[],
  sourcePasswords: Password[],
  sourceLookups: any,
  conflicts: ConflictedPassword[],
  targetSource: 'apple' | 'google'
): Password[] => {
  const merged: Password[] = [...targetPasswords];
  const processedSourceIds = new Set<string>();

  // Check each source password against target
  sourcePasswords.forEach(sourcePassword => {
    const matchResult = findBestPasswordMatch(sourcePassword, sourceLookups);
    
    if (matchResult.match) {
      processedSourceIds.add(sourcePassword.id);
      
      // Check for conflicts
      if (sourcePassword.password !== matchResult.match.password) {
        const conflictId = uuidv4();
        conflicts.push({
          id: conflictId,
          apple: targetSource === 'apple' ? matchResult.match : sourcePassword,
          google: targetSource === 'google' ? matchResult.match : sourcePassword,
          reason: `Different passwords (${matchResult.matchType})`,
          resolved: false
        });
      }
      // If passwords match, target already has it, so no action needed
    } else {
      // Unique source password - add to target
      merged.push({
        ...sourcePassword,
        id: `merged-${merged.length}`,
        notes: combineNotes(sourcePassword.notes, `Added from ${sourcePassword.source}`)
      });
    }
  });

  return merged;
};

const bidirectionalMerge = (
  applePasswords: Password[],
  googlePasswords: Password[],
  googleLookups: any,
  conflicts: ConflictedPassword[]
): Password[] => {
  const merged: Password[] = [];
  const processedGoogleIds = new Set<string>();

  // Process Apple passwords first (they have richer data)
  applePasswords.forEach(applePassword => {
    const matchResult = findBestPasswordMatch(applePassword, googleLookups);
    
    if (matchResult.match) {
      processedGoogleIds.add(matchResult.match.id);
      
      // Check for conflicts
      if (applePassword.password !== matchResult.match.password) {
        const conflictId = uuidv4();
        conflicts.push({
          id: conflictId,
          apple: applePassword,
          google: matchResult.match,
          reason: `Different passwords (${matchResult.matchType})`,
          resolved: false
        });
        
        // Prefer Apple version but merge metadata
        merged.push({
          ...applePassword,
          id: `merged-${merged.length}`,
          title: applePassword.title || matchResult.match.title,
          notes: combineNotes(applePassword.notes, `Conflict with Google - chose Apple version`)
        });
      } else {
        // Perfect match - merge the best data
        merged.push({
          ...applePassword,
          id: `merged-${merged.length}`,
          title: applePassword.title || matchResult.match.title,
          notes: combineNotes(applePassword.notes, `Synced from Google (${matchResult.matchType})`)
        });
      }
    } else {
      // Unique Apple password
      merged.push({
        ...applePassword,
        id: `merged-${merged.length}`,
        notes: combineNotes(applePassword.notes, 'Apple only')
      });
    }
  });

  // Add remaining unique Google passwords
  const uniqueGooglePasswords = googlePasswords
    .filter(password => !processedGoogleIds.has(password.id))
    .map(password => ({
      ...password,
      id: `merged-${merged.length + uniqueGooglePasswords.length}`,
      notes: combineNotes(password.notes, 'Google only')
    }));
  
  merged.push(...uniqueGooglePasswords);
  return merged;
};

// Apply conflict resolutions to the merged results
export const applyConflictResolutions = (
  result: SyncResult,
  resolvedConflicts: ConflictedPassword[]
): SyncResult => {
  const updatedMerged = [...result.merged];
  const updatedConflicts = result.conflicts.map(conflict => {
    const resolved = resolvedConflicts.find(r => r.id === conflict.id);
    if (resolved) {
      // Update the merged password with the chosen version
      const mergedIndex = updatedMerged.findIndex(p => 
        passwordsMatch(p, conflict.apple) || passwordsMatch(p, conflict.google)
      );
      
      if (mergedIndex !== -1) {
        const chosenPassword = resolved.chosenSource === 'apple' ? conflict.apple : conflict.google;
        updatedMerged[mergedIndex] = {
          ...chosenPassword,
          id: updatedMerged[mergedIndex].id,
          notes: combineNotes(chosenPassword.notes, `Conflict resolved - chose ${resolved.chosenSource}`)
        };
      }
      
      return { ...conflict, resolved: true, chosenSource: resolved.chosenSource };
    }
    return conflict;
  });

  return {
    ...result,
    merged: updatedMerged,
    conflicts: updatedConflicts
  };
};

// Create comprehensive lookup system for passwords
const createPasswordLookups = (passwords: Password[]) => {
  const exactMap = new Map<string, Password>();
  const domainUserMap = new Map<string, Password[]>();
  const domainMap = new Map<string, Password[]>();
  const usernameMap = new Map<string, Password[]>();
  const fuzzyMap = new Map<string, Password[]>();

  passwords.forEach(password => {
    // 1. Exact URL + username match
    const exactKey = `${normalizeUrl(password.url)}::${normalizeUsername(password.username)}`;
    exactMap.set(exactKey, password);

    // 2. Domain + username match
    const domain = extractDomain(password.url);
    if (domain) {
      const domainUserKey = `${domain}::${normalizeUsername(password.username)}`;
      if (!domainUserMap.has(domainUserKey)) {
        domainUserMap.set(domainUserKey, []);
      }
      domainUserMap.get(domainUserKey)!.push(password);

      // 3. Domain-only match
      if (!domainMap.has(domain)) {
        domainMap.set(domain, []);
      }
      domainMap.get(domain)!.push(password);
    }

    // 4. Username-only match
    const normalizedUsername = normalizeUsername(password.username);
    if (!usernameMap.has(normalizedUsername)) {
      usernameMap.set(normalizedUsername, []);
    }
    usernameMap.get(normalizedUsername)!.push(password);

    // 5. Fuzzy matching for similar URLs
    const fuzzyKey = createFuzzyKey(password.url, password.username);
    if (!fuzzyMap.has(fuzzyKey)) {
      fuzzyMap.set(fuzzyKey, []);
    }
    fuzzyMap.get(fuzzyKey)!.push(password);
  });

  return { exactMap, domainUserMap, domainMap, usernameMap, fuzzyMap };
};

// Find the best password match
const findBestPasswordMatch = (password: Password, lookups: any) => {
  const { exactMap, domainUserMap, domainMap, usernameMap, fuzzyMap } = lookups;

  // 1. Try exact URL + username match
  const exactKey = `${normalizeUrl(password.url)}::${normalizeUsername(password.username)}`;
  let match = exactMap.get(exactKey);
  if (match) return { match, matchType: 'exact URL + username' };

  // 2. Try domain + username match
  const domain = extractDomain(password.url);
  if (domain) {
    const domainUserKey = `${domain}::${normalizeUsername(password.username)}`;
    const domainUserMatches = domainUserMap.get(domainUserKey) || [];
    if (domainUserMatches.length > 0) {
      return { match: domainUserMatches[0], matchType: 'domain + username' };
    }
  }

  // 3. Try fuzzy domain matching
  if (domain) {
    for (const [otherDomain, passwords] of domainMap.entries()) {
      if (domainsAreSimilar(domain, otherDomain)) {
        const usernameMatch = passwords.find(p => 
          normalizeUsername(p.username) === normalizeUsername(password.username)
        );
        if (usernameMatch) {
          return { match: usernameMatch, matchType: 'similar domain + username' };
        }
      }
    }
  }

  // 4. Try username match
  const normalizedUsername = normalizeUsername(password.username);
  const usernameMatches = usernameMap.get(normalizedUsername) || [];
  
  if (usernameMatches.length === 1) {
    return { match: usernameMatches[0], matchType: 'unique username' };
  } else if (usernameMatches.length > 1) {
    const bestMatch = usernameMatches.find(p => {
      const otherDomain = extractDomain(p.url);
      return domain && otherDomain && domainsAreSimilar(domain, otherDomain);
    });
    if (bestMatch) {
      return { match: bestMatch, matchType: 'username + similar domain' };
    }
    
    const passwordMatch = usernameMatches.find(p => p.password === password.password);
    if (passwordMatch) {
      return { match: passwordMatch, matchType: 'username + same password' };
    }
  }

  return { match: null, matchType: 'no match' };
};

// Helper functions
const passwordsMatch = (p1: Password, p2: Password): boolean => {
  return normalizeUrl(p1.url) === normalizeUrl(p2.url) && 
         normalizeUsername(p1.username) === normalizeUsername(p2.username);
};

const normalizeUrl = (url: string): string => {
  return url
    .toLowerCase()
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/$/, '')
    .trim();
};

const extractDomain = (url: string): string | null => {
  try {
    let domain = url.replace(/^https?:\/\/(www\.)?/, '');
    domain = domain.split('/')[0].split('?')[0].split(':')[0];
    return domain.toLowerCase().trim();
  } catch {
    return null;
  }
};

const normalizeUsername = (username: string): string => {
  return username.toLowerCase().trim();
};

const domainsAreSimilar = (domain1: string, domain2: string): boolean => {
  if (domain1 === domain2) return true;
  
  const parts1 = domain1.split('.').reverse();
  const parts2 = domain2.split('.').reverse();
  
  if (parts1.length >= 2 && parts2.length >= 2) {
    return parts1[0] === parts2[0] && parts1[1] === parts2[1];
  }
  
  const variations = [
    [domain1.replace('www.', ''), domain2.replace('www.', '')],
    [domain1.replace('m.', ''), domain2.replace('m.', '')],
    [domain1.replace('mobile.', ''), domain2.replace('mobile.', '')]
  ];
  
  return variations.some(([d1, d2]) => d1 === d2);
};

const createFuzzyKey = (url: string, username: string): string => {
  const domain = extractDomain(url) || url;
  const rootDomain = domain.split('.').slice(-2).join('.');
  return `${rootDomain}::${normalizeUsername(username)}`;
};

const combineNotes = (existingNotes: string | undefined, newNote: string): string => {
  if (!existingNotes) return newNote;
  return `${existingNotes}; ${newNote}`;
};

// Export functions for Apple format
export const exportToAppleFormat = (passwords: Password[]): string => {
  const headers = ['Title', 'URL', 'Username', 'Password', 'Notes', 'OTPAuth'];
  
  const csvRows = passwords.map(password => [
    escapeCSVField(password.title),
    escapeCSVField(password.url),
    escapeCSVField(password.username),
    escapeCSVField(password.password),
    escapeCSVField(password.notes || ''),
    escapeCSVField(password.otpAuth || '')
  ]);

  return [headers, ...csvRows]
    .map(row => row.join(','))
    .join('\n');
};

// Export functions for Google format
export const exportToGoogleFormat = (passwords: Password[]): string => {
  const headers = ['name', 'url', 'username', 'password'];
  
  const csvRows = passwords.map(password => [
    escapeCSVField(password.title),
    escapeCSVField(password.url),
    escapeCSVField(password.username),
    escapeCSVField(password.password)
  ]);

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