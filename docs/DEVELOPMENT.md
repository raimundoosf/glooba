# Development Guide

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- PostgreSQL database
- Clerk account for authentication
- UploadThing account for file uploads

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
DATABASE_URL=your_database_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
UPLOADTHING_TOKEN=your_uploadthing_token
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
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
│   └── shared/      # Shared UI components
├── contexts/        # React Context providers
├── lib/             # Utility functions and configurations
└── actions/         # Server actions
```

## Development Workflow

1. Create a new branch for your feature/fix:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them:
```bash
git add .
git commit -m "Description of your changes"
```

3. Push your changes and create a pull request

## Code Style Guidelines

- Use TypeScript for type safety
- Follow the existing code formatting (Prettier is configured)
- Write meaningful commit messages
- Add comments for complex logic
- Use meaningful variable and function names

## Testing

Run tests with:
```bash
npm test
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

## Troubleshooting

### Common Issues

1. Database connection issues:
   - Verify your DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Check Prisma schema for errors

2. Authentication issues:
   - Verify Clerk credentials
   - Check environment variables
   - Clear browser cache and cookies

3. Build errors:
   - Clear .next directory
   - Remove node_modules and reinstall
   - Check for TypeScript errors

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Clerk Documentation](https://clerk.com/docs) 