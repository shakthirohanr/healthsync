# HealthSync Frontend

Next.js 14 application for the HealthSync healthcare management system.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Development

```bash
# Start development server
pnpm dev

# The app will be available at http://localhost:3000
```

### Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js 14 App Router pages
│   │   ├── (auth)/       # Authentication pages (login, register)
│   │   ├── api/          # API routes (legacy, mostly unused)
│   │   ├── dashboard/    # Dashboard page
│   │   ├── appointments/ # Appointments page
│   │   ├── records/      # Medical records page
│   │   └── settings/     # Settings page
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── Header.tsx   # App header
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── DoctorDashboard.tsx
│   │   └── PatientDashboard.tsx
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and helpers
│   │   ├── auth.ts      # JWT authentication functions
│   │   ├── AuthContext.tsx  # Auth context provider
│   │   └── utils.ts     # General utilities
│   └── styles/          # Global styles
├── public/              # Static assets
├── prisma/              # Prisma schema (for reference)
└── package.json         # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Database (for Prisma, optional)
DATABASE_URL=postgresql://user:password@localhost:5432/healthsync

# Auth (if using NextAuth, currently not active)
AUTH_SECRET=your-secret-key
```

## 🎨 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Forms:** React Hook Form + Zod
- **Data Fetching:** SWR
- **Authentication:** JWT (custom implementation)
- **Date Handling:** date-fns

## 🔐 Authentication

The frontend uses JWT-based authentication with the Python FastAPI backend:

- Login/Register → Get JWT token
- Store token in localStorage
- Include token in API requests via Authorization header
- Auto-refresh user data on mount

## 📡 API Integration

All API calls go through the Python backend at `http://localhost:8000/api/v1`:

- `/auth/login` - User login
- `/auth/register` - User registration
- `/auth/me` - Get current user
- `/me/dashboard` - Get dashboard data
- `/appointments` - Manage appointments
- `/users/profile` - Update profile
- `/users/password` - Change password

## 🧪 Available Scripts

```bash
# Development
pnpm dev          # Start dev server

# Building
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
pnpm format       # Format with Prettier

# Database (Prisma - optional)
pnpm db:push      # Push schema to database
pnpm db:generate  # Generate Prisma client
pnpm db:studio    # Open Prisma Studio
```

## 🚦 Running with Backend

1. **Start Backend:**
   ```bash
   cd ../backend
   python -m uvicorn main:app --reload --port 8000
   ```

2. **Start Frontend:**
   ```bash
   cd ../frontend
   pnpm dev
   ```

3. **Access:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 🔄 Development Workflow

1. Backend must be running on port 8000
2. Frontend runs on port 3000
3. Frontend makes API calls to backend
4. JWT tokens stored in localStorage
5. Protected routes redirect to login if not authenticated

## 📝 Notes

- The `prisma/` folder is kept for reference but the main database is managed by the Python backend
- The `api/` routes under `src/app/api/` are legacy NextAuth routes (mostly unused)
- Current authentication is handled by Python backend with JWT tokens
