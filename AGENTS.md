# AGENTS.md

## Project Overview

**page-with-crud** is a Next.js 16 web application with authentication powered by Supabase. It uses the App Router pattern with Server Actions, React 19, Tailwind CSS v4, and shadcn/ui components. The project is a single-package TypeScript application (not a monorepo).

### Key Technologies

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| Framework      | Next.js 16.2.3 (App Router)                         |
| UI Library     | React 19.2.4                                        |
| Language       | TypeScript 5                                        |
| Styling        | Tailwind CSS v4 (via PostCSS), tw-animate-css       |
| Component Kit  | shadcn/ui (radix-vega style), Radix UI, Lucide icons |
| Forms          | react-hook-form + @hookform/resolvers + Zod         |
| Auth/Backend   | Supabase (@supabase/supabase-js, @supabase/ssr)     |
| Notifications  | react-hot-toast                                     |
| Package Manager| npm                                                 |

> **Important:** This project uses **Next.js 16**, which has breaking changes from earlier versions. Always read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Setup Commands

```bash
# Install dependencies
npm install

# Create a .env.local file with your Supabase credentials
# Required environment variables:
#   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
#   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>

# Start the development server
npm run dev

# Build for production
npm run build

# Start the production server
npm run start

# Run the linter
npm run lint
```

## Environment Variables

The app requires two Supabase environment variables. Create a `.env.local` file at the root:

| Variable                               | Description                      |
| -------------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL             |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous/public key    |

These are used in `lib/supabase/client.ts`, `lib/supabase/server.ts`, and `lib/supabase/proxy.ts`.

## Project Structure

```
├── app/                    # Next.js App Router (pages, layouts, global CSS)
│   ├── layout.tsx          # Root layout (dark mode, fonts, Toaster)
│   ├── page.tsx            # Home page
│   ├── globals.css         # Tailwind v4 imports, theme variables (light/dark)
│   └── login/
│       ├── layout.tsx      # Auth layout wrapper
│       └── page.tsx        # Login page (renders AuthForm)
├── actions/
│   └── auth/
│       └── auth.ts         # Server Actions: login(), signup()
├── components/
│   ├── auth/               # Auth UI components
│   │   ├── AuthForm.tsx    # Auth form wrapper (sign-in / sign-up toggle)
│   │   ├── SignInForm.tsx
│   │   ├── SignUpForm.tsx
│   │   └── RecoverPasswordForm.tsx
│   └── ui/                 # shadcn/ui primitives
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── field.tsx
│       └── separator.tsx
├── lib/
│   ├── utils.ts            # cn() helper (clsx + tailwind-merge)
│   └── supabase/
│       ├── client.ts       # Browser-side Supabase client
│       ├── server.ts       # Server-side Supabase client (uses cookies)
│       └── proxy.ts        # Session refresh logic for middleware/proxy
├── public/                 # Static assets (SVGs)
├── proxy.ts                # Root proxy/middleware (session refresh matcher)
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript config (strict, @/* path alias)
├── eslint.config.mjs       # ESLint flat config (core-web-vitals + typescript)
├── postcss.config.mjs      # PostCSS with @tailwindcss/postcss
├── components.json         # shadcn/ui CLI configuration
└── package.json
```

## Architecture Patterns

### Path Alias

The project uses `@/*` as an alias to the repository root. Always import using this alias:

```typescript
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
```

### Server Actions

Backend logic lives in the `actions/` directory using Next.js Server Actions (`'use server'` directive). Auth actions return `{ success, error?, message?, data? }` objects.

### Supabase Client Pattern

Three Supabase client factories are used depending on context:

- `lib/supabase/client.ts` — Browser-side client (use in Client Components)
- `lib/supabase/server.ts` — Server-side client (use in Server Components and Server Actions; manages cookies)
- `lib/supabase/proxy.ts` — Session refresh in middleware/proxy (called from `proxy.ts`)

### UI Components

- **shadcn/ui** components live in `components/ui/` using the `radix-vega` style with CSS variables and the `neutral` base color.
- Add new components via `npx shadcn@latest add <component>`.
- The `cn()` utility from `lib/utils.ts` merges Tailwind classes.

### Theme

- The app defaults to **dark mode** (class `dark` is set on the `<html>` element in `app/layout.tsx`).
- Theme tokens are defined as CSS custom properties in `app/globals.css` using oklch colors with both `:root` (light) and `.dark` (dark) variants.

### Form Handling

Forms use **react-hook-form** with **Zod** schemas for validation and **@hookform/resolvers** to connect them. Toast notifications are displayed via **react-hot-toast**.

## Code Style

### Linting

ESLint is configured with the Next.js flat config preset:

- `eslint-config-next/core-web-vitals`
- `eslint-config-next/typescript`

Run the linter:

```bash
npm run lint
```

### Conventions

- Use TypeScript for all files (`.ts` / `.tsx`)
- Use functional components with arrow functions or `function` declarations
- Use Server Components by default; add `'use client'` only when needed
- Use Server Actions in the `actions/` directory with `'use server'` directive
- Prefer the `@/*` import alias over relative paths
- CSS: use Tailwind utility classes; avoid inline styles
- No Prettier is configured — follow existing formatting patterns in the codebase

## Testing

No testing framework is currently configured. When adding tests:

- Consider Vitest for unit/integration tests
- Consider Playwright for E2E tests
- Place test files alongside the source with `.test.ts` / `.test.tsx` suffix

## Build and Deployment

```bash
# Production build
npm run build

# Start production server
npm run start
```

- The project is designed for deployment on **Vercel** (Next.js default platform)
- Build output is generated in the `.next/` directory
- No Docker or CI/CD configuration is present in the repository

## Debugging Tips

- Supabase auth issues: check that `.env.local` has valid credentials and the proxy in `proxy.ts` is correctly refreshing sessions via `supabase.auth.getClaims()`
- If users are randomly logged out, ensure no code runs between `createServerClient()` and `supabase.auth.getClaims()` in `lib/supabase/proxy.ts`
- Dark mode rendering issues: the `dark` class is applied at the `<html>` level in `app/layout.tsx`
- Component styling: shadcn/ui uses CSS variables defined in `app/globals.css` — check both `:root` and `.dark` selectors

## Additional Notes

- The `proxy.ts` at root acts as Next.js middleware, matching all routes except static files. It refreshes the Supabase auth session on every request.
- The project name suggests CRUD functionality is planned but the current codebase focuses on authentication flows.
- Font stack: Inter (primary sans), Geist Sans, and Geist Mono are loaded via `next/font/google`.
