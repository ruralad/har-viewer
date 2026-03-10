import { useState, useEffect, useCallback } from 'react';
import styled, { useTheme } from 'styled-components';
import { X } from 'lucide-react';
import { useHAR } from '@contexts/HARContext';
import { formatBytes, formatDuration, formatTimestamp } from '@utils/harParser';
import { JsonViewer, JsonSearchBar } from './JsonViewer';
import { StatusBadge } from './shared/StatusBadge';

type Tab = 'general' | 'headers' | 'cookies' | 'payload' | 'response' | 'timings';
const TABS: Tab[] = ['general', 'headers', 'cookies', 'payload', 'response', 'timings'];

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 800px;
`;

const Tabs = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  overflow-x: auto;
  min-height: 42px;
  position: relative;
  outline: none;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.background : 'transparent'};
  border: none;
  border-bottom: 2px solid
    ${({ theme, $active }) => ($active ? theme.colors.primary : 'transparent')};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  right: ${({ theme }) => theme.spacing.sm};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background-color: ${({ theme }) => theme.colors.hover};
    color: ${({ theme }) => theme.colors.error};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SectionHeaderTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const Label = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const Value = styled.div`
  color: ${({ theme }) => theme.colors.text};
  word-break: break-all;
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const Th = styled.th`
  text-align: left;
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const Td = styled.td`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  word-break: break-all;
`;

const Highlight = styled.mark`
  background-color: ${({ theme }) => theme.colors.warning};
  color: ${({ theme }) => theme.colors.background};
  padding: 1px 2px;
  border-radius: 2px;
`;

const SearchInputWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const SearchStats = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const CodeBlock = styled.pre`
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow-x: auto;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  color: ${({ theme }) => theme.colors.text};
  max-height: 500px;
  overflow-y: auto;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;


const TimingBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const TimingLabel = styled.div`
  min-width: 100px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TimingBarContainer = styled.div`
  flex: 1;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  position: relative;
  overflow: hidden;
