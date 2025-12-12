# Backend Architecture & Dependencies Explanation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Dependencies Explained](#dependencies-explained)
4. [Project Structure](#project-structure)
5. [File-by-File Breakdown](#file-by-file-breakdown)
6. [How Everything Works Together](#how-everything-works-together)
7. [Environment Variables](#environment-variables)

---

## 🎯 Overview

This is a **Node.js/Express.js** backend API for **Donatrack**, a donation tracking platform. It's built with **TypeScript** for type safety and uses **Prisma ORM** to interact with a **PostgreSQL** database. The backend handles authentication, campaign management, donations, payment processing (via Xendit), and administrative functions.

**Architecture Pattern**: MVC (Model-View-Controller) with a service layer
- **Models**: Defined in Prisma schema
- **Controllers**: Handle business logic and request/response
- **Routes**: Define API endpoints
- **Services**: External integrations (Prisma, Xendit)
- **Middleware**: Authentication and authorization
- **Utils**: Helper functions

---

## 🛠 Technology Stack

### Core Technologies
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web framework for building REST APIs
- **TypeScript**: Typed superset of JavaScript for better code quality
- **PostgreSQL**: Relational database
- **Prisma**: Modern ORM (Object-Relational Mapping) for database access

---

## 📦 Dependencies Explained

### Production Dependencies (`dependencies`)

#### **@prisma/client** (^6.19.0)
- **Purpose**: Prisma's database client - auto-generated TypeScript types and query builder
- **Why Important**: 
  - Provides type-safe database queries
  - Auto-completion in your IDE
  - Prevents SQL injection attacks
  - Generates types from your database schema
- **Usage**: Used in `prisma.service.ts` to create database queries

#### **bcrypt** (^6.0.0) & **bcryptjs** (^3.0.3)
- **Purpose**: Password hashing libraries
- **Why Important**: 
  - Never store passwords in plain text
  - bcrypt hashes passwords with salt (random data) for security
  - bcryptjs is a pure JavaScript implementation (works everywhere)
- **Usage**: Used in `utils/hash.ts` to hash passwords before storing and compare passwords during login

#### **cookie-parser** (^1.4.7)
- **Purpose**: Parse HTTP cookies from requests
- **Why Important**: 
  - Extracts cookies from `Cookie` header
  - Needed for session management or OAuth callbacks
- **Usage**: Middleware in `app.ts` to parse cookies

#### **cors** (^2.8.5)
- **Purpose**: Cross-Origin Resource Sharing middleware
- **Why Important**: 
  - Allows frontend (running on different port/domain) to make API requests
  - Prevents unauthorized websites from accessing your API
  - Configures which origins can access your API
- **Usage**: Configured in `app.ts` with allowed origins (frontend URL, localhost, Vercel deployments)

#### **dotenv** (^17.2.3)
- **Purpose**: Loads environment variables from `.env` file
- **Why Important**: 
  - Keeps sensitive data (API keys, secrets) out of code
  - Different configs for development/production
- **Usage**: Loaded in `server.ts` and `app.ts` to access `process.env` variables

#### **express** (^5.1.0)
- **Purpose**: Web framework for Node.js
- **Why Important**: 
  - Simplifies HTTP server creation
  - Handles routing, middleware, request/response
  - Industry standard for Node.js APIs
- **Usage**: Main framework - creates the Express app in `app.ts`

#### **jsonwebtoken** (^9.0.2)
- **Purpose**: Create and verify JSON Web Tokens (JWT)
- **Why Important**: 
  - Stateless authentication (no server-side sessions)
  - Tokens contain user info (id, role) that can be verified
  - Used for protected routes
- **Usage**: Used in `utils/jwt.ts` to sign tokens on login and verify tokens in `auth.middleware.ts`

#### **nodemailer** (^7.0.10)
- **Purpose**: Send emails from Node.js
- **Why Important**: 
  - Password reset emails
  - Email notifications
  - Email verification (if needed)
- **Usage**: Configured in `config/mailer.ts` with Gmail SMTP, used in `utils/email.ts`

#### **passport** (^0.7.0)
- **Purpose**: Authentication middleware for Express
- **Why Important**: 
  - Standardized authentication strategies
  - Supports multiple OAuth providers (Google, GitHub, etc.)
  - Handles OAuth flow automatically
- **Usage**: Initialized in `app.ts`, configured in `config/passport.ts`

#### **passport-github2** (^0.1.12)
- **Purpose**: GitHub OAuth strategy for Passport
- **Why Important**: Allows users to login with GitHub account
- **Usage**: Can be added to `config/passport.ts` (currently only Google is configured)

#### **passport-google-oauth20** (^2.0.0)
- **Purpose**: Google OAuth strategy for Passport
- **Why Important**: Allows users to login with Google account (social login)
- **Usage**: Configured in `config/passport.ts` for Google OAuth

#### **tsconfig-paths** (^4.2.0)
- **Purpose**: Resolves TypeScript path aliases at runtime
- **Why Important**: 
  - Allows imports like `@/utils/jwt` instead of `../../utils/jwt`
  - Makes imports cleaner and easier to refactor
- **Usage**: Used in dev script with `-r tsconfig-paths/register`

#### **xendit-node** (^5.1.1)
- **Purpose**: Xendit payment gateway SDK (though custom implementation is used)
- **Why Important**: 
  - Xendit is a payment processor popular in Southeast Asia
  - Handles GCash, credit cards, and other payment methods
  - Processes donations securely
- **Usage**: Payment processing in `services/xendit.service.ts` (custom fetch-based implementation)

### Development Dependencies (`devDependencies`)

#### **@types/*** packages
- **Purpose**: TypeScript type definitions for JavaScript libraries
- **Why Important**: 
  - Provides IntelliSense/autocomplete in IDE
  - Type checking for external libraries
  - Prevents runtime errors
- **Packages**: `@types/bcrypt`, `@types/cookie-parser`, `@types/cors`, `@types/express`, `@types/jsonwebtoken`, `@types/node`, `@types/nodemailer`, `@types/passport`, `@types/passport-github2`, `@types/passport-google-oauth20`

#### **nodemon** (^3.1.11)
- **Purpose**: Auto-restarts server when files change
- **Why Important**: 
  - Speeds up development
  - No manual restart needed after code changes
- **Usage**: Used in `dev` script: `nodemon --exec ts-node ...`

#### **prisma** (^6.19.0)
- **Purpose**: Prisma CLI for migrations and code generation
- **Why Important**: 
  - Generates Prisma Client from schema
  - Creates and runs database migrations
  - Manages database schema changes
- **Usage**: Commands like `prisma generate`, `prisma migrate dev`

#### **ts-node** (^10.9.2)
- **Purpose**: Run TypeScript files directly without compiling
- **Why Important**: 
  - Faster development (no compile step)
  - Used in development scripts
- **Usage**: `ts-node src/server.ts` runs TypeScript directly

#### **typescript** (^5.9.3)
- **Purpose**: TypeScript compiler
- **Why Important**: 
  - Compiles TypeScript to JavaScript
  - Type checking
  - Used in `build` script to create production code
- **Usage**: `tsc` compiles TypeScript to JavaScript in `dist/` folder

---

## 📁 Project Structure

```
backend/
├── prisma/                    # Database schema and migrations
│   ├── migrations/           # Database migration history
│   ├── schema.prisma         # Database schema definition
│   └── seed.ts               # Database seeding script
├── src/                      # Source code
│   ├── config/               # Configuration files
│   │   ├── index.ts          # Main config exports
│   │   ├── mailer.ts         # Email configuration
│   │   └── passport.ts       # OAuth configuration
│   ├── controllers/          # Business logic handlers
│   │   ├── admin.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── campaigns.controller.ts
│   │   ├── donations.controller.ts
│   │   ├── funds.controller.ts
│   │   └── proof.controller.ts
│   ├── middleware/            # Express middleware
│   │   └── auth.middleware.ts # Authentication middleware
│   ├── routes/               # API route definitions
│   │   ├── admin.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── campaigns.routes.ts
│   │   ├── donations.routes.ts
│   │   ├── funds.routes.ts
│   │   └── proof.routes.ts
│   ├── services/             # External service integrations
│   │   ├── prisma.service.ts # Database service
│   │   └── xendit.service.ts # Payment service
│   ├── utils/                # Helper functions
│   │   ├── email.ts          # Email sending utilities
│   │   ├── hash.ts           # Password hashing
│   │   ├── jwt.ts            # JWT token utilities
│   │   ├── logger.ts         # Logging utilities
│   │   └── validate.ts       # Validation utilities
│   ├── app.ts                # Express app configuration
│   └── server.ts             # Server entry point
├── node_modules/             # Installed dependencies
├── package.json              # Dependencies and scripts
├── package-lock.json         # Locked dependency versions
├── tsconfig.json             # TypeScript configuration
└── .env                      # Environment variables (not in git)
```

---

## 📄 File-by-File Breakdown

### Root Level Files

#### **package.json**
- **Purpose**: Defines project metadata, dependencies, and scripts
- **Key Scripts**:
  - `dev`: Runs development server with auto-reload
  - `build`: Compiles TypeScript to JavaScript
  - `start`: Runs production server
  - `db:generate`: Generates Prisma Client
  - `db:migrate`: Runs database migrations
  - `db:seed`: Seeds database with initial data
- **Importance**: Central configuration file - defines what the project needs

#### **tsconfig.json**
- **Purpose**: TypeScript compiler configuration
- **Key Settings**:
  - `target: ES2020`: Compiles to modern JavaScript
  - `module: commonjs`: Uses CommonJS modules (Node.js standard)
  - `strict: true`: Enables strict type checking
  - `baseUrl: src`: Sets base path for imports
  - `paths: @/*`: Allows `@/` imports
- **Importance**: Ensures consistent TypeScript compilation

### Prisma Files

#### **prisma/schema.prisma**
- **Purpose**: Defines database schema (tables, relationships, types)
- **Models**:
  - `User`: Users with roles (USER, CREATOR, ADMIN), funds, Xendit keys
  - `Campaign`: Fundraising campaigns
  - `Donation`: Donation records with payment info
  - `Proof`: Proof of fund usage (images)
  - `Withdrawal`: Withdrawal requests
- **Importance**: Single source of truth for database structure

#### **prisma/migrations/**
- **Purpose**: History of database schema changes
- **Importance**: 
  - Version control for database
  - Can rollback changes
  - Reproducible database setup

#### **prisma/seed.ts**
- **Purpose**: Populates database with initial/test data
- **Creates**: Admin user, regular user, creator user, sample campaigns
- **Importance**: 
  - Quick setup for development
  - Testing with known data
  - Demo data

### Source Files (`src/`)

#### **server.ts** (Entry Point)
- **Purpose**: Starts the HTTP server
- **Responsibilities**:
  - Loads environment variables
  - Starts Express app on configured port
  - Connects to database via Prisma
  - Starts background job to sync pending donations
- **Importance**: Application entry point - everything starts here

#### **app.ts** (Express Configuration)
- **Purpose**: Configures Express application
- **Responsibilities**:
  - Sets up CORS (Cross-Origin Resource Sharing)
  - Configures middleware (cookie parser, JSON parser)
  - Initializes Passport for OAuth
  - Registers all API routes
  - Test route for health checks
- **Importance**: Central configuration for HTTP server

### Configuration (`src/config/`)

#### **config/index.ts**
- **Purpose**: Exports environment variables with defaults
- **Variables**: PORT, JWT_SECRET, JWT_EXPIRES_IN, FRONTEND_URL, RESET_TOKEN_EXP_MIN
- **Importance**: Centralized config access, prevents undefined errors

#### **config/passport.ts**
- **Purpose**: Configures Passport.js OAuth strategies
- **Current Setup**: Google OAuth only
- **Flow**:
  1. User clicks "Login with Google"
  2. Redirected to Google
  3. Google redirects back with code
  4. Passport exchanges code for user info
  5. Creates/finds user in database
  6. Returns user to app
- **Importance**: Handles social login authentication

#### **config/mailer.ts**
- **Purpose**: Configures Nodemailer for sending emails
- **Setup**: Gmail SMTP configuration
- **Usage**: Password reset emails, notifications
- **Importance**: Email functionality for user management

### Controllers (`src/controllers/`)

Controllers handle business logic and HTTP request/response.

#### **auth.controller.ts**
- **Purpose**: Authentication endpoints
- **Functions**: Register, login, logout, password reset, OAuth callbacks
- **Importance**: User authentication and session management

#### **campaigns.controller.ts**
- **Purpose**: Campaign CRUD operations
- **Functions**: Create, read, update, delete campaigns, list campaigns
- **Importance**: Core feature - managing fundraising campaigns

#### **donations.controller.ts**
- **Purpose**: Donation processing
- **Functions**: 
  - Create donation (creates Xendit invoice)
  - Webhook handler (Xendit payment callbacks)
  - Sync pending donations (background job)
- **Importance**: Payment processing and donation tracking

#### **funds.controller.ts**
- **Purpose**: User funds management
- **Functions**: Get user funds, withdraw funds
- **Importance**: Manages campaign creator's collected funds

#### **proof.controller.ts**
- **Purpose**: Proof of fund usage
- **Functions**: Create, read, update, delete proofs (with images)
- **Importance**: Transparency - shows how donations were used

#### **admin.controller.ts**
- **Purpose**: Administrative functions
- **Functions**: User management, campaign approval, system stats
- **Importance**: Platform administration

### Routes (`src/routes/`)

Routes define API endpoints and connect them to controllers.

#### **auth.routes.ts**
- **Endpoints**: `/api/auth/v1/register`, `/login`, `/logout`, `/google`, `/google/callback`, `/forgot-password`, `/reset-password`
- **Importance**: Defines authentication API structure

#### **campaigns.routes.ts**
- **Endpoints**: `/campaigns` (GET, POST), `/campaigns/:id` (GET, PUT, DELETE)
- **Importance**: Campaign API endpoints

#### **donations.routes.ts**
- **Endpoints**: `/donations` (POST), `/donations/webhook` (POST)
- **Importance**: Donation processing endpoints

#### **funds.routes.ts**
- **Endpoints**: `/funds` (GET), `/funds/withdraw` (POST)
- **Importance**: Funds management endpoints

#### **proof.routes.ts**
- **Endpoints**: `/proofs` (POST), `/proofs/:id` (GET, PUT, DELETE)
- **Importance**: Proof management endpoints

#### **admin.routes.ts**
- **Endpoints**: `/admin/users`, `/admin/campaigns`, `/admin/stats`
- **Importance**: Admin API endpoints

### Services (`src/services/`)

Services handle external integrations.

#### **prisma.service.ts**
- **Purpose**: Prisma Client singleton instance
- **Why Singleton**: 
  - Prisma Client should be reused (connection pooling)
  - Prevents multiple database connections
- **Importance**: Database access point for entire application

#### **xendit.service.ts**
- **Purpose**: Xendit payment gateway integration
- **Functions**:
  - `createXenditInvoice`: Creates payment invoice
  - `fetchXenditInvoice`: Gets invoice status
  - `calculatePlatformFee`: Calculates platform commission
- **Features**:
  - Falls back to mock invoices if Xendit not configured
  - Normalizes payment methods (GCash, Credit Card)
- **Importance**: Payment processing - core revenue feature

### Middleware (`src/middleware/`)

#### **auth.middleware.ts**
- **Purpose**: Protects routes requiring authentication
- **Function**: `protect(roles?)`
- **How It Works**:
  1. Extracts JWT token from `Authorization` header
  2. Verifies token signature
  3. Finds user in database
  4. Checks user role (if roles specified)
  5. Attaches user to request object
  6. Calls next() or returns 401/403
- **Usage**: `protect()`, `protect(['ADMIN'])`, `protect(['CREATOR', 'ADMIN'])`
- **Importance**: Security - prevents unauthorized access

### Utils (`src/utils/`)

Utility functions used across the application.

#### **jwt.ts**
- **Functions**: `signToken()`, `verifyToken()`
- **Purpose**: JWT token creation and verification
- **Importance**: Authentication token management

#### **hash.ts**
- **Functions**: `hashPassword()`, `comparePassword()`
- **Purpose**: Password hashing and comparison
- **Importance**: Password security

#### **email.ts**
- **Purpose**: Email sending utilities
- **Functions**: Sends password reset emails, notifications
- **Importance**: User communication

#### **validate.ts**
- **Purpose**: Input validation utilities
- **Importance**: Data validation before processing

#### **logger.ts**
- **Purpose**: Logging utilities
- **Importance**: Debugging and monitoring

---

## 🔄 How Everything Works Together

### Request Flow Example: Creating a Donation

1. **Frontend** sends POST request to `/donations` with donation data
2. **Express** (`app.ts`) receives request
3. **CORS middleware** checks if origin is allowed
4. **Cookie parser** extracts cookies (if any)
5. **JSON parser** parses request body
6. **Route** (`donations.routes.ts`) matches `/donations` POST endpoint
7. **Auth middleware** (`auth.middleware.ts`) verifies JWT token
8. **Controller** (`donations.controller.ts`) handles request:
   - Validates input
   - Creates donation record in database via **Prisma** (`prisma.service.ts`)
   - Creates Xendit invoice via **Xendit service** (`xendit.service.ts`)
   - Updates donation with Xendit payment ID
   - Returns checkout URL to frontend
9. **Frontend** redirects user to Xendit checkout page
10. **User** completes payment on Xendit
11. **Xendit** sends webhook to `/donations/webhook`
12. **Webhook handler** updates donation status to COMPLETED
13. **Background job** (`server.ts`) periodically syncs pending donations (fallback if webhook fails)

### Authentication Flow: Google OAuth

1. **User** clicks "Login with Google" on frontend
2. **Frontend** redirects to `/api/auth/v1/google`
3. **Passport** (`config/passport.ts`) redirects to Google OAuth page
4. **User** authorizes on Google
5. **Google** redirects to `/api/auth/v1/google/callback` with code
6. **Passport** exchanges code for user profile
7. **Passport callback** finds or creates user in database
8. **Auth controller** generates JWT token
9. **Frontend** receives token and stores it
10. **Future requests** include token in `Authorization` header
11. **Auth middleware** verifies token on protected routes

### Database Flow: Prisma ORM

1. **Schema** (`prisma/schema.prisma`) defines models
2. **Migration** (`prisma migrate dev`) creates/updates database tables
3. **Prisma Client** (`prisma generate`) generates TypeScript types
4. **Service** (`prisma.service.ts`) exports Prisma Client instance
5. **Controllers** use Prisma Client to query database:
   ```typescript
   await prisma.user.findUnique({ where: { email } })
   await prisma.campaign.create({ data: {...} })
   ```
6. **Type Safety**: TypeScript knows exact types from schema

---

## 🔐 Environment Variables

Required environment variables (set in `.env` file):

### Database
- **DATABASE_URL**: PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database`
  - Example: `postgresql://postgres:password@localhost:5432/donatrack`

### Server
- **PORT**: Server port (default: 4000)
- **NODE_ENV**: Environment (`development` or `production`)

### Authentication
- **JWT_SECRET**: Secret key for signing JWT tokens (use strong random string)
- **JWT_EXPIRES_IN**: Token expiration (default: `7d`)

### Frontend
- **FRONTEND_URL**: Frontend URL for CORS (e.g., `https://donatrack.vercel.app`)

### OAuth (Google)
- **GOOGLE_CLIENT_ID**: Google OAuth client ID
- **GOOGLE_CLIENT_SECRET**: Google OAuth client secret
- **GOOGLE_CALLBACK_URL**: OAuth callback URL

### Email (Gmail)
- **EMAIL_USER**: Gmail address for sending emails
- **EMAIL_PASS**: Gmail app password (not regular password)

### Payment (Xendit)
- **XENDIT_SECRET_KEY**: Xendit API secret key (for production)
- **XENDIT_PUBLIC_KEY**: Xendit public key (optional)

### Background Jobs
- **PAYMENT_SYNC_INTERVAL_MS**: Interval for syncing pending donations (default: 60000ms = 1 minute)

---

## 🎓 Key Concepts

### MVC Pattern
- **Model**: Database schema (Prisma models)
- **View**: Not applicable (API only, no views)
- **Controller**: Business logic (`controllers/`)

### Middleware Chain
Express processes requests through middleware in order:
1. CORS
2. Cookie Parser
3. JSON Parser
4. Passport
5. Routes (with auth middleware if protected)

### Database Relationships
- **User** → **Campaigns** (one-to-many)
- **User** → **Donations** (one-to-many)
- **Campaign** → **Donations** (one-to-many)
- **Campaign** → **Proofs** (one-to-many)
- **User** → **Withdrawals** (one-to-many)
- **Campaign** → **Withdrawals** (optional one-to-many)

### Security Features
1. **Password Hashing**: bcrypt with salt
2. **JWT Tokens**: Stateless authentication
3. **CORS**: Prevents unauthorized origins
4. **Role-Based Access**: USER, CREATOR, ADMIN roles
5. **Input Validation**: Validates user input
6. **SQL Injection Prevention**: Prisma parameterized queries

---

## 🚀 Development Workflow

1. **Setup**:
   ```bash
   npm install              # Install dependencies
   npm run db:generate      # Generate Prisma Client
   npm run db:migrate       # Run database migrations
   npm run db:seed          # Seed database (optional)
   ```

2. **Development**:
   ```bash
   npm run dev              # Start dev server with auto-reload
   ```

3. **Production**:
   ```bash
   npm run build            # Compile TypeScript
   npm start                # Run production server
   ```

---

## 📚 Additional Resources

- **Express.js**: https://expressjs.com/
- **Prisma**: https://www.prisma.io/docs
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Passport.js**: http://www.passportjs.org/
- **Xendit**: https://docs.xendit.co/

---

This backend is designed to be:
- ✅ **Type-safe** (TypeScript + Prisma)
- ✅ **Secure** (JWT, password hashing, CORS)
- ✅ **Scalable** (modular structure, service layer)
- ✅ **Maintainable** (clear separation of concerns)
- ✅ **Production-ready** (error handling, logging, background jobs)

