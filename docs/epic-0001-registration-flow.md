# EPIC 0001: Content Creator Registration Flow

**Project**: OneZap - Content Creator Platform with Lossless Subscription
**Epic Type**: feature
**Priority**: P0 (Critical)

## Overview

Build the foundational registration and authentication flow for content creators on the OneZap platform. OneZap is a content creator platform that implements "Lossless Subscription" - a novel subscription model where subscribers never actually purchase subscriptions, creating a unique value proposition.

## Knowledge Base References

Before implementation, consult:
- `/docs/knowledge-base.md` - All LLM sources and library documentation
- `/docs/adr/0001-project-architecture.md` - Architecture decisions

**Key Requirements from ADR**:
1. ✅ All API calls must use TanStack Query (organize in dedicated folder)
2. ✅ All components must use shadcn/ui (no custom colors)
3. ✅ Use Drizzle ORM for database operations (direct implementation, no mocking)
4. ✅ Use better-auth + SIWE for authentication
5. ✅ Use wagmi + viem for Web3 operations
6. ✅ API routes: flat structure, no nested folders (e.g., `api.content.$id.update`)
7. ✅ Dashboard routes: flat structure (e.g., `dashboard.content.$id.tsx`)

## Epic Breakdown

### EPIC 0: Registration & Authentication Flow

#### 1. Landing Page
**Route**: `/` (root)
**Components**:
- Hero section introducing OneZap
- Clear messaging about "Lossless Subscription" value proposition
- "Get Started" CTA button → navigates to `/dashboard`
- Implement using shadcn/ui components
- Ensure responsive design

#### 2. Dashboard (Protected)
**Route**: `/dashboard`
**Authentication**: Protected with session check via better-auth
- If not authenticated → redirect to `/signin`
- If authenticated → show dashboard content

**Dashboard Content**:
- List of content (writings) in table format
- Table columns:
  - Content Title
  - Content Preview
  - Actions column with 2 buttons:
    - Edit button
    - Delete button
- "Create Content" button at the top → navigates to `/dashboard/content/{new-id}`

#### 3. Sign In Page
**Route**: `/signin`
**Flow**:
1. **Step 1 - Wallet Connection**:
   - Connect wallet button using wagmi
   - Show connected network
   - Show wallet address

2. **Step 2 - SIWE Authentication**:
   - Display Terms of Service: "User understands ToS of this platform and agrees to sign in or register to this platform"
   - "Sign In" button (SIWE via better-auth SIWE plugin)
   - After successful auth → redirect to `/dashboard`

#### 4. Content Creation Page
**Route**: `/dashboard/content/{id}`
**Status**: Empty page for now
**Note**: Focus on dashboard implementation first, content creation page will be developed later

#### 5. API Structure
**Pattern**: Flat structure, no nested folders in routes
- API routes: `/routes/api.content.$id.update.ts`, etc.
- Dashboard routes: `/routes/dashboard.content.$id.tsx`, etc.

**API Endpoints Needed**:
- Content CRUD operations (using Drizzle ORM)
- Session/authentication checks
- User data management

**Database Implementation**:
- Define schemas using Drizzle ORM
- Create migrations for content and user tables
- Implement actual database queries (NO MOCKING)
- Integrate with better-auth for user data persistence

## Technical Implementation Notes

### Stack Requirements
- **UI**: shadcn/ui components exclusively
- **Auth**: better-auth with SIWE plugin
- **Web3**: wagmi (React hooks) + viem (Ethereum operations)
- **Database**: Drizzle ORM for all database operations (direct implementation)
- **Data Fetching**: TanStack Query for ALL API calls
- **Routing**: TanStack Router or similar

### TanStack Query Organization
- Create dedicated API folder structure
- Organize by feature/domain
- Use query hooks for all data fetching
- Integrate with Drizzle ORM for database queries

### Component Guidelines
- All components: shadcn/ui only
- No custom color definitions
- Use Tailwind utility classes for styling
- Follow shadcn patterns from LLM docs

### Database Guidelines
- Use Drizzle ORM for all database operations
- Define type-safe schemas
- Create migrations for schema changes
- NO MOCK DATA - implement actual database operations
- Integrate with better-auth user data

## Acceptance Criteria

1. ✅ Landing page displays correctly with Hero and CTA
2. ✅ Unauthenticated users redirected from `/dashboard` to `/signin`
3. ✅ Wallet connection works via wagmi
4. ✅ SIWE authentication completes successfully
5. ✅ Authenticated users see dashboard with content table
6. ✅ Dashboard shows content list with edit/delete actions
7. ✅ Create Content button navigates to content page
8. ✅ All API calls use TanStack Query
9. ✅ All components use shadcn/ui
10. ✅ API routes follow flat structure pattern
11. ✅ Database operations use Drizzle ORM (no mocking)
12. ✅ Content data persists in actual database

## Dependencies
- EPIC 0001 must be completed before subsequent content creation features

## Notes for LLM

When generating this epic:
- Reference the knowledge base LLM sources (shadcn, wagmi, viem, better-auth, tanstack, Drizzle ORM)
- Follow the architectural decisions in ADR 0001
- Create beads issues for each major task
- Organize API layer with TanStack Query
- Use Drizzle ORM for all database operations (NO MOCKING)
- Use flat route structure (no nested folders)
- Prioritize dashboard implementation over content creation page
