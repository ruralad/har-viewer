// Built-in filter types (non-editable)
export type BuiltInFilterType = 'all' | '4xx' | '5xx' | 'other-errors';

// Filter type can be either built-in or a custom filter ID
export type FilterType = BuiltInFilterType | string;

// Pattern types for custom filters
export type PatternType = 'regex' | 'path';

// Custom filter interface
export interface CustomFilter {
  id: string;
  name: string;
  pattern: string;
  patternType: PatternType;
  icon: string;
  description: string;
  createdAt: number;
}

// Built-in filter option interface
export interface FilterOption {
  id: BuiltInFilterType;
  label: string;
  description: string;
  icon: string;
}

// Built-in filters (non-editable)
export const BUILT_IN_FILTERS: FilterOption[] = [
  {
    id: 'all',
    label: 'All Requests',
    description: 'Show all network requests',
    icon: 'list',
  },
  {
    id: '4xx',
    label: '4xx Errors',
    description: 'Client errors (400-499)',
    icon: 'alert-triangle',
  },
  {
    id: '5xx',
    label: '5xx Errors',
    description: 'Server errors (500-599)',
    icon: 'x-circle',
  },
  {
    id: 'other-errors',
    label: 'Other Errors',
    description: 'Other failed requests',
    icon: 'alert-circle',
  },
];

// For backwards compatibility
export const FILTER_OPTIONS = BUILT_IN_FILTERS;

// Default custom filters (initialized on first load)
export const DEFAULT_CUSTOM_FILTERS: CustomFilter[] = [
  {
    id: 'custom-example',
    name: 'Example API',
    pattern: '/api/example/',
    patternType: 'path',
    icon: '🔷',
    description: 'Show only example API endpoint requests',
    createdAt: Date.now(),
  },
];
