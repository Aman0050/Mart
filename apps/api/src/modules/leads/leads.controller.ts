import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeadsService, CreateLeadDto } from './leads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'leads', version: '1' })
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lead (Buyer)' })
  async createLead(
    @CurrentUser('sub') buyerId: string,
    @Body() dto: CreateLeadDto
  ) {
    return this.leadsService.createLead(buyerId, dto);
  }

  @Roles('seller', 'admin')
  @Get('seller')
  @ApiOperation({ summary: 'Get leads for seller dashboard' })
  async getSellerLeads(
    @CurrentUser('sub') sellerId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.leadsService.getSellerLeads(sellerId, parseInt(page, 10), parseInt(limit, 10));
  }

  @Get('buyer')
  @ApiOperation({ summary: 'Get leads for buyer dashboard' })
  async getBuyerLeads(
    @CurrentUser('sub') buyerId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.leadsService.getBuyerLeads(buyerId, parseInt(page, 10), parseInt(limit, 10));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed lead view' })
  async getLeadDetails(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return this.leadsService.getLeadDetails(id, user.sub, user.role);
  }

  @Roles('seller', 'admin')
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update lead status (Seller)' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('sub') sellerId: string,
    @Body('status') status: any
  ) {
    return this.leadsService.updateLeadStatus(id, sellerId, status);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Add a message to the lead thread' })
  async addMessage(
    @Param('id') id: string,
    @CurrentUser('sub') senderId: string,
    @Body('message') message: string
  ) {
    return this.leadsService.addMessage(id, senderId, message);
  }

  @Roles('seller')
  @Post(':id/notes')
  @ApiOperation({ summary: 'Add a private internal note (Seller)' })
  async addNote(
    @Param('id') id: string,
    @CurrentUser('sub') sellerId: string,
    @Body('note') note: string
  ) {
    return this.leadsService.addNote(id, sellerId, note);
  }

  @Roles('seller')
  @Post(':id/quick-reply')
  @ApiOperation({ summary: 'Send a quick automated reply (Quote/Acknowledgment)' })
  async quickReply(
    @Param('id') id: string,
    @CurrentUser('sub') sellerId: string,
    @Body('template') template: 'quote' | 'acknowledge' | 'reject'
  ) {
    return this.leadsService.quickReply(id, sellerId, template);
  }
}
