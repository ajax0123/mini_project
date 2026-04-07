# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the CreditAlt AI-powered alternative credit scoring web application.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI Integration**: Anthropic Claude via Replit AI Integrations proxy

## CreditAlt Application

### What It Does
CreditAlt is an AI-powered credit scoring platform that analyzes alternative financial data — UPI transactions, utility bills, rent payments, subscriptions, and employment history — to assess creditworthiness without requiring a traditional CIBIL credit score.

### Key Features
- **AI Document Scanning**: Uses Claude Sonnet to analyze uploaded bank statements, pay slips, utility bills, and more
- **Multi-Step Application**: 4-step form (Document Upload → Financial Profile → Behavioral Signals → Review & Submit)
- **Live Risk Gauge**: Real-time risk score that updates as users fill their profile
- **Results Dashboard**: Eligible loan amount, risk analysis, feature importance chart, and personalized loan offers
- **Indian Locale**: All monetary values formatted in Indian numbering system (₹1,23,456)

### Frontend (artifacts/creditalt)
- React + Vite, Tailwind CSS only (no Framer Motion, no inline styles)
- Custom color tokens: navy (#0A1628), emerald (#10B981), amber (#F59E0B)
- Custom animations: fade-up, slide-left, slide-right, scan-line, pulse-green
- Pages: LandingPage, ApplyPage, ResultsPage, HowItWorksPage
- Components: Navbar, StepIndicator, DocumentUploader, RiskGauge, FeatureImportanceChart, LoanProductCard, CountUp

### Backend (artifacts/api-server)
- Express 5 API server
- `/api/creditalt/scan-document` — multipart upload, Claude AI scanning with `@workspace/integrations-anthropic-ai`
- `/api/creditalt/score` — deterministic credit risk scoring algorithm

### AI Integration
- Uses Replit AI Integrations for Anthropic (no user API key required)
- Model: claude-sonnet-4-6
- Env vars: AI_INTEGRATIONS_ANTHROPIC_BASE_URL, AI_INTEGRATIONS_ANTHROPIC_API_KEY (auto-managed)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
