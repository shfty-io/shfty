export interface CategoryMetadata {
  title: string;
  description: string;
  totalTemplates?: number;
}

export const categoryMetadata: Record<string, CategoryMetadata> = {
  'business': {
    title: 'Business',
    description: 'Solutions for business management, analytics, and operations.',
  },
  'entertainment': {
    title: 'Entertainment',
    description: 'Applications and content for entertainment and media consumption.',
  },
  'developer-tools': {
    title: 'Developer Tools',
    description: 'Tools and utilities for software development and programming.',
  },
  'finance': {
    title: 'Finance',
    description: 'Tools for financial management, tracking, and analysis.',
  },
  'education': {
    title: 'Education',
    description: 'Learning tools and educational resources for students and educators.',
  },
  'games': {
    title: 'Games',
    description: 'Gaming applications and interactive entertainment.',
  },
  'graphics-design': {
    title: 'Graphics & Design',
    description: 'Tools for digital art, graphic design, and creative work.',
  },
  'health-fitness': {
    title: 'Health & Fitness',
    description: 'Applications for health tracking, fitness, and wellness.',
  },
  'lifestyle': {
    title: 'Lifestyle',
    description: 'Apps and tools for lifestyle management and personal interests.',
  },
  'medical': {
    title: 'Medical',
    description: 'Healthcare and medical-related applications and tools.',
  },
  'news': {
    title: 'News',
    description: 'News aggregation and information delivery applications.',
  },
  'photo-video': {
    title: 'Photo & Video',
    description: 'Tools and applications for photo and video editing and management.',
  },
  'productivity': {
    title: 'Productivity',
    description: 'Applications and tools to enhance personal and professional productivity.',
  },
  'social-networking': {
    title: 'Social Networking',
    description: 'Platforms and tools for social connection and networking.',
  },
  'sports': {
    title: 'Sports',
    description: 'Sports-related applications and tools.',
  },
  'travel': {
    title: 'Travel',
    description: 'Travel planning, booking, and management applications.',
  },
  'utilities': {
    title: 'Utilities',
    description: 'Essential utility tools and applications for everyday computing needs.',
  },
  'weather': {
    title: 'Weather',
    description: 'Weather forecasting and monitoring applications.',
  },
  'other': {
    title: 'Other',
    description: 'Miscellaneous applications and tools that don\'t fit other categories.',
  }
}; 