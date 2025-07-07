<h1 align="center">✨ Glooba, the social platform that connects users with sustainable companies and initiatives in Latin America ✨</h1>

## Overview

Glooba is a social platform built with Next.js 14, TypeScript, and modern web technologies. It provides features for company discovery, user profiles, and social interactions.

## Documentation

For detailed documentation, please refer to the following guides:

- [Main Guide](https://deepwiki.com/raimundoosf/glooba) - Overview and features
- [Development Guide](docs/DEVELOPMENT.md) - Setup and development workflow
- [API Documentation](docs/API.md) - API endpoints and usage
- [Component Documentation](docs/COMPONENTS.md) - UI components and guidelines

## Tech Stack

### Frontend

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Shadcn UI components
- React Hook Form
- TanStack Query for data fetching
- React Hot Toast for notifications
- Clerk for authentication

### Backend

- Prisma ORM
- PostgreSQL (via Prisma)
- UploadThing for file uploads
- Next.js API Routes

## Project Structure

```
src/
├── app/              # Next.js app directory with routes
├── components/       # Reusable React components
│   ├── explore/     # Company exploration components
│   ├── profile/     # User profile components
│   ├── feed/        # Feed components
│   └── shared/      # Shared UI components
├── lib/             # Utility functions and configurations
└── actions/         # Server actions
```

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:
   Create a `.env` file with the following variables:

```env
DATABASE_URL=your_database_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
UPLOADTHING_TOKEN=your_uploadthing_token
```

3. Start the development server:

```bash
npm run dev
```

For more detailed setup instructions, please refer to the [Development Guide](docs/DEVELOPMENT.md).

## Contributing

Please read our [Development Guide](docs/DEVELOPMENT.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
