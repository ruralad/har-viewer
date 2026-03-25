import { useMemo, useRef, useEffect, lazy, Suspense } from 'react';
import styled, { useTheme } from 'styled-components';
import { useHAR } from '@contexts/HARContext';
import { WaterfallRow } from './WaterfallRow';

const RequestInspector = lazy(() => import('./RequestInspector').then(module => ({ default: module.RequestInspector })));
import { calculateWaterfallData, getTimeMarkers } from '@utils/waterfallCalculations';
import type { FilterType, SearchScope } from '../types/filters';
import { useCustomFiltersStore } from '../stores/customFiltersStore';
import { applyFilters } from '../utils/filterUtils';
import { ResizableSplitPanel, Container } from './shared/ViewLayout';
import { useListKeyboardNav } from '@hooks/useListKeyboardNav';

const Header = styled.div`
  display: grid;
  grid-template-columns: 50px minmax(200px, 300px) 1fr 100px;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  position: sticky;
  top: 0;
  z-index: 10;
  min-width: 600px;
`;

const HeaderCell = styled.div<{ $align?: string }>`
  text-align: ${({ $align }) => $align || 'left'};
  padding: 0 ${({ theme }) => theme.spacing.sm};
`;

const TimelineHeader = styled.div`
  position: relative;
  padding: 0 ${({ theme }) => theme.spacing.sm};
`;

const TimelineMarkers = styled.div`
  position: relative;
  height: 20px;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const TimeMarker = styled.div<{ $position: number }>`
  position: absolute;
  left: ${({ $position }) => $position}%;
  transform: translateX(-50%);
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;

  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    width: 1px;
    height: 4px;
    background-color: ${({ theme }) => theme.colors.border};
  }
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  outline: none;
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
`;

const Legend = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  flex-wrap: wrap;
  justify-content: center;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 16px;
  height: 12px;
  background-color: ${({ $color }) => $color};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

interface WaterfallChartProps {
  activeFilter: FilterType;
  searchTerm: string;
  searchScope: SearchScope;
}

export const WaterfallChart = ({ activeFilter, searchTerm, searchScope }: WaterfallChartProps) => {
  const theme = useTheme();
  const { entries, selectedEntry, selectEntry } = useHAR();
  const { filters: customFilters } = useCustomFiltersStore();
  const lastAutoSelectKeyRef = useRef<string>('');

  const filteredEntries = useMemo(() => {
    return applyFilters(entries, activeFilter, customFilters, searchTerm, searchScope);
  }, [entries, activeFilter, customFilters, searchScope, searchTerm]);

  const waterfallData = useMemo(() => {
    return calculateWaterfallData(filteredEntries);
  }, [filteredEntries]);

  const timeMarkers = useMemo(() => {
    return getTimeMarkers(waterfallData.totalDuration);
  }, [waterfallData.totalDuration]);

  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const normalizedSearchTerm = searchTerm.trim();
    if (!normalizedSearchTerm) {
      lastAutoSelectKeyRef.current = '';
      return;
    }

    const autoSelectKey = `${normalizedSearchTerm}::${searchScope}::${activeFilter}::${filteredEntries.length}::${filteredEntries[0]?.index ?? 'none'}`;
    if (lastAutoSelectKeyRef.current === autoSelectKey) {
      return;
    }

    lastAutoSelectKeyRef.current = autoSelectKey;

    if (filteredEntries.length === 0) {
      selectEntry(null);
      return;
    }

    selectEntry(filteredEntries[0]);
  }, [activeFilter, filteredEntries, searchScope, searchTerm, selectEntry]);

  const { handleKeyDown } = useListKeyboardNav({
    filteredEntries,
    selectedEntry,
    selectEntry,
  });

  useEffect(() => {
    if (!bodyRef.current) return;
    if (selectedEntry) {
      const row = bodyRef.current.querySelector(
        `[data-entry-index="${selectedEntry.index}"]`
      );
      if (row) {
        row.scrollIntoView({ block: 'nearest' });
      }
    }

    const activeElement = document.activeElement;
    const isTypingInField = activeElement instanceof HTMLElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable
    );

    if (!isTypingInField) {
      bodyRef.current.focus();
    }
  }, [selectedEntry]);

  if (entries.length === 0) {
    return (
      <Container>
        <EmptyState>No entries to display</EmptyState>
      </Container>
    );
  }

  const listContent = (
    <>
      <Header>
        <HeaderCell $align="center">#</HeaderCell>
        <HeaderCell>Name</HeaderCell>
        <TimelineHeader>
          Timeline
          <TimelineMarkers>
            {timeMarkers.map((marker, index) => (
              <TimeMarker key={index} $position={marker.position}>
                {marker.label}
              </TimeMarker>
            ))}
          </TimelineMarkers>
        </TimelineHeader>
        <HeaderCell $align="right">Time</HeaderCell>
      </Header>
      <Body ref={bodyRef} tabIndex={0} onKeyDown={handleKeyDown}>
        {waterfallData.entries.map((entry, index) => (
          <WaterfallRow
            key={`${entry.index}-${entry.request.url}`}
            entry={entry}
            bar={waterfallData.bars[index]}
            isSelected={selectedEntry?.index === entry.index}
            onClick={() => selectEntry(entry)}
          />
        ))}
      </Body>
      <Legend>
        <LegendItem>
          <LegendColor $color={theme.colors.blocked} />
          Blocked
        </LegendItem>
        <LegendItem>
          <LegendColor $color={theme.colors.dns} />
          DNS
        </LegendItem>
        <LegendItem>
          <LegendColor $color={theme.colors.connect} />
          Connect
        </LegendItem>
        <LegendItem>
          <LegendColor $color={theme.colors.ssl} />
          SSL
        </LegendItem>
        <LegendItem>
          <LegendColor $color={theme.colors.send} />
          Send
        </LegendItem>
        <LegendItem>
          <LegendColor $color={theme.colors.wait} />
          Wait
        </LegendItem>
        <LegendItem>
          <LegendColor $color={theme.colors.receive} />
          Receive
        </LegendItem>
      </Legend>
    </>
  );

  if (!selectedEntry) {
    return (
      <Container>
        {listContent}
      </Container>
    );
  }

  return (
    <ResizableSplitPanel
      leftPanel={listContent}
      rightPanel={
        <Suspense fallback={<LoadingContainer>Loading details...</LoadingContainer>}>
          <RequestInspector
            key={`${selectedEntry.index}:${searchScope}:${searchTerm}`}
            globalSearchTerm={searchTerm}
            globalSearchScope={searchScope}
          />
        </Suspense>
      }
    />
  );
};
