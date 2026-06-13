import { Controller, Post, Body, UseGuards, Req, Headers, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-order')
  async createOrder(
    @Req() req,
    @Body() body: { subscriptionId: string; companyId: string }
  ) {
    if (!body.subscriptionId || !body.companyId) {
      throw new BadRequestException('subscriptionId and companyId are required');
    }
    return this.paymentsService.createSubscriptionPayment(
      body.companyId,
      body.subscriptionId,
      req.user.id
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  async verifyPayment(
    @Body() body: { 
      paymentId: string; 
      razorpayOrderId: string; 
      razorpayPaymentId: string; 
      razorpaySignature: string 
    }
  ) {
    if (!body.paymentId || !body.razorpayOrderId || !body.razorpayPaymentId || !body.razorpaySignature) {
      throw new BadRequestException('Missing required verification parameters');
    }
    return this.paymentsService.verifyPayment(
      body.paymentId,
      body.razorpayOrderId,
      body.razorpayPaymentId,
      body.razorpaySignature
    );
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Req() req
  ) {
    if (!signature) {
      throw new BadRequestException('Missing signature');
    }
    
    // In Express/NestJS, to verify webhook signatures securely, we need the raw unparsed body.
    // For simplicity in this demo audit, we assume req.rawBody or JSON.stringify(req.body) works.
    const rawBody = req.rawBody || JSON.stringify(req.body);
    
    return this.paymentsService.handleWebhook(rawBody, signature, req.body);
  }
}
