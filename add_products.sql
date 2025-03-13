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
    updated_at
) VALUES 
-- AppFlowy
(
    'AppFlowy',
    'appflowy',
    'Open-source alternative to Notion with native cross-platform support',
    '<p><strong>AppFlowy</strong> is an open-source productivity tool that combines <em>note-taking</em>, <em>task management</em>, and <em>database organization</em>. Built with Flutter and Rust, it offers:</p>
    <ul>
        <li>Native desktop and mobile apps</li>
        <li>End-to-end encryption</li>
        <li>Customizable workspace templates</li>
        <li>Real-time collaboration</li>
    </ul>',
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
    '[{"question": "Cross-Platform Sync", "answer": "Access your workspace from any device with real-time synchronization"}, {"question": "Collaboration", "answer": "Work simultaneously with team members in shared documents"}, {"question": "Security", "answer": "End-to-end encryption for all your data"}]',
    NOW(),
    NOW()
),

-- Plane
(
    'Plane',
    'plane-project-management',
    'Open-source project management tool for agile teams',
    '<p><strong>Plane</strong> helps teams manage projects with:</p>
    <ul>
        <li>Kanban boards and Gantt charts</li>
        <li>Issue tracking and sprints</li>
        <li>GitHub/GitLab integrations</li>
        <li>Customizable workflows</li>
    </ul>',
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
    '[{"question": "Agile Workflows", "answer": "Support for Scrum and Kanban methodologies"}, {"question": "Issue Tracking", "answer": "Advanced bug and task tracking system"}, {"question": "Integrations", "answer": "Native integration with GitHub and GitLab"}]',
    NOW(),
    NOW()
),

-- NocoDB
(
    'NocoDB',
    'nocodb-airtable-alternative',
    'Open-source Airtable alternative with database connectivity',
    '<p><strong>NocoDB</strong> transforms databases into smart spreadsheets with:</p>
    <ul>
        <li>SQL database connectivity</li>
        <li>Collaborative spreadsheet interface</li>
        <li>API automation capabilities</li>
        <li>Role-based access control</li>
    </ul>',
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
    '[{"question": "Database Connectivity", "answer": "Connect to MySQL, PostgreSQL, SQL Server"}, {"question": "Collaboration", "answer": "Real-time multi-user editing"}, {"question": "API Generation", "answer": "Automatically generate REST APIs"}]',
    NOW(),
    NOW()
),

-- Coolify
(
    'Coolify',
    'coolify-heroku-alternative',
    'Self-hostable PaaS alternative to Heroku/Netlify',
    '<p><strong>Coolify</strong> provides:</p>
    <ul>
        <li>Application deployment automation</li>
        <li>Database hosting</li>
        <li>Git-based deployments</li>
        <li>SSL certificate management</li>
        <li>Resource monitoring</li>
    </ul>',
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
    '[{"question": "Deployment", "answer": "One-click app deployments"}, {"question": "Git Integration", "answer": "Automatic Git-based workflows"}, {"question": "Monitoring", "answer": "Real-time resource tracking"}]',
    NOW(),
    NOW()
),

-- Supabase
(
    'Supabase',
    'supabase-firebase-alternative',
    'Open-source Firebase alternative with PostgreSQL',
    '<p><strong>Supabase</strong> provides a complete backend solution with:</p>
    <ul>
        <li>Real-time PostgreSQL database</li>
        <li>Authentication and authorization</li>
        <li>Auto-generated REST APIs</li>
        <li>File storage and CDN</li>
        <li>Edge functions</li>
    </ul>',
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
    '[{"question": "Realtime DB", "answer": "PostgreSQL with realtime updates"}, {"question": "Auth", "answer": "Built-in authentication system"}, {"question": "Storage", "answer": "File storage with CDN"}]',
    NOW(),
    NOW()
),

