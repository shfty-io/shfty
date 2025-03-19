export interface CategoryMetadata {
  title: string;
  description: string;
  totalTemplates?: number;
}

export const categoryMetadata: Record<string, CategoryMetadata> = {
  // Work & Productivity
  'ai-notetakers': {
    title: 'AI Notetakers',
    description: 'Applications that use AI to automatically take and organize notes.',
  },
  'app-switcher': {
    title: 'App Switcher',
    description: 'Tools for switching between applications efficiently.',
  },
  'compliance-software': {
    title: 'Compliance Software',
    description: 'Software for managing regulatory compliance and requirements.',
  },
  'e-signature-apps': {
    title: 'E-Signature Apps',
    description: 'Applications for electronic document signing and authentication.',
  },
  'knowledge-base-software': {
    title: 'Knowledge Base Software',
    description: 'Tools for creating and managing organizational knowledge.',
  },
  'meeting-software': {
    title: 'Meeting Software',
    description: 'Applications for virtual meetings and video conferencing.',
  },
  'pdf-editor': {
    title: 'PDF Editor',
    description: 'Tools for creating, editing, and managing PDF documents.',
  },
  'presentation-software': {
    title: 'Presentation Software',
    description: 'Applications for creating and delivering presentations.',
  },
  'project-management-software': {
    title: 'Project Management Software',
    description: 'Tools for planning, organizing, and managing projects.',
  },
  'scheduling-software': {
    title: 'Scheduling Software',
    description: 'Applications for scheduling meetings and managing calendars.',
  },
  'search': {
    title: 'Search',
    description: 'Tools and engines for searching content and information.',
  },
  'spreadsheets': {
    title: 'Spreadsheets',
    description: 'Applications for creating and managing spreadsheets and data.',
  },
  'ad-blockers': {
    title: 'Ad Blockers',
    description: 'Tools for blocking advertisements on websites and applications.',
  },
  'customer-support-tools': {
    title: 'Customer Support Tools',
    description: 'Applications for managing customer support and service.',
  },
  'email-clients': {
    title: 'Email Clients',
    description: 'Applications for sending, receiving, and managing emails.',
  },
  'note-and-writing-apps': {
    title: 'Note and Writing Apps',
    description: 'Tools for taking notes and writing content.',
  },
  'password-managers': {
    title: 'Password Managers',
    description: 'Applications for securely storing and managing passwords.',
  },
  'screenshots-and-screen-recording-apps': {
    title: 'Screenshots and Screen Recording Apps',
    description: 'Tools for capturing and recording screen activity.',
  },
  'security-software': {
    title: 'Security Software',
    description: 'Applications for enhancing digital security and privacy.',
  },
  'team-collaboration-software': {
    title: 'Team Collaboration Software',
    description: 'Tools for team communication and collaboration.',
  },
  
  // Engineering & Development
  'ab-testing-tools': {
    title: 'A/B Testing Tools',
    description: 'Applications for conducting A/B tests and experiments.',
  },
  'authentication-identity-tools': {
    title: 'Authentication & Identity Tools',
    description: 'Tools for managing user authentication and identity.',
  },
  'content-management-systems': {
    title: 'Content Management Systems',
    description: 'Platforms for creating and managing digital content.',
  },
  'code-review-tools': {
    title: 'Code Review Tools',
    description: 'Applications for reviewing and collaborating on code.',
  },
  'command-line-tools': {
    title: 'Command Line Tools',
    description: 'Utilities and applications for command line interfaces.',
  },
  'data-visualization-tools': {
    title: 'Data Visualization Tools',
    description: 'Applications for visualizing and presenting data.',
  },
  'git-clients': {
    title: 'Git Clients',
    description: 'Applications for managing Git repositories and workflows.',
  },
  'issue-tracking-software': {
    title: 'Issue Tracking Software',
    description: 'Tools for tracking bugs, issues, and feature requests.',
  },
  'no-code-platforms': {
    title: 'No-Code Platforms',
    description: 'Platforms for building applications without coding.',
  },
  'standup-bots': {
    title: 'Standup Bots',
    description: 'Automated tools for conducting team standups.',
  },
  'testing-qa-software': {
    title: 'Testing and QA Software',
    description: 'Tools for software testing and quality assurance.',
  },
  'vpn-client': {
    title: 'VPN Client',
    description: 'Applications for secure virtual private network connections.',
  },
  'ai-coding-assistants': {
    title: 'AI Coding Assistants',
    description: 'AI-powered tools that assist with coding and development.',
  },
  'automation-tools': {
    title: 'Automation Tools',
    description: 'Applications for automating repetitive tasks and workflows.',
  },
  'code-editors': {
    title: 'Code Editors',
    description: 'Software for writing, editing, and managing code.',
  },
  'data-analysis-tools': {
    title: 'Data Analysis Tools',
    description: 'Applications for analyzing and processing data.',
  },
  'databases-backend-frameworks': {
    title: 'Databases and Backend Frameworks',
    description: 'Tools and frameworks for data storage and backend development.',
  },
  'headless-cms-software': {
    title: 'Headless CMS Software',
    description: 'Content management systems with decoupled frontends.',
  },
  'observability-tools': {
    title: 'Observability Tools',
    description: 'Applications for monitoring and observing systems.',
  },
  'static-site-generators': {
    title: 'Static Site Generators',
    description: 'Tools for generating static websites from templates.',
  },
  'unified-api': {
    title: 'Unified API',
    description: 'API tools that unify multiple services and endpoints.',
  },
  'website-analytics': {
    title: 'Website Analytics',
    description: 'Tools for analyzing website traffic and user behavior.',
  },
  
  // Design & Creative
  'design-mockups': {
    title: 'Design Mockups',
    description: 'Tools for creating visual mockups and prototypes.',
  },
  'digital-whiteboards': {
    title: 'Digital Whiteboards',
    description: 'Applications for collaborative visual brainstorming.',
  },
  'icon-sets': {
    title: 'Icon Sets',
    description: 'Collections of icons for design and development.',
  },
  'ui-frameworks': {
    title: 'UI Frameworks',
    description: 'Frameworks for building user interfaces and components.',
  },
  'wireframing': {
    title: 'Wireframing',
    description: 'Tools for creating wireframes and low-fidelity prototypes.',
  },
  'background-removal-tools': {
    title: 'Background Removal Tools',
    description: 'Applications for removing backgrounds from images.',
  },
  'design-resources': {
    title: 'Design Resources',
    description: 'Collections of resources for designers and creatives.',
  },
  'graphic-design-tools': {
    title: 'Graphic Design Tools',
    description: 'Applications for creating graphic designs and illustrations.',
  },
  'interface-design-tools': {
    title: 'Interface Design Tools',
    description: 'Software for designing user interfaces and experiences.',
  },
  'photo-editing': {
    title: 'Photo Editing',
    description: 'Applications for editing and enhancing photos.',
  },
  'user-research': {
    title: 'User Research',
    description: 'Tools for conducting user research and testing.',
  },
  
  // Social & Community
  'blogging-platforms': {
    title: 'Blogging Platforms',
    description: 'Platforms for creating and managing blogs.',
  },
  'dating-apps': {
    title: 'Dating Apps',
    description: 'Applications for online dating and relationships.',
  },
  'microblogging-platforms': {
    title: 'Microblogging Platforms',
    description: 'Platforms for short-form content and updates.',
  },
  'safety-privacy-platforms': {
    title: 'Safety and Privacy Platforms',
    description: 'Tools for enhancing online safety and privacy.',
  },
  'community-management': {
    title: 'Community Management',
    description: 'Applications for managing online communities.',
  },
  'link-in-bio-tools': {
    title: 'Link in Bio Tools',
    description: 'Tools for creating landing pages for social media profiles.',
  },
  'messaging-apps': {
    title: 'Messaging Apps',
    description: 'Applications for communication and messaging.',
  },
  'newsletter-platforms': {
    title: 'Newsletter Platforms',
    description: 'Tools for creating and distributing newsletters.',
  },
  
  // Marketing & Sales
  'advertising-tools': {
    title: 'Advertising Tools',
    description: 'Applications for creating and managing advertisements.',
  },
  'seo-tools': {
    title: 'SEO Tools',
    description: 'Tools for search engine optimization and analysis.',
  },
  'crm-software': {
    title: 'CRM Software',
    description: 'Applications for customer relationship management.',
  },
  'email-marketing': {
    title: 'Email Marketing',
    description: 'Tools for creating and managing email marketing campaigns.',
  },
  'keyword-research-tools': {
    title: 'Keyword Research Tools',
    description: 'Applications for researching and analyzing keywords.',
  },
  'lead-generation-software': {
    title: 'Lead Generation Software',
    description: 'Tools for generating and managing leads.',
  },
  'sales-enablement': {
    title: 'Sales Enablement',
    description: 'Applications for empowering sales teams.',
  },
  'social-media-management-tools': {
    title: 'Social Media Management Tools',
    description: 'Tools for managing social media accounts and content.',
  },
  'survey-form-builders': {
    title: 'Survey and Form Builders',
    description: 'Applications for creating surveys and forms.',
  },
  'business-intelligence-software': {
    title: 'Business Intelligence Software',
    description: 'Tools for business data analysis and reporting.',
  },
  'marketing-automation-platforms': {
    title: 'Marketing Automation Platforms',
    description: 'Applications for automating marketing tasks and workflows.',
  },
  'social-media-scheduling-tools': {
    title: 'Social Media Scheduling Tools',
    description: 'Tools for scheduling and managing social media posts.',
  },
  
  // AI
  'ai-characters': {
    title: 'AI Characters',
    description: 'AI-powered virtual characters and personalities.',
  },
  'ai-content-detection': {
    title: 'AI Content Detection',
    description: 'Tools for detecting AI-generated content.',
  },
  'ai-generative-art': {
    title: 'AI Generative Art',
    description: 'Applications for creating art using AI algorithms.',
  },
  'ai-infrastructure-tools': {
    title: 'AI Infrastructure Tools',
    description: 'Tools for building and managing AI infrastructure.',
  },
  'ai-voice-agents': {
    title: 'AI Voice Agents',
    description: 'AI-powered voice assistants and agents.',
  },
  'chatgpt-prompts': {
    title: 'ChatGPT Prompts',
    description: 'Collections of prompts for ChatGPT and similar models.',
  },
  'predictive-ai': {
    title: 'Predictive AI',
    description: 'AI applications for prediction and forecasting.',
  },
  'ai-chatbots': {
    title: 'AI Chatbots',
    description: 'AI-powered conversational agents and bots.',
  },
  'ai-databases': {
    title: 'AI Databases',
    description: 'Databases optimized for AI workloads and applications.',
  },
  'ai-metrics-evaluation': {
    title: 'AI Metrics and Evaluation',
    description: 'Tools for measuring and evaluating AI performance.',
  },
  'llms': {
    title: 'LLMs',
    description: 'Large language models and related applications.',
  },
  'text-to-speech': {
    title: 'Text-to-Speech',
    description: 'Applications for converting text to spoken audio.',
  },
  
  // Product Add-ons
  'chrome-extensions': {
    title: 'Chrome Extensions',
    description: 'Extensions and add-ons for the Chrome browser.',
  },
  'figma-templates': {
    title: 'Figma Templates',
    description: 'Templates and resources for Figma.',
  },
  'slack-apps': {
    title: 'Slack Apps',
    description: 'Applications and integrations for Slack.',
  },
  'wordpress-plugins': {
    title: 'WordPress Plugins',
    description: 'Plugins and extensions for WordPress.',
  },
  'figma-plugins': {
    title: 'Figma Plugins',
    description: 'Plugins and extensions for Figma.',
  },
  'notion-templates': {
    title: 'Notion Templates',
    description: 'Templates and resources for Notion.',
  },
  'twitter-apps': {
    title: 'Twitter Apps',
    description: 'Applications and tools for Twitter.',
  },
  'wordpress-themes': {
    title: 'WordPress Themes',
    description: 'Themes and templates for WordPress.',
  },
  
  // Web3
  'crypto-wallets': {
    title: 'Crypto Wallets',
    description: 'Wallets for storing and managing cryptocurrencies.',
  },
  'defi': {
    title: 'DeFi',
    description: 'Decentralized finance applications and tools.',
  },
  'nft-creation-tools': {
    title: 'NFT Creation Tools',
    description: 'Tools for creating and managing NFTs.',
  },
  
  // Games
  'action-games': {
    title: 'Action Games',
    description: 'Fast-paced games focused on movement, combat, and quick reflexes.',
  },
  'adventure-games': {
    title: 'Adventure Games',
    description: 'Story-driven games with exploration and puzzle-solving elements.',
  },
  'puzzle-games': {
    title: 'Puzzle Games',
    description: 'Games that challenge problem-solving skills and logical thinking.',
  },
  'strategy-games': {
    title: 'Strategy Games',
    description: 'Games that emphasize tactical thinking and planning.',
  },
  'role-playing-games': {
    title: 'Role-Playing Games',
    description: 'Games where players assume the roles of characters in a fictional setting.',
  },
  'simulation-games': {
    title: 'Simulation Games',
    description: 'Games that simulate real-world activities or systems.',
  },
  'sports-games': {
    title: 'Sports Games',
    description: 'Virtual versions of traditional physical sports.',
  },
  'board-games': {
    title: 'Board Games',
    description: 'Digital adaptations of traditional board games.',
  },
  'card-games': {
    title: 'Card Games',
    description: 'Games played with a deck of cards or collectible card games.',
  },
  'educational-games': {
    title: 'Educational Games',
    description: 'Games designed to teach while entertaining players.',
  },
  
  // Frontend Resources
  'blog': {
    title: 'Blog',
    description: 'Blog templates and resources for developers.',
  },
  'portfolio': {
    title: 'Portfolio',
    description: 'Portfolio templates and resources for showcasing work.',
  },
  'personal': {
    title: 'Personal',
    description: 'Personal website templates and resources.',
  },
  'dashboard': {
    title: 'Dashboard',
    description: 'Dashboard templates and interfaces for applications.',
  },
  'landing-page': {
    title: 'Landing Page',
    description: 'Templates and resources for creating landing pages.',
  },
  'business-templates': {
    title: 'Business',
    description: 'Business website templates and resources.',
  },
  'documentation': {
    title: 'Documentation',
    description: 'Templates and tools for creating documentation.',
  },
  'ecommerce': {
    title: 'Ecommerce',
    description: 'Ecommerce website templates and resources.',
  },
  'boilerplates': {
    title: 'Boilerplates',
    description: 'Starter templates and boilerplates for development.',
  },
  'ui-kits-components': {
    title: 'UI Kits & Components',
    description: 'Collections of UI components and kits for developers.',
  },
  'templates-themes': {
    title: 'Templates & Themes',
    description: 'Website templates and themes for various platforms.',
  },
  
  // Legacy categories preserved from original file
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
  'frontend-templates': {
    title: 'Frontend Templates',
    description: 'Ready-to-use templates for websites, landing pages, dashboards, and other frontend interfaces.',
  },
  'other': {
    title: 'Other',
    description: 'Miscellaneous applications and tools that don\'t fit other categories.',
  },
  'entertainment': {
    title: 'Entertainment',
    description: 'Applications and content for entertainment and media consumption.',
  },
  'business': {
    title: 'Business',
    description: 'Solutions for business management, analytics, and operations.',
  }
}; 