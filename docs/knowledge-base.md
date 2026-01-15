# Knowledge Base

This document serves as the primary source of truth for all library knowledge in this project. Always refer to this document before making any decisions or implementing features.

## LLM Documentation Sources

This project uses the following LLM documentation files as our knowledge source:

### UI Libraries
- **shadcn/ui**
  - URL: https://ui.shadcn.com/llms.txt
  - Purpose: UI component library based on Radix UI and Tailwind CSS
  - Usage: All UI components must use shadcn components, no custom color definitions

### Web3 Libraries
- **wagmi**
  - URL: https://wagmi.sh/llms.txt
  - Purpose: React hooks for Ethereum
  - Usage: Web3 interactions and wallet connections

- **viem**
  - URL: https://viem.sh/llms.txt
  - Purpose: TypeScript interface for Ethereum
  - Usage: Low-level Ethereum operations

### Authentication
- **better-auth**
  - Main LLM: https://www.better-auth.com/llms.txt
  - SIWE Plugin: https://www.better-auth.com/docs/plugins/siwe
  - Purpose: Authentication library with Web3 support
  - Usage: User authentication including Sign-In with Ethereum (SIWE)

### TanStack Ecosystem
- **tanstack**
  - URL: https://tanstack.com/llms.txt
  - Components Used:
    - **TanStack Query**: For API data fetching and caching
    - **TanStack Router**: For client-side routing
    - **TanStack Start**: For full-stack application development
  - Usage:
    - All API calls must use TanStack Query
    - API logic should be organized in a dedicated folder for easy management

### Database Layer
- **Drizzle ORM**
  - Purpose: TypeScript ORM for database operations
  - Usage: Direct database implementation (no mocking)
  - Provides type-safe database queries and migrations

## Key Rules

1. **API Layer**: Every API call must use TanStack Query, organized in a dedicated folder structure
2. **UI Components**: All components must use shadcn components - no custom color definitions
3. **Database Layer**: Use Drizzle ORM for all database operations - direct implementation (no mocking)
4. **Documentation**: Never create documents at root level - always use the `docs` folder
5. **Existing Documentation**: Always check existing docs before creating new ones
6. **Decisions**: All architectural decisions must be documented in ADR (Architecture Decision Records)

## Referencing This Document

When implementing features or making decisions:
1. Check this knowledge base first
2. Consult the relevant LLM documentation URLs
3. Document any new decisions in the ADR
4. Minimize web searches - rely on these curated sources

Last Updated: 2026-01-15
