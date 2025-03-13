-- Add open-source products to the database
-- User ID: a7a4395b-9fe9-4927-aa2c-abcb44289c74

INSERT INTO products (
    name,
    byline,
    short_description,
    description,
    price,
    image_urls,
    user_id,
    github_repo_url,
    categories,
    technologies,
    software_license,
    demo_url,
    faq,
    created_at,
    updated_at,
    status
) VALUES 
-- AppFlowy
(
    'AppFlowy',
    'AppFlowy',
    'Open-source alternative to Notion with native cross-platform support',
    '<p><strong>AppFlowy</strong> is an open-source productivity powerhouse that seamlessly combines <em>note-taking</em>, <em>task management</em>, and <em>database organization</em> into one elegant workspace. Built with Flutter and Rust for exceptional performance, it offers:</p>
    <ul>
        <li><strong>Native Experience:</strong> Enjoy smooth, responsive desktop and mobile apps that feel truly native to each platform</li>
        <li><strong>End-to-End Encryption:</strong> Keep your sensitive data protected with robust security measures</li>
        <li><strong>Customizable Workspace:</strong> Create personalized templates and workflows that adapt to your unique needs</li>
        <li><strong>Real-time Collaboration:</strong> Work seamlessly with team members on shared documents and projects</li>
        <li><strong>Offline Support:</strong> Continue working without interruption, even when your internet connection fails</li>
        <li><strong>Markdown Support:</strong> Format your notes with intuitive markdown syntax for clean, consistent styling</li>
        <li><strong>Database Views:</strong> Visualize your data with multiple views including tables, boards, and calendars</li>
    </ul>
    <p>Unlike proprietary alternatives, AppFlowy puts <em>you</em> in control of your data while providing a beautiful, intuitive interface that enhances productivity without compromising on privacy or flexibility.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/AppFlowy-IO/AppFlowy',
    ARRAY['productivity', 'developer_tools']::product_category[],
    ARRAY['flutter', 'rust', 'dart']::product_technology[],
    'AGPL-3.0',
    'https://appflowy.io',
    '[{"question": "Cross-Platform Sync", "answer": "Access your workspace from any device with real-time synchronization across Windows, macOS, Linux, iOS, and Android"}, {"question": "Collaboration Features", "answer": "Work simultaneously with team members in shared documents with presence indicators, comments, and version history"}, {"question": "Security Measures", "answer": "End-to-end encryption for all your data with optional self-hosting for complete control over your information"}, {"question": "Offline Capabilities", "answer": "Continue working without internet connection - all changes sync automatically when you reconnect"}, {"question": "Data Visualization", "answer": "Transform your data with multiple views including tables, kanban boards, calendars, and galleries"}, {"question": "Extensibility", "answer": "Extend functionality with plugins and custom integrations to connect with your existing tools"}]',
    NOW(),
    NOW(),
    'approved'
),

-- Plane
(
    'Plane',
    'Plane',
    'Open-source project management tool for agile teams',
    '<p><strong>Plane</strong> is a comprehensive project management platform designed specifically for agile development teams. With its intuitive interface and powerful features, Plane helps teams:</p>
    <ul>
        <li><strong>Visualize Workflows:</strong> Track progress with customizable Kanban boards, Gantt charts, and list views</li>
        <li><strong>Manage Issues:</strong> Create, assign, and track bugs and tasks with detailed attributes and custom fields</li>
        <li><strong>Plan Sprints:</strong> Organize work into time-boxed iterations with capacity planning and burndown charts</li>
        <li><strong>Integrate with Git:</strong> Connect seamlessly with GitHub and GitLab for automatic issue updates</li>
        <li><strong>Customize Workflows:</strong> Define states, priorities, and issue types that match your team''s process</li>
        <li><strong>Track Time:</strong> Monitor time spent on tasks and generate reports for better resource allocation</li>
        <li><strong>Automate Routines:</strong> Create automation rules to reduce manual work and ensure consistency</li>
    </ul>
    <p>Whether you''re a small startup or a large enterprise, Plane adapts to your team''s needs while providing the structure necessary for effective project management and delivery.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/makeplane/plane',
    ARRAY['productivity', 'business']::product_category[],
    ARRAY['next_js', 'typescript', 'postgresql']::product_technology[],
    'MIT',
    'https://plane.so',
    '[{"question": "Agile Workflows", "answer": "Comprehensive support for Scrum and Kanban methodologies with sprint planning, backlog management, and retrospectives"}, {"question": "Issue Tracking", "answer": "Advanced bug and task tracking system with custom fields, labels, priorities, and dependencies"}, {"question": "Git Integrations", "answer": "Native integration with GitHub and GitLab for automatic issue updates, branch creation, and PR linking"}, {"question": "Reporting", "answer": "Generate detailed reports on team velocity, sprint burndown, and issue distribution for data-driven decisions"}, {"question": "Team Collaboration", "answer": "Comment threads, @mentions, and real-time notifications keep everyone in sync"}, {"question": "Customization", "answer": "Tailor workflows, issue types, states, and fields to match your team''s unique processes"}]',
    NOW(),
    NOW(),
    'approved'
),

-- NocoDB
(
    'NocoDB',
    'NocoDB',
    'Open-source Airtable alternative with database connectivity',
    '<p><strong>NocoDB</strong> transforms any database into a smart spreadsheet with powerful features for teams and developers. This innovative platform:</p>
    <ul>
        <li><strong>Connects to Any Database:</strong> Works with MySQL, PostgreSQL, SQL Server, SQLite, and more</li>
        <li><strong>Provides a Collaborative Interface:</strong> Edit, filter, and sort data in a familiar spreadsheet view</li>
        <li><strong>Generates APIs Automatically:</strong> Access your data via REST, GraphQL, or gRPC endpoints</li>
        <li><strong>Secures Access:</strong> Implement role-based permissions for teams with varying access needs</li>
        <li><strong>Enables Automation:</strong> Create webhooks and integrations to automate workflows</li>
        <li><strong>Supports Multiple Views:</strong> Visualize data as grids, galleries, forms, or kanban boards</li>
        <li><strong>Enables Collaboration:</strong> Comment, share, and work together on data in real-time</li>
    </ul>
    <p>NocoDB bridges the gap between developer-centric databases and user-friendly interfaces, making data accessible to everyone in your organization without sacrificing power or flexibility.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/nocodb/nocodb',
    ARRAY['developer_tools', 'productivity']::product_category[],
    ARRAY['typescript', 'vue', 'postgresql']::product_technology[],
    'AGPL-3.0',
    'https://nocodb.com',
    '[{"question": "Database Connectivity", "answer": "Connect to MySQL, PostgreSQL, SQL Server, SQLite, and other databases with native drivers for optimal performance"}, {"question": "Collaboration Features", "answer": "Real-time multi-user editing with comments, mentions, and activity tracking for team coordination"}, {"question": "API Generation", "answer": "Automatically generate REST, GraphQL, and gRPC APIs with authentication and rate limiting"}, {"question": "Data Visualization", "answer": "View your data as grids, galleries, forms, kanban boards, or custom views"}, {"question": "Automation", "answer": "Create webhooks, scheduled jobs, and integrations with external services"}, {"question": "Access Control", "answer": "Fine-grained permissions system with roles, row-level security, and audit logs"}]',
    NOW(),
    NOW(),
    'approved'
),

