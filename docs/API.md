# API Documentation

## Overview

Glooba's API is built using Next.js API routes and server actions. The API provides endpoints for managing companies, users, posts, and interactions between them.

## Authentication

All API endpoints require authentication using Clerk. The authentication token should be included in the request headers:

```typescript
headers: {
  'Authorization': 'Bearer <clerk-token>'
}
```

## API Endpoints

### Companies

#### Get Company Profile
```typescript
GET /api/companies/[companyId]
```

Response:
```typescript
{
  id: string;
  name: string;
  description: string;
  logo: string;
  backgroundImage: string;
  category: string;
  location: string;
  rating: number;
  followers: number;
}
```

#### Follow/Unfollow Company
```typescript
POST /api/companies/[companyId]/follow
```

Request body:
```typescript
{
  action: 'follow' | 'unfollow'
}
```

### User Profile

#### Get User Profile
```typescript
GET /api/users/[userId]
```

Response:
```typescript
{
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  following: number;
  followers: number;
}
```

#### Update User Profile
```typescript
PATCH /api/users/[userId]
```

Request body:
```typescript
{
  name?: string;
  bio?: string;
  avatar?: string;
}
```

### File Upload

#### Upload Image
```typescript
POST /api/upload
```

Request body:
```typescript
FormData {
  file: File;
  type: 'avatar' | 'background' | 'company-logo';
}
```

Response:
```typescript
{
  url: string;
}
```

### Posts

#### Create Post
```typescript
POST /api/posts
```

Request body:
```typescript
{
  content: string;
  images?: string[];
  companyId?: string;  // Optional: if post is associated with a company
  tags?: string[];     // Optional: for categorizing posts
}
```

Response:
```typescript
{
  id: string;
  content: string;
  images: string[];
  authorId: string;
  companyId?: string;
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}
```

#### Get Posts
```typescript
GET /api/posts
```

Query parameters:
```typescript
{
  page?: number;      // Default: 1
  limit?: number;     // Default: 10
  companyId?: string; // Optional: filter by company
  userId?: string;    // Optional: filter by user
  tag?: string;       // Optional: filter by tag
}
```

#### Get Post Details
```typescript
GET /api/posts/[postId]
```

#### Update Post
```typescript
PATCH /api/posts/[postId]
```

Request body:
```typescript
{
  content?: string;
  images?: string[];
  tags?: string[];
}
```

#### Delete Post
```typescript
DELETE /api/posts/[postId]
```

#### Like/Unlike Post
```typescript
POST /api/posts/[postId]/like
```

Request body:
```typescript
{
  action: 'like' | 'unlike'
}
```

#### Comment on Post
```typescript
POST /api/posts/[postId]/comments
```

Request body:
```typescript
{
  content: string;
  images?: string[];
}
```

Response:
```typescript
{
  id: string;
  content: string;
  images: string[];
  authorId: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Get Post Comments
```typescript
GET /api/posts/[postId]/comments
```

Query parameters:
```typescript
{
  page?: number;  // Default: 1
  limit?: number; // Default: 10
}
```

## Server Actions

### Company Actions

```typescript
// Create new company
createCompany(data: CompanyCreateInput)

// Update company
updateCompany(id: string, data: CompanyUpdateInput)

// Delete company
deleteCompany(id: string)
```

### User Actions

```typescript
// Update user profile
updateUserProfile(data: UserProfileUpdateInput)

// Follow/unfollow company
toggleCompanyFollow(companyId: string, action: 'follow' | 'unfollow')
```

### Post Actions

```typescript
// Create new post
createPost(data: PostCreateInput)

// Update post
updatePost(id: string, data: PostUpdateInput)

// Delete post
deletePost(id: string)

// Like/unlike post
togglePostLike(postId: string, action: 'like' | 'unlike')

// Add comment
addComment(postId: string, data: CommentCreateInput)

// Delete comment
deleteComment(commentId: string)
```

## Error Handling

The API uses standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error response format:
```typescript
{
  error: {
    message: string;
    code: string;
  }
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse. The current limits are:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Data Validation

All API requests are validated using Zod schemas. Invalid requests will return a 400 status code with validation error details.

## Webhooks

The API supports webhooks for the following events:

- Company created/updated/deleted
- User profile updated
- Follow/unfollow actions

To set up webhooks, configure the webhook URL in your environment variables:

```env
WEBHOOK_URL=your_webhook_url
WEBHOOK_SECRET=your_webhook_secret
```