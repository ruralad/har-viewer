interface Theme {
  name: 'light' | 'dark';
  colors: {
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;

    text: string;
    textSecondary: string;
    textMuted: string;

    border: string;
    borderLight: string;
    hover: string;
    selected: string;

    success: string;
    warning: string;
    error: string;
    info: string;

    status2xx: string;
    status3xx: string;
    status4xx: string;
    status5xx: string;

    html: string;
    css: string;
    javascript: string;
    image: string;
    font: string;
    xhr: string;
    media: string;
    other: string;

    blocked: string;
    dns: string;
    connect: string;
    send: string;
    wait: string;
    receive: string;
    ssl: string;

    primary: string;
    primaryHover: string;
    accent: string;
  };

  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };

  typography: {
    fontFamily: string;
    fontFamilyMono: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };

  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };

  shadows: {
    sm: string;
    md: string;
    lg: string;
  };

  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: '#FAFBFC',
    backgroundSecondary: '#F1F3F6',
    backgroundTertiary: '#E5E8ED',

    text: '#1A1D23',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',

    border: '#D1D5DB',
    borderLight: '#E5E7EB',
    hover: '#E8EBF0',
    selected: '#EFF6FF',

    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    status2xx: '#10B981',
    status3xx: '#3B82F6',
    status4xx: '#F59E0B',
    status5xx: '#EF4444',

    html: '#EF4444',
    css: '#3B82F6',
    javascript: '#EAB308',
    image: '#8B5CF6',
    font: '#EC4899',
    xhr: '#10B981',
    media: '#F97316',
    other: '#6B7280',

    blocked: '#6B7280',
    dns: '#06B6D4',
    connect: '#F97316',
    send: '#3B82F6',
    wait: '#EAB308',
    receive: '#10B981',
    ssl: '#A855F7',

    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    accent: '#7C3AED',
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },

  typography: {
    fontFamily: '"IBM Plex Sans", sans-serif',
    fontFamilyMono: '"JetBrains Mono", monospace',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.03)',
    md: '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 4px 12px -4px rgba(0, 0, 0, 0.06)',
    lg: '0 8px 24px -6px rgba(0, 0, 0, 0.1), 0 4px 12px -4px rgba(0, 0, 0, 0.05)',
  },

  transitions: {
    fast: '100ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
};

const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: '#0D1017',
    backgroundSecondary: '#161A24',
    backgroundTertiary: '#1E2230',

    text: '#E5E7EB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',

    border: '#2A2F3E',
    borderLight: '#1E2230',
    hover: '#232838',
    selected: '#172137',

    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',

    status2xx: '#34D399',
    status3xx: '#60A5FA',
    status4xx: '#FBBF24',
    status5xx: '#F87171',

    html: '#F87171',
    css: '#60A5FA',
    javascript: '#FACC15',
    image: '#A78BFA',
    font: '#F472B6',
    xhr: '#34D399',
    media: '#FB923C',
    other: '#9CA3AF',

    blocked: '#9CA3AF',
    dns: '#22D3EE',
    connect: '#FB923C',
    send: '#60A5FA',
    wait: '#FACC15',
    receive: '#34D399',
    ssl: '#C084FC',

    primary: '#3B82F6',
    primaryHover: '#60A5FA',
    accent: '#8B5CF6',
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },

  typography: {
    fontFamily: '"IBM Plex Sans", sans-serif',
    fontFamilyMono: '"JetBrains Mono", monospace',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    md: '0 2px 8px -2px rgba(0, 0, 0, 0.3), 0 4px 12px -4px rgba(0, 0, 0, 0.2)',
    lg: '0 8px 24px -6px rgba(0, 0, 0, 0.4), 0 4px 12px -4px rgba(0, 0, 0, 0.25)',
  },

  transitions: {
    fast: '100ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
};

export type { Theme };
export { lightTheme, darkTheme };