-- Coolify
(
    'Coolify',
    'Coolify',
    'Self-hostable PaaS alternative to Heroku/Netlify',
    '<p><strong>Coolify</strong> is a powerful self-hosted Platform as a Service (PaaS) that gives developers complete control over their deployment infrastructure. This comprehensive solution provides:</p>
    <ul>
        <li><strong>One-Click Deployments:</strong> Deploy applications directly from Git repositories with automatic builds and updates</li>
        <li><strong>Database Management:</strong> Provision and manage databases including PostgreSQL, MySQL, MongoDB, and Redis</li>
        <li><strong>SSL Automation:</strong> Automatically issue and renew SSL certificates for all your applications</li>
        <li><strong>Resource Monitoring:</strong> Track CPU, memory, and storage usage with detailed metrics and alerts</li>
        <li><strong>Service Orchestration:</strong> Manage Docker containers, services, and resources from a unified dashboard</li>
        <li><strong>Environment Variables:</strong> Securely manage configuration with environment variables and secrets</li>
        <li><strong>Custom Domains:</strong> Connect unlimited custom domains to your applications with automatic DNS verification</li>
        <li><strong>Backup System:</strong> Schedule automatic backups for applications and databases with retention policies</li>
    </ul>
    <p>Coolify empowers developers to maintain complete ownership of their infrastructure while eliminating the complexity of manual deployments. By combining the convenience of platforms like Heroku with the control of self-hosting, Coolify provides an ideal solution for teams seeking both simplicity and sovereignty over their deployment pipeline.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/coollabsio/coolify',
    ARRAY['developer_tools', 'hosting']::product_category[],
    ARRAY['docker', 'node_js', 'postgresql']::product_technology[],
    'AGPL-3.0',
    'https://coolify.io',
    '[{"question": "Deployment Capabilities", "answer": "Deploy applications from Git repositories with automatic builds, rollbacks, and preview environments for pull requests"}, {"question": "Database Support", "answer": "Provision and manage PostgreSQL, MySQL, MongoDB, Redis, CouchDB, and other databases with automatic backups and restoration"}, {"question": "Infrastructure Requirements", "answer": "Run on any server with Docker support, including VPS providers, bare metal servers, or local development environments"}, {"question": "Security Features", "answer": "Automatic SSL certificate management, secrets encryption, network isolation, and regular security updates"}, {"question": "Scaling Options", "answer": "Horizontal and vertical scaling for applications with load balancing and resource allocation controls"}, {"question": "Monitoring Tools", "answer": "Real-time resource tracking with metrics for CPU, memory, network, and storage plus customizable alerts"}]',
    NOW(),
    NOW(),
    'approved'
),

-- Supabase
(
    'Supabase',
    'Supabase',
    'Open-source Firebase alternative with PostgreSQL',
    '<p><strong>Supabase</strong> is a comprehensive open-source backend platform that provides all the essential services for building modern applications. Powered by PostgreSQL, it offers:</p>
    <ul>
        <li><strong>Real-time Database:</strong> Build reactive applications with PostgreSQL''s powerful features and real-time subscriptions</li>
        <li><strong>Authentication:</strong> Implement secure user management with social logins, row-level security, and multi-factor authentication</li>
        <li><strong>Auto-generated APIs:</strong> Access your data instantly through automatically generated REST and GraphQL endpoints</li>
        <li><strong>Storage:</strong> Store and serve files with policy-based permissions and CDN integration</li>
        <li><strong>Edge Functions:</strong> Deploy serverless functions globally for optimal performance</li>
        <li><strong>Realtime Subscriptions:</strong> Create interactive experiences with WebSocket connections to your database</li>
        <li><strong>Vector Support:</strong> Build AI applications with native PostgreSQL vector operations</li>
        <li><strong>Webhooks:</strong> Trigger external systems when database events occur</li>
    </ul>
    <p>Supabase combines the reliability of PostgreSQL with modern developer tools to create a platform that scales from side projects to enterprise applications. With both hosted and self-hosted options, you maintain complete control over your data while accelerating development.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/supabase/supabase',
    ARRAY['developer_tools', 'database']::product_category[],
    ARRAY['postgresql', 'typescript', 'supabase']::product_technology[],
    'Apache-2.0',
    'https://supabase.io',
    '[{"question": "Realtime Database", "answer": "PostgreSQL database with realtime subscriptions for building reactive applications with change listeners and broadcast notifications"}, {"question": "Authentication System", "answer": "Complete auth system with social providers, row-level security, multi-factor authentication, and enterprise SSO options"}, {"question": "Storage Solutions", "answer": "File storage with CDN integration, image transformations, and policy-based access controls"}, {"question": "Edge Functions", "answer": "Deploy serverless functions globally with TypeScript support and environment variable management"}, {"question": "Vector Capabilities", "answer": "Build AI applications with pgvector extension for embeddings, similarity search, and semantic operations"}, {"question": "Database Webhooks", "answer": "Trigger external systems and services when database events occur with configurable retry policies"}, {"question": "GraphQL API", "answer": "Auto-generated GraphQL API with subscriptions, filtering, and pagination"}, {"question": "Local Development", "answer": "Develop locally with the same features as production using Supabase CLI and Docker"}]',
    NOW(),
    NOW(),
    'approved'
),

-- Appwrite
(
    'Appwrite',
    'Appwrite',
    'Open-source backend server for web/mobile apps',
    '<p><strong>Appwrite</strong> is a secure, end-to-end backend server that simplifies application development with a comprehensive suite of services:</p>
    <ul>
        <li><strong>Authentication:</strong> Implement secure user management with multiple sign-in methods, JWT tokens, and session control</li>
        <li><strong>Databases:</strong> Store and query structured data with a document-based NoSQL database system</li>
        <li><strong>Storage:</strong> Manage files and media with automatic image optimization and secure access controls</li>
        <li><strong>Functions:</strong> Execute custom code in a serverless environment with multiple runtime options</li>
        <li><strong>Realtime:</strong> Create interactive experiences with WebSocket connections and pub/sub channels</li>
        <li><strong>Localization:</strong> Build multilingual applications with built-in translation management</li>
        <li><strong>Webhooks:</strong> Connect with external services through customizable event triggers</li>
        <li><strong>GraphQL API:</strong> Access all Appwrite services through a unified GraphQL endpoint</li>
    </ul>
    <p>With its Docker-based architecture, Appwrite can be deployed anywhere—from local development environments to production clouds—giving developers complete control while eliminating backend complexity.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/appwrite/appwrite',
    ARRAY['developer_tools', 'backend']::product_category[],
    ARRAY['node_js', 'typescript', 'docker']::product_technology[],
    'BSD-3-Clause',
    'https://appwrite.io',
    '[{"question": "Authentication System", "answer": "Comprehensive auth with email/password, social providers, phone authentication, magic URLs, and anonymous sessions"}, {"question": "Database Capabilities", "answer": "NoSQL database with advanced queries, indexing, relationships, and realtime subscriptions"}, {"question": "Serverless Functions", "answer": "Deploy custom code in multiple runtimes including Node.js, PHP, Python, Ruby, and Deno with environment variables and secrets management"}, {"question": "Storage Features", "answer": "File storage with automatic image optimization, file previews, and access controls"}, {"question": "Realtime API", "answer": "WebSocket connections with channels, presence indicators, and pub/sub messaging"}, {"question": "Security", "answer": "End-to-end encryption, anti-abuse systems, and compliance with security best practices"}, {"question": "Self-hosting", "answer": "Deploy on any infrastructure with Docker Compose or Kubernetes with full control over your data"}, {"question": "SDKs", "answer": "Client libraries for Web, Flutter, Android, iOS, React Native, and more with type safety"}]',
    NOW(),
    NOW(),
    'approved'
),