`;

const TimingBarFill = styled.div<{ $width: number; $color: string }>`
  width: ${({ $width }) => $width}%;
  height: 100%;
  background-color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: white;
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
`;

export const RequestInspector = () => {
  const theme = useTheme();
  const { selectedEntry, selectEntry } = useHAR();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [payloadSearchTerm, setPayloadSearchTerm] = useState('');
  const [payloadMatchIndex, setPayloadMatchIndex] = useState(0);
  const [responseSearchTerm, setResponseSearchTerm] = useState('');
  const [responseMatchIndex, setResponseMatchIndex] = useState(0);
  const [headersSearchTerm, setHeadersSearchTerm] = useState('');

  // Clear all search terms when a new API call is selected
  useEffect(() => {
    setPayloadSearchTerm('');
    setPayloadMatchIndex(0);
    setResponseSearchTerm('');
    setResponseMatchIndex(0);
    setHeadersSearchTerm('');
  }, [selectedEntry?.index]);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const currentIndex = TABS.indexOf(activeTab);
        const nextIndex = (currentIndex + 1) % TABS.length;
        setActiveTab(TABS[nextIndex]);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const currentIndex = TABS.indexOf(activeTab);
        const prevIndex = (currentIndex - 1 + TABS.length) % TABS.length;
        setActiveTab(TABS[prevIndex]);
      }
    },
    [activeTab]
  );

  if (!selectedEntry) {
    return (
      <Container>
        <EmptyState>Select a request to view details</EmptyState>
      </Container>
    );
  }

  const { request, response, timings } = selectedEntry;

  const renderGeneralTab = () => {
    const totalTime = selectedEntry.time;

    return (
      <>
        <Section>
          <SectionTitle>Request</SectionTitle>
          <InfoGrid>
            <Label>URL:</Label>
            <Value>{request.url}</Value>
            <Label>Method:</Label>
            <Value>{request.method}</Value>
            <Label>HTTP Version:</Label>
            <Value>{request.httpVersion}</Value>
            <Label>Server IP:</Label>
            <Value>{selectedEntry.serverIPAddress || 'N/A'}</Value>
          </InfoGrid>
        </Section>

        <Section>
          <SectionTitle>Response</SectionTitle>
          <InfoGrid>
            <Label>Status:</Label>
            <Value>
              <StatusBadge $status={response.status}>
                {response.status} {response.statusText}
              </StatusBadge>
            </Value>
            <Label>HTTP Version:</Label>
            <Value>{response.httpVersion}</Value>
            <Label>Content Type:</Label>
            <Value>{response.content.mimeType}</Value>
            <Label>Content Size:</Label>
            <Value>
              {formatBytes(response.content.size)}
              {response.content.compression && response.content.compression > 0 && (
                <> (compressed from {formatBytes(response.content.size + response.content.compression)})</>
              )}
            </Value>
          </InfoGrid>
        </Section>

        <Section>
          <SectionTitle>Timing</SectionTitle>
          <InfoGrid>
            <Label>Started:</Label>
            <Value>{formatTimestamp(selectedEntry.startedDateTime)}</Value>
            <Label>Total Duration:</Label>
            <Value>{formatDuration(totalTime)}</Value>
          </InfoGrid>
        </Section>
      </>
    );
  };

  const highlightText = (text: string, searchTerm: string): React.ReactNode => {
    if (!searchTerm.trim()) return text;

    const searchLower = searchTerm.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(searchLower);

    if (index === -1) return text;

    const before = text.substring(0, index);
    const match = text.substring(index, index + searchTerm.length);
    const after = text.substring(index + searchTerm.length);

    return (
      <>
        {before}
        <Highlight>{match}</Highlight>
        {highlightText(after, searchTerm)}
      </>
    );
  };

  const renderHeadersTab = () => {
    // Filter headers based on search term
    const filteredRequestHeaders = request.headers.filter(header => {
      if (!headersSearchTerm.trim()) return true;
      const searchLower = headersSearchTerm.toLowerCase();
      return (
        header.name.toLowerCase().includes(searchLower) ||
        header.value.toLowerCase().includes(searchLower)
      );
    });

    const filteredResponseHeaders = response.headers.filter(header => {
      if (!headersSearchTerm.trim()) return true;
      const searchLower = headersSearchTerm.toLowerCase();
      return (
        header.name.toLowerCase().includes(searchLower) ||
        header.value.toLowerCase().includes(searchLower)
      );
    });

    const totalMatches = filteredRequestHeaders.length + filteredResponseHeaders.length;
    const totalHeaders = request.headers.length + response.headers.length;

    return (
      <>
        <SearchInputWrapper>
          <SearchInput
            type="text"
            placeholder="Search headers (name or value)..."
            value={headersSearchTerm}
            onChange={(e) => setHeadersSearchTerm(e.target.value)}
          />
          {headersSearchTerm && (
            <SearchStats>
              Showing {totalMatches} of {totalHeaders} headers
            </SearchStats>
          )}
        </SearchInputWrapper>

        <Section>
          <SectionTitle>Request Headers ({filteredRequestHeaders.length}{headersSearchTerm ? ` of ${request.headers.length}` : ''})</SectionTitle>
          {filteredRequestHeaders.length === 0 ? (
            <EmptyState>No matching request headers</EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Value</Th>
                </tr>
              </thead>
              <tbody>
                {filteredRequestHeaders.map((header, index) => (
                  <tr key={index}>
                    <Td>{highlightText(header.name, headersSearchTerm)}</Td>
                    <Td>{highlightText(header.value, headersSearchTerm)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Section>

        <Section>
          <SectionTitle>Response Headers ({filteredResponseHeaders.length}{headersSearchTerm ? ` of ${response.headers.length}` : ''})</SectionTitle>
          {filteredResponseHeaders.length === 0 ? (
            <EmptyState>No matching response headers</EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Value</Th>
                </tr>
              </thead>
              <tbody>
                {filteredResponseHeaders.map((header, index) => (
                  <tr key={index}>
                    <Td>{highlightText(header.name, headersSearchTerm)}</Td>
                    <Td>{highlightText(header.value, headersSearchTerm)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Section>
      </>
    );
  };

  const renderCookiesTab = () => (
    <>
      <Section>
        <SectionTitle>Request Cookies ({request.cookies.length})</SectionTitle>
        {request.cookies.length === 0 ? (
          <EmptyState>No request cookies</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Value</Th>
                <Th>Domain</Th>
                <Th>Path</Th>
              </tr>
            </thead>
            <tbody>
              {request.cookies.map((cookie, index) => (
                <tr key={index}>
                  <Td>{cookie.name}</Td>
                  <Td>{cookie.value}</Td>
                  <Td>{cookie.domain || 'N/A'}</Td>
                  <Td>{cookie.path || 'N/A'}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>

      <Section>
        <SectionTitle>Response Cookies ({response.cookies.length})</SectionTitle>
        {response.cookies.length === 0 ? (
          <EmptyState>No response cookies</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Value</Th>
                <Th>Domain</Th>
                <Th>Path</Th>
                <Th>Expires</Th>
              </tr>
            </thead>
            <tbody>
              {response.cookies.map((cookie, index) => (
                <tr key={index}>
                  <Td>{cookie.name}</Td>
                  <Td>{cookie.value}</Td>
                  <Td>{cookie.domain || 'N/A'}</Td>
                  <Td>{cookie.path || 'N/A'}</Td>
                  <Td>{cookie.expires || 'Session'}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>
    </>
  );

  const renderPayloadTab = () => {
    if (!request.postData) {
      return <EmptyState>No payload data</EmptyState>;
    }

    const isJSON = request.postData.mimeType.includes('application/json');
    let jsonData = null;

    if (isJSON && request.postData.text) {
      try {
        jsonData = JSON.parse(request.postData.text);
      } catch {
        // Not valid JSON, will fall back to CodeBlock
      }
    }

    return (
      <Section>
        {jsonData ? (
          <>
            <SectionHeader>
              <SectionHeaderTitle>Request Payload</SectionHeaderTitle>
              <JsonSearchBar
                searchTerm={payloadSearchTerm}
                onSearchChange={setPayloadSearchTerm}
                data={jsonData}
                currentMatchIndex={payloadMatchIndex}
                onMatchIndexChange={setPayloadMatchIndex}
              />
            </SectionHeader>
            <InfoGrid>
              <Label>MIME Type:</Label>
              <Value>{request.postData.mimeType}</Value>
            </InfoGrid>
            <JsonViewer
              data={jsonData}
              searchTerm={payloadSearchTerm}
              currentMatchIndex={payloadMatchIndex}
              showBreadcrumb={true}
            />
          </>
        ) : (
          <>
            <SectionTitle>Request Payload</SectionTitle>
            <InfoGrid>
              <Label>MIME Type:</Label>
              <Value>{request.postData.mimeType}</Value>
            </InfoGrid>
            {request.postData.text ? (
              <CodeBlock>{request.postData.text}</CodeBlock>
            ) : null}
          </>
        )}
        {request.postData.params && request.postData.params.length > 0 && (
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Value</Th>
              </tr>
            </thead>
            <tbody>
              {request.postData.params.map((param, index) => (
                <tr key={index}>
                  <Td>{param.name}</Td>
                  <Td>{param.value || 'N/A'}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>
    );
  };

  const renderResponseTab = () => {
    const { content } = response;

    const isJSON = content.mimeType.includes('application/json') || content.mimeType.includes('application/hal+json');
    let jsonData = null;

    if (isJSON && content.text && content.encoding !== 'base64') {
      try {
        jsonData = JSON.parse(content.text);
      } catch {
        // Not valid JSON, will fall back to CodeBlock
      }
    }

    return (
      <Section>
        {jsonData ? (
          <>
            <SectionHeader>
              <SectionHeaderTitle>Response Content</SectionHeaderTitle>
              <JsonSearchBar
                searchTerm={responseSearchTerm}
                onSearchChange={setResponseSearchTerm}
                data={jsonData}
                currentMatchIndex={responseMatchIndex}
                onMatchIndexChange={setResponseMatchIndex}
              />
            </SectionHeader>
            <InfoGrid>
              <Label>MIME Type:</Label>
              <Value>{content.mimeType}</Value>
              <Label>Size:</Label>
              <Value>{formatBytes(content.size)}</Value>
              {content.encoding && (
                <>
                  <Label>Encoding:</Label>
                  <Value>{content.encoding}</Value>
                </>
              )}
            </InfoGrid>
            <JsonViewer
              data={jsonData}
              searchTerm={responseSearchTerm}
              currentMatchIndex={responseMatchIndex}
              showBreadcrumb={true}
            />
          </>
        ) : (
          <>
            <SectionTitle>Response Content</SectionTitle>
            <InfoGrid>
              <Label>MIME Type:</Label>
              <Value>{content.mimeType}</Value>
              <Label>Size:</Label>
              <Value>{formatBytes(content.size)}</Value>
              {content.encoding && (
                <>
                  <Label>Encoding:</Label>
                  <Value>{content.encoding}</Value>
                </>
              )}
            </InfoGrid>
            {content.text && content.encoding !== 'base64' ? (
              <CodeBlock>{content.text}</CodeBlock>
            ) : content.encoding === 'base64' ? (
              <EmptyState>Binary content (base64 encoded)</EmptyState>
            ) : (
              <EmptyState>No content available</EmptyState>
            )}
          </>
        )}
      </Section>
    );
  };

  const renderTimingsTab = () => {
    const totalTime = selectedEntry.time;
    const timingData = [
      { label: 'Blocked', value: timings.blocked ?? -1, color: theme.colors.blocked },
      { label: 'DNS', value: timings.dns ?? -1, color: theme.colors.dns },
      { label: 'Connect', value: timings.connect ?? -1, color: theme.colors.connect },
      { label: 'SSL', value: timings.ssl ?? -1, color: theme.colors.ssl },
      { label: 'Send', value: timings.send, color: theme.colors.send },
      { label: 'Wait', value: timings.wait, color: theme.colors.wait },
      { label: 'Receive', value: timings.receive, color: theme.colors.receive },
    ].filter((timing) => timing.value >= 0);

    return (
      <Section>
        <SectionTitle>Timing Breakdown</SectionTitle>
        {timingData.map((timing) => (
          <TimingBar key={timing.label}>
            <TimingLabel>{timing.label}</TimingLabel>
            <TimingBarContainer>
              <TimingBarFill
                $width={(timing.value / totalTime) * 100}
                $color={timing.color}
              >
                {formatDuration(timing.value)}
              </TimingBarFill>
            </TimingBarContainer>
          </TimingBar>
        ))}
        <InfoGrid style={{ marginTop: '1rem' }}>
          <Label>Total:</Label>
          <Value>{formatDuration(totalTime)}</Value>
        </InfoGrid>
      </Section>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralTab();
      case 'headers':
        return renderHeadersTab();
      case 'cookies':
        return renderCookiesTab();
      case 'payload':
        return renderPayloadTab();
      case 'response':
        return renderResponseTab();
      case 'timings':
        return renderTimingsTab();
      default:
        return null;
    }
  };

  return (
    <Container>
      <Tabs tabIndex={0} onKeyDown={handleTabKeyDown}>
        <Tab $active={activeTab === 'general'} onClick={() => setActiveTab('general')}>
          General
        </Tab>
        <Tab $active={activeTab === 'headers'} onClick={() => setActiveTab('headers')}>
          Headers
        </Tab>
        <Tab $active={activeTab === 'cookies'} onClick={() => setActiveTab('cookies')}>
          Cookies
        </Tab>
        <Tab $active={activeTab === 'payload'} onClick={() => setActiveTab('payload')}>
          Payload
        </Tab>
        <Tab $active={activeTab === 'response'} onClick={() => setActiveTab('response')}>
          Response
        </Tab>
        <Tab $active={activeTab === 'timings'} onClick={() => setActiveTab('timings')}>
          Timings
        </Tab>
        <CloseButton onClick={() => selectEntry(null)} title="Close details">
          <X />
        </CloseButton>
      </Tabs>
      <Content>{renderContent()}</Content>
    </Container>
  );
};
