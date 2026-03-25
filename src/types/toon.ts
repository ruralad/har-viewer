import type { HAR } from '@types';

export type ToonExportStatus = 'idle' | 'generating' | 'ready' | 'error';

export interface ToonWorkerRequest {
  har: HAR;
  options?: {
    delimiter?: ',' | '\t' | '|';
    keyFolding?: 'off' | 'safe';
    progressInterval?: number;
  };
}

export interface ToonWorkerProgressMessage {
  type: 'progress';
  linesProcessed: number;
  elapsedMs: number;
}

export interface ToonWorkerSuccessMessage {
  type: 'success';
  toonText: string;
  lineCount: number;
  elapsedMs: number;
}

export interface ToonWorkerErrorMessage {
  type: 'error';
  error: string;
}

export type ToonWorkerMessage =
  | ToonWorkerProgressMessage
  | ToonWorkerSuccessMessage
  | ToonWorkerErrorMessage;

export interface ToonExportCacheEntry {
  sourceKey: string;
  toonText: string;
  generatedAtMs: number;
  lineCount: number;
}
