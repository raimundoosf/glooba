/**
 * Clerk webhook handler for user events.
 * @module clerk/webhook
 */
import prisma from '@/lib/prisma';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

/**
 * Main webhook handler for Clerk user events.
 * @param {Request} req - The incoming webhook request
 * @returns {Promise<NextResponse>} Response with success status or error
 */
export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) throw new Error('CLERK_WEBHOOK_SECRET not set');

  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Missing headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new NextResponse('Invalid signature', { status: 400 });
  }

  try {
    switch (evt.type) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;

      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;

      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handles user creation events from Clerk.
 * Creates a new user record in the database with:
 * - Clerk ID
 * - Email address
 * - Username (generated if not provided)
 * - Profile image URL
 * @param {any} clerkUser - The Clerk user data
 * @throws {Error} If user creation fails
 */
async function handleUserCreated(clerkUser: any) {
  try {
    const userData = {
      clerkId: clerkUser.id,
      email: clerkUser.email_addresses[0]?.email_address,
      username: clerkUser.username || generateUsernameFromEmail(clerkUser),
      image: clerkUser.image_url,
    };

    await prisma.user.create({
      data: userData,
    });

    revalidatePath('/');
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Handles user update events from Clerk.
 * Updates user record in the database with:
 * - Email address
 * - Username
 * - Profile image URL
 * @param {any} clerkUser - The Clerk user data
 * @throws {Error} If user update fails
 */
async function handleUserUpdated(clerkUser: any) {
  try {
    const updateData = {
      email: clerkUser.email_addresses[0]?.email_address,
      username: clerkUser.username,
      image: clerkUser.image_url,
    };

    const updatedUser = await prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: updateData,
      select: { username: true },
    });

    const pathsToRevalidate = ['/'];
    if (updatedUser.username) {
      pathsToRevalidate.push(`/profile/${updatedUser.username}`);
    }

    await Promise.all(pathsToRevalidate.map((path) => revalidatePath(path)));
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// User Deletion Handler (Fixed)
async function handleUserDeleted(clerkUser: any) {
  try {
    const deleteResult = await prisma.user.deleteMany({
      where: { clerkId: clerkUser.id },
    });

    if (deleteResult.count === 0) {
      console.warn(`User ${clerkUser.id} not found during deletion`);
      return;
    }

    revalidatePath('/');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

function generateUsernameFromEmail(clerkUser: any): string {
  return clerkUser.email_addresses[0]?.email_address.split('@')[0] || 'user';
}
