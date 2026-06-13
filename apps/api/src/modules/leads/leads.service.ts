import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

import { EmailService } from '../email/email.service';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  companyId?: string;

  @IsString()
  subject: string;

  @IsString()
  message: string;

  @IsNumber()
  @IsOptional()
  quantityRequired?: number;

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsString()
  @IsOptional()
  source?: 'product_page' | 'company_profile' | 'search_page' | 'direct_enquiry';
}

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService
  ) {}

  private generateLeadNumber(): string {
    return `LD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  async createLead(buyerId: string, dto: CreateLeadDto) {
    // Determine seller
    let sellerId: string | null = null;
    let companyId = dto.companyId;

    if (dto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
        include: { company: true },
      });
      if (!product) throw new NotFoundException('Product not found');
      sellerId = product.company.ownerId;
      companyId = product.companyId;
    } else if (dto.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: dto.companyId },
      });
      if (!company) throw new NotFoundException('Company not found');
      sellerId = company.ownerId;
    }

    if (!sellerId) throw new NotFoundException('Could not determine supplier for this lead');
    if (sellerId === buyerId) throw new ForbiddenException('You cannot send a lead to yourself');

    const lead = await this.prisma.lead.create({
      data: {
        leadNumber: this.generateLeadNumber(),
        buyerId,
        sellerId,
        productId: dto.productId,
        companyId,
        subject: dto.subject,
        message: dto.message,
        quantityRequired: dto.quantityRequired,
        budget: dto.budget,
        source: dto.source || 'product_page',
        status: 'new',
        priority: (dto.budget && dto.budget > 100000) ? 'high' : 'medium', // Flag high budget leads
        timeline: {
          create: {
            activityType: 'lead_created',
            description: 'Lead submitted by buyer'
          }
        }
      },
    });

    // Notify seller
    await this.prisma.notification.create({
      data: {
        userId: sellerId,
        title: 'New Lead Received',
        description: `You have received a new enquiry: ${dto.subject}`,
        type: 'lead_created',
      }
    });

    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId },
      select: { email: true, fullName: true }
    });

    if (seller && seller.email) {
      const buyer = await this.prisma.user.findUnique({
        where: { id: buyerId },
        select: { fullName: true }
      });
      const productName = dto.productId ? 'a product' : 'your company'; // Can be improved
      
      this.emailService.sendLeadNotification(seller.email, buyer?.fullName || 'A Buyer', productName).catch(e => {
        console.error('Failed to send lead email', e);
      });
    }

    return lead;
  }

  async getSellerLeads(sellerId: string, page = 1, limit = 20) {
    return this.prisma.paginate('lead', {
      where: { sellerId },
      include: {
        buyer: { select: { fullName: true, email: true, phone: true } },
        product: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      page,
      limit,
    });
  }

  async getBuyerLeads(buyerId: string, page = 1, limit = 20) {
    return this.prisma.paginate('lead', {
      where: { buyerId },
      include: {
        company: { select: { companyName: true, logoUrl: true } },
        product: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      page,
      limit,
    });
  }

  async getLeadDetails(id: string, userId: string, role: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        buyer: { select: { fullName: true, email: true, phone: true } },
        seller: { select: { fullName: true, email: true, phone: true } },
        company: { select: { companyName: true, logoUrl: true, slug: true } },
        product: { select: { title: true, slug: true, minPrice: true, maxPrice: true } },
        messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { fullName: true } } } },
        notes: role === 'seller' || role === 'admin' ? { orderBy: { createdAt: 'desc' } } : false,
        timeline: { orderBy: { createdAt: 'desc' } },
        history: { orderBy: { changedAt: 'desc' } }
      }
    });

    if (!lead) throw new NotFoundException('Lead not found');

    // Access control
    if (role === 'buyer' && lead.buyerId !== userId) throw new ForbiddenException();
    if (role === 'seller' && lead.sellerId !== userId) throw new ForbiddenException();

    // Mark as viewed activity if seller is viewing for the first time
    if (role === 'seller' && lead.status === 'new') {
      await this.updateLeadStatus(id, userId, 'contacted');
    }

    return lead;
  }

  async updateLeadStatus(id: string, sellerId: string, newStatus: any) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead || lead.sellerId !== sellerId) throw new NotFoundException();

    if (lead.status === newStatus) return lead;

    const updated = await this.prisma.lead.update({
      where: { id },
      data: {
        status: newStatus,
        closedAt: ['closed', 'rejected'].includes(newStatus) ? new Date() : null,
        history: {
          create: {
            previousStatus: lead.status,
            newStatus,
            changedBy: sellerId
          }
        },
        timeline: {
          create: {
            activityType: 'status_updated',
            description: `Status changed to ${newStatus}`
          }
        }
      }
    });

    // Notify buyer
    await this.prisma.notification.create({
      data: {
        userId: lead.buyerId,
        title: 'Lead Status Updated',
        description: `Your enquiry status was updated to ${newStatus}`,
        type: 'lead_updated',
      }
    });

    return updated;
  }

  async addMessage(leadId: string, senderId: string, message: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException();
    if (lead.buyerId !== senderId && lead.sellerId !== senderId) throw new ForbiddenException();

    const createdMsg = await this.prisma.leadMessage.create({
      data: {
        leadId,
        senderId,
        message,
      }
    });

    await this.prisma.leadActivity.create({
      data: {
        leadId,
        activityType: 'message_sent',
        description: `New message from ${lead.buyerId === senderId ? 'Buyer' : 'Supplier'}`
      }
    });

    const receiverId = lead.buyerId === senderId ? lead.sellerId : lead.buyerId;
    await this.prisma.notification.create({
      data: {
        userId: receiverId,
        title: 'New Message',
        description: `You received a new message regarding lead #${lead.leadNumber}`,
        type: 'new_message',
      }
    });

    return createdMsg;
  }

  async addNote(leadId: string, sellerId: string, note: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead || lead.sellerId !== sellerId) throw new NotFoundException();

    const createdNote = await this.prisma.leadNote.create({
      data: {
        leadId,
        sellerId,
        note,
      }
    });

    await this.prisma.leadActivity.create({
      data: {
        leadId,
        activityType: 'note_added',
        description: 'Internal note added'
      }
    });

    return createdNote;
  }

  // --- FASTER RESPONSE MECHANISMS ---
  async quickReply(leadId: string, sellerId: string, template: 'quote' | 'acknowledge' | 'reject') {
    const lead = await this.prisma.lead.findUnique({ 
      where: { id: leadId },
      include: { buyer: true }
    });
    
    if (!lead || lead.sellerId !== sellerId) {
      throw new NotFoundException('Lead not found or unauthorized');
    }

    let messageText = '';
    let newStatus = lead.status;

    switch(template) {
      case 'quote':
        messageText = `Hello ${lead.buyer.fullName.split(' ')[0]}, thank you for your enquiry. We have attached our official quotation regarding this requirement. Let me know if you would like to proceed.`;
        newStatus = 'quoted' as any;
        break;
      case 'acknowledge':
        messageText = `Hello ${lead.buyer.fullName.split(' ')[0]}, we have received your requirement and are currently reviewing our inventory. We will get back to you shortly with availability and pricing.`;
        newStatus = 'contacted' as any;
        break;
      case 'reject':
        messageText = `Hello ${lead.buyer.fullName.split(' ')[0]}, unfortunately we cannot fulfill this requirement at this time.`;
        newStatus = 'rejected' as any;
        break;
      default:
        messageText = 'Thank you for contacting us.';
    }

    // 1. Send the templated message
    await this.addMessage(leadId, sellerId, messageText);

    // 2. Automatically update lead status
    if (newStatus !== lead.status) {
      await this.updateLeadStatus(leadId, sellerId, newStatus);
    }

    return { success: true, message: 'Quick reply dispatched', newStatus };
  }
}
