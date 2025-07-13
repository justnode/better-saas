# Better SaaS

A modern, full-stack SaaS application built with Next.js 15, featuring authentication, payments, file management, and internationalization with comprehensive testing suite.

## 🚀 Features

- **🔐 Authentication**: Email/password and social login (GitHub, Google) with Better Auth
- **💳 Payments**: Stripe integration with subscription management and billing dashboard
- **📁 File Management**: Upload, preview, and manage files with AWS S3/R2 storage
- **🌍 Internationalization**: Multi-language support (English/Chinese) with next-intl
- **📱 Responsive Design**: Modern UI with Radix UI and Tailwind CSS v4
- **📖 Documentation**: Built-in documentation system with Fumadocs
- **🔒 Protected Routes**: Role-based access control and route protection
- **👥 Admin Dashboard**: User management and system administration
- **⚡ Performance**: Optimized with Next.js 15 App Router and Turbo mode
- **🧪 Testing**: Comprehensive testing suite with Jest, Playwright, and integration tests

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **UI Components**: Radix UI + Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: SWR
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

### Backend

- **Runtime**: Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **Payments**: Stripe
- **File Storage**: AWS S3/Cloudflare R2
- **Validation**: Zod

### Development & Testing

- **Language**: TypeScript
- **Package Manager**: pnpm
- **Code Quality**: Biome (formatting, linting)
- **Environment**: @t3-oss/env-nextjs
- **Unit Testing**: Jest with React Testing Library
- **Integration Testing**: Jest with database integration
- **E2E Testing**: Playwright with multi-browser support
- **Test Coverage**: Comprehensive coverage reporting

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   │   ├── (home)/        # Public pages (home, blog, blocks)
│   │   ├── (protected)/   # Protected dashboard pages
│   │   ├── docs/          # Documentation
│   │   ├── login/         # Authentication pages
│   │   └── signup/        # Registration pages
│   └── api/               # API routes
│       ├── auth/          # Authentication endpoints
│       └── webhooks/      # Webhook handlers (Stripe)
├── components/            # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── blocks/            # Page sections (hero, features, pricing)
│   ├── dashboard/         # Dashboard components
│   ├── file-manager/      # File management components
│   ├── payment/           # Payment and billing components
│   ├── settings/          # User settings components
│   └── ui/                # Base UI components (Radix UI)
├── lib/                   # Utility libraries
│   ├── auth/              # Authentication config (Better Auth)
│   ├── fumadocs/          # Documentation generation
│   ├── logger/            # Logging utilities
│   └── utils.ts           # Helper functions
├── server/                # Server-side code
│   ├── actions/           # Server actions
│   │   ├── auth-actions.ts
│   │   ├── file-actions.ts
│   │   └── payment/       # Payment-related actions
│   └── db/                # Database layer
│       ├── repositories/  # Data access layer
│       ├── services/      # Business logic
│       └── schema.ts      # Database schema
├── config/                # Configuration files
│   ├── app.config.ts      # App configuration
│   ├── features.config.ts # Feature flags
│   ├── i18n.config.ts     # Internationalization
│   └── payment.config.ts  # Payment configuration
├── content/               # Content management
│   ├── blog/              # Blog posts (MDX)
│   └── docs/              # Documentation (MDX)
├── i18n/                  # Internationalization
│   ├── messages/          # Translation files
│   └── navigation.ts      # Localized routing
├── hooks/                 # Custom React hooks
├── payment/               # Payment integration
│   └── stripe/            # Stripe client and provider
├── store/                 # State management (Zustand)
└── types/                 # TypeScript definitions
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database
- Stripe account (for payments)
- AWS S3 or Cloudflare R2 (for file storage)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd better-saas
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   ```

   Fill in the required environment variables:

   - `DATABASE_URL`: PostgreSQL connection string
   - `BETTER_AUTH_SECRET`: Random secret for authentication
   - `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: GitHub OAuth app credentials
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth app credentials
   - `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`: Stripe API keys
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
   - `NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY` & `NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY`: Stripe price IDs
   - `R2_*`: Cloudflare R2 or AWS S3 configuration
   - `NEXT_PUBLIC_APP_URL`: Your app's URL
   - `ADMIN_EMAILS`: Comma-separated list of admin email addresses

4. **Set up the database**

   ```bash
   pnpm db:push
   ```

