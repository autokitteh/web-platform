# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server on port 8000
- `npm run build` - Build for production
- `npm run build:prod` - Production build with templates fetch and verification
- `npm run preview` - Preview production build locally

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run type-check` - Run TypeScript type checking (use this command for type checking)
- `npm run tsc` - Run TypeScript compiler

### Testing
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:e2e:ui` - Run Playwright tests with UI
- `npm run test:e2e:report` - Generate and view test report

### Development Tools
- `npm run storybook` - Start Storybook development server
- `npm run build-storybook` - Build Storybook
- `npm run tailwind-config-viewer` - View Tailwind CSS configuration

### Template Management
- `npm run fetch-templates` - Fetch project templates
- `npm run generate-interfaces-manifest` - Generate interfaces manifest
- `npm run generate-project-files-index` - Generate project files index

## Architecture Overview

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration
- **Styling**: TailwindCSS with custom components
- **State Management**: Zustand stores
- **Routing**: React Router DOM v7
- **UI Components**: Custom component library with Atoms/Molecules/Organisms pattern
- **Authentication**: Descope SDK integration
- **API Communication**: gRPC-web with Connect protocol
- **Code Editor**: Monaco Editor integration

### Project Structure
```
src/
├── components/          # UI components (atoms, molecules, organisms, pages, templates)
├── store/              # Zustand state management
├── services/           # API services and external integrations
├── hooks/              # Custom React hooks
├── utilities/          # Utility functions
├── types/              # TypeScript type definitions
├── interfaces/         # TypeScript interfaces
├── enums/              # TypeScript enums
├── constants/          # Application constants
├── validations/        # Zod validation schemas
├── contexts/           # React contexts
├── models/             # Data models
├── assets/             # Static assets (images, fonts, templates)
└── autokitteh/         # Backend proto definitions and generated code
```

### Key Architecture Patterns

#### Component Architecture
- **Atomic Design**: Components organized as atoms, molecules, organisms, pages, and templates
- **Composition Pattern**: Higher-order components for layout and functionality
- **Custom Hooks**: Business logic abstracted into reusable hooks

#### State Management
- **Zustand Stores**: Separate stores for different domains (project, connection, file, etc.)
- **Cache Management**: Dedicated caching stores for activities and outputs
- **Persistent State**: IndexedDB for template and tour data

#### API Integration
- **gRPC Services**: Type-safe API communication with generated clients
- **Service Layer**: Abstracted service classes for different API domains
- **Error Handling**: Centralized error handling with toast notifications

#### Path Aliases
The project uses extensive path aliases configured in both vite.config.ts and tsconfig.json:
- `@src/*` - Source root
- `@components/*` - UI components
- `@store/*` - State management
- `@services/*` - API services
- `@hooks/*` - Custom hooks
- `@utilities/*` - Utility functions
- `@types/*` - TypeScript types
- `@interfaces/*` - TypeScript interfaces
- `@enums/*` - TypeScript enums
- `@constants/*` - Application constants
- `@validations/*` - Validation schemas
- `@ak-proto-ts/*` - Generated protocol buffer types

#### Development Patterns
- **Strict TypeScript**: Enabled with strict mode, unused locals/parameters checks
- **ESLint Configuration**: Comprehensive linting with React, TypeScript, and custom rules
- **Import Organization**: Structured import order with groups and alphabetical sorting
- **Component Naming**: PascalCase for components, camelCase for utilities
- **File Naming**: camelCase for most files, PascalCase for components

## Key Features

### Project Management
- Template-based project creation with ZIP file processing
- Project building and deployment management
- File system operations with Monaco editor integration
- Version control and build artifact management

### Integration System
- OAuth-based connections for external services
- Dynamic integration discovery and configuration
- Custom trigger system for event-driven workflows
- Variable management with validation

### User Experience
- Interactive tours and onboarding flows
- Real-time notifications and toast system
- Responsive design with mobile support
- Accessibility compliance (a11y)

### Authentication & Authorization
- Descope-based authentication
- Organization and user management
- Role-based access control
- JWT token handling

## Environment Configuration

Key environment variables (defined in vite.config.ts):
- `VITE_HOST_URL` - Backend API URL
- `VITE_DESCOPE_PROJECT_ID` - Authentication project ID
- `TESTS_JWT_AUTH_TOKEN` - E2E testing authentication
- `VITE_DISPLAY_BILLING` - Feature flag for billing UI
- Various integration display flags

## Testing Strategy

### E2E Testing
- Playwright for end-to-end testing
- Page object model for test organization
- Test fixtures for common operations
- Authentication handling for protected routes

### Code Quality
- TypeScript strict mode
- Comprehensive ESLint rules
- Import organization and sorting
- Component and file naming conventions

## Development Guidelines

### Code Style
- Use TypeScript with strict type checking
- Follow React functional component patterns
- Implement proper error boundaries
- Use custom hooks for business logic
- Maintain consistent import organization

### Component Development
- Follow atomic design principles
- Use proper prop typing with interfaces
- Implement accessibility features
- Handle loading and error states
- Use Tailwind classes with `cn` utility

### State Management
- Use Zustand for global state
- Implement proper store separation
- Handle async operations in stores
- Use proper TypeScript typing for stores

## Common Integrations

The application integrates with numerous external services:
- GitHub, GitLab for version control
- Slack, Discord for communication
- Google, Microsoft for productivity
- Salesforce, HubSpot for CRM
- Linear, Asana for project management
- And many more through the dynamic integration system