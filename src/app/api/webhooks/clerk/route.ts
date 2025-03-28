import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import type { WebhookEvent } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to your .env file')
  }

  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error occurred', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new NextResponse('Error occurred', { status: 400 })
  }

  if (evt.type === 'user.updated') {
    const { id, image_url, username } = evt.data

    try {
      // Update both username and image
      const updatedUser = await prisma.user.update({
        where: { clerkId: id },
        data: { 
          image: image_url,
          username: username || undefined // Fallback to undefined if null
        },
        select: {
          username: true,
        }
      })

      // Revalidate new profile path
      const pathsToRevalidate = ['/']
      
      if (updatedUser.username) {
        pathsToRevalidate.push(`/profile/${updatedUser.username}`)
      }
      
      await Promise.all(pathsToRevalidate.map(path => revalidatePath(path)))

    } catch (error) {
      console.error('Error updating user:', error)
      return NextResponse.json(
        { success: false, error: 'Database update failed' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ success: true })
}