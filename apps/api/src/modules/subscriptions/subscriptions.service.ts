import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async subscribeToPlan(companyId: string, planId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Check for existing active subscription
    const existingSub = await this.prisma.subscription.findFirst({
      where: {
        companyId,
        status: SubscriptionStatus.active,
        endDate: { gt: new Date() }
      }
    });

    if (existingSub) {
      throw new BadRequestException('Company already has an active subscription. Use upgrade flow.');
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationDays);

    // If Free/Trial Plan (Price = 0)
    if (Number(plan.price) === 0) {
      return this.prisma.subscription.create({
        data: {
          companyId,
          planId,
          status: SubscriptionStatus.active,
          startDate,
          endDate,
          amountPaid: 0,
        }
      });
    }

    // Paid Plan -> requires payment
    return this.prisma.subscription.create({
      data: {
        companyId,
        planId,
        status: SubscriptionStatus.pending_payment,
        startDate,
        endDate, // This is tentative until payment is successful
        amountPaid: 0,
      }
    });
  }

  async getCompanySubscription(companyId: string) {
    return this.prisma.subscription.findFirst({
      where: { companyId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Phase 8 & 9 Logic
  async upgradePlan(companyId: string, newPlanId: string) {
    // In a full implementation, you would calculate prorated charges here.
    // For now, we will simply create a new pending subscription for the new plan.
    // Once paid, the webhook/verification flow will mark the old one as cancelled.
    return this.subscribeToPlan(companyId, newPlanId);
  }

  // Cron job simulation
  async expireOldSubscriptions() {
    const now = new Date();
    const expiredCount = await this.prisma.subscription.updateMany({
      where: {
        status: SubscriptionStatus.active,
        endDate: { lt: now }
      },
      data: {
        status: SubscriptionStatus.expired
      }
    });
    this.logger.log(`Expired ${expiredCount.count} subscriptions.`);
    return { count: expiredCount.count };
  }
}
