export interface CategoryMetadata {
  title: string;
  description: string;
  totalTemplates?: number;
}

export const categoryMetadata: Record<string, CategoryMetadata> = {
  'photo-video': {
    title: 'Photo & Video',
    description: 'Tools and templates for photo editing, video processing, and media management.',
  },
  'productivity': {
    title: 'Productivity',
    description: 'Applications and tools to enhance personal and professional productivity.',
  },
  'utilities': {
    title: 'Utilities',
    description: 'Essential utility tools and applications for everyday computing needs.',
  },
  'entertainment': {
    title: 'Entertainment',
    description: 'Applications and content for entertainment and media consumption.',
  },
  'developer-tools': {
    title: 'Developer Tools',
    description: 'Tools and utilities for software development and programming.',
  },
  'business': {
    title: 'Business',
    description: 'Solutions for business management, analytics, and operations.',
  },
  'creativity': {
    title: 'Creativity',
    description: 'Tools for digital art, design, and creative expression.',
  },
  'security': {
    title: 'Security',
    description: 'Applications for digital security, privacy, and data protection.',
  },
  'lifestyle': {
    title: 'Lifestyle',
    description: 'Apps and tools for health, wellness, and personal lifestyle management.',
  },
  'education': {
    title: 'Education',
    description: 'Learning tools and educational resources for students and educators.',
  },
  'communication-social': {
    title: 'Communication & Social',
    description: 'Tools for communication, social networking, and collaboration.',
  },
  'ai': {
    title: 'AI',
    description: 'Artificial Intelligence tools, models, and applications.',
  },
  'finance': {
    title: 'Finance',
    description: 'Tools for financial management, tracking, and analysis.',
  },
  'other': {
    title: 'Other',
    description: 'Miscellaneous applications and tools that don\'t fit other categories.',
  }
}; 