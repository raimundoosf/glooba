# Development Guide

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- PostgreSQL database
- Clerk account for authentication
- UploadThing account for file uploads
- Git

## Local Development Setup

1. Clone the repository:

```bash
git clone [repository-url]
cd glooba
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=your_database_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# UploadThing
UPLOADTHING_TOKEN=your_uploadthing_token
UPLOADTHING_SECRET_KEY=your_uploadthing_secret
CLERK_WEBHOOK_SECRET=your_webhook_secret

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4. Set up the database:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Run migrations (if needed)
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── app/              # Next.js app directory with routes
│   ├── (auth)/      # Authentication related routes
│   ├── (main)/      # Main application routes
│   └── api/         # API routes
├── components/       # Reusable React components
│   ├── explore/     # Company exploration components
│   ├── profile/     # User profile components
│   ├── feed/        # Feed components
│   └── shared/      # Shared UI components
├── contexts/        # React Context providers
├── lib/             # Utility functions and configurations
│   ├── constants/   # Application constants
│   ├── prisma/      # Prisma configuration
│   ├── uploadthing/ # UploadThing configuration
│   └── utils/       # Utility functions
└── actions/         # Server actions
```

## Development Workflow

1. Create a new branch for your feature/fix:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes following the code style guidelines

3. Add tests if modifying existing functionality

4. Run linting and formatting:

```bash
npm run lint
npm run format
```

5. Test your changes:

```bash
npm test
```

6. Commit your changes:

```bash
git add .
git commit -m "feat: Description of your changes"
```

7. Push your changes and create a pull request

## Code Style Guidelines

1. TypeScript Usage

   - Use TypeScript for all new code
   - Maintain existing type definitions
   - Avoid using `any` type
   - Use interfaces for component props

2. Component Structure

   - Use PascalCase for component names
   - Export components with named exports
   - Use JSDoc comments for public components
   - Keep components small and focused

3. Styling

   - Use Tailwind CSS for styling
   - Use Shadcn UI components where possible
   - Follow the existing design system
   - Use CSS variables for theme colors

4. State Management

   - Use React Context for global state
   - Use local state for component-specific state
   - Keep state management simple and maintainable

5. API Integration

   - Use TanStack Query for data fetching
   - Handle errors gracefully
   - Implement proper loading states
   - Use proper HTTP methods

6. Git Commit Messages
   - Use conventional commits format
   - Start with type (feat, fix, docs, style, refactor, test, chore)
   - Keep messages concise but descriptive

## Testing

1. Unit Tests

   - Test components in isolation
   - Test utility functions
   - Test API integrations

2. Integration Tests

   - Test component interactions
   - Test API endpoints
   - Test user flows

3. Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test path/to/test
```

## Building for Production

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

3. Deployment
   - Push to main branch
   - Wait for CI/CD pipeline
   - Verify deployment

## Troubleshooting

### Common Issues

1. Database connection issues:

   - Verify your DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Check Prisma schema for errors
   - Run `npx prisma db push` again

2. Authentication issues:

   - Verify Clerk credentials
   - Check environment variables
   - Clear browser cache and cookies
   - Verify Clerk webhook setup

3. Build errors:

   - Clear .next directory
   - Remove node_modules and reinstall
   - Check for TypeScript errors
   - Run `npm run lint`

4. Performance issues:
   - Check for unnecessary re-renders
   - Verify API call optimization
   - Check image optimization
   - Review bundle size

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [UploadThing Documentation](https://docs.uploadthing.com)
- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [Shadcn UI Documentation](https://ui.shadcn.com)
- [Conventional Commits Specification](https://www.conventionalcommits.org)
