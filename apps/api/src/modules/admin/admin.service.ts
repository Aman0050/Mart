import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ── AUDIT LOGGING ────────────────────────────────────────

  async logAction(adminId: string, action: string, entityType: string, entityId?: string, details?: any) {
    await this.prisma.auditLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId,
        details: details || {}
      }
    });
  }

  async getAuditLogs(page = 1, limit = 20) {
    return this.prisma.paginate('auditLog', {
      include: { admin: { select: { fullName: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      page,
      limit,
    });
  }

  // ── ANALYTICS ────────────────────────────────────────────

  async getDashboardKpis() {
    const [
      totalUsers, totalSuppliers, totalProducts, totalLeads, newLeads, convertedLeads, totalRfqs
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.company.count({ where: { status: 'active' } }),
      this.prisma.product.count({ where: { status: 'active' } }),
      this.prisma.lead.count(),
      this.prisma.lead.count({ where: { status: 'new' } }),
      this.prisma.lead.count({ where: { status: 'closed' } }),
      this.prisma.rfq.count(),
    ]);

    return {
      totalUsers,
      totalSuppliers,
      totalProducts,
      totalLeads,
      newLeads,
      convertedLeads,
      totalRfqs,
      conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0
    };
  }

  async getFeedbackAnalytics() {
    const [totalFeedbacks, ratings] = await Promise.all([
      this.prisma.feedback.count(),
      this.prisma.feedback.findMany({ select: { rating: true, role: true } }),
    ]);

    const avgRating = ratings.length > 0 ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length) : 0;
    const supplierRatings = ratings.filter(r => r.role === 'seller');
    const buyerRatings = ratings.filter(r => r.role === 'buyer');

    const avgSupplierRating = supplierRatings.length > 0 ? (supplierRatings.reduce((acc, curr) => acc + curr.rating, 0) / supplierRatings.length) : 0;
    const avgBuyerRating = buyerRatings.length > 0 ? (buyerRatings.reduce((acc, curr) => acc + curr.rating, 0) / buyerRatings.length) : 0;

    // NPS Calculation (Promoters 9-10 (but our scale is 1-5, so 5 is promoter), Passives 4, Detractors 1-3)
    const promoters = ratings.filter(r => r.rating === 5).length;
    const detractors = ratings.filter(r => r.rating <= 3).length;
    const nps = ratings.length > 0 ? ((promoters - detractors) / ratings.length) * 100 : 0;

    return {
      totalFeedbacks,
      avgRating: avgRating.toFixed(1),
      avgSupplierRating: avgSupplierRating.toFixed(1),
      avgBuyerRating: avgBuyerRating.toFixed(1),
      npsScore: Math.round(nps),
    };
  }

  // ── USERS ────────────────────────────────────────────────

  async getUsers(search: string, page = 1, limit = 20) {
    const where = search ? {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    } : {};

    return this.prisma.paginate('user', {
      where,
      select: { id: true, fullName: true, email: true, role: true, status: true, createdAt: true, lastLoginAt: true },
      orderBy: { createdAt: 'desc' },
      page,
      limit,
    });
  }

  async updateUserStatus(adminId: string, userId: string, status: any) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status }
    });
    await this.logAction(adminId, `USER_${status.toUpperCase()}`, 'User', userId, { newStatus: status });
    return user;
  }

  // ── COMPANIES ────────────────────────────────────────────

  async getCompanies(status: any, page = 1, limit = 20) {
    const where = status ? { status } : {};
    return this.prisma.paginate('company', {
      where,
      include: { owner: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      page,
      limit,
    });
  }

  async updateCompanyStatus(adminId: string, companyId: string, status: any) {
    const company = await this.prisma.company.update({
      where: { id: companyId },
      data: { status, verified: status === 'active' }
    });
    
    // Change owner role if active
    if (status === 'active' && company.ownerId) {
      await this.prisma.user.update({ where: { id: company.ownerId }, data: { role: 'seller' } });
    }

    await this.logAction(adminId, `COMPANY_${status.toUpperCase()}`, 'Company', companyId, { newStatus: status });
    return company;
  }

  // ── PRODUCTS ─────────────────────────────────────────────

  async getProducts(status: any, page = 1, limit = 20) {
    const where = status ? { status } : {};
    return this.prisma.paginate('product', {
      where,
      include: { company: { select: { companyName: true } }, category: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      page,
      limit,
    });
  }

  async updateProductStatus(adminId: string, productId: string, status: any, featured?: boolean) {
    const updateData: any = { status };
    if (featured !== undefined) updateData.featured = featured;

    const product = await this.prisma.product.update({
      where: { id: productId },
      data: updateData
    });
    await this.logAction(adminId, `PRODUCT_${status.toUpperCase()}`, 'Product', productId, { newStatus: status, featured });
    return product;
  }

  // ── LEADS ────────────────────────────────────────────────

  async getLeads(page = 1, limit = 20) {
    return this.prisma.paginate('lead', {
      include: {
        buyer: { select: { fullName: true } },
        company: { select: { companyName: true } },
        product: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' },
      page,
      limit,
    });
  }
}