-- Prestashop
(
    'Prestashop',
    'Prestashop',
    'Open-source e-commerce platform',
    '<p><strong>PrestaShop</strong> is a feature-rich e-commerce platform that empowers businesses of all sizes to create and manage professional online stores. This comprehensive solution offers:</p>
    <ul>
        <li><strong>Product Catalog Management:</strong> Create unlimited products with variants, combinations, and customizable attributes</li>
        <li><strong>Payment Processing:</strong> Accept payments through 250+ payment gateways including Stripe, PayPal, and Square</li>
        <li><strong>Shipping Integration:</strong> Connect with major carriers for real-time shipping rates and label printing</li>
        <li><strong>Tax Management:</strong> Configure complex tax rules for different regions, products, and customer groups</li>
        <li><strong>Multi-store Capabilities:</strong> Manage multiple shops from a single back office with shared or separate inventories</li>
        <li><strong>Marketing Tools:</strong> Implement discounts, coupons, abandoned cart recovery, and email campaigns</li>
        <li><strong>SEO Optimization:</strong> Improve search rankings with customizable URLs, meta tags, and sitemaps</li>
        <li><strong>Analytics Dashboard:</strong> Track sales, customer behavior, and inventory with detailed reports</li>
    </ul>
    <p>PrestaShop combines powerful commerce functionality with exceptional flexibility, allowing merchants to customize every aspect of their online store. With a vibrant ecosystem of themes and modules, businesses can extend their stores with additional features while maintaining complete control over their e-commerce operations.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/PrestaShop/PrestaShop',
    ARRAY['ecommerce', 'business']::product_category[],
    ARRAY['php', 'mysql', 'symfony']::product_technology[],
    'OSL-3.0',
    'https://www.prestashop.com',
    '[{"question": "Product Management", "answer": "Comprehensive catalog system with unlimited products, variants, combinations, pack products, virtual products, and customizable attributes"}, {"question": "Payment Solutions", "answer": "Integration with over 250 payment gateways including Stripe, PayPal, Square, and Authorize.net with support for subscriptions and partial payments"}, {"question": "Shipping Options", "answer": "Connect with major carriers including UPS, FedEx, USPS, and DHL for real-time rates, label printing, and order tracking"}, {"question": "International Commerce", "answer": "Multi-language, multi-currency support with localized tax rules, payment methods, and shipping options for global selling"}, {"question": "Marketing Features", "answer": "Built-in tools for discounts, coupons, abandoned cart recovery, and email marketing campaigns"}, {"question": "Mobile Commerce", "answer": "Responsive themes and mobile-optimized checkout for seamless shopping experiences across all devices"}, {"question": "Marketplace Integration", "answer": "Connect and synchronize with Amazon, eBay, Etsy, and other marketplaces to expand your sales channels"}, {"question": "Customization", "answer": "Extensive theme system and module marketplace with 3,000+ extensions for adding specialized functionality"}]',
    NOW(),
    NOW(),
    'approved'
),

-- Mattermost
(
    'Mattermost',
    'Mattermost',
    'Open-source Slack alternative for team collaboration',
    '<p><strong>Mattermost</strong> is an enterprise-grade collaboration platform that brings all your team communication into one secure, searchable hub. This comprehensive messaging solution offers:</p>
    <ul>
        <li><strong>Channel-Based Communication:</strong> Organize conversations by teams, projects, or topics with public and private channels</li>
        <li><strong>Direct Messaging:</strong> Communicate one-on-one or in small groups with threaded conversations</li>
        <li><strong>File Sharing:</strong> Share, preview, and collaborate on documents with advanced search capabilities</li>
        <li><strong>Video Conferencing:</strong> Launch calls directly from chat with screen sharing and recording options</li>
        <li><strong>DevOps Integrations:</strong> Connect with development tools like GitHub, GitLab, Jenkins, and Jira</li>
        <li><strong>Slash Commands:</strong> Execute actions directly from the message box with customizable commands</li>
        <li><strong>Automation:</strong> Create workflows with incoming and outgoing webhooks and message actions</li>
        <li><strong>Self-Hosted Security:</strong> Maintain complete control over your data with on-premises or private cloud deployment</li>
    </ul>
    <p>Mattermost combines the ease of use of consumer messaging apps with the security and configurability enterprises require. Its open-source foundation ensures transparency, customizability, and freedom from vendor lock-in, making it ideal for teams with stringent compliance or security requirements.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/mattermost/mattermost',
    ARRAY['communication_social', 'business']::product_category[],
    ARRAY['go', 'react', 'postgresql']::product_technology[],
    'AGPL-3.0',
    'https://mattermost.com',
    '[{"question": "Team Communication", "answer": "Comprehensive messaging with channels, direct messages, threads, emoji reactions, and formatting options for effective team collaboration"}, {"question": "File Management", "answer": "Secure document sharing with preview support for images, PDFs, and documents, plus advanced search capabilities for finding content quickly"}, {"question": "DevOps Integrations", "answer": "Native connections to development tools including GitHub, GitLab, Jenkins, Jira, and CircleCI with actionable notifications and two-way updates"}, {"question": "Security Features", "answer": "Enterprise-grade security with data encryption, AD/LDAP integration, SAML 2.0 support, and compliance reporting"}, {"question": "Extensibility", "answer": "Customize with plugins, webhooks, slash commands, and a complete REST API for extending functionality"}, {"question": "Mobile Support", "answer": "Native iOS and Android apps with push notifications, offline support, and secure authentication"}, {"question": "Deployment Options", "answer": "Self-host on-premises or in your private cloud with support for high availability and horizontal scaling"}, {"question": "Migration Tools", "answer": "Import data from Slack, Microsoft Teams, and other platforms with user mapping and channel history preservation"}]',
    NOW(),
    NOW(),
    'approved'
),

-- ERPNext
(
    'ERPNext',
    'ERPNext',
    'Open-source ERP for business operations',
    '<p><strong>ERPNext</strong> is a comprehensive, open-source enterprise resource planning platform that unifies all aspects of business operations in a single system. This integrated solution includes:</p>
    <ul>
        <li><strong>Accounting:</strong> Manage finances with general ledger, accounts receivable/payable, and financial reporting</li>
        <li><strong>Inventory Management:</strong> Track stock levels, transfers, and valuations across multiple warehouses</li>
        <li><strong>CRM:</strong> Nurture customer relationships with lead tracking, opportunity management, and communication logs</li>
        <li><strong>HR & Payroll:</strong> Handle employee records, attendance, leave management, and salary processing</li>
        <li><strong>Manufacturing:</strong> Plan production with bills of materials, work orders, and capacity planning</li>
        <li><strong>Project Management:</strong> Track tasks, timelines, and resources for project-based work</li>
        <li><strong>E-commerce Integration:</strong> Connect online stores with inventory and order processing</li>
        <li><strong>Asset Management:</strong> Monitor equipment lifecycle, maintenance schedules, and depreciation</li>
    </ul>
    <p>ERPNext provides businesses of all sizes with enterprise-grade functionality without the enterprise price tag. Its modular design allows organizations to start with core modules and expand as needed, while its open architecture enables customization to fit specific industry requirements and workflows.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/frappe/erpnext',
    ARRAY['business', 'finance']::product_category[],
    ARRAY['python', 'javascript', 'mariadb']::product_technology[],
    'GPL-3.0',
    'https://erpnext.com',
    '[{"question": "Accounting System", "answer": "Complete double-entry accounting with journal entries, balance sheets, P&L statements, tax management, and multi-currency support"}, {"question": "Inventory Management", "answer": "Multi-warehouse tracking with batch and serial numbers, quality control, reorder points, and valuation methods including FIFO and moving average"}, {"question": "Manufacturing Capabilities", "answer": "Production planning with capacity planning, job cards, routing, BOM management, and quality inspection workflows"}, {"question": "Human Resources", "answer": "Employee management with recruitment, onboarding, performance evaluation, attendance tracking, and payroll processing"}, {"question": "CRM Features", "answer": "Lead management, opportunity tracking, customer communication, quotations, and sales analytics"}, {"question": "Project Management", "answer": "Task assignment, Gantt charts, time tracking, billing, and project profitability analysis"}, {"question": "Customization", "answer": "Create custom forms, fields, reports, and workflows without coding using the built-in Frappe framework"}, {"question": "Industry Solutions", "answer": "Pre-configured setups for manufacturing, retail, distribution, services, education, healthcare, agriculture, and non-profit sectors"}]',
    NOW(),
    NOW(),
    'approved'
),