-- Appwrite
(
    'Appwrite',
    'appwrite-backend-server',
    'Open-source backend server for web/mobile apps',
    '<p><strong>Appwrite</strong> offers backend services including:</p>
    <ul>
        <li>User authentication</li>
        <li>Database and storage APIs</li>
        <li>Cloud functions</li>
        <li>Localization support</li>
        <li>Webhooks and integrations</li>
    </ul>',
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
    '[{"question": "Auth System", "answer": "Multiple authentication methods"}, {"question": "Database", "answer": "NoSQL database with advanced queries"}, {"question": "Functions", "answer": "Serverless cloud functions"}]',
    NOW(),
    NOW()
),

-- Prestashop
(
    'Prestashop',
    'prestashop-ecommerce',
    'Open-source e-commerce platform',
    '<p><strong>PrestaShop</strong> powers online stores with:</p>
    <ul>
        <li>Product catalog management</li>
        <li>Payment gateway integrations</li>
        <li>Shipping and tax calculators</li>
        <li>Marketing and SEO tools</li>
        <li>Multi-store management</li>
    </ul>',
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
    '[{"question": "Catalog", "answer": "Advanced product management"}, {"question": "Payments", "answer": "100+ payment gateways"}, {"question": "SEO", "answer": "Built-in optimization tools"}]',
    NOW(),
    NOW()
),

-- Mattermost
(
    'Mattermost',
    'mattermost-slack-alternative',
    'Open-source Slack alternative for team collaboration',
    '<p><strong>Mattermost</strong> provides secure team messaging with:</p>
    <ul>
        <li>Channel-based communication</li>
        <li>File sharing and search</li>
        <li>Video conferencing</li>
        <li>DevOps tool integrations</li>
        <li>Self-hostable deployment</li>
    </ul>',
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
    '[{"question": "Team Chat", "answer": "Channel-based messaging with threads"}, {"question": "File Sharing", "answer": "Secure document sharing with search"}, {"question": "Integrations", "answer": "CI/CD pipeline integrations"}]',
    NOW(),
    NOW()
),

-- ERPNext
(
    'ERPNext',
    'erpnext-business-management',
    'Open-source ERP for business operations',
    '<p><strong>ERPNext</strong> integrates business processes including:</p>
    <ul>
        <li>Accounting and inventory</li>
        <li>CRM and HR management</li>
        <li>Manufacturing and projects</li>
        <li>E-commerce integration</li>
        <li>Customizable reporting</li>
    </ul>',
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
    '[{"question": "Accounting", "answer": "Full financial management system"}, {"question": "Inventory", "answer": "Multi-warehouse tracking"}, {"question": "Manufacturing", "answer": "Production planning tools"}]',
    NOW(),
    NOW()
),

-- ToolJet
(
    'ToolJet',
    'tooljet-low-code-platform',
    'Open-source low-code platform for internal tools',
    '<p><strong>ToolJet</strong> enables building internal tools with:</p>
    <ul>
        <li>Database connectors (PostgreSQL, MySQL, etc)</li>
        <li>API and GraphQL integrations</li>
        <li>Customizable dashboards</li>
        <li>Role-based access control</li>
        <li>Multi-app management</li>
    </ul>',
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
    '[{"question": "Connectors", "answer": "Connect to databases and APIs"}, {"question": "Dashboards", "answer": "Customizable data visualizations"}, {"question": "Security", "answer": "Role-based access control"}]',
    NOW(),
    NOW()
),

-- Directus
(
    'Directus',
    'directus-headless-cms',
    'Open-source headless CMS for any SQL database',
    '<p><strong>Directus</strong> provides:</p>
    <ul>
        <li>Database abstraction layer</li>
        <li>REST and GraphQL APIs</li>
        <li>Role-based permissions</li>
        <li>File asset management</li>
        <li>Custom data models</li>
    </ul>',
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
    '[{"question": "Database Mirroring", "answer": "Mirror existing SQL databases"}, {"question": "API Options", "answer": "REST and GraphQL support"}, {"question": "Permissions", "answer": "Granular access control"}]',
    NOW(),
    NOW()
),

