import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { HAR, ToonExportCacheEntry, ToonExportStatus, ToonWorkerMessage } from '@types';
import { downloadTextFile } from '@utils/downloadFile';

const TOON_ENCODING_OPTIONS = {
  delimiter: '\t' as const,
  keyFolding: 'safe' as const,
  progressInterval: 2000,
};

const TOON_PREAMBLE_LINES = [
  'Format: TOON (Token-Oriented Object Notation)',
  'Reference: https://toonformat.dev/guide/getting-started.html',
  '',
];

function addToonPreamble(toonText: string) {
  return `${TOON_PREAMBLE_LINES.join('\n')}${toonText}`;
}

const createWorker = () =>
  new Worker(new URL('../workers/toonEncoder.worker.ts', import.meta.url), {
    type: 'module',
  });

function getExportFileName(fileName: string | null) {
  const baseName = (fileName ?? 'har-export').replace(/\.[^.]+$/, '');
  return `${baseName}.toon.txt`;
}

interface UseToonExportOptions {
  har: HAR | null;
  fileName: string | null;
  entriesCount: number;
}

export function useToonExport({ har, fileName, entriesCount }: UseToonExportOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<ToonExportStatus>('idle');
  const [toonText, setToonText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [lineCount, setLineCount] = useState<number | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const cacheRef = useRef<ToonExportCacheEntry | null>(null);

  const sourceKey = useMemo(() => {
    if (!har) return null;
    return [
      fileName ?? '',
      entriesCount,
      har.log.version,
      har.log.entries.length,
    ].join('::');
  }, [entriesCount, fileName, har]);

  const cleanupWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  const resetState = useCallback(() => {
    setStatus('idle');
    setToonText(null);
    setError(null);
    setElapsedMs(null);
    setLineCount(null);
  }, []);

  const hydrateFromCache = useCallback((cached: ToonExportCacheEntry) => {
    setStatus('ready');
    setToonText(cached.toonText);
    setError(null);
    setElapsedMs(cached.generatedAtMs);
    setLineCount(cached.lineCount);
  }, []);

  const startGeneration = useCallback(() => {
    if (!har || !sourceKey) return;

    cleanupWorker();
    resetState();
    setStatus('generating');

    const worker = createWorker();
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<ToonWorkerMessage>) => {
      const message = event.data;

      if (message.type === 'progress') {
        setElapsedMs(message.elapsedMs);
        setLineCount(message.linesProcessed);
        return;
      }

      if (message.type === 'success') {
        const exportText = addToonPreamble(message.toonText);
        const cacheEntry: ToonExportCacheEntry = {
          sourceKey,
          toonText: exportText,
          generatedAtMs: message.elapsedMs,
          lineCount: message.lineCount + TOON_PREAMBLE_LINES.length,
        };

        cacheRef.current = cacheEntry;
        hydrateFromCache(cacheEntry);
        cleanupWorker();
        return;
      }

      setStatus('error');
      setError(message.error);
      setToonText(null);
      cleanupWorker();
    };

    worker.onerror = () => {
      setStatus('error');
      setError('Failed to generate TOON output.');
      cleanupWorker();
    };

    worker.postMessage({
      har,
      options: TOON_ENCODING_OPTIONS,
    });
  }, [cleanupWorker, har, hydrateFromCache, resetState, sourceKey]);

  const openModal = useCallback(() => {
    if (!har || !sourceKey) return;

    setIsOpen(true);

    if (cacheRef.current?.sourceKey === sourceKey) {
      hydrateFromCache(cacheRef.current);
      return;
    }

    startGeneration();
  }, [har, hydrateFromCache, sourceKey, startGeneration]);

  const closeModal = useCallback(() => {
    if (status === 'generating') {
      cleanupWorker();
      resetState();
    }

    setIsOpen(false);
  }, [cleanupWorker, resetState, status]);

  const retry = useCallback(() => {
    if (!isOpen) {
      setIsOpen(true);
    }
    startGeneration();
  }, [isOpen, startGeneration]);

  const download = useCallback(() => {
    if (!toonText) return;
    downloadTextFile(toonText, getExportFileName(fileName));
  }, [fileName, toonText]);

  useEffect(() => {
    if (!sourceKey) {
      cacheRef.current = null;
      cleanupWorker();
      resetState();
      setIsOpen(false);
      return;
    }

    if (cacheRef.current && cacheRef.current.sourceKey !== sourceKey) {
      cacheRef.current = null;
      cleanupWorker();
      resetState();
      if (isOpen) {
        startGeneration();
      }
    }
  }, [cleanupWorker, isOpen, resetState, sourceKey, startGeneration]);

  useEffect(() => () => cleanupWorker(), [cleanupWorker]);

  return {
    isOpen,
    openModal,
    closeModal,
    retry,
    download,
    status,
    toonText,
    error,
    elapsedMs,
    lineCount,
    sourceKey,
    exportFileName: getExportFileName(fileName),
  };
}
