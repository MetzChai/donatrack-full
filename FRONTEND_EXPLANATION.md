# Frontend Architecture & Dependencies Explanation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Dependencies Explained](#dependencies-explained)
4. [Project Structure](#project-structure)
5. [File-by-File Breakdown](#file-by-file-breakdown)
6. [How Everything Works Together](#how-everything-works-together)
7. [Environment Variables](#environment-variables)
8. [Next.js App Router Concepts](#nextjs-app-router-concepts)

---

## 🎯 Overview

This is a **Next.js 14** frontend application for **Donatrack**, built with **React 18** and **TypeScript**. It uses the **App Router** (Next.js 13+ routing system) and **Tailwind CSS** for styling. The frontend communicates with the backend API to handle authentication, campaign management, donations, and administrative functions.

**Architecture Pattern**: Component-based React architecture with:
- **Pages**: Route-based components (App Router)
- **Components**: Reusable UI components
- **Contexts**: Global state management (React Context API)
- **Utils**: Helper functions
- **Lib**: API client and external integrations

---

## 🛠 Technology Stack

### Core Technologies
- **Next.js 14**: React framework with App Router, SSR, SSG, and API routes
- **React 18**: UI library with hooks and context API
- **TypeScript**: Typed JavaScript for better code quality
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests

---

## 📦 Dependencies Explained

### Production Dependencies (`dependencies`)

#### **next** (^14.2.33)
- **Purpose**: React framework for production
- **Why Important**: 
  - **App Router**: File-based routing system
  - **Server Components**: Render components on server (faster initial load)
  - **Client Components**: Interactive components with "use client"
  - **Image Optimization**: Automatic image optimization
  - **Code Splitting**: Automatic code splitting for better performance
  - **API Routes**: Can create API endpoints (not used in this project)
- **Key Features Used**:
  - App Router (`app/` directory)
  - Dynamic routes (`[id]` folders)
  - Server and Client Components
  - Built-in CSS support

#### **react** (18.2.0) & **react-dom** (18.2.0)
- **Purpose**: React library and DOM renderer
- **Why Important**: 
  - Core UI library
  - Hooks (useState, useEffect, useContext)
  - Component composition
  - Virtual DOM for efficient updates
- **Usage**: All components use React hooks and JSX

#### **axios** (^1.4.0)
- **Purpose**: HTTP client for making API requests
- **Why Important**: 
  - Easier than fetch API
  - Request/response interceptors
  - Automatic JSON parsing
  - Better error handling
  - Timeout support
- **Usage**: Configured in `lib/api.ts` with interceptors for logging and error handling

#### **@headlessui/react** (^2.2.9)
- **Purpose**: Unstyled, accessible UI components
- **Why Important**: 
  - Pre-built accessible components (modals, dropdowns, etc.)
  - No default styling (use with Tailwind)
  - ARIA attributes built-in
- **Usage**: Used for modals and interactive components (if implemented)

#### **@heroicons/react** (^2.0.18)
- **Purpose**: Beautiful SVG icon library
- **Why Important**: 
  - Consistent icon set
  - React components (easy to use)
  - Two variants: outline and solid
- **Usage**: Icons throughout the UI (if implemented)

### Development Dependencies (`devDependencies`)

#### **typescript** (^5.5.2)
- **Purpose**: TypeScript compiler
- **Why Important**: 
  - Type checking
  - Better IDE support
  - Catches errors before runtime
- **Usage**: Compiles TypeScript to JavaScript

#### **@types/node** (24.10.1) & **@types/react** (19.2.6)
- **Purpose**: TypeScript type definitions
- **Why Important**: 
  - Type safety for Node.js and React APIs
  - IntelliSense in IDE
- **Usage**: TypeScript knows types for Node.js and React

#### **tailwindcss** (^3.4.7)
- **Purpose**: Utility-first CSS framework
- **Why Important**: 
  - Rapid UI development
  - Consistent design system
  - Responsive design utilities
  - Small production bundle (only used classes)
- **Usage**: All styling uses Tailwind utility classes

#### **postcss** (^8.4.23)
- **Purpose**: CSS transformation tool
- **Why Important**: 
  - Processes Tailwind CSS
  - Adds vendor prefixes
  - Required by Tailwind
- **Usage**: Configured in `postcss.config.js`

#### **autoprefixer** (^10.4.14)
- **Purpose**: Adds vendor prefixes to CSS
- **Why Important**: 
  - Ensures CSS works in all browsers
  - Automatically adds `-webkit-`, `-moz-`, etc.
- **Usage**: Used by PostCSS to process Tailwind CSS

---

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── about/               # About page
│   │   └── page.tsx
│   ├── admin/               # Admin dashboard
│   │   └── page.tsx
│   ├── auth/                # Authentication pages
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── campaigns/           # Campaign pages
│   │   ├── [id]/           # Dynamic route - campaign detail
│   │   ├── ended/          # Ended campaigns
│   │   ├── new/            # Create campaign
│   │   └── page.tsx        # List campaigns
│   ├── donate-failed/      # Donation failure page
│   ├── donate-history/     # User donation history
│   ├── donate-success/     # Donation success page
│   ├── transparency/       # Transparency/proofs page
│   ├── user/               # User dashboard
│   ├── withdrawals/        # Withdrawal management
│   ├── layout.tsx          # Root layout (wraps all pages)
│   └── page.tsx            # Homepage
├── components/             # Reusable React components
│   ├── CampaignCard.tsx   # Campaign card component
│   ├── DonateForm.tsx     # Donation form component
│   ├── DonateModal.tsx    # Donation modal component
│   ├── GuestPage.tsx      # Guest/unauthorized page wrapper
│   ├── Header.tsx         # Navigation header
│   └── ProtectedPage.tsx  # Route protection wrapper
├── contexts/               # React Context providers
│   └── AuthContext.tsx    # Authentication context
├── lib/                   # Library/utility code
│   └── api.ts             # API client (Axios configuration)
├── public/                # Static assets
│   ├── Clark.png
│   ├── kAREN.png
│   ├── metz-id.jpg
│   └── Remar.jpg
├── styles/                 # Global styles
│   └── globals.css        # Global CSS + Tailwind imports
├── utils/                  # Utility functions
│   └── auth.ts             # Auth helper functions
├── next.config.js          # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

---

## 📄 File-by-File Breakdown

### Root Level Files

#### **package.json**
- **Purpose**: Defines project metadata, dependencies, and scripts
- **Key Scripts**:
  - `dev`: Starts development server (`next dev`)
  - `build`: Builds production bundle (`next build`)
  - `start`: Starts production server (`next start`)
  - `lint`: Runs ESLint (`next lint`)
- **Importance**: Central configuration file

#### **tsconfig.json**
- **Purpose**: TypeScript compiler configuration
- **Key Settings**:
  - `target: ES2020`: Modern JavaScript output
  - `jsx: preserve`: Keeps JSX for Next.js to process
  - `module: ESNext`: ES modules
  - `paths: @/*`: Allows `@/` imports (e.g., `@/components/Header`)
- **Importance**: TypeScript configuration for type checking

#### **next.config.js**
- **Purpose**: Next.js configuration
- **Settings**:
  - `reactStrictMode: true`: Enables React strict mode (catches bugs)
- **Importance**: Next.js behavior configuration

#### **tailwind.config.js**
- **Purpose**: Tailwind CSS configuration
- **Settings**:
  - `content`: Files to scan for Tailwind classes
  - `theme`: Custom theme extensions
- **Importance**: Configures which files Tailwind scans for classes

#### **postcss.config.js**
- **Purpose**: PostCSS configuration
- **Plugins**: Tailwind CSS and Autoprefixer
- **Importance**: Processes Tailwind CSS into regular CSS

### App Directory (`app/`)

The `app/` directory uses Next.js App Router - file-based routing where folders define routes.

#### **app/layout.tsx** (Root Layout)
- **Purpose**: Root layout that wraps all pages
- **Responsibilities**:
  - Provides HTML structure (`<html>`, `<body>`)
  - Wraps app with `AuthProvider` (authentication context)
  - Includes `Header` component on all pages
  - Sets global styles and classes
- **Key Features**:
  - `AuthProvider`: Makes auth state available to all pages
  - `Header`: Navigation bar on every page
  - Global styling: `bg-gray-50`, `antialiased`
- **Importance**: Base structure for entire application

#### **app/page.tsx** (Homepage)
- **Purpose**: Landing page
- **Features**:
  - Hero section with call-to-action
  - Featured campaigns carousel
  - Scrollable campaign cards
  - Fetches campaigns from API
- **Client Component**: Uses `"use client"` for interactivity
- **Importance**: First impression, main entry point

#### **app/auth/login/page.tsx**
- **Purpose**: User login page
- **Features**:
  - Email/password login form
  - Google OAuth login button
  - Handles OAuth callback (token in URL params)
  - Error handling and loading states
- **Client Component**: Uses hooks and form handling
- **Importance**: Authentication entry point

#### **app/auth/register/page.tsx**
- **Purpose**: User registration page
- **Features**: Registration form with validation
- **Importance**: New user signup

#### **app/auth/forgot-password/page.tsx** & **app/auth/reset-password/page.tsx**
- **Purpose**: Password reset flow
- **Features**: Email-based password reset
- **Importance**: User account recovery

#### **app/campaigns/page.tsx**
- **Purpose**: List all campaigns
- **Features**: Grid of campaign cards
- **Importance**: Browse campaigns

#### **app/campaigns/[id]/page.tsx**
- **Purpose**: Campaign detail page (dynamic route)
- **Features**:
  - Campaign details
  - Donation form/modal
  - Progress bar
  - Donation history
- **Dynamic Route**: `[id]` means URL parameter (e.g., `/campaigns/abc123`)
- **Importance**: Individual campaign view

#### **app/campaigns/new/page.tsx**
- **Purpose**: Create new campaign
- **Features**: Campaign creation form
- **Protected**: Requires authentication (likely uses `ProtectedPage`)
- **Importance**: Campaign creators create campaigns here

#### **app/campaigns/ended/page.tsx**
- **Purpose**: List ended campaigns
- **Features**: Shows completed campaigns
- **Importance**: Campaign history view

#### **app/admin/page.tsx**
- **Purpose**: Admin dashboard
- **Features**:
  - User management
  - Campaign management
  - System statistics
  - Withdrawal approvals
- **Protected**: Requires ADMIN role
- **Importance**: Platform administration

#### **app/user/page.tsx**
- **Purpose**: User dashboard
- **Features**: User's campaigns, funds, profile
- **Protected**: Requires authentication
- **Importance**: User's personal dashboard

#### **app/donate-history/page.tsx**
- **Purpose**: User's donation history
- **Features**: List of all donations made by user
- **Protected**: Requires authentication
- **Importance**: Track donation history

#### **app/withdrawals/page.tsx**
- **Purpose**: Withdrawal management
- **Features**: View and manage withdrawal requests
- **Protected**: Requires CREATOR or ADMIN role
- **Importance**: Fund withdrawal interface

#### **app/transparency/page.tsx**
- **Purpose**: Transparency/proofs page
- **Features**: Shows proofs of fund usage
- **Importance**: Builds trust, shows how donations are used

#### **app/donate-success/page.tsx** & **app/donate-failed/page.tsx**
- **Purpose**: Donation result pages
- **Features**: Success/failure messages after payment
- **Importance**: User feedback after donation

### Components (`components/`)

#### **Header.tsx**
- **Purpose**: Navigation header component
- **Features**:
  - Logo and branding
  - Navigation links (Home, Donations, Campaign History, etc.)
  - User profile dropdown
  - Logout button
  - Conditional rendering based on auth state
- **Uses**: `useAuth()` hook, `usePathname()` for active link highlighting
- **Importance**: Consistent navigation across all pages

#### **CampaignCard.tsx**
- **Purpose**: Reusable campaign card component
- **Features**:
  - Campaign image, title, description
  - Progress bar showing funding percentage
  - Funding amount and goal
  - Creator information
  - Status indicators (ended, implemented)
  - Clickable link to campaign detail
- **Props**: Campaign object with all campaign data
- **Importance**: Consistent campaign display across pages

#### **DonateModal.tsx**
- **Purpose**: Modal for making donations
- **Features**:
  - Donor information form
  - Campaign selection
  - Amount input with preset buttons
  - Payment method selection (GCash, Card)
  - Payment details (mobile number, card info)
  - Form validation
  - Redirects to Xendit checkout or success page
- **State Management**: Multiple useState hooks for form fields
- **Importance**: Core donation functionality

#### **ProtectedPage.tsx**
- **Purpose**: Route protection wrapper component
- **Features**:
  - Checks authentication status
  - Checks user role (if required)
  - Redirects to login if not authenticated
  - Shows loading state
  - Renders children only if authorized
- **Props**: `requiredRole` (optional role requirement)
- **Usage**: Wraps protected pages
- **Importance**: Security - prevents unauthorized access

#### **GuestPage.tsx**
- **Purpose**: Wrapper for guest/unauthorized pages
- **Features**: Shows message for unauthorized users
- **Importance**: User feedback for access denied

#### **DonateForm.tsx**
- **Purpose**: Donation form component (if separate from modal)
- **Features**: Form for donation input
- **Importance**: Reusable donation form

### Contexts (`contexts/`)

#### **AuthContext.tsx**
- **Purpose**: Global authentication state management
- **Features**:
  - `user`: Current user object (null if not logged in)
  - `loading`: Loading state during auth check
  - `isAuthenticated`: Boolean for auth status
  - `login()`: Function to log in user
  - `logout()`: Function to log out user
  - `refreshUser()`: Function to refresh user data from API
- **How It Works**:
  1. On app load, checks localStorage for token
  2. If token exists, fetches user from API
  3. Updates state with user data
  4. Provides auth state to all components via Context
- **Usage**: `const { user, login, logout } = useAuth()`
- **Importance**: Centralized auth state - no prop drilling

### Library (`lib/`)

#### **api.ts** (API Client)
- **Purpose**: Centralized API client configuration
- **Features**:
  - Axios instance with base URL configuration
  - Environment-based URL (dev vs production)
  - Request interceptors (logging, adding auth token)
  - Response interceptors (error handling)
  - All API functions (auth, campaigns, donations, etc.)
- **Key Functions**:
  - `getBaseURL()`: Determines API URL from env or defaults
  - `getAuthHeaders()`: Adds Authorization header with token
  - Auth APIs: `loginUser()`, `registerUser()`, `forgotPassword()`, etc.
  - Campaign APIs: `getCampaigns()`, `createCampaign()`, etc.
  - Donation APIs: `donateToCampaign()`, `getMyDonations()`, etc.
  - Fund APIs: `getMyFunds()`, `withdrawFunds()`, etc.
  - Admin APIs: `getUsers()`, `getAdminStats()`, etc.
  - Proof APIs: `getAllProofs()`, `createProof()`, etc.
- **Error Handling**: Comprehensive error logging and user-friendly messages
- **Importance**: Single source for all API calls, consistent error handling

### Utils (`utils/`)

#### **auth.ts**
- **Purpose**: Authentication utility functions
- **Functions**:
  - `setToken(token)`: Saves JWT token to localStorage
  - `getToken()`: Retrieves token from localStorage
  - `setUser(user)`: Saves user object to localStorage
  - `getUser()`: Retrieves user from localStorage
  - `logout()`: Clears auth data and redirects to login
- **Why localStorage**: Persists auth across page refreshes
- **Importance**: Low-level auth helpers used by AuthContext

### Styles (`styles/`)

#### **globals.css**
- **Purpose**: Global CSS styles
- **Contents**:
  - Tailwind directives (`@tailwind base/components/utilities`)
  - Custom global styles (body, buttons, forms)
  - Card styles
  - Form input styles
  - Header styles
  - Responsive grid utilities
  - Scrollbar hiding utilities
- **Importance**: Global styling and Tailwind setup

### Public (`public/`)

- **Purpose**: Static assets served at root URL
- **Files**: Images (team photos, IDs)
- **Usage**: `<img src="/Clark.png" />` → serves from `public/Clark.png`
- **Importance**: Static assets accessible without API calls

---

## 🔄 How Everything Works Together

### Page Load Flow

1. **User visits URL** (e.g., `/campaigns`)
2. **Next.js App Router** matches route to `app/campaigns/page.tsx`
3. **Root Layout** (`app/layout.tsx`) wraps the page:
   - Provides HTML structure
   - Wraps with `AuthProvider`
   - Includes `Header` component
4. **AuthProvider** (`contexts/AuthContext.tsx`):
   - Checks localStorage for token
   - If token exists, fetches user from API (`/api/auth/v1/me`)
   - Updates auth state
5. **Page Component** (`app/campaigns/page.tsx`):
   - Uses `useAuth()` to get auth state
   - Fetches campaigns from API (`lib/api.ts` → `getCampaigns()`)
   - Renders `CampaignCard` components
6. **API Call** (`lib/api.ts`):
   - Axios sends request to backend
   - Request interceptor adds auth token (if exists)
   - Response interceptor handles errors
   - Returns data to component
7. **Component Updates**: React re-renders with new data

### Authentication Flow

1. **User clicks "Login"** → navigates to `/auth/login`
2. **Login Page** (`app/auth/login/page.tsx`):
   - User enters email/password OR clicks "Login with Google"
3. **Email/Password Login**:
   - Form submits → calls `loginUser()` from `lib/api.ts`
   - API returns token and user data
   - `login()` function in `AuthContext` saves token and user
   - Redirects to homepage or dashboard
4. **Google OAuth Login**:
   - Redirects to backend `/api/auth/v1/google`
   - Backend redirects to Google OAuth
   - User authorizes on Google
   - Google redirects back to backend callback
   - Backend creates/updates user and redirects to frontend with token in URL
   - Frontend extracts token from URL params
   - Saves token and redirects
5. **Protected Routes**:
   - `ProtectedPage` component checks `isAuthenticated`
   - If not authenticated → redirects to `/auth/login`
   - If authenticated but wrong role → redirects to `/`
   - If authorized → renders page content

### Donation Flow

1. **User clicks "Donate"** on campaign page
2. **DonateModal** opens (`components/DonateModal.tsx`)
3. **User fills form**:
   - Selects campaign
   - Enters amount
   - Chooses payment method (GCash/Card)
   - Enters payment details
4. **Form submission**:
   - Calls `donateToCampaign()` from `lib/api.ts`
   - API creates donation and Xendit invoice
   - Returns checkout URL
5. **Payment**:
   - If mock URL → redirects to success page
   - If real Xendit URL → redirects to Xendit checkout
   - User completes payment on Xendit
   - Xendit redirects back to success/failure page
6. **Backend webhook** (separate process):
   - Xendit sends webhook to backend
   - Backend updates donation status to COMPLETED

### State Management Flow

1. **Global State**: `AuthContext` provides auth state to all components
2. **Local State**: Each component uses `useState` for component-specific state
3. **API State**: Components fetch data on mount with `useEffect`
4. **No Redux/Zustand**: Simple Context API is sufficient for this app

---

## 🔐 Environment Variables

Required environment variables (set in Vercel or `.env.local`):

### API Configuration
- **NEXT_PUBLIC_API_URL**: Backend API URL
  - **Development**: `http://localhost:4000`
  - **Production**: Your backend URL (e.g., `https://your-backend.railway.app`)
  - **Why NEXT_PUBLIC_**: Next.js only exposes env vars prefixed with `NEXT_PUBLIC_` to the browser
  - **Required**: Must be set in production

### Example `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 🎓 Next.js App Router Concepts

### Server vs Client Components

#### **Server Components** (Default)
- **Rendered on server**: HTML sent to browser
- **No JavaScript**: No interactivity, no hooks
- **Faster**: Smaller bundle, faster initial load
- **Use for**: Static content, data fetching, SEO

#### **Client Components** (`"use client"`)
- **Rendered in browser**: Interactive, uses hooks
- **JavaScript required**: Larger bundle
- **Use for**: Forms, modals, interactive features

**Example**:
```tsx
// Server Component (default)
export default function Page() {
  return <div>Static content</div>
}

// Client Component
"use client"
export default function Page() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### File-Based Routing

- **`app/page.tsx`** → `/` (homepage)
- **`app/about/page.tsx`** → `/about`
- **`app/campaigns/page.tsx`** → `/campaigns`
- **`app/campaigns/[id]/page.tsx`** → `/campaigns/abc123` (dynamic)
- **`app/auth/login/page.tsx`** → `/auth/login`

### Layouts

- **`app/layout.tsx`**: Root layout (wraps all pages)
- **Nested layouts**: Can create `app/dashboard/layout.tsx` for dashboard-specific layout

### Loading States

- **`loading.tsx`**: Shows loading UI while page loads
- **`error.tsx`**: Shows error UI if page fails

---

## 🎨 Styling Approach

### Tailwind CSS

- **Utility-first**: Classes like `bg-blue-500`, `text-white`, `p-4`
- **Responsive**: `md:`, `lg:` prefixes for breakpoints
- **No CSS files**: Styles written as classes in JSX
- **Production**: Only used classes are included in bundle

### Custom Styles

- **`globals.css`**: Global styles and Tailwind setup
- **Custom classes**: `.card`, `.scrollbar-hide` defined in globals.css

---

## 🚀 Development Workflow

1. **Setup**:
   ```bash
   npm install              # Install dependencies
   ```

2. **Development**:
   ```bash
   npm run dev              # Start dev server (http://localhost:3000)
   ```

3. **Build**:
   ```bash
   npm run build            # Build production bundle
   npm start                # Start production server
   ```

4. **Environment**:
   - Create `.env.local` for local development
   - Set `NEXT_PUBLIC_API_URL` in Vercel for production

---

## 🔑 Key Features

### 1. Authentication
- JWT token-based auth
- Google OAuth integration
- Protected routes
- Role-based access control

### 2. Campaign Management
- Create, read, update campaigns
- Campaign listing with filters
- Campaign detail pages
- Progress tracking

### 3. Donations
- Donation modal/form
- Multiple payment methods (GCash, Card)
- Xendit integration
- Donation history

### 4. User Dashboard
- User profile
- My campaigns
- My donations
- Funds management

### 5. Admin Dashboard
- User management
- Campaign management
- System statistics
- Withdrawal approvals

### 6. Transparency
- Proof of fund usage
- Campaign implementation tracking
- Donation logs

---

## 📚 Additional Resources

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Axios**: https://axios-http.com/docs/intro
- **TypeScript**: https://www.typescriptlang.org/docs/

---

## 🎯 Best Practices Used

1. ✅ **TypeScript**: Type safety throughout
2. ✅ **Component Reusability**: CampaignCard, Header, etc.
3. ✅ **Context API**: Global state without prop drilling
4. ✅ **Error Handling**: Comprehensive error handling in API client
5. ✅ **Loading States**: Loading indicators for async operations
6. ✅ **Responsive Design**: Mobile-first with Tailwind
7. ✅ **Protected Routes**: Route protection with ProtectedPage
8. ✅ **Environment Variables**: Configurable API URL
9. ✅ **Code Organization**: Clear folder structure
10. ✅ **Accessibility**: Semantic HTML, ARIA attributes (via Headless UI)

---

This frontend is designed to be:
- ✅ **Fast**: Next.js optimizations, code splitting
- ✅ **Type-safe**: TypeScript throughout
- ✅ **Maintainable**: Clear structure, reusable components
- ✅ **User-friendly**: Loading states, error handling, responsive design
- ✅ **Secure**: Protected routes, token-based auth
- ✅ **Scalable**: Component-based, easy to extend

