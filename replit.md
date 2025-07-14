# Pomorange - Pomodoro Timer Application

## Overview

Pomorange is a modern Pomodoro timer application designed to help users manage their time effectively using the Pomodoro Technique. The application allows users to create tasks, set focus and break timers, track their productivity, and view historical session data. Built with a full-stack TypeScript architecture, it features a clean React frontend and an Express.js backend with database integration capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: React hooks with custom state management for timer functionality
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js 20
- **Database**: PostgreSQL with Drizzle ORM (using Neon serverless driver)
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Development**: Hot module replacement via Vite integration
- **Data Storage**: Database-backed storage for users, tasks, and session records

### Key Components

#### Timer System
- **Focus Sessions**: Configurable duration (1-120 minutes)
- **Break Sessions**: Configurable duration (1-60 minutes)
- **Timer States**: Running, paused, completed with progress tracking
- **Early Completion**: Support for finishing tasks before timer expires

#### Task Management
- **CRUD Operations**: Create, read, update, delete tasks
- **Task Completion**: Mark tasks as completed with visual feedback
- **Local Storage**: Client-side persistence using browser localStorage

#### Session Tracking
- **Session Records**: Comprehensive logging of focus sessions
- **Statistics**: Daily, weekly, monthly, and yearly productivity metrics
- **Export Functionality**: CSV export of session data
- **Calendar Integration**: Visual calendar showing productivity patterns

#### Notification System
- **Browser Notifications**: Permission-based desktop notifications
- **Audio Alerts**: Web Audio API for session start/end sounds
- **Visual Feedback**: Progress bars and status indicators

## Data Flow

1. **Task Creation**: Users create tasks stored in localStorage
2. **Session Setup**: Users select task and configure timer durations
3. **Timer Execution**: Real-time countdown with pause/resume functionality
4. **Session Recording**: Completed sessions logged with detailed metadata
5. **Data Visualization**: Historical data presented in charts and calendars
6. **Export**: Session data can be exported as CSV for external analysis

## External Dependencies

### UI Framework
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Database & ORM
- **Drizzle**: Type-safe ORM for database operations
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **Drizzle-Zod**: Schema validation integration

### Development Tools
- **TSX**: TypeScript execution for development
- **ESBuild**: Fast bundling for production builds
- **Replit Integration**: Development environment optimization

## Deployment Strategy

### Development
- **Hot Reload**: Vite development server with HMR
- **Database**: Local PostgreSQL instance via Replit
- **Port Configuration**: Development server on port 5000

### Production
- **Build Process**: Vite production build with ESBuild bundling
- **Static Assets**: Client files served from `/dist/public`
- **Server Bundle**: ESM format with external dependencies
- **Environment**: Autoscale deployment target

### Environment Variables
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)

## Changelog

Changelog:
- July 14, 2025. Added PostgreSQL database with Drizzle ORM. Migrated from in-memory storage to database-backed storage for users, tasks, and session records.
- June 27, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.