-- ToolJet
(
    'ToolJet',
    'ToolJet',
    'Open-source low-code platform for internal tools',
    '<p><strong>ToolJet</strong> is a powerful low-code platform that enables teams to build custom internal applications without extensive development resources. This versatile platform provides:</p>
    <ul>
        <li><strong>Visual Application Builder:</strong> Create interfaces with a drag-and-drop editor featuring 45+ pre-built components</li>
        <li><strong>Database Connectors:</strong> Connect to PostgreSQL, MySQL, MongoDB, Firestore, and other databases with native drivers</li>
        <li><strong>API Integration:</strong> Interact with REST, GraphQL, and SOAP APIs through a visual interface without writing code</li>
        <li><strong>Authentication:</strong> Implement SSO, LDAP, Google, and GitHub authentication with role-based access control</li>
        <li><strong>Workflow Automation:</strong> Build complex business logic with visual workflows and custom JavaScript</li>
        <li><strong>Real-time Collaboration:</strong> Work simultaneously with team members on application development</li>
        <li><strong>Version Control:</strong> Track changes with built-in versioning and release management</li>
        <li><strong>White-labeling:</strong> Customize the look and feel with your company''s branding and design system</li>
    </ul>
    <p>ToolJet empowers both technical and non-technical teams to create custom dashboards, admin panels, CRUD applications, and workflow tools in a fraction of the time required for traditional development. By eliminating the need for frontend and backend coding, organizations can rapidly deploy internal tools that connect to their existing data sources and systems.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/ToolJet/ToolJet',
    ARRAY['developer_tools', 'productivity']::product_category[],
    ARRAY['react', 'node_js', 'postgresql']::product_technology[],
    'AGPL-3.0',
    'https://tooljet.com',
    '[{"question": "Data Source Connectivity", "answer": "Connect to 40+ data sources including PostgreSQL, MySQL, MongoDB, Firestore, Redis, Elasticsearch, REST APIs, GraphQL, SOAP, and third-party services like Stripe, Airtable, and Google Sheets"}, {"question": "UI Components", "answer": "Build interfaces with 45+ pre-built components including tables, charts, forms, buttons, modals, file uploaders, maps, calendars, and kanban boards with customizable properties"}, {"question": "Access Control", "answer": "Implement granular permissions with user groups, row-level security, and feature-based access control integrated with SSO, LDAP, and OAuth providers"}, {"question": "Custom Logic", "answer": "Create complex business logic with JavaScript transformations, queries, and event handlers without backend coding"}, {"question": "Deployment Options", "answer": "Self-host on your infrastructure with Docker, Kubernetes, or use ToolJet Cloud for managed hosting with automatic updates"}, {"question": "Enterprise Features", "answer": "Audit logs, multi-environment support, workspace management, and dedicated support for large-scale deployments"}, {"question": "Mobile Responsiveness", "answer": "Design responsive applications that work seamlessly across desktop and mobile devices with adaptive layouts"}, {"question": "Extensibility", "answer": "Extend functionality with custom plugins, components, and integrations to meet specific business requirements"}]',
    NOW(),
    NOW(),
    'approved'
),

-- Directus
(
    'Directus',
    'Directus',
    'Open-source headless CMS for any SQL database',
    '<p><strong>Directus</strong> is a flexible data platform that wraps your SQL database with a dynamic API and intuitive admin app. This powerful system provides:</p>
    <ul>
        <li><strong>Database Abstraction:</strong> Connect to any SQL database and instantly gain a powerful REST and GraphQL API</li>
        <li><strong>Intuitive Admin Panel:</strong> Manage content with a beautiful, customizable interface designed for non-technical users</li>
        <li><strong>Role-Based Access Control:</strong> Define granular permissions for users and roles at the field level</li>
        <li><strong>File Asset Management:</strong> Store and transform images and documents with on-demand resizing</li>
        <li><strong>Custom Data Models:</strong> Create and modify collections, fields, and relationships without writing SQL</li>
        <li><strong>Workflow Automation:</strong> Build hooks, flows, and operations to automate business processes</li>
        <li><strong>Data Versioning:</strong> Track changes with revision history and rollback capabilities</li>
        <li><strong>Extensibility:</strong> Create custom interfaces, displays, layouts, and modules to extend functionality</li>
    </ul>
    <p>Directus empowers both developers and content creators by providing a flexible foundation for any digital project. Developers maintain complete database freedom and API control, while content managers benefit from an intuitive interface tailored to their specific workflow needs. With its "database-first" approach, Directus can be added to existing projects without migration or lock-in.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/directus/directus',
    ARRAY['developer_tools', 'database']::product_category[],
    ARRAY['node_js', 'typescript', 'postgresql']::product_technology[],
    'GPL-3.0',
    'https://directus.io',
    '[{"question": "Database Compatibility", "answer": "Connect to any SQL database including PostgreSQL, MySQL, SQLite, MS SQL Server, OracleDB, and MariaDB without changing your existing schema"}, {"question": "API Capabilities", "answer": "Automatically generated REST and GraphQL APIs with filtering, sorting, searching, pagination, and deep relational queries"}, {"question": "Access Control", "answer": "Granular permissions system with role-based access control down to the field level, plus IP access controls and SSO options"}, {"question": "Content Management", "answer": "Intuitive admin app with customizable layouts, interfaces, and displays for different content types and user roles"}, {"question": "Asset Management", "answer": "File storage with image transformations, thumbnail generation, and metadata extraction for images, videos, and documents"}, {"question": "Extensibility", "answer": "Create custom extensions including interfaces, displays, layouts, modules, endpoints, and hooks without forking the core"}, {"question": "Automation", "answer": "Build flows with triggers, operations, and conditional logic to automate processes and integrate with external services"}, {"question": "Deployment Options", "answer": "Self-host on-premises or in the cloud, or use Directus Cloud for managed hosting with automatic updates and backups"}]',
    NOW(),
    NOW(),
    'approved'
),

-- n8n
(
    'n8n',
    'n8n',
    'Open-source workflow automation platform',
    '<p><strong>n8n</strong> is a powerful workflow automation platform that connects any app or service, whether cloud-based or on-premises. This flexible system enables:</p>
    <ul>
        <li><strong>Visual Workflow Building:</strong> Create complex automation flows with an intuitive drag-and-drop interface</li>
        <li><strong>Extensive Integrations:</strong> Connect to 300+ services and apps out of the box</li>
        <li><strong>Custom Logic:</strong> Implement conditional branches, loops, and transformations with JavaScript code nodes</li>
        <li><strong>Error Handling:</strong> Build robust workflows with retry mechanisms and error branches</li>
        <li><strong>Self-Hosting:</strong> Deploy on your own infrastructure for complete data control and privacy</li>
        <li><strong>Webhook Triggers:</strong> Start workflows from external events and API calls</li>
        <li><strong>Scheduled Execution:</strong> Run workflows on custom schedules or cron expressions</li>
        <li><strong>Data Mapping:</strong> Transform data between services with powerful mapping tools</li>
    </ul>
    <p>n8n empowers technical and non-technical users alike to automate repetitive tasks, synchronize data between systems, and build complex business processes without limitations. Its fair-code license model ensures the platform remains open while supporting sustainable development.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/n8n-io/n8n',
    ARRAY['developer_tools', 'automation']::product_category[],
    ARRAY['typescript', 'node_js', 'postgresql']::product_technology[],
    'Apache-2.0',
    'https://n8n.io',
    '[{"question": "Available Integrations", "answer": "Connect to 300+ services including Airtable, Notion, Google Sheets, Slack, GitHub, AWS, and databases with new integrations added regularly"}, {"question": "Workflow Capabilities", "answer": "Build complex automation with conditional logic, loops, error handling, and parallel execution paths using the visual pipeline builder"}, {"question": "Self-Hosting Options", "answer": "Deploy on your own infrastructure using Docker, Kubernetes, or npm with full control over your data and execution environment"}, {"question": "Extensibility", "answer": "Create custom nodes and functionality using the n8n SDK to connect to any service or implement specialized logic"}, {"question": "Execution Methods", "answer": "Trigger workflows via webhooks, schedules, manual execution, or API calls with queue management for high loads"}, {"question": "Data Processing", "answer": "Transform, filter, and manipulate data between services with JavaScript functions and specialized operation nodes"}, {"question": "Credentials Management", "answer": "Securely store and manage API keys and authentication tokens with encryption"}, {"question": "Collaboration", "answer": "Share workflows with team members and implement version control with the n8n cloud offering"}]',
    NOW(),
    NOW(),
    'approved'
),