-- n8n
(
    'n8n',
    'n8n-workflow-automation',
    'Open-source workflow automation platform',
    '<p><strong>n8n</strong> enables workflow automation with:</p>
    <ul>
        <li>300+ app integrations</li>
        <li>Visual workflow builder</li>
        <li>Self-hostable architecture</li>
        <li>Error handling and debugging</li>
        <li>Custom code execution</li>
    </ul>',
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
    '[{"question": "Integrations", "answer": "300+ app connections"}, {"question": "Workflows", "answer": "Visual pipeline builder"}, {"question": "Self-Hosting", "answer": "Full control over data"}]',
    NOW(),
    NOW()
),

-- Plausible Analytics
(
    'Plausible Analytics',
    'plausible-web-analytics',
    'Privacy-focused open-source web analytics',
    '<p><strong>Plausible</strong> offers:</p>
    <ul>
        <li>Lightweight script (1.4KB)</li>
        <li>No cookie banners required</li>
        <li>GDPR/CCPA compliant</li>
        <li>Real-time dashboard</li>
        <li>Goal conversions tracking</li>
    </ul>',
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
    '[{"question": "Privacy", "answer": "No cookies or personal data collection"}, {"question": "Lightweight", "answer": "1.4KB tracking script"}, {"question": "Compliance", "answer": "GDPR/CCPA ready"}]',
    NOW(),
    NOW()
),

-- Umami
(
    'Umami',
    'umami-web-analytics',
    'Simple, privacy-focused web analytics',
    '<p><strong>Umami</strong> features:</p>
    <ul>
        <li>Lightweight tracking script</li>
        <li>Multi-website support</li>
        <li>Custom event tracking</li>
        <li>Data export capabilities</li>
        <li>Self-hostable deployment</li>
    </ul>',
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
    '[{"question": "Multi-Site", "answer": "Track unlimited websites"}, {"question": "Events", "answer": "Custom event tracking"}, {"question": "Export", "answer": "CSV data exports"}]',
    NOW(),
    NOW()
),

-- Medusa
(
    'Medusa',
    'medusa-ecommerce',
    'Open-source headless commerce platform',
    '<p><strong>Medusa</strong> provides:</p>
    <ul>
        <li>Headless commerce architecture</li>
        <li>Customizable storefronts</li>
        <li>Order management system</li>
        <li>Payment processor integrations</li>
        <li>Plugin ecosystem</li>
    </ul>',
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
    '[{"question": "Headless", "answer": "Decoupled frontend/backend"}, {"question": "Payments", "answer": "Multiple payment providers"}, {"question": "Plugins", "answer": "Extendable ecosystem"}]',
    NOW(),
    NOW()
),

-- Saleor
(
    'Saleor',
    'saleor-ecommerce',
    'Headless e-commerce platform with GraphQL',
    '<p><strong>Saleor</strong> features:</p>
    <ul>
        <li>GraphQL-first architecture</li>
        <li>Multi-channel sales</li>
        <li>Checkout customization</li>
        <li>Tax and payment plugins</li>
        <li>Cloud deployment options</li>
    </ul>',
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
    '[{"question": "GraphQL API", "answer": "Modern API-first approach"}, {"question": "Checkout", "answer": "Customizable checkout flow"}, {"question": "Cloud", "answer": "Managed hosting option"}]',
    NOW(),
    NOW()
),

-- Strapi
(
    'Strapi',
    'strapi-headless-cms',
    'Open-source headless CMS for modern applications',
    '<p><strong>Strapi</strong> offers:</p>
    <ul>
        <li>Custom content types</li>
        <li>REST & GraphQL APIs</li>
        <li>Plugin ecosystem</li>
        <li>Role-based permissions</li>
        <li>Database-agnostic architecture</li>
    </ul>',
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
    '[{"question": "Content Types", "answer": "Customizable content models"}, {"question": "APIs", "answer": "REST & GraphQL support"}, {"question": "Plugins", "answer": "Extensible ecosystem"}]',
    NOW(),
    NOW()
),

