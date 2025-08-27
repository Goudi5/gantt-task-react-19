# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `yarn start` - Start development server with Vite (runs on host)
- `yarn storybook` - Start Storybook development server
- `yarn build` - Build the library using Vite and generate TypeScript declarations
- `yarn prepare` - Build for production (runs automatically on npm/yarn install)

### Testing & Quality
- `yarn test` - Run complete test suite (unit tests, linting, and build validation)
- `yarn test:unit` - Run Jest unit tests only
- `yarn test:lint` - Run ESLint on TypeScript/TSX files in src/
- `yarn test:watch` - Run Jest in watch mode for development
- `yarn test:build` - Validate that the build process completes successfully

### Storybook & Documentation
- `yarn build-storybook` - Build Storybook for production
- `yarn deploy-storybook` - Deploy Storybook to GitHub Pages

## Architecture Overview

This is a React TypeScript library that provides an interactive Gantt chart component. The codebase is structured as follows:

### Core Components Structure
- **`src/components/gantt/`** - Main Gantt component with hooks for drag operations, scrolling, selections, and context menus
- **`src/components/task-list/`** - Left-side task table with customisable columns (title, dates, dependencies, actions)
- **`src/components/calendar/`** - Top timeline header with customisable date formatting
- **`src/components/grid/`** - SVG grid background for the timeline
- **`src/components/task-item/`** - Individual task rendering (bars, milestones, projects)
- **`src/components/other/`** - Utility components (tooltips, arrows, relation lines)
- **`src/components/context-menu/`** - Right-click context menu system

### Data Flow & State Management
- **Task Processing Pipeline**: Raw tasks → sorting → parent-child mapping → coordinate calculation → rendering
- **Coordinate System**: Tasks are positioned using a complex coordinate mapping system that handles multiple comparison levels
- **Dependency System**: Tasks can have start-to-start, start-to-end, end-to-start, and end-to-end relationships
- **Selection & Context**: Multi-select with keyboard modifiers, copy/cut/paste operations via context menu

### Key Helper Modules
- **`src/helpers/bar-helper.ts`** - Task positioning and progress calculations
- **`src/helpers/date-helper.ts`** - Date manipulation for different view modes (Hour, Day, Week, Month, etc.)
- **`src/helpers/get-*`** - Data transformation helpers for mapping tasks to coordinates, dependencies, and nested structures
- **`src/helpers/use-*`** - Custom React hooks for optimised rendering and state management

### Type System
- **`src/types/public-types.ts`** - Comprehensive TypeScript definitions including Task, ViewMode, styling options, and event handlers
- **Complex Maps**: Uses TypeScript Maps for efficient lookups (TaskToCoordinates, DependencyMap, etc.)
- **Comparison Levels**: Supports multiple gantt charts for comparison scenarios

### Build Configuration
- **Vite** for bundling with React plugin
- **ESM and UMD** output formats
- **TypeScript declarations** generated separately
- **Peer dependencies**: React 19+, MUI components for enhanced UI elements
- **CSS Modules** for component styling with `.module.css` pattern

### Testing Strategy
- **Jest** for unit testing with jsdom environment
- **Testing Library** for React component testing
- **ESLint** for code quality with React-specific rules
- **Storybook** for component documentation and visual testing

### Customisation Points
- **Column System**: TaskList supports custom columns via the `columns` prop
- **Theming**: Extensive colour and styling customisation through ColorStyles interface
- **Date Handling**: Custom holiday detection, date rounding, and working day calculations
- **Context Menu**: Extensible context menu with custom action definitions
- **Rendering**: Custom header renderers, tooltip content, and task list components

## Development Notes

### Key Dependencies
- **@floating-ui/react**: For tooltip positioning and floating elements
- **date-fns**: Date manipulation and formatting utilities
- **lucide-react**: Modern icon library for UI elements

### Project Structure Highlights
- **CSS Modules**: All component styles use `.module.css` for scoped styling
- **Hook-based Architecture**: Extensive use of custom hooks for state management (`use-*` files)
- **Type Safety**: Comprehensive TypeScript definitions with strict configuration
- **Optimised Rendering**: Performance-focused with memoisation and virtualisation patterns