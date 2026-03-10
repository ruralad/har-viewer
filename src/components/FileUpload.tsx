import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import styled from 'styled-components';
import { FileUp } from 'lucide-react';
import { useHAR } from '@contexts/HARContext';
import { parseHARFile } from '@utils/harParser';

const UploadContainer = styled.div<{ $isDragging: boolean }>`
  border: 2px dashed ${({ theme, $isDragging }) =>
    $isDragging ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  background-color: ${({ theme, $isDragging }) =>
    $isDragging ? theme.colors.hover : theme.colors.backgroundSecondary};
  transition: all ${({ theme }) => theme.transitions.normal};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.hover};
  }
`;

const UploadIcon = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const UploadTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const UploadDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const UploadButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  transition: all ${({ theme }) => theme.transitions.fast};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ErrorMessage = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.error}20;
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const SupportedFormats = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setHAR } = useHAR();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);

    // Validate file extension
    if (!file.name.endsWith('.har') && !file.name.endsWith('.json')) {
      setError('Invalid file type. Please upload a .har or .json file.');
      setIsProcessing(false);
      return;
    }

    // Check file size (max 50MB)
    // const maxSize = 50 * 1024 * 1024; // 50MB
    // if (file.size > maxSize) {
    //   setError('File is too large. Maximum size is 50MB.');
    //   setIsProcessing(false);
    //   return;
    // }

    try {
      const content = await file.text();
      const result = parseHARFile(content);

      if (result.success && result.har) {
        setHAR(result.har, file.name);
        setError(null);
      } else {
        setError(result.error || 'Failed to parse HAR file');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file');
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <UploadContainer
        $isDragging={isDragging}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <UploadIcon><FileUp size={48} strokeWidth={1.5} /></UploadIcon>
        <UploadTitle>
          {isProcessing ? 'Processing...' : 'Drop HAR file here'}
        </UploadTitle>
        <UploadDescription>
          or click to browse files
        </UploadDescription>
        <UploadButton disabled={isProcessing}>
          {isProcessing ? 'Loading...' : 'Choose File'}
        </UploadButton>
        <SupportedFormats>
          Supported formats: .har, .json
        </SupportedFormats>
      </UploadContainer>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept=".har,.json"
        onChange={handleFileInput}
      />
    </>
  );
};
