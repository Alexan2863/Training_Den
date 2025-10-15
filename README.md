# Training Den - Frontend Development Guide

A Next.js-based training management platform with role-based authentication built with React, TypeScript, Tailwind CSS, and Supabase.

## Table of Contents

- [Getting Started](#getting-started)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Next.js Folder Structure Conventions](#nextjs-folder-structure-conventions)
- [Key Concepts](#key-concepts)
- [Development Workflow](#development-workflow)
- [Styling Guide](#styling-guide)
- [Authentication](#authentication)
- [Best Practices](#best-practices)

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase project credentials (.env.local)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd training-den
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with your Supabase credentials:

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Authentication:** Supabase Auth
- **Database:** Supabase (PostgreSQL)
- **UI Library:** React 19

---

## Project Structure

```
training-den/
├── public/                 # Static assets
│   └── logo.png           # App logo and images
├── src/                   # Source code
│   ├── app/              # Next.js App Router directory (CRITICAL)
│   │   ├── layout.js     # Root layout wrapper
│   │   ├── page.js       # Home page (/)
│   │   ├── globals.css   # Global styles and CSS variables
│   │   ├── login/        # Login page route
│   │   │   └── page.tsx  # Login page component
│   │   ├── register/     # Register page route
│   │   │   └── page.tsx  # Register page component
│   │   ├── dashboard/    # Dashboard page route
│   │   │   └── page.tsx  # Dashboard page component
│   │   └── api/          # API routes
│   │       └── test/
│   │           └── route.ts  # API endpoint
│   └── lib/              # Shared utilities and libraries
│       ├── supabase.ts   # Supabase client configuration
│       └── auth.ts       # Authentication helpers
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies and scripts
├── next.config.mjs       # Next.js configuration
├── postcss.config.mjs    # PostCSS configuration
└── eslint.config.mjs     # ESLint configuration
```

---

## Next.js Folder Structure Conventions

### The `app/` Directory (App Router)

Next.js 13+ uses the **App Router**, where the folder structure directly maps to your application's routes. This is a convention-based system where **folder names become URL paths**.

#### How Routing Works

| File/Folder Path         | URL Route    | Purpose        |
| ------------------------ | ------------ | -------------- |
| `app/page.js`            | `/`          | Home page      |
| `app/login/page.tsx`     | `/login`     | Login page     |
| `app/register/page.tsx`  | `/register`  | Register page  |
| `app/dashboard/page.tsx` | `/dashboard` | Dashboard page |
| `app/api/test/route.ts`  | `/api/test`  | API endpoint   |

#### Special Files in App Router

1. **`page.tsx/js`** - Creates a publicly accessible route

   - Example: `app/dashboard/page.tsx` → `/dashboard`
   - This is the ONLY file that makes a route accessible

2. **`layout.tsx/js`** - Shared UI wrapper for routes

   - Example: `app/layout.js` wraps all pages
   - Layouts are nested and preserved during navigation
   - Great for headers, footers, navigation

3. **`route.ts/js`** - API route handlers

   - Example: `app/api/test/route.ts` → `/api/test`
   - Used for backend endpoints (GET, POST, etc.)

4. **`loading.tsx/js`** - Loading UI (we don't have this yet)

   - Automatically shown while page loads

5. **`error.tsx/js`** - Error handling UI (we don't have this yet)

   - Catches errors in the route segment

6. **`not-found.tsx/js`** - 404 page (we don't have this yet)

#### Why This Structure Matters

**CRITICAL:** In Next.js App Router, the folder structure IS your routing system. You cannot arbitrarily organize files - each folder name becomes part of the URL.

**Examples:**

Creating a new page:

```
app/
  training/
    page.tsx      → This creates route: /training
```

Creating nested routes:

```
app/
  training/
    page.tsx      → /training
    [id]/
      page.tsx    → /training/:id (dynamic route)
```

**Common Mistake:** Creating a folder without `page.tsx` will NOT create a route. The folder will be invisible to the router.

---

## Key Concepts

### 1. Server vs Client Components

Next.js 15 uses **Server Components by default**. This is a new React paradigm.

**Server Components** (default)

- Rendered on the server
- No JavaScript sent to client
- Can directly access databases
- CANNOT use hooks like `useState`, `useEffect`
- CANNOT use browser APIs

**Client Components** (opt-in with `"use client"`)

- Rendered in the browser
- Can use React hooks
- Can handle user interactions
- Example: [login/page.tsx](src/app/login/page.tsx)

```tsx
"use client"; // This directive makes it a client component

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState(""); // Now hooks work!
  // ...
}
```

**Rule of thumb:** Use Client Components for:

- Forms with state
- Interactive UI
- Browser APIs (localStorage, etc.)
- Event handlers (onClick, onChange)

### 2. File-Based Routing

The folder structure in `app/` defines your routes automatically:

```
app/
  login/page.tsx      → /login
  dashboard/page.tsx  → /dashboard
  api/test/route.ts   → /api/test
```

**No need for react-router** or manual route configuration!

### 3. TypeScript Configuration

Path aliases are configured in [tsconfig.json](tsconfig.json#L22-L24):

```json
"paths": {
  "@/*": ["./src/*"]
}
```

This allows clean imports:

```tsx
import { supabase } from "@/lib/supabase"; // Instead of ../../lib/supabase
```

---

## Development Workflow

### Creating a New Page

1. Create a new folder in `src/app/` with the desired route name
2. Add a `page.tsx` file inside that folder
3. Decide if you need client-side features (if yes, add `"use client"`)

Example - Creating `/profile` page:

```tsx
// src/app/profile/page.tsx
"use client";

export default function ProfilePage() {
  return (
    <div>
      <h1>Profile Page</h1>
    </div>
  );
}
```

### Creating an API Endpoint

1. Create a folder in `src/app/api/` with your endpoint name
2. Add a `route.ts` file
3. Export HTTP method handlers

Example:

```tsx
// src/app/api/users/route.ts
export async function GET() {
  return Response.json({ users: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  return Response.json({ success: true });
}
```

### Adding Shared Logic

Place reusable code in `src/lib/`:

- **Utilities:** `src/lib/utils.ts`
- **API clients:** `src/lib/supabase.ts`
- **Authentication:** `src/lib/auth.ts`
- **Types:** `src/lib/types.ts`

---

## Styling Guide

### CSS Architecture

We use **Tailwind CSS** with custom brand colors defined in [globals.css](src/app/globals.css).

#### CSS Variables

Custom properties are defined at the root:

```css
:root {
  --primary: #4c1f7a; /* Brand purple */
  --secondary: #eb5b00; /* Brand orange */
  --background: #fafbff; /* Page background */
  --foreground: #0e0e0e; /* Text color */
}
```

#### Utility Classes

Pre-built component classes for consistency:

**Buttons:**

```tsx
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary Action</button>
```

**Inputs:**

```tsx
<input className="input-primary" type="text" />
```

**Cards:**

```tsx
<div className="card">Card content</div>
```

#### Using Tailwind

You can use Tailwind utility classes alongside our custom classes:

```tsx
<div className="flex items-center justify-between p-4 bg-primary text-white rounded-lg">
  <h2 className="text-xl font-bold">Title</h2>
  <button className="btn-secondary">Action</button>
</div>
```

### Brand Colors in Tailwind

Tailwind is configured to use our brand colors:

```tsx
<div className="bg-primary">Purple background</div>
<div className="bg-secondary">Orange background</div>
<div className="text-primary">Purple text</div>
```

---

## Authentication

### Auth Flow

Authentication is handled via Supabase. Key functions are in [lib/auth.ts](src/lib/auth.ts):

```tsx
import { signIn, signUp, signOut, getCurrentUser } from "@/lib/auth";

// Sign up
const { user, error } = await signUp(email, password, {
  first_name: "John",
  last_name: "Doe",
  role: "employee",
});

// Sign in
const { user, error } = await signIn(email, password);

// Get current user
const user = await getCurrentUser(); // Returns AuthUser or null

// Sign out
await signOut();
```

### User Roles

The app supports role-based access:

- **admin** - Full system access
- **manager** - Team management
- **trainer** - Training content creation
- **employee** - Basic access

### Protected Routes

To protect a page, check authentication status:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default function ProtectedPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
    }
    checkAuth();
  }, [router]);

  if (!user) return <div>Loading...</div>;

  return <div>Protected content for {user.email}</div>;
}
```

See [dashboard/page.tsx](src/app/dashboard/page.tsx) for a complete example.

---

## Best Practices

### 1. Component Organization

- **Pages:** Only routing logic and page composition
- **Components:** Reusable UI in `src/components/` (create this folder as needed)
- **Business Logic:** Keep in `src/lib/`

### 2. Type Safety

Always define TypeScript types for:

- Component props
- API responses
- User data

Example:

```tsx
interface UserCardProps {
  name: string;
  email: string;
  role: "admin" | "manager" | "trainer" | "employee";
}

export function UserCard({ name, email, role }: UserCardProps) {
  return (
    <div>
      {name} - {email}
    </div>
  );
}
```

### 3. Error Handling

Always handle errors in async operations:

```tsx
const [error, setError] = useState<string | null>(null);

try {
  const result = await someAsyncOperation();
} catch (err) {
  setError(err.message);
}
```

### 4. Don't Mix Server and Client Code

- Server Components CANNOT import Client Components directly
- Client Components CAN import Server Components as children
- Keep server-side logic (database calls) separate from client code

### 5. Use Loading States

Provide feedback during async operations:

```tsx
const [isLoading, setIsLoading] = useState(false);

async function handleSubmit() {
  setIsLoading(true);
  await someOperation();
  setIsLoading(false);
}

return (
  <button disabled={isLoading}>{isLoading ? "Loading..." : "Submit"}</button>
);
```

### 6. Follow Next.js Conventions

- Use `page.tsx` for routes (not `index.tsx`)
- Use `layout.tsx` for shared layouts
- Use `route.ts` for API endpoints
- Place static assets in `public/`

---

## Common Gotchas

1. **Forgot "use client"?**

   - Error: "You're importing a component that needs useState..."
   - Solution: Add `"use client"` at the top of the file

2. **Wrong import path?**

   - Use `@/` alias: `import { supabase } from "@/lib/supabase"`
   - Not relative: `import { supabase } from "../../lib/supabase"`

3. **Folder without page.tsx?**

   - The route won't exist! Every route needs a `page.tsx` file

4. **Styling not working?**

   - Check if [globals.css](src/app/globals.css) is imported in `layout.js`
   - Verify Tailwind classes are spelled correctly

5. **API route not working?**
   - Must be in `app/api/` folder
   - Must be named `route.ts` (not `page.ts`)
   - Must export named functions: `GET`, `POST`, etc.

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
