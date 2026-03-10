import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  /* CSS Reset and Base Styles */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.background};
    transition: background-color ${({ theme }) => theme.transitions.normal},
                color ${({ theme }) => theme.transitions.normal};
  }

  /* Scrollbar Styles */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.backgroundSecondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    border: 2px solid ${({ theme }) => theme.colors.backgroundSecondary};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.textMuted};
  }

  /* Selection */
  ::selection {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
  }

  /* Focus Styles */
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  /* Links */
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover};
    }
  }

  /* Buttons */
  button {
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
    border: none;
    background: none;
    color: inherit;
  }

  /* Code and Pre */
  code, pre {
    font-family: ${({ theme }) => theme.typography.fontFamilyMono};
    font-feature-settings: 'liga' 1, 'calt' 1;
  }

  code {
    background-color: ${({ theme }) => theme.colors.backgroundTertiary};
    padding: 2px 6px;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    font-size: 0.9em;
  }

  pre {
    background-color: ${({ theme }) => theme.colors.backgroundTertiary};
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    overflow-x: auto;
    line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  }

  pre code {
    background-color: transparent;
    padding: 0;
  }

  /* Tables */
  table {
    border-collapse: collapse;
    width: 100%;
  }

  th, td {
    text-align: left;
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  }

  /* Form Elements */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    background-color: ${({ theme }) => theme.colors.background};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    transition: border-color ${({ theme }) => theme.transitions.fast};

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
    }

    &::placeholder {
      color: ${({ theme }) => theme.colors.textMuted};
    }
  }

  /* Headings */
  h1, h2, h3, h4, h5, h6 {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  h1 { font-size: ${({ theme }) => theme.typography.fontSize.xxl}; }
  h2 { font-size: ${({ theme }) => theme.typography.fontSize.xl}; }
  h3 { font-size: ${({ theme }) => theme.typography.fontSize.lg}; }
  h4 { font-size: ${({ theme }) => theme.typography.fontSize.md}; }

  /* Paragraphs */
  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  /* Lists */
  ul, ol {
    padding-left: ${({ theme }) => theme.spacing.lg};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  li {
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  /* Horizontal Rule */
  hr {
    border: none;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    margin: ${({ theme }) => theme.spacing.lg} 0;
  }

  /* App Container */
  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
`;
