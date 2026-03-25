import styled, { keyframes } from 'styled-components';
import type { ToonExportStatus } from '@types';
import { formatBytes, formatDuration } from '@utils/harParser';

const MAX_RENDER_SIZE_BYTES = 25 * 1024 * 1024;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Modal = styled.div`
  width: min(1100px, 100%);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  color: ${({ theme }) => theme.colors.text};
`;

const Subtitle = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  word-break: break-all;
`;

const Description = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const MetaBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  background-color: ${({ theme }) => theme.colors.background};
`;

const MetaItem = styled.div`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
`;

const Body = styled.div`
  flex: 1;
  min-height: 0;
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme, $variant }) =>
    $variant === 'primary' ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $variant }) =>
    $variant === 'primary' ? theme.colors.primary : theme.colors.background};
  color: ${({ theme, $variant }) =>
    $variant === 'primary' ? '#ffffff' : theme.colors.text};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};

  &:hover:not(:disabled) {
    opacity: 0.92;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const LoadingState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  text-align: center;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  animation: ${spin} 0.8s linear infinite;
`;

const StatusText = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.text};
`;

const StatusSubtext = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ErrorState = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => `${theme.colors.error}14`};
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const InfoState = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

const TextViewer = styled.textarea`
  width: 100%;
  flex: 1;
  min-height: 420px;
  resize: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.backgroundTertiary};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

interface ToonExportModalProps {
  isOpen: boolean;
  status: ToonExportStatus;
  sourceFileName: string | null;
  exportFileName: string;
  toonText: string | null;
  error: string | null;
  elapsedMs: number | null;
  lineCount: number | null;
  onClose: () => void;
  onRetry: () => void;
  onDownload: () => void;
}

export const ToonExportModal = ({
  isOpen,
  status,
  sourceFileName,
  exportFileName,
  toonText,
  error,
  elapsedMs,
  lineCount,
  onClose,
  onRetry,
  onDownload,
}: ToonExportModalProps) => {
  if (!isOpen) return null;

  const outputBytes = toonText ? new Blob([toonText]).size : 0;
  const shouldRenderText = Boolean(toonText) && outputBytes <= MAX_RENDER_SIZE_BYTES;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(event) => event.stopPropagation()}>
        <Header>
          <TitleBlock>
            <Title>TOON Export</Title>
            <Subtitle>{sourceFileName ?? exportFileName}</Subtitle>
            <Description>
              TOON is a compact text format for structured data that helps LLMs read large payloads
              more efficiently than raw JSON in many prompt workflows. This export makes the HAR
              easier to paste into an LLM context.{' '}
              <a
                href="https://toonformat.dev/guide/getting-started.html"
                target="_blank"
                rel="noreferrer"
              >
                Learn more
              </a>
              .
            </Description>
          </TitleBlock>
          <CloseButton onClick={onClose} aria-label="Close TOON export modal">
            ×
          </CloseButton>
        </Header>

        {(status === 'ready' || status === 'generating') && (
          <MetaBar>
            <MetaItem>Target: {exportFileName}</MetaItem>
            {elapsedMs != null && <MetaItem>Generated in: {formatDuration(elapsedMs)}</MetaItem>}
            {lineCount != null && <MetaItem>Lines: {lineCount.toLocaleString()}</MetaItem>}
            {status === 'ready' && toonText && (
              <>
                <MetaItem>Chars: {toonText.length.toLocaleString()}</MetaItem>
                <MetaItem>Size: {formatBytes(outputBytes)}</MetaItem>
              </>
            )}
          </MetaBar>
        )}

        <Body>
          {status === 'generating' && (
            <LoadingState>
              <Spinner />
              <StatusText>Generating TOON export…</StatusText>
              <StatusSubtext>
                The conversion is running in a background worker so the app stays responsive.
              </StatusSubtext>
            </LoadingState>
          )}

          {status === 'error' && (
            <ErrorState>{error ?? 'Failed to generate TOON output.'}</ErrorState>
          )}

          {status === 'ready' && toonText && shouldRenderText && (
            <TextViewer
              value={toonText}
              readOnly
              spellCheck={false}
              wrap="off"
              aria-label="TOON export output"
            />
          )}

          {status === 'ready' && toonText && !shouldRenderText && (
            <InfoState>
              TOON output is larger than {formatBytes(MAX_RENDER_SIZE_BYTES)}, so inline rendering is
              disabled to keep the UI responsive. Use <strong>Download .txt</strong> to access the
              full export.
            </InfoState>
          )}
        </Body>

        <Footer>
          {status === 'error' && (
            <Button $variant="primary" onClick={onRetry}>
              Retry
            </Button>
          )}
          <Button onClick={onClose}>Close</Button>
          <Button
            $variant="primary"
            onClick={onDownload}
            disabled={status !== 'ready' || !toonText}
          >
            Download .txt
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};
