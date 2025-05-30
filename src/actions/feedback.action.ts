'use server';

import prisma from '@/lib/prisma';
import { getDbUserId } from './user.action';

type FeedbackInput = {
  content: string;
  email?: string;
};

export type FeedbackResponse = {
  success: boolean;
  error?: string;
  feedback?: {
    id: string;
    content: string;
    createdAt: Date;
  };
};

/**
 * Submit feedback from a user
 * @param {FeedbackInput} data - The feedback data
 * @returns {Promise<FeedbackResponse>} The result of the operation
 */
export async function submitFeedback(data: FeedbackInput): Promise<FeedbackResponse> {
  try {
    const userId = await getDbUserId();
    
    if (!data.content?.trim()) {
      return {
        success: false,
        error: 'El contenido del comentario no puede estar vacío',
      };
    }

    // If user is not logged in and provided email, validate it
    if (!userId && data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return {
        success: false,
        error: 'El formato del correo electrónico no es válido',
      };
    }

    // Validate email format if provided
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return {
        success: false,
        error: 'El formato del correo electrónico no es válido',
      };
    }

    const feedback = await prisma.feedback.create({
      data: {
        content: data.content.trim(),
        email: data.email?.trim(),
        ...(userId ? { userId } : {}), // Only include userId if user is logged in
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      feedback,
    };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return {
      success: false,
      error: 'Error al enviar los comentarios. Por favor, inténtalo de nuevo.',
    };
  }
}

/**
 * Get all feedback (admin only)
 * @returns {Promise<FeedbackResponse & { feedbacks: Array<{ id: string; content: string; email: string | null; createdAt: Date; user: { id: string; username: string | null; name: string | null } | null }> }>} List of all feedback
 */
export async function getAllFeedback() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      feedbacks,
    };
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return {
      success: false,
      error: 'Error al obtener los comentarios',
      feedbacks: [],
    };
  }
}