-- Plausible Analytics
(
    'Plausible Analytics',
    'Plausible',
    'Privacy-focused open-source web analytics',
    '<p><strong>Plausible Analytics</strong> is a lightweight, privacy-first alternative to traditional web analytics platforms. This transparent and ethical analytics solution offers:</p>
    <ul>
        <li><strong>Lightweight Script:</strong> Add just 1.4KB to your site, 45x smaller than Google Analytics</li>
        <li><strong>Cookie-Free Tracking:</strong> Collect anonymous data without requiring cookie consent banners</li>
        <li><strong>GDPR/CCPA Compliance:</strong> Meet privacy regulations out of the box with no configuration needed</li>
        <li><strong>Real-Time Dashboard:</strong> View visitor activity as it happens with an intuitive, fast-loading interface</li>
        <li><strong>Goal Conversion Tracking:</strong> Measure important actions visitors take on your site</li>
        <li><strong>Traffic Source Analysis:</strong> Understand where your visitors come from with referrer tracking</li>
        <li><strong>Country and Device Stats:</strong> See visitor locations and what devices they use to browse your site</li>
        <li><strong>Page Performance Metrics:</strong> Identify your most popular content and visitor engagement patterns</li>
    </ul>
    <p>Plausible provides actionable insights without compromising visitor privacy or site performance. Its simple, transparent approach to analytics respects users while giving site owners the data they need to make informed decisions. With both cloud and self-hosted options, Plausible puts you in control of your analytics data.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/plausible/analytics',
    ARRAY['analytics', 'developer_tools']::product_category[],
    ARRAY['elixir', 'phoenix', 'postgresql']::product_technology[],
    'AGPL-3.0',
    'https://plausible.io',
    '[{"question": "Privacy Features", "answer": "No cookies, no personal data collection, no tracking across sites, and no selling or sharing data with third parties"}, {"question": "Script Performance", "answer": "Extremely lightweight 1.4KB script that loads instantly and doesn''t affect your site speed or Core Web Vitals scores"}, {"question": "Regulatory Compliance", "answer": "GDPR, CCPA, and PECR compliant by default with no need for cookie banners or consent management"}, {"question": "Data Ownership", "answer": "Complete ownership of your analytics data with easy export options and no data sharing with advertising companies"}, {"question": "Custom Events", "answer": "Track conversions, file downloads, outbound link clicks, and other custom goals with simple event tracking"}, {"question": "Detailed Metrics", "answer": "View unique visitors, page views, bounce rates, visit duration, entry/exit pages, and referral sources"}, {"question": "White Labeling", "answer": "Create custom branded dashboards to share with clients and stakeholders"}, {"question": "Self-Hosting", "answer": "Deploy on your own infrastructure with Docker for complete data control and privacy"}]',
    NOW(),
    NOW(),
    'approved'
),

-- Umami
(
    'Umami',
    'Umami',
    'Simple, privacy-focused web analytics',
    '<p><strong>Umami</strong> is a lightweight, privacy-focused alternative to conventional web analytics platforms. This user-friendly solution offers:</p>
    <ul>
        <li><strong>Privacy-First Tracking:</strong> Collect anonymous usage data without cookies or personally identifiable information</li>
        <li><strong>Lightweight Script:</strong> Add just 1.8KB to your site with minimal performance impact</li>
        <li><strong>Real-Time Dashboard:</strong> View visitor activity as it happens with an intuitive, clean interface</li>
        <li><strong>Multi-Website Support:</strong> Track unlimited websites from a single installation</li>
        <li><strong>Custom Events:</strong> Monitor specific user interactions like button clicks, form submissions, and conversions</li>
        <li><strong>Data Ownership:</strong> Maintain complete control over your analytics data with self-hosting</li>
        <li><strong>Shareable Reports:</strong> Create public or password-protected dashboards to share with team members</li>
        <li><strong>Data Export:</strong> Export your analytics data in CSV format for further analysis</li>
    </ul>
    <p>Umami provides the essential metrics you need to understand your website''s performance without compromising visitor privacy or site speed. Its simple, transparent approach to analytics respects users while giving site owners actionable insights to make informed decisions about their content and marketing strategies.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/umami-software/umami',
    ARRAY['analytics', 'developer_tools']::product_category[],
    ARRAY['react', 'next_js', 'mysql']::product_technology[],
    'MIT',
    'https://umami.is',
    '[{"question": "Privacy Compliance", "answer": "GDPR, CCPA, and PECR compliant by default with no cookies, no tracking across sites, and no collection of personally identifiable information"}, {"question": "Performance Impact", "answer": "Extremely lightweight 1.8KB script that loads instantly and has negligible effect on page load times and Core Web Vitals"}, {"question": "Available Metrics", "answer": "Track pageviews, unique visitors, referral sources, countries, browsers, operating systems, device types, and screen sizes with historical comparisons"}, {"question": "Custom Event Tracking", "answer": "Monitor specific user interactions like button clicks, form submissions, video plays, and custom conversion goals with event parameters"}, {"question": "Multi-Site Management", "answer": "Track unlimited websites and applications from a single dashboard with role-based access control for team members"}, {"question": "Data Retention", "answer": "Full control over how long data is stored with no artificial limitations on historical data access"}, {"question": "Deployment Options", "answer": "Self-host on your own infrastructure with Docker, Vercel, or any Node.js hosting platform with support for various databases"}, {"question": "API Access", "answer": "Programmatically access your analytics data through a comprehensive REST API for custom reporting and integrations"}]',
    NOW(),
    NOW(),
    'approved'
),

-- Medusa
(
    'Medusa',
    'Medusa',
    'Open-source headless commerce platform',
    '<p><strong>Medusa</strong> is a composable commerce platform that gives developers the freedom to create unique and scalable e-commerce experiences. This flexible, API-first solution provides:</p>
    <ul>
        <li><strong>Headless Architecture:</strong> Separate your frontend and backend for maximum flexibility and performance</li>
        <li><strong>Customizable Commerce Logic:</strong> Adapt the platform to your specific business requirements and workflows</li>
        <li><strong>Order Management:</strong> Handle complex order processing with support for multiple fulfillment methods</li>
        <li><strong>Payment Processing:</strong> Integrate with popular payment providers or build custom payment solutions</li>
        <li><strong>Inventory Management:</strong> Track stock levels across multiple locations with automated alerts</li>
        <li><strong>Discount Engine:</strong> Create sophisticated promotion rules and coupon campaigns</li>
        <li><strong>Plugin System:</strong> Extend functionality with a growing ecosystem of plugins and modules</li>
        <li><strong>Multi-Region Support:</strong> Sell globally with region-specific pricing, taxes, and shipping options</li>
    </ul>
    <p>Medusa empowers developers to build custom commerce experiences without sacrificing the core functionality needed for modern e-commerce operations. Its modular approach allows businesses to start small and scale their platform as they grow, adding new capabilities without replatforming.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/medusajs/medusa',
    ARRAY['ecommerce', 'developer_tools']::product_category[],
    ARRAY['node_js', 'typescript', 'postgresql']::product_technology[],
    'MIT',
    'https://medusajs.com',
    '[{"question": "Headless Architecture", "answer": "Completely decoupled frontend and backend with RESTful APIs and custom storefronts using any framework including Next.js, Gatsby, or Vue"}, {"question": "Payment Processing", "answer": "Integration with multiple payment providers including Stripe, PayPal, Klarna, and custom payment methods with support for saved payment methods"}, {"question": "Plugin Ecosystem", "answer": "Extendable platform with plugins for search, analytics, marketing, shipping, taxes, and more with easy installation and configuration"}, {"question": "Product Management", "answer": "Flexible product system supporting complex variants, custom attributes, collections, categories, and digital products"}, {"question": "Cart & Checkout", "answer": "Customizable checkout flows with support for guest checkout, saved addresses, and multi-step processes"}, {"question": "Shipping & Fulfillment", "answer": "Multiple shipping options, fulfillment providers, and return management with automated workflows"}, {"question": "Internationalization", "answer": "Multi-currency, multi-language support with region-specific pricing, taxes, and shipping rules"}, {"question": "Developer Experience", "answer": "TypeScript-based codebase with comprehensive documentation, CLI tools, and starter templates for rapid development"}]',
    NOW(),
    NOW(),
    'approved'
),

