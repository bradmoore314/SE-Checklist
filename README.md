# Kastle Wizard

A comprehensive web application for digitizing and streamlining security equipment tracking, site assessments, and Kastle Video Guarding (KVG) configurations. This application replaces traditional Excel-based tracking systems with a modern, intelligent web interface powered by AI analysis.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Setup Instructions](#setup-instructions)
5. [Core Features](#core-features)
6. [AI Capabilities](#ai-capabilities)
7. [Kastle Video Guarding](#kastle-video-guarding)
8. [Floorplan Management](#floorplan-management)
9. [Data Model](#data-model)
10. [Frontend Components](#frontend-components)
11. [Backend Implementation](#backend-implementation)
12. [Authentication System](#authentication-system)
13. [Theme Configuration](#theme-configuration)
14. [Mobile Responsiveness](#mobile-responsiveness)
15. [Integration Points](#integration-points)

## Project Overview

The Kastle Wizard is a specialized application for security professionals to manage and track equipment for security projects. It captures detailed information about various security equipment types (card access points, cameras, elevators, and intercoms), provides advanced floorplan annotation capabilities, and offers comprehensive Kastle Video Guarding (KVG) configuration. The application leverages Microsoft Azure OpenAI services for intelligent analysis, reporting, and insights generation.

## Technology Stack

- **Frontend**: React + TypeScript with Vite
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Microsoft Azure OpenAI (migrated from Google Gemini)
- **Authentication**: Passport.js with local strategy and Microsoft authentication
- **State Management**: React Context API + TanStack Query (React Query)
- **PDF Processing**: PDF.js for rendering and annotation
- **Styling**: Tailwind CSS, shadcn/ui components
- **Storage**: Database storage with PostgreSQL (migrated from in-memory storage)
- **Form Handling**: react-hook-form with zod validation
- **Routing**: Wouter for lightweight client-side routing
- **Mobile Support**: Responsive design optimized for field use

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── equipment/
│   │   │   │   ├── CardAccessTab.tsx
│   │   │   │   ├── CamerasTab.tsx
│   │   │   │   ├── ElevatorsTab.tsx
│   │   │   │   ├── IntercomsTab.tsx
│   │   │   │   └── EquipmentTabs.tsx
│   │   │   ├── modals/
│   │   │   │   ├── AddAccessPointModal.tsx
│   │   │   │   ├── EditAccessPointModal.tsx
│   │   │   │   ├── AddCameraModal.tsx
│   │   │   │   ├── EditCameraModal.tsx
│   │   │   │   ├── AddElevatorModal.tsx
│   │   │   │   ├── EditElevatorModal.tsx
│   │   │   │   ├── AddIntercomModal.tsx
│   │   │   │   └── EditIntercomModal.tsx
│   │   │   ├── project/
│   │   │   │   └── ProjectDashboard.tsx
│   │   │   ├── ui/
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopNav.tsx
│   │   ├── context/
│   │   │   ├── ProjectContext.tsx
│   │   │   └── SiteWalkContext.tsx
│   │   ├── hooks/
│   │   │   ├── use-auth.tsx
│   │   │   ├── use-mobile.tsx
│   │   │   └── use-toast.ts
│   │   ├── layouts/
│   │   │   └── MainLayout.tsx
│   │   ├── lib/
│   │   │   ├── protected-route.tsx
│   │   │   └── queryClient.ts
│   │   ├── pages/
│   │   │   ├── auth-page.tsx
│   │   │   ├── card-access.tsx
│   │   │   ├── cameras.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── elevators.tsx
│   │   │   ├── home-page.tsx
│   │   │   ├── intercoms.tsx
│   │   │   ├── not-found.tsx
│   │   │   ├── project-summary.tsx
│   │   │   └── projects.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
├── server/
│   ├── data/
│   │   └── lookupData.ts
│   ├── auth.ts
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   └── vite.ts
├── shared/
│   ├── express-session.d.ts
│   └── schema.ts
├── drizzle.config.ts
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── theme.json
├── tsconfig.json
└── vite.config.ts
```

## Setup Instructions

Follow these steps to set up the project:

1. **Initialize Project**:
   ```bash
   npm init -y
   ```

2. **Install Required NodeJS Packages**:

   ```bash
   # Install core dependencies
   npm install @hookform/resolvers @neondatabase/serverless @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip @replit/vite-plugin-cartographer @replit/vite-plugin-runtime-error-modal @replit/vite-plugin-shadcn-theme-json @tailwindcss/typography @tanstack/react-query @types/connect-pg-simple @types/express @types/express-session @types/node @types/passport @types/passport-local @types/react @types/react-dom @types/ws @vitejs/plugin-react autoprefixer class-variance-authority clsx cmdk connect-pg-simple date-fns drizzle-kit drizzle-orm drizzle-zod embla-carousel-react esbuild express express-session framer-motion input-otp lucide-react memorystore passport passport-local postcss react react-day-picker react-dom react-hook-form react-icons react-resizable-panels recharts tailwind-merge tailwindcss tailwindcss-animate tsx typescript vaul vite wouter ws zod zod-validation-error
   ```

3. **Create Basic Directory Structure**:
   ```bash
   mkdir -p client/src/components/equipment client/src/components/modals client/src/components/project client/src/components/ui client/src/context client/src/hooks client/src/layouts client/src/lib client/src/pages server/data shared
   ```

4. **Configure TypeScript**:
   Create `tsconfig.json` with proper configurations for the project.

5. **Set Up Tailwind CSS**:
   Configure `postcss.config.js` and `tailwind.config.ts` with the necessary settings.

6. **Configure Vite**:
   Set up `vite.config.ts` with the proper plugins and configurations for the project.

7. **Configure the Theme**:
   Create `theme.json` with the dark grey theme configuration.

## Core Features

### 1. Security Equipment Management

The application allows tracking of four key types of security equipment:

#### Card Access Points
- Add, edit, duplicate, and delete card access points
- Capture details such as location, door type, reader type, lock type, and security level
- Apply searchable/filterable views with pagination

#### Cameras
- Add, edit, duplicate, and delete cameras
- Capture details such as location, camera type, resolution, mounting type
- Apply searchable/filterable views with pagination

#### Elevators & Turnstiles
- Add, edit, duplicate, and delete elevators
- Capture details such as location, elevator type, number of floors
- Apply searchable/filterable views with pagination

#### Intercoms
- Add, edit, duplicate, and delete intercoms
- Capture details such as location, intercom type, connectivity options
- Apply searchable/filterable views with pagination

### 2. Site Walk Dashboard

- Real-time summary of equipment counts (access points, cameras, elevators, intercoms)
- Progress indicator showing site walk completion status
- Site walk details display (SE name, BDM name, site address, dates)
- Action buttons for editing and sharing site walks

### 3. Authentication System

- User registration with secure password hashing
- Login functionality with session management
- Microsoft account integration for enterprise SSO
- Protected routes requiring authentication
- User information display in the top navigation

### 4. Reports and Schedules

- Site walk summary report with equipment counts
- Door schedule report with detailed door information
- Camera schedule report with detailed camera information
- Excel/CSV export capabilities
- PDF export with annotations

## AI Capabilities

### 1. Azure OpenAI Integration

- Secure integration with Microsoft Azure OpenAI services
- Enhanced security through Kastle's dedicated Azure environment
- Configured with gpt-4o-mini model for optimal performance
- Error handling and fallback mechanisms
- Proper token management and rate limiting

### 2. Intelligent Analysis

- Floorplan analysis for equipment suggestion
- Security coverage visualization
- Report generation and summarization
- Equipment identification from site photos
- Multi-language translation support for documentation

### 3. Advanced PDF Processing

- Intelligent extraction of floorplan details
- Automatic equipment placement suggestions
- Area classification and identification
- Technical specifications parsing
- Coverage gap analysis

## Kastle Video Guarding

### 1. Stream Configuration

- Camera Video Stream Details with location, accessibility, and type information
- Field of View (FOV) Accessibility configuration with security level options
- Camera Type selection with industry-standard options
- Environment settings for proper installation planning
- Numeric input for total camera stream count

### 2. Monitoring Configuration

- Event Monitoring configuration with schedule management
- Monitoring start and end time selection
- Audio talk-down configuration options
- Speaker association settings
- Custom incident type configuration

### 3. Use Case Documentation

- Detailed use case problem documentation
- Site scene activity notes
- Reviewer assignment and tracking
- Security level classification
- Integration with other security systems

## Floorplan Management

### 1. PDF Annotation

- Multi-page PDF upload and management
- High-fidelity PDF rendering
- Precise equipment marker placement
- Coordinate system for accurate positioning
- Zoom and pan navigation controls

### 2. Layer Management

- Toggle visibility of different equipment types
- Custom layer creation and management
- Color-coding for different security zones
- Equipment grouping by type or location
- Print-ready view options

### 3. Equipment Visualization

- Visual representation of coverage areas
- Camera field of view visualization
- Access control zone definition
- Equipment status indicators
- Interactive marker information

## Data Model

### Schema Definition

Implement the following schema in `shared/schema.ts`:

```typescript
// users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  role: text("role"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// projects table (actually site walks)
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  client: text("client"),
  site_address: text("site_address"),
  se_name: text("se_name"),
  bdm_name: text("bdm_name"),
  description: text("description"),
  status: text("status").default("in_progress"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  created_by: integer("created_by").references(() => users.id)
});

// access_points table
export const accessPoints = pgTable("access_points", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").notNull().references(() => projects.id),
  location: text("location").notNull(),
  door_type: text("door_type").notNull(),
  reader_type: text("reader_type").notNull(),
  lock_type: text("lock_type").notNull(),
  security_level: text("security_level").notNull(),
  notes: text("notes"),
  pp_integration: text("pp_integration"),
  door_monitoring: text("door_monitoring"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// cameras table
export const cameras = pgTable("cameras", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").notNull().references(() => projects.id),
  location: text("location").notNull(),
  camera_type: text("camera_type").notNull(),
  resolution: text("resolution").notNull(),
  mounting_type: text("mounting_type").notNull(),
  field_of_view: text("field_of_view"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// elevators table
export const elevators = pgTable("elevators", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").notNull().references(() => projects.id),
  location: text("location").notNull(),
  elevator_type: text("elevator_type").notNull(),
  floors_served: integer("floors_served").notNull(),
  security_level: text("security_level").notNull(),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// intercoms table
export const intercoms = pgTable("intercoms", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").notNull().references(() => projects.id),
  location: text("location").notNull(),
  intercom_type: text("intercom_type").notNull(),
  connectivity: text("connectivity").notNull(),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// Create insert schemas omitting auto-generated fields
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const insertAccessPointSchema = createInsertSchema(accessPoints).omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const insertCameraSchema = createInsertSchema(cameras).omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const insertElevatorSchema = createInsertSchema(elevators).omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const insertIntercomSchema = createInsertSchema(intercoms).omit({
  id: true,
  created_at: true,
  updated_at: true
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type AccessPoint = typeof accessPoints.$inferSelect;
export type InsertAccessPoint = z.infer<typeof insertAccessPointSchema>;

export type Camera = typeof cameras.$inferSelect;
export type InsertCamera = z.infer<typeof insertCameraSchema>;

export type Elevator = typeof elevators.$inferSelect;
export type InsertElevator = z.infer<typeof insertElevatorSchema>;

export type Intercom = typeof intercoms.$inferSelect;
export type InsertIntercom = z.infer<typeof insertIntercomSchema>;
```

## Frontend Components

### Main Layout

Create a main layout component (`client/src/layouts/MainLayout.tsx`) that includes the responsive sidebar, top navigation, and content area.

### Authentication Components

#### Auth Page (Login and Registration)

Create an auth page (`client/src/pages/auth-page.tsx`) with:
- Login form with username and password fields
- Registration form with username, email, password fields
- Form validation using zod
- Attractive two-column layout with a form on the left and a hero section on the right

#### Protected Route Component

Create a protected route wrapper (`client/src/lib/protected-route.tsx`) to restrict access to authenticated users.

### Equipment Management

#### Equipment Tabs Component

Create a tab-based interface (`client/src/components/equipment/EquipmentTabs.tsx`) to switch between equipment types.

#### Card Access Tab Component

Create a tab for managing card access points (`client/src/components/equipment/CardAccessTab.tsx`) with:
- Tabular display of access points
- Search and filter functionality
- Add, edit, duplicate, and delete operations
- Pagination controls

#### Cameras Tab Component

Create a tab for managing cameras (`client/src/components/equipment/CamerasTab.tsx`) with similar features as the card access tab.

#### Elevators Tab Component

Create a tab for managing elevators (`client/src/components/equipment/ElevatorsTab.tsx`) with similar features as the card access tab.

#### Intercoms Tab Component

Create a tab for managing intercoms (`client/src/components/equipment/IntercomsTab.tsx`) with similar features as the card access tab.

### Dashboard

Create a dashboard component (`client/src/components/project/ProjectDashboard.tsx`) displaying:
- Site walk status card with progress indicator
- Equipment summary card with counts
- Site walk details card with key information
- Action buttons for editing and sharing

### Modal Components

Create modal components for adding and editing each equipment type:
- AddAccessPointModal.tsx and EditAccessPointModal.tsx
- AddCameraModal.tsx and EditCameraModal.tsx
- AddElevatorModal.tsx and EditElevatorModal.tsx
- AddIntercomModal.tsx and EditIntercomModal.tsx

Each modal should include a form with the appropriate fields for the equipment type.

### Navigation Components

#### Top Navigation

Create a top navigation component (`client/src/components/TopNav.tsx`) with:
- Site walk title and status
- User information and initials display
- Mobile sidebar toggle
- Action buttons

#### Sidebar Navigation

Create a sidebar component (`client/src/components/Sidebar.tsx`) with:
- Site walk logo and branding
- Navigation links to main sections
- Collapsible design for mobile view

## Backend Implementation

### Storage Interface

The application implements a dual storage system with:

1. **Database Storage**: PostgreSQL with Drizzle ORM for persistent storage
   - Implements `IStorage` interface for consistent data access
   - Handles camelCase to snake_case field mapping
   - Proper error handling and transaction management
   - Optimized query performance

2. **Memory Storage**: In-memory fallback for development and testing
   - Sample data initialization for quick setup
   - Mimics database interface for consistent API

### Database Configuration

The PostgreSQL database is configured with:
- Connection pooling for efficient resource usage
- WebSocket support for Neon serverless
- Proper environment variable handling for database credentials
- Schema initialization and migration support

### Authentication System

The authentication system (`server/auth.ts`) implements:
- Passport.js with multiple strategies
  - Local strategy with password hashing using scrypt
  - Microsoft authentication for enterprise SSO
- Secure token management
- User serialization and deserialization
- Session management with secure cookies
- API endpoints for register, login, logout, and user info

### API Routes

Comprehensive API routes (`server/routes.ts`) for:
- User authentication and management
- Project (site walk) management
- Equipment management (access points, cameras, elevators, intercoms)
- Kastle Video Guarding configuration
- Floorplan and marker management
- AI integration for analysis and suggestions
- Reports generation and export
- File upload and management

### Azure OpenAI Integration

The Azure OpenAI integration provides:
- Secure communication with Azure endpoints
- Authentication via API keys stored as environment variables
- Prompt engineering for specialized security tasks
- Error handling with appropriate fallbacks
- Response parsing and formatting

### Server Setup

The Express server (`server/index.ts`) includes:
- Secure middleware configuration
- CORS and security headers
- Session management
- Static file serving
- Error handling and logging
- Vite integration for development

## Authentication System

The application implements a comprehensive authentication system:

1. **Password hashing**: Uses scrypt with salt for secure password storage
2. **Session management**: Uses express-session with secure cookie configuration
3. **Microsoft Authentication**: Integrates with Microsoft identity platform for SSO
4. **Authorization**: Role-based access control for different application features
5. **Session Timeout**: Automatic session expiration after inactivity

## Mobile Responsiveness

The application is fully optimized for mobile use:

### 1. Touch-Friendly Interface
- Larger touch targets for buttons and controls
- Swipe gestures for navigation where appropriate
- Optimized touch input for floorplan annotations

### 2. Responsive Layouts
- Flexible grid system adapting to screen size
- Collapsible sections for better content organization
- Card view mode for data tables on small screens
- Horizontal scrolling for tables with many columns

### 3. Field-Optimized Features
- Offline capability for data collection without connectivity
- Camera integration for on-site photos
- GPS location tagging for equipment
- Data compression for limited bandwidth

## Integration Points

The application integrates with several external systems:

### 1. Microsoft Azure
- Azure OpenAI for intelligent analysis and processing
- Microsoft Graph API for user authentication
- Azure Blob Storage for file storage and management

### 2. CRM Systems
- Integration with customer relationship management systems
- Project and opportunity data synchronization
- Client information retrieval

### 3. Export Formats
- Excel/CSV export for tabular data
- PDF export with annotations
- JSON export for system interoperability
- Custom format exports for specialized systems
