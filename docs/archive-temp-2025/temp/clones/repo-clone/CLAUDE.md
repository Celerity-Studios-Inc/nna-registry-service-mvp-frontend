# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is the NNA Registry Service, a crucial component of the NNA Framework for ReViz's AI-powered video remixing platform. It implements a dual addressing system (Human-Friendly Names and NNA Addresses) for digital assets across various layers (Songs, Stars, Looks, Moves, Worlds, etc.).

## Tech Stack
- NestJS for backend API
- MongoDB for metadata storage
- Google Cloud Storage for asset file management
- JWT authentication

## Build, Lint, Test Commands
- Build: `npm run build`
- Lint: `npm run lint`
- Format: `npm run format`
- Start dev server: `npm run start:dev`
- Run all tests: `npm run test`
- Run single test: `npm test -- -t "test name pattern"`
- Run E2E tests: `npm run test:e2e`
- Test with watch mode: `npm run test:watch`
- Test coverage: `npm run test:cov`

## Key Implementation Features
- Asset registration with taxonomy validation
- Asset retrieval by friendly name or NNA address
- Asset management (update, delete, search, curate)
- GCP Storage integration for asset files
- JWT-based authentication and role-based authorization
- Taxonomy validation against NNA Layer Taxonomy v1.2
- Integration with Sentry for error tracking

## Code Style Guidelines
- **Formatting**: Use Prettier with single quotes and trailing commas
- **TypeScript**: Use strict null checks, consistent casing in filenames
- **Naming**: Follow NestJS conventions with camelCase for variables/methods, PascalCase for classes
- **Imports**: Group imports by external libs then internal modules
- **Error Handling**: Always handle promise rejections (no-floating-promises is enforced)
- **Testing**: Name spec files with `.spec.ts` suffix, E2E tests with `.e2e-spec.ts`
- **Structure**: Follow NestJS modular architecture with controllers, services, and modules
- **Documentation**: Use Swagger annotations for API documentation