-- Saleor
(
    'Saleor',
    'Saleor',
    'Headless e-commerce platform with GraphQL',
    '<p><strong>Saleor</strong> is a modern, GraphQL-first headless commerce platform designed for developers building high-performance, customizable storefronts. This flexible solution provides:</p>
    <ul>
        <li><strong>GraphQL API:</strong> Access all commerce functionality through a comprehensive, well-documented GraphQL API</li>
        <li><strong>Headless Architecture:</strong> Build custom storefronts with any frontend technology including React, Vue, or Next.js</li>
        <li><strong>Multi-Channel Sales:</strong> Manage products, inventory, and orders across websites, mobile apps, and marketplaces</li>
        <li><strong>Checkout Engine:</strong> Implement customizable checkout flows with support for various payment methods</li>
        <li><strong>Product Management:</strong> Create complex product catalogs with attributes, variants, and digital products</li>
        <li><strong>Order Processing:</strong> Handle the complete order lifecycle with fulfillment tracking and returns</li>
        <li><strong>Extensibility:</strong> Customize core functionality with apps and webhooks without forking the codebase</li>
        <li><strong>Cloud Deployment:</strong> Deploy with Saleor Cloud for managed infrastructure or self-host for complete control</li>
    </ul>
    <p>Saleor empowers development teams to create unique commerce experiences without the constraints of traditional platforms. Its API-first approach enables businesses to adapt quickly to changing market demands while maintaining a robust, scalable foundation for their e-commerce operations.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/saleor/saleor',
    ARRAY['ecommerce', 'developer_tools']::product_category[],
    ARRAY['python', 'django', 'postgresql']::product_technology[],
    'BSD-3-Clause',
    'https://saleor.io',
    '[{"question": "GraphQL API Capabilities", "answer": "Comprehensive API with queries, mutations, and subscriptions for real-time updates, plus detailed documentation and type safety"}, {"question": "Frontend Integration", "answer": "Build storefronts with any technology using official SDKs for React, Next.js, and other frameworks with Storefront starter kits"}, {"question": "Product Management", "answer": "Flexible catalog with unlimited attributes, variants, collections, and support for physical, digital, and subscription products"}, {"question": "Checkout Customization", "answer": "Build custom checkout flows with support for guest checkout, saved payment methods, and multi-step processes"}, {"question": "Payment Processing", "answer": "Integration with Stripe, PayPal, Adyen, and other payment providers with support for multiple currencies and payment methods"}, {"question": "Internationalization", "answer": "Multi-language, multi-currency support with automatic tax calculations and localized pricing"}, {"question": "Performance", "answer": "Built for scale with efficient database queries, caching strategies, and support for horizontal scaling"}, {"question": "Extensibility", "answer": "Extend functionality with apps, webhooks, and custom resolvers without modifying core code"}]',
    NOW(),
    NOW(),
    'approved'
),

-- Strapi
(
    'Strapi',
    'Strapi',
    'Open-source headless CMS for modern applications',
    '<p><strong>Strapi</strong> is a developer-first headless CMS that gives teams the freedom to create, manage and distribute content across any digital channel. With its flexible content architecture, Strapi offers:</p>
    <ul>
        <li><strong>Content Type Builder:</strong> Design your content structure with a visual interface for creating custom models and fields</li>
        <li><strong>Dynamic API Generation:</strong> Access your content through automatically generated REST and GraphQL endpoints</li>
        <li><strong>Admin Panel:</strong> Manage content with an intuitive, customizable interface designed for content editors</li>
        <li><strong>Role-Based Access Control:</strong> Define granular permissions for different user roles and content types</li>
        <li><strong>Media Library:</strong> Organize and optimize images, videos, and documents with powerful asset management</li>
        <li><strong>Internationalization:</strong> Create and manage multilingual content with localization workflows</li>
        <li><strong>Webhooks:</strong> Trigger external systems when content changes occur</li>
        <li><strong>Plugin System:</strong> Extend functionality with a marketplace of plugins or create custom extensions</li>
    </ul>
    <p>Strapi empowers developers to build modern content-rich applications while providing content teams with the tools they need to work efficiently. Its database-agnostic architecture supports multiple SQL databases and can be deployed in any environment.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/strapi/strapi',
    ARRAY['developer_tools', 'cms']::product_category[],
    ARRAY['node_js', 'react', 'postgresql']::product_technology[],
    'MIT',
    'https://strapi.io',
    '[{"question": "Content Modeling", "answer": "Create custom content types with dynamic zones, components, and relationships through an intuitive visual builder"}, {"question": "API Options", "answer": "Access content via REST and GraphQL APIs with filtering, pagination, and deep population of related content"}, {"question": "Plugin Ecosystem", "answer": "Extend functionality with official and community plugins for SEO, e-commerce, documentation, and more"}, {"question": "Admin Customization", "answer": "Tailor the admin panel with custom fields, views, and plugins to match your workflow"}, {"question": "Media Management", "answer": "Organize assets with folders, metadata, and automatic image optimization"}, {"question": "Localization", "answer": "Manage content in multiple languages with translation workflows and localized APIs"}, {"question": "Deployment Options", "answer": "Deploy on-premises or in the cloud with support for various hosting providers"}, {"question": "Versioning", "answer": "Track content changes with draft/publish workflows and revision history"}]',
    NOW(),
    NOW(),
    'approved'
),

-- Ghost
(
    'Ghost',
    'Ghost',
    'Professional publishing platform for creators',
    '<p><strong>Ghost</strong> is a powerful, independent publishing platform designed specifically for professional creators, bloggers, and digital publications. This modern content management system provides:</p>
    <ul>
        <li><strong>Beautiful Editor:</strong> Write with a clean, distraction-free editor that supports rich media, cards, and markdown</li>
        <li><strong>Membership & Subscriptions:</strong> Build a sustainable business with integrated paid subscriptions and member management</li>
        <li><strong>SEO Optimization:</strong> Rank higher in search results with built-in SEO tools and structured data</li>
        <li><strong>Newsletter System:</strong> Send automated newsletters and email digests directly to your audience</li>
        <li><strong>Custom Themes:</strong> Design your publication with customizable themes and a flexible templating system</li>
        <li><strong>Native Apps:</strong> Manage your content on the go with iOS and Android mobile applications</li>
        <li><strong>Integrations:</strong> Connect with your favorite tools through Zapier, webhooks, and custom integrations</li>
        <li><strong>Analytics:</strong> Understand your audience with detailed traffic and member analytics</li>
    </ul>
    <p>Ghost combines the simplicity of a traditional blog with the power of modern publishing tools, allowing creators to focus on content while building direct relationships with their audience. Its non-profit foundation ensures the platform remains independent and focused on creator needs rather than investor demands.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/TryGhost/Ghost',
    ARRAY['publishing', 'cms']::product_category[],
    ARRAY['node_js', 'react', 'mysql']::product_technology[],
    'MIT',
    'https://ghost.org',
    '[{"question": "Membership Features", "answer": "Complete membership system with free and paid tiers, custom member fields, and portal for self-service account management"}, {"question": "Newsletter Capabilities", "answer": "Send automated newsletters with custom designs, scheduling options, and audience segmentation"}, {"question": "SEO Optimization", "answer": "Built-in tools including canonical tags, meta descriptions, structured data, XML sitemaps, and AMP support"}, {"question": "Content Management", "answer": "Flexible content editor with cards for specialized content types, custom templates, and scheduling"}, {"question": "Monetization Options", "answer": "Multiple payment options including Stripe integration, various currencies, and flexible subscription plans"}, {"question": "Theme Development", "answer": "Handlebars-based theming system with dynamic routing, content API, and theme marketplace"}, {"question": "Performance", "answer": "Optimized for speed with image optimization, lazy loading, and CDN compatibility"}, {"question": "Self-hosting", "answer": "Deploy on your own server with Docker, DigitalOcean, or other hosting providers for complete control"}]',
    NOW(),
    NOW(),
    'approved'
),

