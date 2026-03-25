import { useMemo, useRef, useEffect, useState, useCallback, lazy, Suspense } from 'react';
import styled from 'styled-components';
import { useHAR } from '@contexts/HARContext';

const RequestInspector = lazy(() => import('./RequestInspector').then(module => ({ default: module.RequestInspector })));
import type { FilterType, SearchScope } from '../types/filters';
import { formatDuration, formatBytes } from '@utils/harParser';
import { useCustomFiltersStore } from '../stores/customFiltersStore';
import { applyFilters } from '../utils/filterUtils';
import { ResizableSplitPanel, Container } from './shared/ViewLayout';
import { StatusBadge } from './shared/StatusBadge';
import { useListKeyboardNav } from '@hooks/useListKeyboardNav';

const TableWrapper = styled.div`
  flex: 1;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
`;

const TableScrollContainer = styled.div`
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
  outline: none;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 650px;
`;

const Thead = styled.thead`
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 10;
  height: 42px;
`;

const Th = styled.th`
  text-align: left;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  height: 42px;
`;

const SortableTh = styled(Th)`
  cursor: pointer;
  user-select: none;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SortIndicator = styled.span`
  margin-left: 4px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

const Tbody = styled.tbody``;

const Tr = styled.tr.attrs<{ $isSelected: boolean }>(({ theme, $isSelected }) => ({
  style: {
    backgroundColor: $isSelected ? theme.colors.selected : 'transparent',
  },
}))<{ $isSelected: boolean }>`
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme, $isSelected }) =>
      $isSelected ? theme.colors.selected : theme.colors.hover};
  }
`;

const Td = styled.td`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const MethodBadge = styled.span<{ $method: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  background-color: ${({ $method, theme }) => {
    switch ($method) {
      case 'GET':
        return theme.colors.success + '20';
      case 'POST':
        return theme.colors.info + '20';
      case 'PUT':
      case 'PATCH':
        return theme.colors.warning + '20';
      case 'DELETE':
        return theme.colors.error + '20';
      default:
        return theme.colors.textMuted + '20';
    }
  }};
  color: ${({ $method, theme }) => {
    switch ($method) {
      case 'GET':
        return theme.colors.success;
      case 'POST':
        return theme.colors.info;
      case 'PUT':
      case 'PATCH':
        return theme.colors.warning;
      case 'DELETE':
        return theme.colors.error;
      default:
        return theme.colors.textMuted;
    }
  }};
`;

const EndpointCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const EndpointName = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 400px;
`;

const Domain = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 400px;
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

type SortColumn = 'size' | 'time';
type SortDirection = 'asc' | 'desc';

interface TableViewProps {
  activeFilter: FilterType;
  searchTerm: string;
  searchScope: SearchScope;
}

export const TableView = ({ activeFilter, searchTerm, searchScope }: TableViewProps) => {
  const { entries, selectedEntry, selectEntry } = useHAR();
  const { filters: customFilters } = useCustomFiltersStore();
  const lastAutoSelectKeyRef = useRef<string>('');

  const filteredEntries = useMemo(() => {
    return applyFilters(entries, activeFilter, customFilters, searchTerm, searchScope);
  }, [entries, activeFilter, customFilters, searchScope, searchTerm]);

  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = useCallback((column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        // Third click: reset to no sort
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn, sortDirection]);

  const sortedEntries = useMemo(() => {
    if (!sortColumn) return filteredEntries;
    const sorted = [...filteredEntries];
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    sorted.sort((a, b) => {
      switch (sortColumn) {
        case 'size':
          return (a.response.content.size - b.response.content.size) * multiplier;
        case 'time':
          return (a.time - b.time) * multiplier;
        default:
          return 0;
      }
    });
    return sorted;
  }, [filteredEntries, sortColumn, sortDirection]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const normalizedSearchTerm = searchTerm.trim();
    if (!normalizedSearchTerm) {
      lastAutoSelectKeyRef.current = '';
      return;
    }

    const autoSelectKey = `${normalizedSearchTerm}::${searchScope}::${activeFilter}::${sortColumn ?? 'none'}::${sortDirection}::${sortedEntries.length}::${sortedEntries[0]?.index ?? 'none'}`;
    if (lastAutoSelectKeyRef.current === autoSelectKey) {
      return;
    }

    lastAutoSelectKeyRef.current = autoSelectKey;

    if (sortedEntries.length === 0) {
      selectEntry(null);
      return;
    }

    selectEntry(sortedEntries[0]);
  }, [activeFilter, searchScope, searchTerm, selectEntry, sortColumn, sortDirection, sortedEntries]);

  const { handleKeyDown } = useListKeyboardNav({
    filteredEntries: sortedEntries,
    selectedEntry,
    selectEntry,
  });

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    if (selectedEntry) {
      const row = scrollContainerRef.current.querySelector(
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
      // Re-focus the scroll container after layout changes when focus is not in a form control.
      scrollContainerRef.current.focus();
    }
  }, [selectedEntry]);

  if (entries.length === 0) {
    return (
      <Container>
        <EmptyState>No entries to display</EmptyState>
      </Container>
    );
  }

  const tableContent = (
    <TableWrapper>
      <TableScrollContainer ref={scrollContainerRef} tabIndex={0} onKeyDown={handleKeyDown}>
        <Table>
          <Thead>
            <tr>
              <Th>Method</Th>
              <Th>Endpoint</Th>
              <Th>Status</Th>
              <SortableTh onClick={() => handleSort('size')}>
                Size{sortColumn === 'size' && <SortIndicator>{sortDirection === 'asc' ? '▲' : '▼'}</SortIndicator>}
              </SortableTh>
              <SortableTh onClick={() => handleSort('time')}>
                Time{sortColumn === 'time' && <SortIndicator>{sortDirection === 'asc' ? '▲' : '▼'}</SortIndicator>}
              </SortableTh>
            </tr>
          </Thead>
          <Tbody>
            {sortedEntries.map((entry) => (
              <Tr
                key={entry.index}
                data-entry-index={entry.index}
                $isSelected={selectedEntry?.index === entry.index}
                onClick={() => selectEntry(entry)}
              >
                <Td>
                  <MethodBadge $method={entry.request.method}>{entry.request.method}</MethodBadge>
                </Td>
                <Td>
                  <EndpointCell>
                    <EndpointName title={entry.fileName}>{entry.fileName}</EndpointName>
                    <Domain title={entry.domain}>{entry.domain}</Domain>
                  </EndpointCell>
                </Td>
                <Td>
                  <StatusBadge $status={entry.response.status}>{entry.response.status}</StatusBadge>
                </Td>
                <Td>{formatBytes(entry.response.content.size)}</Td>
                <Td>{formatDuration(entry.time)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableScrollContainer>
    </TableWrapper>
  );

  if (!selectedEntry) {
    return (
      <Container>
        {tableContent}
      </Container>
    );
  }

  return (
    <ResizableSplitPanel
      leftPanel={tableContent}
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
