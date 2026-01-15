# ADR 0001: Project Architecture Decisions

**Date**: 2026-01-15
**Status**: Accepted

## Context

This document records the key architectural decisions made for the OneZap platform.

## Decisions

### 1. API Layer Architecture

**Decision**: All API calls must use TanStack Query

**Rationale**:
- Centralized data fetching and caching
- Built-in caching, background updates, and error handling
- Consistent pattern across the application
- Easier to manage and debug API interactions

**Implementation**:
- Create a dedicated folder structure for API logic
- Organize queries by feature or domain
- Use TanStack Query hooks for all data fetching

### 2. UI Component Strategy

**Decision**: Use shadcn/ui components exclusively

**Rationale**:
- Consistent design system
- Built on Radix UI (accessible primitives)
- Tailwind CSS integration
- Reduced maintenance overhead
- No custom color definitions to maintain

**Implementation**:
- All new components must be built from shadcn/ui primitives
- Custom styling only through Tailwind utility classes
- No custom color variables or theme extensions

### 3. Documentation Strategy

**Decision**: Centralized documentation in `docs/` folder

**Rationale**:
- Single source of truth
- Easy discovery and maintenance
- Version controlled with code
- Prevents documentation sprawl

**Implementation**:
- All documentation stored in `/docs` directory
- No documentation files at project root
- Check existing docs before creating new ones
- ADR (Architecture Decision Records) in `/docs/adr/`

### 4. Knowledge Management

**Decision**: Use curated LLM documentation as primary knowledge source

**Rationale**:
- Curated, high-quality documentation
- Minimizes need for web searches
- Ensures consistent information across team
- Faster decision-making

**Implementation**:
- Maintain `/docs/knowledge-base.md` with all LLM sources
- Reference this document for all library-related questions
- Update knowledge base when adding new dependencies

### 5. Authentication Strategy

**Decision**: Use better-auth with SIWE plugin

**Rationale**:
- Web3-native authentication
- Simplifies wallet connection flow
- Type-safe implementation
- Comprehensive documentation

**Implementation**:
- better-auth for general authentication
- SIWE plugin for Ethereum wallet authentication
- Follow patterns from better-auth LLM docs

### 6. Web3 Integration

**Decision**: Use wagmi + viem for Web3 operations

**Rationale**:
- wagmi: React hooks for wallet and blockchain interactions
- viem: Type-safe, low-level Ethereum operations
- Complementary, well-documented stack
- Active ecosystem

**Implementation**:
- wagmi for React components and hooks
- viem for direct blockchain operations
- Follow wagmi/viem LLM documentation patterns

### 7. Database Layer Strategy

**Decision**: Use Drizzle ORM for all database operations

**Rationale**:
- Type-safe database queries and operations
- Excellent TypeScript support
- Migration system built-in
- No data mocking - direct implementation
- Compatible with multiple database providers

**Implementation**:
- Define schemas using Drizzle ORM
- Create migrations for schema changes
- Use Drizzle queries in API endpoints
- Integrate with better-auth for user data
- No mock data - implement actual database operations

## Consequences

### Positive
- Consistent architecture across the codebase
- Reduced decision fatigue
- Faster development with well-documented libraries
- Better maintainability

### Negative
- Less flexibility in component customization
- Dependency on external documentation format
- Learning curve for team members

## Review Date

This ADR should be reviewed when:
- Major version upgrades of core libraries
- Architectural pivots
- Performance or scalability issues arise
