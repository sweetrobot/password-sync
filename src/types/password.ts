export interface Password {
  id: string;
  title: string;
  url: string;
  username: string;
  password: string;
  notes?: string;
  source: 'apple' | 'google';
  otpAuth?: string;
}

export interface ApplePasswordRow {
  Title: string;
  URL: string;
  Username: string;
  Password: string;
  Notes?: string;
  OTPAuth?: string;
}

export interface GooglePasswordRow {
  name: string;
  url: string;
  username: string;
  password: string;
}

export interface SyncResult {
  merged: Password[];
  conflicts: ConflictedPassword[];
  stats: {
    appleCount: number;
    googleCount: number;
    mergedCount: number;
    conflictCount: number;
    uniqueFromApple: number;
    uniqueFromGoogle: number;
  };
}

export interface ConflictedPassword {
  id: string;
  apple: Password;
  google: Password;
  reason: string;
  resolved?: boolean;
  chosenSource?: 'apple' | 'google';
}

export interface ProcessingState {
  isProcessing: boolean;
  stage: string;
  progress: number;
}

export type MergeDirection = 'bidirectional' | 'apple-to-google' | 'google-to-apple';