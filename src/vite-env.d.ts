/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    saveFile: (options: { content: string; filename: string; filters?: Array<{ name: string; extensions: string[] }> }) => Promise<{ success: boolean; filePath?: string }>;
  };
}