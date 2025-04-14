# Site Walk Checklist Application

A comprehensive web application for digitizing and streamlining security equipment tracking during site walks. This application replaces traditional Excel-based tracking systems with a modern, intelligent web interface.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Setup Instructions](#setup-instructions)
5. [Core Features](#core-features)
6. [Data Model](#data-model)
7. [Frontend Components](#frontend-components)
8. [Backend Implementation](#backend-implementation)
9. [Authentication System](#authentication-system)
10. [Theme Configuration](#theme-configuration)
11. [User Interfaces](#user-interfaces)
12. [Integration Points](#integration-points)

## Project Overview

The Site Walk Checklist is a specialized application for security professionals to manage and track equipment during site walks. It captures detailed information about various security equipment types (card access points, cameras, elevators, and intercoms) and provides tools for analysis, reporting, and exporting.

This application strictly uses "Site Walk" terminology instead of "Project" or "Proposal" as site walks come first in the workflow, followed by a proposal, and only becoming a project once the customer signs.

## Technology Stack

- **Frontend**: React + TypeScript with Vite
- **Backend**: Node.js with Express
- **Authentication**: Passport.js with local strategy
- **State Management**: React Context API + TanStack Query (React Query)
- **Styling**: Tailwind CSS, shadcn/ui components
- **Storage**: In-memory storage with MemStorage implementation
- **Form Handling**: react-hook-form with zod validation
- **Routing**: Wouter for lightweight client-side routing

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
- Protected routes requiring authentication
- User information display in the top navigation

### 4. Reports and Schedules

- Site walk summary report with equipment counts
- Door schedule report with detailed door information
- Camera schedule report with detailed camera information
- Excel/CSV export capabilities

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

Create a storage interface (`server/storage.ts`) with methods for CRUD operations on:
- Users
- Projects (site walks)
- Access points
- Cameras
- Elevators
- Intercoms

Implement in-memory storage using `MemStorage` class with sample data initialization.

### Authentication System

Implement the authentication system (`server/auth.ts`) with:
- Passport.js local strategy
- Password hashing using scrypt
- User serialization and deserialization
- API endpoints for register, login, logout, and user info

### API Routes

Implement API routes (`server/routes.ts`) for:
- User authentication
- Project (site walk) management
- Equipment management (access points, cameras, elevators, intercoms)
- Reports generation

### Server Setup

Set up the Express server (`server/index.ts`) with necessary middleware and error handling.

## Authentication System

Implement a comprehensive authentication system:

1. **Password hashing**: Use scrypt with salt for secure password storage
2. **Session management**: Use express-session with memorystore
3. **Protected routes**: Implement isAuthenticated middleware
4. **Auth hooks**: Create useAuth hook to manage authentication state
5. **Authentication UI**: Create login and registration forms

### server/auth.ts Implementation

```typescript
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
```

### client/src/hooks/use-auth.tsx Implementation

```typescript
import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

## Theme Configuration

### Dark Grey Theme with Red Accent

Create a dark grey theme with red accent colors throughout the application using:

1. **theme.json**:
```json
{
  "primary": "#e53935",
  "variant": "professional",
  "appearance": "dark",
  "radius": 0.5
}
```

2. **CSS Variables in index.css**:
```css
:root {
  --darker-grey: #1e1e1e;
  --dark-grey: #242424;
  --medium-grey: #333333;
  --light-grey: #4a4a4a;
  --red-accent: #e53935;
}

body {
  background-color: var(--darker-grey);
  color: white;
}

/* Add additional styling for components, text, etc. */
```

3. **Consistent Component Styling**:
Apply the theme colors consistently to all components using style attributes:
```jsx
style={{ backgroundColor: 'var(--dark-grey)', borderColor: 'var(--medium-grey)' }}
```

Or Tailwind classes with the proper color values.

## User Interfaces

### Login and Registration Page

Create a two-column auth page with:
- Left side: Forms for login and registration
- Right side: Hero section with site walk description
- Validation using zod schemas
- Error and success messages

### Dashboard Page

Create a dashboard with:
- Site walk status section showing progress
- Equipment summary with counts of each equipment type
- Site walk details section with key information
- Tabs section for equipment management
- Search bar for equipment filtering

### Equipment Management Pages

For each equipment type, create a page with:
- Tabular list of items
- Search and filter functionality
- Pagination controls
- Action buttons for add, edit, duplicate, delete
- Modals for adding/editing items

### Project Summary Page

Create a summary page with:
- Equipment count cards
- Site walk details
- Buttons for generating reports and schedules

## Integration Points

### API Endpoints

Implement the following API endpoints:

1. **Authentication**:
   - POST /api/register
   - POST /api/login
   - POST /api/logout
   - GET /api/user

2. **Projects (Site Walks)**:
   - GET /api/projects
   - GET /api/projects/:id
   - POST /api/projects
   - PUT /api/projects/:id
   - DELETE /api/projects/:id

3. **Access Points**:
   - GET /api/projects/:projectId/access-points
   - GET /api/access-points/:id
   - POST /api/access-points
   - POST /api/access-points/:id/duplicate
   - PUT /api/access-points/:id
   - DELETE /api/access-points/:id

4. **Cameras**:
   - GET /api/projects/:projectId/cameras
   - GET /api/cameras/:id
   - POST /api/cameras
   - POST /api/cameras/:id/duplicate
   - PUT /api/cameras/:id
   - DELETE /api/cameras/:id

5. **Elevators**:
   - GET /api/projects/:projectId/elevators
   - GET /api/elevators/:id
   - POST /api/elevators
   - POST /api/elevators/:id/duplicate
   - PUT /api/elevators/:id
   - DELETE /api/elevators/:id

6. **Intercoms**:
   - GET /api/projects/:projectId/intercoms
   - GET /api/intercoms/:id
   - POST /api/intercoms
   - POST /api/intercoms/:id/duplicate
   - PUT /api/intercoms/:id
   - DELETE /api/intercoms/:id

7. **Reports**:
   - GET /api/projects/:projectId/reports/door-schedule
   - GET /api/projects/:projectId/reports/camera-schedule
   - GET /api/projects/:projectId/reports/project-summary

8. **Lookup Data**:
   - GET /api/lookup

### Synchronization and Real-time Updates

Implement cache invalidation on all data-modifying operations:

```typescript
// Invalidate queries when data changes
queryClient.invalidateQueries({ 
  queryKey: [`/api/projects/${project.id}/access-points`]
});
queryClient.invalidateQueries({
  queryKey: [`/api/projects/${project.id}/reports/project-summary`]
});
```

This ensures that the UI always displays the most up-to-date information, especially for the summary counts.

---

By following this detailed guide, you'll be able to reproduce the exact Site Walk Checklist application with all its features, styling, and functionality.