-- Rocket.Chat
(
    'Rocket.Chat',
    'RocketChat',
    'Open-source team communication platform',
    '<p><strong>Rocket.Chat</strong> is a comprehensive communication platform that brings team collaboration, customer engagement, and secure messaging into one unified solution. This versatile platform offers:</p>
    <ul>
        <li><strong>Team Messaging:</strong> Communicate through channels, private groups, and direct messages with threaded conversations</li>
        <li><strong>Video Conferencing:</strong> Host meetings with screen sharing, recording, and whiteboard collaboration</li>
        <li><strong>File Sharing:</strong> Exchange documents, images, and media with preview capabilities and version control</li>
        <li><strong>Omnichannel Support:</strong> Engage with customers across websites, mobile apps, social media, and messaging platforms</li>
        <li><strong>End-to-End Encryption:</strong> Secure sensitive communications with robust encryption and data protection</li>
        <li><strong>Marketplace:</strong> Extend functionality with 1,000+ integrations, bots, and apps</li>
        <li><strong>Federation:</strong> Connect multiple Rocket.Chat instances across organizations while maintaining security boundaries</li>
        <li><strong>Self-Hosting:</strong> Deploy on your own infrastructure for complete data sovereignty and compliance</li>
    </ul>
    <p>Rocket.Chat provides organizations with a secure, flexible alternative to proprietary communication tools. Its open-source foundation ensures transparency, customizability, and freedom from vendor lock-in, making it ideal for businesses, governments, and healthcare organizations with stringent security and compliance requirements.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/RocketChat/Rocket.Chat',
    ARRAY['communication_social', 'business']::product_category[],
    ARRAY['meteor', 'react', 'mongodb']::product_technology[],
    'MIT',
    'https://rocket.chat',
    '[{"question": "Team Collaboration", "answer": "Comprehensive messaging with channels, groups, direct messages, threads, reactions, and formatting options for effective team communication"}, {"question": "Video Conferencing", "answer": "Built-in video meetings with screen sharing, recording, breakout rooms, and integration with external providers like Jitsi, BigBlueButton, and WebRTC"}, {"question": "Customer Engagement", "answer": "Omnichannel platform connecting website live chat, WhatsApp, Facebook, Instagram, Twitter, SMS, and email into a unified agent interface"}, {"question": "Security Features", "answer": "End-to-end encryption, two-factor authentication, SSO integration, data retention policies, and compliance with GDPR, HIPAA, and other regulations"}, {"question": "Integration Ecosystem", "answer": "Connect with 1,000+ tools including GitHub, Jira, Trello, Confluence, Salesforce, and HubSpot through the marketplace and webhooks"}, {"question": "Mobile Experience", "answer": "Native iOS and Android apps with push notifications, offline support, and security features for remote teams"}, {"question": "Customization", "answer": "Tailor the platform with custom themes, branding, fields, and functionality through the extensive API and plugin system"}, {"question": "Deployment Options", "answer": "Self-host on-premises or in your private cloud with support for Docker, Kubernetes, and various cloud providers, or use Rocket.Chat Cloud for managed hosting"}]',
    NOW(),
    NOW(),
    'approved'
),

-- Odoo
(
    'Odoo',
    'Odoo',
    'Comprehensive open-source business management suite',
    '<p><strong>Odoo</strong> is an all-in-one business management platform that seamlessly integrates a wide range of business applications into a unified experience. This comprehensive suite provides:</p>
    <ul>
        <li><strong>CRM & Sales:</strong> Manage leads, opportunities, quotations, and the complete sales pipeline</li>
        <li><strong>Accounting & Finance:</strong> Handle invoicing, payments, taxes, and financial reporting</li>
        <li><strong>Inventory Management:</strong> Track stock levels, transfers, and valuations across multiple warehouses</li>
        <li><strong>Manufacturing:</strong> Plan production with bills of materials, work orders, and quality control</li>
        <li><strong>Human Resources:</strong> Streamline recruitment, employee management, time tracking, and payroll</li>
        <li><strong>Project Management:</strong> Organize tasks, timelines, and resources for project-based work</li>
        <li><strong>E-commerce:</strong> Build and manage online stores with product catalogs and payment processing</li>
        <li><strong>Website Builder:</strong> Create professional websites with drag-and-drop tools and content management</li>
    </ul>
    <p>Odoo''s modular architecture allows businesses to start with the applications they need most and expand as they grow. With both community (open-source) and enterprise editions available, organizations can choose the deployment model that best fits their requirements while benefiting from a fully integrated system that eliminates data silos and streamlines operations.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/odoo/odoo',
    ARRAY['business', 'finance']::product_category[],
    ARRAY['python', 'postgresql', 'javascript']::product_technology[],
    'LGPL-3.0',
    'https://www.odoo.com',
    '[{"question": "Available Applications", "answer": "Over 40 main applications including CRM, Sales, Accounting, Inventory, Manufacturing, Project Management, HR, E-commerce, Website, Point of Sale, and Marketing Automation"}, {"question": "Integration Capabilities", "answer": "Seamless data flow between all modules with a unified database, plus API access for connecting with external systems and third-party applications"}, {"question": "Customization Options", "answer": "Adapt the system to your specific business needs with custom fields, workflows, reports, and development of specialized modules without modifying core code"}, {"question": "Deployment Models", "answer": "Choose between Odoo Online (SaaS), Odoo.sh (PaaS), or on-premises installation with options for both Community (free) and Enterprise editions"}, {"question": "Scalability", "answer": "Support for businesses from startups to enterprises with performance optimization for databases with millions of records and thousands of concurrent users"}, {"question": "Localization", "answer": "Available in 30+ languages with country-specific accounting, tax, and regulatory features for global operations"}, {"question": "Mobile Access", "answer": "Native mobile applications for iOS and Android providing access to key business functions from anywhere"}, {"question": "Reporting & Analytics", "answer": "Built-in business intelligence tools with customizable dashboards, real-time reporting, and data visualization capabilities"}]',
    NOW(),
    NOW(),
    'approved'
),

