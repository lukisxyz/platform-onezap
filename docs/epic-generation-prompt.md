# Epic Generation Prompt for LLM

## Project Overview

Generate an epic for **OneZap**, a content creator platform that implements "Lossless Subscription" - a unique model where subscribers never actually purchase subscriptions.

## Core Epic: Registration & Authentication Flow

### Epic Requirements

Build the complete registration and authentication flow with these components:

#### 1. Landing Page (`/`)
- Hero section introducing OneZap
- Explain "Lossless Subscription" value proposition
- "Get Started" CTA button → navigates to `/dashboard`
- Use shadcn/ui components exclusively

#### 2. Dashboard (Protected) (`/dashboard`)
- **Authentication**: Protected with better-auth session check
  - If not authenticated → redirect to `/signin`
  - If authenticated → show dashboard
- **Content List**: Table format with:
  - Content Title
  - Content Preview
  - Actions column: Edit + Delete buttons
- **"Create Content" button** → navigates to `/dashboard/content/{new-id}`

#### 3. Sign In Page (`/signin`)
**Two-step process:**

**Step 1 - Wallet Connection (wagmi):**
- Connect wallet button
- Show connected network
- Show wallet address

**Step 2 - SIWE Authentication:**
- Display: "User understands ToS of this platform and agrees to sign in or register to this platform"
- "Sign In" button (SIWE via better-auth SIWE plugin)
- After auth → redirect to `/dashboard`

#### 4. Content Creation Page (`/dashboard/content/{id}`)
- Empty placeholder for now (focus on dashboard first)

#### 5. API Structure
- **Pattern**: Flat structure, NO nested folders in routes/
  - API routes: `api.content.$id.update.ts`, `api.content.list.ts`, etc.
  - Dashboard routes: `dashboard.content.$id.tsx`, etc.
- ALL API calls use TanStack Query
- **Database**: Use Drizzle ORM for all database operations (NO MOCKING)

**Database Implementation Required:**
- Define schemas using Drizzle ORM
- Create migrations for content and user tables
- Implement actual database queries (no mock data)
- Integrate with better-auth for user data persistence

## Architecture Rules (MANDATORY)

### Knowledge Base References
Before any implementation, consult:
- `/docs/knowledge-base.md` - All LLM sources
- `/docs/adr/0001-project-architecture.md` - Architecture decisions

### Mandatory Implementation Rules

1. ✅ **API Layer**: ALL API calls use TanStack Query
   - Create dedicated API folder structure
   - Organize by feature/domain
   - Use query hooks pattern

2. ✅ **UI Components**: Use shadcn/ui exclusively
   - No custom color definitions
   - Use Tailwind utility classes
   - Follow shadcn patterns

3. ✅ **Database Layer**: Use Drizzle ORM for ALL database operations
   - Define type-safe schemas
   - Create migrations for schema changes
   - NO MOCK DATA - implement actual database operations
   - Integrate with better-auth user data

4. ✅ **Authentication**: better-auth + SIWE
   - better-auth for session management
   - SIWE plugin for Ethereum wallet auth
   - Reference: better-auth LLM docs

5. ✅ **Web3 Integration**: wagmi + viem
   - wagmi for React hooks (wallet connection)
   - viem for Ethereum operations
   - Reference: wagmi/viem LLM docs

6. ✅ **Routing**: Flat structure only
   - NO nested folders in routes/
   - Use pattern: `feature.$id.tsx`
   - Use pattern: `api.feature.$id.action.ts`

7. ✅ **Documentation**: Everything in `docs/` folder
   - No documents at root level
   - Check existing docs before creating new
   - All decisions in ADR format

## LLM Documentation Sources

When implementing, reference these curated LLM sources from `/docs/knowledge-base.md`:

- **shadcn/ui**: https://ui.shadcn.com/llms.txt
- **wagmi**: https://wagmi.sh/llms.txt
- **viem**: https://viem.sh/llms.txt
- **better-auth**: https://www.better-auth.com/llms.txt + https://www.better-auth.com/docs/plugins/siwe
- **TanStack**: https://tanstack.com/llms.txt (Query, Router, Start)
- **Drizzle ORM**: TypeScript ORM for database operations (direct implementation, no mocking)

## Beads Issues Created

The following beads issues have been created for this epic:

1. **onezapman-platform-v0e** - Build OneZap Landing Page with Hero Section (P0)
2. **onezapman-platform-8yp** - Create Content Creation Route (P1)
3. **onezapman-platform-pd6** - Build Protected Dashboard with Content Table (P0)
4. **onezapman-platform-d2n** - Build Sign In Page with Wallet Connection & SIWE (P0)
5. **onezapman-platform-0v6** - Setup API Structure with TanStack Query (P0)

## How to Use This Prompt

Copy and paste this entire document when asking an LLM to generate or implement this epic. The LLM will have all the context needed to:

1. Understand the project architecture
2. Reference the correct documentation sources
3. Follow the mandatory implementation rules
4. Use the appropriate libraries (shadcn, wagmi, viem, better-auth, TanStack, Drizzle ORM)
5. Create code following the flat route structure
6. Implement TanStack Query for all API calls
7. Use Drizzle ORM for database operations (NO MOCKING)

## Example LLM Prompt

```
[Insert this entire document]

Please generate the implementation for this epic following all the architecture rules. Create:
1. The landing page with Hero section
2. The protected dashboard with content table
3. The signin page with wallet connection and SIWE
4. The API structure with TanStack Query
5. The database layer with Drizzle ORM
6. All necessary components using shadcn/ui

Ensure all code follows the flat route structure, uses the libraries specified in the knowledge base, and implements actual database operations with Drizzle ORM (no mocking).
```

## Notes

- The LLM should minimize web searches and rely on the knowledge base LLM sources
- All decisions should follow the ADR 0001 architecture document
- Implementation should be in TypeScript with the specified tech stack
- The epic focuses on registration/auth flow - content creation features come later
- **CRITICAL**: Use Drizzle ORM for database operations - NO MOCK DATA ALLOWED
