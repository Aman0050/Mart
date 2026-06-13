import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  async getPlans() {
    const plans = await this.subscriptionsService.getPlans();
    return { success: true, data: plans };
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  async subscribe(
    @Body() body: { companyId: string; planId: string }
  ) {
    const sub = await this.subscriptionsService.subscribeToPlan(body.companyId, body.planId);
    return { success: true, data: sub };
  }

  @UseGuards(JwtAuthGuard)
  @Get('company/:companyId')
  async getCompanySubscription(@Param('companyId') companyId: string) {
    const sub = await this.subscriptionsService.getCompanySubscription(companyId);
    return { success: true, data: sub };
  }
}
