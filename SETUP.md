# Exambuddy Setup Guide

This guide will help you set up the Exambuddy application with Supabase and Prisma.

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- PostgreSQL database (via Supabase)

## Setup Steps

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Configuration (Supabase PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database?schema=public

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Important:** 
- Get your Supabase credentials from your Supabase project settings
- The `DATABASE_URL` should be your Supabase PostgreSQL connection string
- Use a strong, random string for `JWT_SECRET` in production

### 3. Set Up Database

1. Generate Prisma Client:
```bash
npm run db:generate
```

2. Create and run migrations:
```bash
npm run db:migrate
```

Alternatively, push the schema directly (for development):
```bash
npm run db:push
```

### 4. Configure Supabase Authentication

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Settings
3. Ensure email authentication is enabled
4. Configure email templates if needed

### 5. Create Your First Admin User

After running migrations, you'll need to create an admin user. You can do this by:

1. Registering a user through the `/api/auth/register` endpoint
2. Manually updating the user's role to `ADMIN` in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

Or using Prisma Studio:
```bash
npm run db:studio
```

### 6. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── users/        # User management endpoints
│   │   └── admin/        # Admin endpoints
│   ├── admin/            # Admin pages (protected)
│   └── (auth)/           # Auth pages (login, register)
├── lib/
│   ├── supabase/        # Supabase client configurations
│   ├── prisma/          # Prisma client
│   ├── auth/            # Authentication utilities
│   ├── utils/           # Utility functions
│   └── types/           # TypeScript type definitions
└── middleware.ts        # Next.js middleware for route protection
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh JWT token

### Users (Protected)
- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create user (admin only)
- `GET /api/users/[id]` - Get user (admin or self)
- `PUT /api/users/[id]` - Update user (admin or self)
- `DELETE /api/users/[id]` - Delete user (admin only)
- `PATCH /api/users/[id]/roles` - Update user role (admin only)

### Admin (Protected - Admin only)
- `GET /api/admin/dashboard` - Get dashboard statistics

## Authentication Flow

1. User authenticates with Supabase (email/password)
2. System generates custom JWT tokens (access + refresh)
3. Access token is used for API requests
4. Refresh token is used to get new access tokens
5. Both Supabase session and custom JWT are validated for protected routes

## Security Notes

- Always use HTTPS in production
- Keep `JWT_SECRET` secure and never commit it to version control
- Use strong passwords for database connections
- Regularly rotate JWT secrets
- Implement rate limiting for production (recommended)

## Troubleshooting

### Prisma Client Not Generated
Run `npm run db:generate` to generate the Prisma client.

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Check Supabase connection pooling settings
- Ensure your IP is whitelisted in Supabase (if applicable)

### Authentication Issues
- Verify Supabase credentials are correct
- Check that email authentication is enabled in Supabase
- Ensure JWT_SECRET is set in environment variables

## Next Steps

- Set up production environment variables
- Configure CORS for your domain
- Add rate limiting middleware
- Set up error monitoring (e.g., Sentry)
- Configure email service for production

