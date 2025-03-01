# Developer Marketplace

A marketplace platform for developers to buy and sell code, templates, and digital products.

## Features

- 🛒 Buy and sell developer products, templates, and code
- 💳 Integrated payment processing with Stripe
- 🔐 Authentication with Supabase and GitHub OAuth
- 📊 Product listings with categories and technology tags
- 👍 Like and purchase tracking
- 📈 Trending products algorithm
- 🧑‍💻 Seller dashboard and onboarding
- 📱 Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with GitHub OAuth
- **Payments**: Stripe
- **Hosting**: Vercel
- **Database**: PostgreSQL (via Supabase)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Stripe account
- GitHub OAuth application

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/developer-marketplace.git
   cd developer-marketplace
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in the required values (see Environment Variables section below)

4. Set up the database:
   - Create a new Supabase project
   - Run the SQL from `db/schema.sql` in the Supabase SQL editor

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Transaction Configuration
TRANSACTION_FEE_PERCENTAGE=10

# GitHub OAuth
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_app_secret
```

### Setting Up Services

#### Supabase Setup

1. Create a new Supabase project
2. Run the SQL from `db/schema.sql` in the SQL editor
3. Set up authentication providers (GitHub)
4. Copy your project URL and anon key to the `.env.local` file

#### Stripe Setup

1. Create a Stripe account
2. Get your API keys from the Stripe dashboard
3. Set up a webhook endpoint (your-domain.com/api/webhooks/stripe)
4. Copy the webhook signing secret to your `.env.local` file

#### GitHub OAuth Setup

1. Create a new OAuth application in GitHub Developer Settings
2. Set the callback URL to `your-domain.com/api/auth/callback/github`
3. Copy the Client ID and Client Secret to your `.env.local` file

## Database Schema

The application uses the following main tables:

- `profiles`: User profiles linked to Supabase Auth
- `products`: Product listings with details and metadata
- `purchases`: Record of product purchases
- `likes`: User likes on products
- `seller_accounts`: Seller-specific information including Stripe Connect accounts
- `repository_access`: Access control for GitHub repositories
- `reports`: User reports for products
- `feedback`: User feedback for the platform

## Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Set up the environment variables
4. Deploy

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Supabase](https://supabase.io/) for the backend and authentication
- [Stripe](https://stripe.com/) for payment processing
- [Next.js](https://nextjs.org/) for the frontend framework
- [Vercel](https://vercel.com/) for hosting 