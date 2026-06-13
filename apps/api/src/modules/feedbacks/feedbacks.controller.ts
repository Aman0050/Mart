import { Controller, Post, Get, Body, UseGuards, Req, Query } from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller({ path: 'feedbacks', version: '1' })
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @UseGuards(JwtAuthGuard)
  @Get('eligibility')
  async checkEligibility(@Req() req: any, @Query('event') event: string) {
    if (!event) return { eligible: false, reason: 'Event required' };
    return this.feedbacksService.checkEligibility(req.user.sub, event);
  }

  @UseGuards(JwtAuthGuard)
  @Post('dismiss')
  async dismissFeedback(@Req() req: any) {
    return this.feedbacksService.dismissFeedback(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('shown')
  async markShown(@Req() req: any, @Body('event') event: string) {
    return this.feedbacksService.markShown(req.user.sub, event);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async submitFeedback(@Req() req: any, @Body() dto: any) {
    return this.feedbacksService.createFeedback(req.user.sub, req.user.role || 'buyer', dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @Get()
  async getFeedbacks(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.feedbacksService.getFeedbacks(Number(page) || 1, Number(limit) || 20);
  }
}
