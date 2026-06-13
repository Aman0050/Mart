import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RazorpayService } from './razorpay.service';
import { PaymentStatus, SubscriptionStatus } from '@prisma/client';
import crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly razorpayService: RazorpayService,
  ) {}

  async createSubscriptionPayment(
    companyId: string,
    subscriptionId: string,
    userId: string
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true }
    });

    if (!subscription || subscription.companyId !== companyId) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === SubscriptionStatus.active) {
      throw new BadRequestException('Subscription is already active');
    }

    const amountInRupees = Number(subscription.plan.price);
    const amountInPaise = Math.round(amountInRupees * 100);

    // Create DB Payment Record
    const payment = await this.prisma.payment.create({
      data: {
        companyId,
        subscriptionId,
        paidBy: userId,
        amount: amountInRupees,
        taxAmount: 0, // Simplified
        totalAmount: amountInRupees,
        status: PaymentStatus.pending,
      }
    });

    // Create Razorpay Order
    const order = await this.razorpayService.createOrder(amountInPaise, payment.id);

    // Update DB with Gateway Order ID
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { gatewayOrderId: order.id }
    });

    return {
      paymentId: payment.id,
      gatewayOrderId: order.id,
      amount: amountInRupees,
      currency: "INR",
    };
  }

  async verifyPayment(
    paymentId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { subscription: true }
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.success) {
      return { success: true, message: 'Already verified' };
    }

    const isValid = this.razorpayService.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      // For local dev without real keys, we might want to bypass or allow mock verification
      // But for enterprise, strict validation is required.
      if (process.env.NODE_ENV !== 'development' || process.env.RAZORPAY_KEY_ID) {
        await this.prisma.payment.update({
          where: { id: paymentId },
          data: { status: PaymentStatus.failed, failureReason: 'Signature mismatch' }
        });
        throw new BadRequestException('Invalid payment signature');
      }
    }

    // Success flow
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.success,
          gatewayPaymentId: razorpayPaymentId,
          gatewaySignature: razorpaySignature,
          invoiceNumber,
        }
      });

      if (payment.subscriptionId && payment.subscription) {
        await tx.subscription.update({
          where: { id: payment.subscriptionId },
          data: {
            status: SubscriptionStatus.active,
            paymentRef: razorpayPaymentId,
          }
        });
      }
    });

    return { success: true, invoiceNumber };
  }

  async handleWebhook(body: string, signature: string, eventData: any) {
    const isValid = this.razorpayService.verifyWebhookSignature(body, signature);
    
    if (!isValid && process.env.NODE_ENV !== 'development') {
      throw new BadRequestException('Invalid webhook signature');
    }

    const eventType = eventData.event;
    const payload = eventData.payload;

    if (eventType === 'payment.failed') {
      const paymentEntity = payload.payment.entity;
      const orderId = paymentEntity.order_id;
      
      const payment = await this.prisma.payment.findFirst({
        where: { gatewayOrderId: orderId }
      });

      if (payment && payment.status !== PaymentStatus.success) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.failed,
            failureReason: paymentEntity.error_description || 'Webhook failed event'
          }
        });
      }
    }

    return { received: true };
  }
}
