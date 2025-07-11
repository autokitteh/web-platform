# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AutoKitteh is an open-source workflow automation platform with a React/TypeScript frontend and Go backend. The web platform provides a UI for managing projects, integrations, deployments, and monitoring automation workflows.

## Development Commands

### Core Development
- `npm run dev` - Start development server with hot reloading
- `npm run build` - Production build
- `npm run build:prod` - Production build with template fetching and validation
- `npm run preview` - Preview production build locally

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run lint:ci` - CI-specific linting without prettier rules
- `npm run type-check` - TypeScript type checking without emitting files
- `npm run tsc` - Full TypeScript compilation

### Testing
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Open Playwright test runner UI
- `npm run test:e2e:report` - Generate and view test report

### Development Tools
- `npm run storybook` - Launch Storybook for component development
- `npm run tailwind-config-viewer` - View Tailwind CSS configuration

## Architecture Overview

### Frontend Structure
- **React 18** with TypeScript and Vite build system
- **State Management**: Zustand for client state, with specialized stores for different domains
- **Routing**: React Router v7 for navigation
- **UI Components**: Custom component library with Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Descope SDK for user authentication

### Backend Integration
- **gRPC Communication**: Uses @connectrpc/connect for gRPC-Web communication with Go backend
- **AutoKitteh Backend**: Full Go backend located in `src/autokitteh/` with:
  - Protocol Buffer definitions for all services
  - Integration framework supporting 15+ platforms (AWS, GitHub, Slack, etc.)
  - Python and Starlark runtime systems
  - Temporal workflow engine integration
  - OAuth2 and webhook management

### Key Directories
- `src/components/` - Atomic design pattern (atoms, molecules, organisms, pages, templates)
- `src/services/` - API service layer and HTTP client
- `src/store/` - Zustand state management stores
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript type definitions
- `src/utilities/` - Shared utility functions
- `src/autokitteh/` - Go backend codebase (submodule)

## Common Patterns

### Component Organization
Components follow atomic design principles:
- **Atoms**: Basic UI elements (buttons, inputs, badges)
- **Molecules**: Simple combinations of atoms (forms, cards)
- **Organisms**: Complex UI sections (headers, sidebars)
- **Pages**: Full page components
- **Templates**: Layout templates

### State Management
- Use Zustand stores for global state
- Stores are domain-specific (projects, connections, deployments)
- State is typically organized with actions, getters, and reset functions

### API Integration
- All API calls go through service layer in `src/services/`
- Services use axios HTTP client with proper error handling
- gRPC services use @connectrpc/connect for type-safe communication

### Form Handling
- React Hook Form with Zod schemas for validation
- Form schemas located in `src/validations/`
- Custom form components with proper error handling

## Environment Variables

Required environment variables:
- `VITE_HOST_URL` - Backend API URL (defaults to localhost:9980)
- `VITE_DESCOPE_PROJECT_ID` - Descope project ID for authentication
- `TESTS_JWT_AUTH_TOKEN` - JWT token for E2E testing

## Build System

- **Vite** as build tool with React plugin
- **Tailwind CSS** for styling
- **PostCSS** for CSS processing
- **ESLint** with extensive rule configuration
- **TypeScript** for type safety

## Testing Strategy

- **E2E Tests**: Playwright for end-to-end testing
- **Component Tests**: Storybook for component development and testing
- Tests located in `e2e/` directory with page object model pattern

## Key Features

- **Project Management**: Create, edit, and deploy automation projects
- **Integration Management**: Connect and configure 15+ external services
- **Deployment Monitoring**: Track deployment status and session execution
- **Code Editor**: Monaco editor for editing project files
- **Template System**: Start projects from predefined templates
- **Real-time Updates**: WebSocket connections for live session monitoring

## Development Notes

- Monaco editor workers are served from `public/monaco-editor-workers/`
- Template files are fetched and processed during build
- Tour system uses IndexedDB for step tracking
- Virtualized lists used for performance with large datasets
- Integration-specific forms are dynamically generated based on configuration