5. **Start the development server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.


## 📋 Available Scripts

### Development

- `pnpm dev` - Start development server with Turbo mode
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm preview` - Build and start production server

### Code Quality

- `pnpm check` - Run Biome checks
- `pnpm check:write` - Fix Biome issues
- `pnpm check:unsafe` - Fix Biome issues with unsafe fixes
- `pnpm typecheck` - Run TypeScript checks

### Database

- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio

### Testing

- `pnpm test` - Run all Jest tests
- `pnpm test:unit` - Run unit tests only
- `pnpm test:integration` - Run integration tests only
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm test:e2e` - Run Playwright E2E tests
- `pnpm test:e2e:ui` - Run E2E tests with UI mode
- `pnpm test:e2e:headed` - Run E2E tests with browser visible
- `pnpm test:all` - Run all tests (unit, integration, and E2E)

### Admin

- `pnpm admin:setup` - Set up admin user account

## 🏗️ Architecture

### Authentication Flow

- Uses Better Auth for secure authentication
- Supports multiple providers (email/password, GitHub, Google)
- Session management with database persistence
- Role-based access control with admin permissions

### Database Design

- **Users**: User profiles and authentication data
- **Sessions**: Active user sessions
- **Files**: File metadata and storage references
- **Payments**: Stripe subscription and payment data
- **Payment Events**: Webhook event tracking

### File Management

- Secure file uploads with validation
- Image processing and thumbnail generation
- Cloud storage integration (S3/R2)
- File access control and permissions
- Support for multiple file types with size limits

### Payment System

- Stripe integration for subscriptions
- Webhook handling for payment events
- Subscription lifecycle management
- Billing dashboard and controls
- Multiple pricing plans with feature limits

### Testing Architecture

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Full user workflows with Playwright
- **Test Coverage**: Comprehensive coverage reporting with thresholds

## 🌍 Internationalization

The application supports multiple languages:

- English (default)
- Chinese (Simplified)

Language files are located in `src/i18n/messages/`.

## 🧪 Testing

The project includes a comprehensive testing suite covering multiple levels:

### Test Structure

```
tests/
├── unit/                   # Unit tests
│   ├── components/         # Component tests
│   ├── hooks/              # Custom hook tests
│   ├── lib/                # Utility function tests
│   └── server/             # Server-side logic tests
├── integration/            # Integration tests
│   ├── api/                # API endpoint tests
│   ├── database/           # Database operation tests
│   └── services/           # Service layer tests
└── e2e/                    # End-to-end tests
    ├── auth/               # Authentication flows
    ├── dashboard/          # Dashboard functionality
    ├── admin/              # Admin features
    ├── payment/            # Payment workflows
    └── settings/           # User settings
```

### Test Coverage

- **Unit Tests**: 85%+ line coverage for critical components
- **Integration Tests**: API endpoints, database operations, and service workflows
- **E2E Tests**: Complete user journeys across all major features
- **Coverage Thresholds**: Enforced minimums for branches, functions, lines, and statements

### Testing Features

- **Multi-browser E2E**: Chromium, Firefox, and Safari support
- **Visual Testing**: Screenshot comparison for UI consistency
- **Database Testing**: Real database integration with cleanup
- **Mock Services**: Comprehensive mocking for external APIs
- **Parallel Execution**: Fast test runs with parallel processing

### Running Tests

```bash
# Run all tests
pnpm test:all

# Run specific test suites
pnpm test:unit
pnpm test:integration
pnpm test:e2e

# Run with coverage
pnpm test:coverage

# Debug E2E tests
pnpm test:e2e:headed
pnpm test:e2e:ui
```

## 📖 Documentation

Built-in documentation is available at `/docs` and includes:

- Architecture overview
- Installation guide
- API documentation
- Component library
- Testing guide

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment

```bash
pnpm build
pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for new features
5. Run tests and quality checks:
   ```bash
   pnpm test:all
   pnpm check
   pnpm typecheck
   ```
6. Ensure all tests pass and coverage thresholds are met
7. Submit a pull request

### Code Quality Standards

- All code must pass Biome linting and formatting
- TypeScript strict mode compliance required
- Minimum test coverage: 85% for critical components
- All E2E tests must pass for core user flows

## 📄 License

This project is licensed under the MIT License.
