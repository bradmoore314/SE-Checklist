# Architecture Overview

## Overview

The Kastle Wizard is a web application designed for security professionals to manage and track equipment during security assessments. It replaces traditional Excel-based tracking systems with a digital solution that captures detailed information about various security equipment types.

The application follows a modern web architecture with a clear separation between frontend and backend components. It's built with scalability, performance, and ease of deployment in mind, particularly targeting Azure cloud deployment.

## System Architecture

### High-Level Architecture

The system follows a client-server architecture with:

1. **Frontend**: React-based single-page application (SPA) using TypeScript
2. **Backend**: Node.js with Express server
3. **Database**: PostgreSQL for persistent data storage
4. **State Management**: React Context API + TanStack Query
5. **Authentication**: Passport.js with local strategy
6. **AI Integration**: Google Gemini API for intelligent features

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│            │     │            │     │            │
│  Frontend  │────►│  Backend   │────►│  Database  │
│  (React)   │     │  (Express) │     │ (PostgreSQL)│
│            │◄────│            │◄────│            │
└────────────┘     └────────────┘     └────────────┘
                          │
                          ▼
                   ┌────────────┐
                   │   External │
                   │   Services │
                   │ (Gemini AI,│
                   │ MS Graph)  │
                   └────────────┘
```

### Frontend Architecture

The frontend is built with React and TypeScript, using Vite as the build tool. Key architectural choices include:

- **Component Structure**: Uses a combination of functional components with hooks
- **State Management**: Uses React Context API for global state and TanStack Query for API data fetching and caching
- **Routing**: Uses Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent UI design
- **Form Handling**: react-hook-form with zod validation for efficient form management
- **Directory Structure**:
  - `/client/src/components/`: UI components organized by functionality
  - `/client/src/hooks/`: Custom React hooks
  - `/client/src/lib/`: Utility functions and shared code
  - `/client/src/pages/`: Page components corresponding to routes

### Backend Architecture

The backend is a Node.js application using Express, structured to provide RESTful API endpoints. Key architectural choices include:

- **API Structure**: RESTful API endpoints for data manipulation
- **Database Access**: Uses Drizzle ORM for database interactions
- **Authentication**: Passport.js for user authentication
- **Error Handling**: Centralized error handling middleware
- **Directory Structure**:
  - `/server/`: Backend code
  - `/server/routes.ts`: API route definitions
  - `/server/index.ts`: Express app initialization
  - `/server/storage.ts`: Data access layer

## Key Components

### 1. Frontend Components

#### UI Components
The application uses shadcn/ui components, a collection of reusable UI components built on Radix UI primitives. This provides accessibility and consistent styling across the application.

#### Form Handling
Forms are managed with react-hook-form and validated with zod, providing type-safe form validation and efficient rendering.

#### Equipment Management
The application includes specialized tabs for different equipment types:
- Card Access
- Cameras
- Elevators
- Intercoms

### 2. Backend Components

#### Express Server
The main Express server handles HTTP requests, routes them to appropriate handlers, and manages middleware.

#### Storage Layer
The application implements a storage interface with both in-memory and Drizzle-based PostgreSQL implementations.

#### Authentication System
The authentication system is built with Passport.js, supporting local username/password authentication.

#### Microsoft Integration (Optional)
Optional integration with Microsoft Graph API and SharePoint for enhanced enterprise functionality.

### 3. Database Schema

The database schema is defined using Drizzle ORM with the following key tables:
- `cameras`: Stores camera information
- `gateways`: Stores gateway device configurations
- `cameraStreams`: Maps camera streams to gateways

## Data Flow

### 1. User Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │     │          │
│  Client  │────►│  Server  │────►│ Passport │────►│ Database │
│          │     │          │     │          │     │          │
│          │◄────│          │◄────│          │◄────│          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

1. User submits credentials from the login form
2. Express server routes the request to Passport.js
3. Passport validates credentials against the database
4. On success, session is established
5. Session cookie is returned to client

### 2. Site Walk Data Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │
│  Client  │────►│  Server  │────►│ Database │
│          │     │          │     │          │
│          │◄────│          │◄────│          │
└──────────┘     └──────────┘     └──────────┘
```

1. User creates/edits site walk information via UI forms
2. Client sends AJAX requests to server API endpoints
3. Server validates and processes the data
4. Data is stored in PostgreSQL database
5. Confirmation is sent back to client

### 3. AI Integration Flow (with Gemini API)

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │
│  Client  │────►│  Server  │────►│ Gemini AI│
│          │     │          │     │          │
│          │◄────│          │◄────│          │
└──────────┘     └──────────┘     └──────────┘
```

1. User triggers AI-assisted features
2. Server makes API calls to Google Gemini
3. AI processes request and returns response
4. Server formats the response and returns to client

## External Dependencies

### Frontend Dependencies
- **@tanstack/react-query**: Data fetching and cache management
- **@radix-ui/react-**: UI component primitives
- **@hookform/resolvers**: Form validation
- **wouter**: Lightweight routing
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library

### Backend Dependencies
- **express**: Web server framework
- **drizzle-orm**: TypeScript ORM
- **@neondatabase/serverless**: PostgreSQL client
- **@google/generative-ai**: Gemini AI integration
- **@azure/msal-node**: Microsoft authentication integration

### External Services
- **PostgreSQL Database**: For data persistence
- **Google Gemini API**: For AI functionalities
- **Microsoft Graph API (Optional)**: For SharePoint integration

## Deployment Strategy

The application is designed for deployment to Azure Web Apps, with several key components to facilitate deployment:

### Azure Deployment Components
- **azure-startup.cjs**: Entry point script for Azure deployment
- **web.config**: IIS configuration for Azure Web Apps
- **build.js**: Custom build script for Azure deployment

### Environment Configuration
The application requires several environment variables in production:
- `DATABASE_URL`: PostgreSQL connection string
- `GEMINI_API_KEY`: Google Gemini API key
- `SESSION_SECRET`: Secret for session encryption
- `NODE_ENV`: Set to "production"

### Deployment Workflow
1. Code is built with Vite and esbuild
2. Frontend assets are generated in `/dist/public`
3. Backend is bundled into `/dist/index.js`
4. Azure Web App executes the startup script

### Database Migration
Database migrations are handled with Drizzle ORM through the `db:push` command, which updates the schema in the PostgreSQL database.

## Development Environment

The application supports multiple development environments:

1. **Local Development**: Using npm scripts
2. **Replit Development**: Configured through .replit file
3. **GitHub Codespaces**: Compatible with remote development

Development mode is started with `npm run dev`, which serves the frontend via Vite's dev server with hot module replacement while simultaneously running the Express backend.