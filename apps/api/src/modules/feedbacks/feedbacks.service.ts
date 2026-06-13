import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FeedbacksService {
  constructor(private readonly prisma: PrismaService) {}

  async checkEligibility(userId: string, event: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { eligible: false, reason: 'User not found' };

    // Anti-spam Rule 1: Never show if already completed
    if (user.feedbackCompletedAt) return { eligible: false, reason: 'Feedback already completed forever' };

    // Anti-spam Rule 2: Never show more than 3 times total
    if (user.feedbackCount >= 3) return { eligible: false, reason: 'Max feedback attempts reached' };

    const now = new Date();

    // Anti-spam Rule 3: Never show more than once every 7 days
    if (user.feedbackLastShownAt) {
      const daysSinceShown = (now.getTime() - user.feedbackLastShownAt.getTime()) / (1000 * 3600 * 24);
      if (daysSinceShown < 7) return { eligible: false, reason: 'Shown within last 7 days' };
    }

    // Anti-spam Rule 4: Never show if dismissed in last 14 days
    if (user.feedbackDismissedAt) {
      const daysSinceDismissed = (now.getTime() - user.feedbackDismissedAt.getTime()) / (1000 * 3600 * 24);
      if (daysSinceDismissed < 14) return { eligible: false, reason: 'Dismissed within last 14 days' };
    }

    // Anti-spam Rule 5: If modal already shown for same event
    // FeedbackEvent enum expects exact match
    const eventHistory = await this.prisma.feedbackEventHistory.findFirst({
      where: { userId, event: event as any }
    });
    if (eventHistory) return { eligible: false, reason: 'Event already triggered' };

    return { eligible: true };
  }

  async dismissFeedback(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { feedbackDismissedAt: new Date() }
    });
    return { success: true };
  }

  async markShown(userId: string, event: string) {
    // We log the event in history so it doesn't trigger again
    await this.prisma.feedbackEventHistory.create({
      data: { userId, event: event as any }
    });
    // Update last shown and count
    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        feedbackLastShownAt: new Date(),
        feedbackCount: { increment: 1 }
      }
    });
    return { success: true };
  }

  async createFeedback(userId: string, role: any, dto: any) {
    const feedback = await this.prisma.feedback.create({
      data: {
        userId,
        role,
        rating: dto.rating,
        category: dto.category,
        answers: dto.answers || {},
        message: dto.message || ''
      }
    });

    // Mark as completely done forever
    await this.prisma.user.update({
      where: { id: userId },
      data: { feedbackCompletedAt: new Date() }
    });

    return feedback;
  }

  async getFeedbacks(page = 1, limit = 20) {
    return this.prisma.paginate('feedback', {
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      page,
      limit,
    });
  }
}

