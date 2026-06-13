import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles('super_admin', 'operations_admin', 'support_admin')
  @Get('analytics/kpis')
  @ApiOperation({ summary: 'Get Dashboard KPIs' })
  async getDashboardKpis() {
    const data = await this.adminService.getDashboardKpis();
    return { data };
  }

  @Roles('super_admin', 'operations_admin', 'support_admin')
  @Get('analytics/feedback-analytics')
  @ApiOperation({ summary: 'Get Feedback Analytics' })
  async getFeedbackAnalytics() {
    const data = await this.adminService.getFeedbackAnalytics();
    return { data };
  }

  @Roles('super_admin')
  @Get('audit-logs')
  @ApiOperation({ summary: 'Get immutable audit logs' })
  async getAuditLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    return this.adminService.getAuditLogs(parseInt(page, 10), parseInt(limit, 10));
  }

  // ── USERS ──
  
  @Roles('super_admin', 'operations_admin', 'support_admin')
  @Get('users')
  async getUsers(
    @Query('search') search: string = '',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.adminService.getUsers(search, parseInt(page, 10), parseInt(limit, 10));
  }

  @Roles('super_admin', 'operations_admin')
  @Patch('users/:id/status')
  async updateUserStatus(
    @CurrentUser('sub') adminId: string,
    @Param('id') userId: string,
    @Body('status') status: any
  ) {
    return this.adminService.updateUserStatus(adminId, userId, status);
  }

  // ── COMPANIES ──

  @Roles('super_admin', 'operations_admin', 'support_admin')
  @Get('companies')
  async getCompanies(
    @Query('status') status: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.adminService.getCompanies(status, parseInt(page, 10), parseInt(limit, 10));
  }

  @Roles('super_admin', 'operations_admin')
  @Patch('companies/:id/status')
  async updateCompanyStatus(
    @CurrentUser('sub') adminId: string,
    @Param('id') companyId: string,
    @Body('status') status: any
  ) {
    return this.adminService.updateCompanyStatus(adminId, companyId, status);
  }

  // ── PRODUCTS ──

  @Roles('super_admin', 'operations_admin', 'support_admin')
  @Get('products')
  async getProducts(
    @Query('status') status: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.adminService.getProducts(status, parseInt(page, 10), parseInt(limit, 10));
  }

  @Roles('super_admin', 'operations_admin')
  @Patch('products/:id/status')
  async updateProductStatus(
    @CurrentUser('sub') adminId: string,
    @Param('id') productId: string,
    @Body('status') status: any,
    @Body('featured') featured?: boolean,
  ) {
    return this.adminService.updateProductStatus(adminId, productId, status, featured);
  }

  // ── LEADS ──

  @Roles('super_admin', 'operations_admin', 'support_admin')
  @Get('leads')
  async getLeads(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.adminService.getLeads(parseInt(page, 10), parseInt(limit, 10));
  }
}
