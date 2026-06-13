import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import crypto from 'crypto';

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private readonly razorpay: Razorpay;
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    const key_id = this.configService.get<string>('RAZORPAY_KEY_ID') || 'rzp_test_mockkey123';
    const key_secret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'mocksecret123';
    this.webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET') || 'mockwebhook123';

    this.razorpay = new Razorpay({
      key_id,
      key_secret,
    });
  }

  async createOrder(amountInPaise: number, receiptId: string): Promise<any> {
    try {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptId,
      };
      
      // If we're using mock keys (no real env), return a mocked order for testing
      if (this.configService.get<string>('RAZORPAY_KEY_ID') === undefined) {
        return {
          id: `order_mock_${Date.now()}`,
          entity: "order",
          amount: amountInPaise,
          currency: "INR",
          receipt: receiptId,
          status: "created",
        };
      }

      return await this.razorpay.orders.create(options);
    } catch (error) {
      this.logger.error(`Failed to create Razorpay order: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Payment gateway error');
    }
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    try {
      const key_secret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'mocksecret123';
      const body = orderId + '|' + paymentId;
      
      const expectedSignature = crypto
        .createHmac('sha256', key_secret)
        .update(body.toString())
        .digest('hex');
        
      return expectedSignature === signature;
    } catch (error) {
      this.logger.error(`Signature verification failed: ${error.message}`);
      return false;
    }
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(body)
        .digest('hex');
        
      return expectedSignature === signature;
    } catch (error) {
      return false;
    }
  }
}