-- Ghost
(
    'Ghost',
    'ghost-publishing',
    'Professional publishing platform for creators',
    '<p><strong>Ghost</strong> provides:</p>
    <ul>
        <li>Modern editor experience</li>
        <li>Membership & subscriptions</li>
        <li>SEO optimization tools</li>
        <li>Newsletter management</li>
        <li>Custom themes and integrations</li>
    </ul>',
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
    '[{"question": "Memberships", "answer": "Paid subscription support"}, {"question": "SEO", "answer": "Built-in optimization tools"}, {"question": "Newsletters", "answer": "Email campaign management"}]',
    NOW(),
    NOW()
),

-- Rocket.Chat
(
    'Rocket.Chat',
    'rocketchat-collaboration',
    'Open-source team communication platform',
    '<p><strong>Rocket.Chat</strong> features:</p>
    <ul>
        <li>Team messaging and video calls</li>
        <li>Omnichannel customer service</li>
        <li>Marketplace for integrations</li>
        <li>End-to-end encryption</li>
        <li>Self-hostable deployment</li>
    </ul>',
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
    '[{"question": "Messaging", "answer": "Real-time team communication"}, {"question": "Video Calls", "answer": "Built-in conferencing"}, {"question": "Security", "answer": "End-to-end encryption"}]',
    NOW(),
    NOW()
),

-- Odoo
(
    'Odoo',
    'odoo-erp',
    'Comprehensive open-source business management suite',
    '<p><strong>Odoo</strong> includes modules for:</p>
    <ul>
        <li>CRM and sales</li>
        <li>Accounting and inventory</li>
        <li>Manufacturing and project management</li>
        <li>Human resources</li>
        <li>E-commerce and website builder</li>
    </ul>',
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
    '[{"question": "CRM", "answer": "Customer relationship management"}, {"question": "Accounting", "answer": "Full financial suite"}, {"question": "Manufacturing", "answer": "Production planning tools"}]',
    NOW(),
    NOW()
),

-- Spree Commerce
(
    'Spree Commerce',
    'spree-ecommerce',
    'Ruby on Rails e-commerce platform',
    '<p><strong>Spree Commerce</strong> offers:</p>
    <ul>
        <li>Modular architecture</li>
        <li>Multi-store management</li>
        <li>API-first design</li>
        <li>Tax and shipping calculators</li>
        <li>Customizable storefronts</li>
    </ul>',
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
    '[{"question": "Modular", "answer": "Add/remove features as needed"}, {"question": "API-first", "answer": "Headless commerce ready"}, {"question": "Customization", "answer": "Flexible theming system"}]',
    NOW(),
    NOW()
),

-- DocuSeal
(
    'DocuSeal',
    'docuseal-document-signing',
    'Open-source document signing platform',
    '<p><strong>DocuSeal</strong> provides:</p>
    <ul>
        <li>PDF form filling and signing</li>
        <li>Template management</li>
        <li>Audit trails</li>
        <li>Team collaboration</li>
        <li>Self-hostable deployment</li>
    </ul>',
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
    '[{"question": "Templates", "answer": "Reusable document templates"}, {"question": "Audit Trail", "answer": "Complete signing history"}, {"question": "Security", "answer": "Encrypted document handling"}]',
    NOW(),
    NOW()
),

-- Cal.com
(
    'Cal.com',
    'cal-scheduling',
    'Open-source scheduling infrastructure',
    '<p><strong>Cal.com</strong> features:</p>
    <ul>
        <li>Customizable booking pages</li>
        <li>Calendar integrations</li>
        <li>Team scheduling</li>
        <li>Video conferencing</li>
        <li>Workflow automations</li>
    </ul>',
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
    '[{"question": "Scheduling", "answer": "Flexible event types"}, {"question": "Integrations", "answer": "Google/Outlook calendar sync"}, {"question": "Team", "answer": "Group scheduling features"}]',
    NOW(),
    NOW()
); 