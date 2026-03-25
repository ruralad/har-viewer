/// <reference lib="webworker" />

import { encodeLines } from '@toon-format/toon';
import type { ToonWorkerMessage, ToonWorkerRequest } from '../types/toon';

const DEFAULT_PROGRESS_INTERVAL = 2000;

self.onmessage = (event: MessageEvent<ToonWorkerRequest>) => {
  const startTime = performance.now();

  try {
    const { har, options } = event.data;
    const lines: string[] = [];
    const progressInterval = options?.progressInterval ?? DEFAULT_PROGRESS_INTERVAL;

    let linesProcessed = 0;

    for (const line of encodeLines(har, {
      delimiter: options?.delimiter ?? '\t',
      keyFolding: options?.keyFolding ?? 'safe',
    })) {
      lines.push(line);
      linesProcessed += 1;

      if (linesProcessed % progressInterval === 0) {
        const progressMessage: ToonWorkerMessage = {
          type: 'progress',
          linesProcessed,
          elapsedMs: performance.now() - startTime,
        };

        self.postMessage(progressMessage);
      }
    }

    const successMessage: ToonWorkerMessage = {
      type: 'success',
      toonText: lines.join('\n'),
      lineCount: linesProcessed,
      elapsedMs: performance.now() - startTime,
    };

    self.postMessage(successMessage);
  } catch (error) {
    const errorMessage: ToonWorkerMessage = {
      type: 'error',
      error: error instanceof Error ? error.message : 'Failed to generate TOON output.',
    };

    self.postMessage(errorMessage);
  }
};
