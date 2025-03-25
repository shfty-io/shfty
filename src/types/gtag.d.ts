// Type definitions for Google Analytics gtag
interface Window {
  gtag: (
    command: 'config' | 'event',
    targetId: string,
    config?: {
      page_path?: string;
      [key: string]: unknown;
    }
  ) => void;
  dataLayer: Record<string, unknown>[];
} 