-- Spree Commerce
(
    'Spree Commerce',
    'Spree',
    'Ruby on Rails e-commerce platform',
    '<p><strong>Spree Commerce</strong> is a flexible, open-source e-commerce platform built on Ruby on Rails that provides developers with a solid foundation for creating customized online stores. This developer-friendly solution offers:</p>
    <ul>
        <li><strong>Modular Architecture:</strong> Build with only the components you need through a system of extensions and engines</li>
        <li><strong>API-First Design:</strong> Access all functionality through a comprehensive REST API for headless commerce</li>
        <li><strong>Multi-Store Management:</strong> Run multiple storefronts from a single installation with shared or separate inventories</li>
        <li><strong>Advanced Product Management:</strong> Create complex products with variants, properties, and customizable options</li>
        <li><strong>Flexible Taxation:</strong> Configure tax rules for different regions, products, and customer types</li>
        <li><strong>Shipping Calculation:</strong> Implement custom shipping methods or integrate with major carriers</li>
        <li><strong>Payment Processing:</strong> Connect with popular payment gateways through a unified payment interface</li>
        <li><strong>Customizable Checkout:</strong> Design multi-step or one-page checkout flows to optimize conversions</li>
    </ul>
    <p>Spree Commerce provides the perfect balance between structure and flexibility, allowing developers to rapidly build e-commerce solutions while maintaining the freedom to customize every aspect of the platform. Its Ruby on Rails foundation ensures clean, maintainable code and access to a rich ecosystem of gems and libraries.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/spree/spree',
    ARRAY['ecommerce', 'developer_tools']::product_category[],
    ARRAY['ruby', 'rails', 'postgresql']::product_technology[],
    'BSD-3-Clause',
    'https://spreecommerce.org',
    '[{"question": "Modular Design", "answer": "Built as a collection of Ruby gems and Rails engines that can be used individually or together, allowing developers to include only the functionality they need"}, {"question": "API Capabilities", "answer": "Comprehensive REST API covering products, orders, customers, and all other aspects of the platform for headless commerce implementations"}, {"question": "Extension Ecosystem", "answer": "Rich marketplace of extensions for additional functionality including analytics, marketing tools, shipping integrations, and payment gateways"}, {"question": "Product Features", "answer": "Support for physical and digital products with variants, option types, properties, and customizable attributes for complex catalogs"}, {"question": "Order Management", "answer": "Complete order lifecycle handling with customizable states, returns processing, and split shipments"}, {"question": "Multi-Currency", "answer": "Support for selling in multiple currencies with configurable exchange rates and region-specific pricing"}, {"question": "Performance", "answer": "Optimized for speed with efficient database queries, caching strategies, and support for horizontal scaling"}, {"question": "Developer Experience", "answer": "Built on Ruby on Rails with clean, well-documented code, comprehensive test coverage, and active community support"}]',
    NOW(),
    NOW(),
    'approved'
),

-- DocuSeal
(
    'DocuSeal',
    'DocuSeal',
    'Open-source document signing platform',
    '<p><strong>DocuSeal</strong> is a comprehensive open-source platform for secure document signing and form completion. This powerful solution provides:</p>
    <ul>
        <li><strong>Digital Signatures:</strong> Collect legally binding electronic signatures on any document</li>
        <li><strong>Form Builder:</strong> Create interactive PDF forms with text fields, checkboxes, date pickers, and signature fields</li>
        <li><strong>Template Management:</strong> Save and reuse document templates for common workflows</li>
        <li><strong>Automated Workflows:</strong> Send documents for signature to multiple recipients in a specified order</li>
        <li><strong>Audit Trails:</strong> Maintain comprehensive logs of all document activities for compliance</li>
        <li><strong>Team Collaboration:</strong> Share templates and manage documents across departments</li>
        <li><strong>Secure Storage:</strong> Store completed documents with encryption and access controls</li>
        <li><strong>Customizable Branding:</strong> Personalize the signing experience with your company''s logo and colors</li>
    </ul>
    <p>DocuSeal streamlines document workflows while maintaining the highest standards of security and compliance. Its self-hosted architecture gives organizations complete control over sensitive documents and personal data, making it ideal for businesses with strict privacy requirements or regulatory constraints.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/docusealco/docuseal',
    ARRAY['business', 'productivity']::product_category[],
    ARRAY['ruby', 'rails', 'postgresql']::product_technology[],
    'AGPL-3.0',
    'https://docuseal.co',
    '[{"question": "Electronic Signatures", "answer": "Collect legally binding e-signatures compliant with ESIGN, UETA, and eIDAS regulations with support for drawing, typing, or uploading signature images"}, {"question": "Form Creation", "answer": "Build interactive forms with drag-and-drop editor supporting text fields, checkboxes, radio buttons, dropdowns, date pickers, file uploads, and signature fields"}, {"question": "Document Workflow", "answer": "Configure signing order, set reminders, add due dates, and create conditional logic for complex document processes"}, {"question": "Security Features", "answer": "Document encryption, access controls, two-factor authentication, and detailed audit logs for every action taken on a document"}, {"question": "Team Management", "answer": "Create user roles, departments, and permission levels to control access to templates and documents within your organization"}, {"question": "API Integration", "answer": "Connect with your existing systems through a comprehensive REST API for automated document generation and processing"}, {"question": "White Labeling", "answer": "Customize the signing experience with your company''s logo, colors, email templates, and custom domains"}, {"question": "Deployment Options", "answer": "Self-host on your own infrastructure with Docker for complete data control or use the cloud version for quick setup"}]',
    NOW(),
    NOW(),
    'approved'
),

-- Cal.com
(
    'Cal.com',
    'Cal',
    'Open-source scheduling infrastructure',
    '<p><strong>Cal.com</strong> is a flexible scheduling platform that simplifies appointment booking and time management for professionals and teams. This comprehensive solution offers:</p>
    <ul>
        <li><strong>Customizable Booking Pages:</strong> Create branded scheduling pages with your logo, colors, and custom domains</li>
        <li><strong>Calendar Integration:</strong> Sync seamlessly with Google, Outlook, Office 365, and other calendar providers</li>
        <li><strong>Team Scheduling:</strong> Coordinate availability across team members with round-robin and collective booking options</li>
        <li><strong>Video Conferencing:</strong> Automatically generate meeting links for Zoom, Google Meet, Microsoft Teams, and more</li>
        <li><strong>Workflow Automation:</strong> Send customized emails, SMS reminders, and follow-ups to reduce no-shows</li>
        <li><strong>Payment Collection:</strong> Accept payments and deposits during the booking process</li>
        <li><strong>Booking Forms:</strong> Collect information from attendees with custom intake forms</li>
        <li><strong>Availability Rules:</strong> Set buffer times, booking limits, and date range restrictions</li>
    </ul>
    <p>Cal.com provides the scheduling infrastructure for businesses of all sizes, from individual freelancers to large enterprises. With both cloud and self-hosted options, it offers unparalleled flexibility while respecting user privacy and data ownership.</p>',
    0,
    ARRAY[
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568357838/1741568357838-6deuxsfie5a.jpg',
        'https://xbwfjonmiddqfrgwdhmi.supabase.co/storage/v1/object/public/products/images/a7a4395b-9fe9-4927-aa2c-abcb44289c74/temp-1741568358078/1741568358078-lhemet2rgpn.jpg'
    ],
    'a7a4395b-9fe9-4927-aa2c-abcb44289c74',
    'https://github.com/calcom/cal.com',
    ARRAY['productivity', 'business']::product_category[],
    ARRAY['next_js', 'typescript', 'postgresql']::product_technology[],
    'AGPL-3.0',
    'https://cal.com',
    '[{"question": "Scheduling Options", "answer": "Create unlimited event types with customizable durations, availability windows, and booking limits for different meeting scenarios"}, {"question": "Calendar Integrations", "answer": "Two-way sync with Google Calendar, Outlook, Office 365, iCloud, and CalDAV providers to automatically prevent double-bookings"}, {"question": "Team Coordination", "answer": "Manage team availability with round-robin distribution, collective booking, and managed event types for organizations of any size"}, {"question": "Video Conferencing", "answer": "Automatic generation of meeting links for Zoom, Google Meet, Microsoft Teams, Jitsi, and Daily with custom conference options"}, {"question": "Customization", "answer": "Brand your booking experience with custom themes, logos, redirect pages, and email templates"}, {"question": "Workflows", "answer": "Create automated sequences with email reminders, SMS notifications, webhook triggers, and other actions"}, {"question": "Embeddability", "answer": "Embed booking widgets and inline calendars on your website with responsive designs"}, {"question": "Enterprise Features", "answer": "SSO authentication, audit logs, advanced analytics, and dedicated support for large organizations"}]',
    NOW(),
    NOW(),
    'approved'
); 
