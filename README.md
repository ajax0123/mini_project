# Next-Deployment Monorepo

A comprehensive Next.js-based web application monorepo for credit alternative solutions, featuring a React frontend, API server, and supporting libraries.

## Overview

This project is a production-ready monorepo built with modern web technologies, utilizing pnpm for package management and TypeScript for type safety. It includes a credit application frontend, backend API server, and shared libraries for seamless development.

## Features

- **Monorepo Structure**: Organized with pnpm workspaces for efficient dependency management
- **Frontend Application**: React-based credit application interface built with Vite
- **API Server**: Node.js/Express backend with TypeScript
- **Shared Libraries**: Reusable components and utilities across projects
- **Database Integration**: Drizzle ORM for database management
- **API Documentation**: OpenAPI specification with Orval for client generation
- **Development Tools**: Hot reloading, linting, and automated builds

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui components
- Zustand for state management

### Backend
- Node.js
- Express.js
- TypeScript
- Drizzle ORM
- PostgreSQL (assumed)

### Development Tools
- pnpm (package manager)
- TypeScript
- ESLint
- Prettier
- Vite (for frontend dev server)

### Libraries
- API Client: Custom fetch with React integration
- Validation: Zod schemas
- AI Integration: Anthropic AI client

## Project Structure

```
Next-Deployment/
├── artifacts/                    # Deployable applications
│   ├── api-server/              # Backend API server
│   │   ├── src/
│   │   │   ├── app.ts           # Express app setup
│   │   │   ├── index.ts         # Server entry point
│   │   │   ├── lib/logger.ts    # Logging utilities
│   │   │   ├── middlewares/     # Express middlewares
│   │   │   └── routes/          # API routes
│   │   │       ├── health.ts    # Health check endpoint
│   │   │       ├── index.ts     # Route index
│   │   │       └── creditalt/   # Credit application routes
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── build.mjs            # Build script
│   ├── creditalt/               # Frontend application
│   │   ├── src/
│   │   │   ├── App.tsx          # Main app component
│   │   │   ├── main.tsx         # App entry point
│   │   │   ├── components/      # React components
│   │   │   │   ├── ui/          # UI components (Shadcn)
│   │   │   │   ├── CountUp.tsx
│   │   │   │   ├── DocumentUploader.tsx
│   │   │   │   ├── FeatureImportanceChart.tsx
│   │   │   │   ├── LoanProductCard.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── RiskGauge.tsx
│   │   │   │   └── StepIndicator.tsx
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   ├── lib/             # Utilities and types
│   │   │   └── pages/           # Page components
│   │   ├── public/              # Static assets
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── components.json      # Shadcn config
│   └── mockup-sandbox/          # Development mockups
├── lib/                         # Shared libraries
│   ├── api-client-react/        # React API client
│   ├── api-spec/                # OpenAPI specification
│   ├── api-zod/                 # Zod validation schemas
│   ├── db/                      # Database schema and config
│   └── integrations-anthropic-ai/ # AI integration
├── scripts/                     # Utility scripts
│   ├── src/hello.ts             # Example script
│   └── post-merge.sh            # Git hook script
├── attached_assets/             # Project documentation
├── package.json                 # Root package.json
├── pnpm-lock.yaml               # Lockfile
├── pnpm-workspace.yaml          # Workspace config
├── tsconfig.base.json           # Base TypeScript config
└── tsconfig.json                # Root TypeScript config
```

## Installation

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- Git

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Next-Deployment
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` (if exists)
   - Configure database connection, API keys, etc.

## Usage

### Development

1. **Start the frontend development server:**
   ```bash
   cd artifacts/creditalt
   pnpm dev
   ```
   The app will be available at `http://localhost:5173`

2. **Start the API server:**
   ```bash
   cd artifacts/api-server
   pnpm dev
   ```
   The API will be available at `http://localhost:3000` (or configured port)

3. **Run all services (if configured):**
   ```bash
   pnpm dev
   ```

### Building

1. **Build the frontend:**
   ```bash
   cd artifacts/creditalt
   pnpm build
   ```

2. **Build the API server:**
   ```bash
   cd artifacts/api-server
   pnpm build
   ```

3. **Build all packages:**
   ```bash
   pnpm build
   ```

### Scripts

Available npm scripts (run from root or specific packages):

- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages
- `pnpm lint` - Run linting
- `pnpm test` - Run tests (if configured)
- `pnpm clean` - Clean build artifacts

## Development Workflow

### Adding New Features

1. Create feature branches from `main`
2. Follow the monorepo structure
3. Update relevant packages and dependencies
4. Test across all affected packages
5. Submit pull requests

### Code Quality

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write tests for new functionality
- Update documentation as needed

### Database

- Schema defined in `lib/db/src/schema/`
- Use Drizzle ORM for migrations
- Run migrations before starting the server

## API Documentation

- OpenAPI spec: `lib/api-spec/openapi.yaml`
- Generated clients: `lib/api-client-react/src/generated/`
- Zod schemas: `lib/api-zod/src/generated/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add license information here]

## Support

For questions or issues, please create an issue in the repository or contact the development team.