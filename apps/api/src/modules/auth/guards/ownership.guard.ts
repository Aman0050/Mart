import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

/**
 * Enterprise Security Guard
 * Mitigates IDOR (Insecure Direct Object Reference) vulnerabilities by ensuring 
 * that the currently authenticated user actually owns the resources they are trying to modify.
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Bypass for super_admin
    if (user?.role === 'super_admin' || user?.role === 'admin') {
      return true;
    }

    const { companyId } = request.params;

    if (!companyId) {
      // If a route doesn't use companyId in params, this guard might not be the right fit,
      // or we just let it pass if we are protecting company-specific routes.
      return true; 
    }

    // Verify Ownership
    const company = await this.prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.ownerId !== user.sub) {
      throw new ForbiddenException('Security Violation: You do not have permission to modify resources belonging to this company.');
    }

    return true;
  }
}
