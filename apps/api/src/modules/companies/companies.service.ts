import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  companyName: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  yearEstablished?: number;

  @IsNumber()
  @IsOptional()
  employeeCount?: number;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @IsString()
  @IsOptional()
  businessType?: any;

  @IsString()
  @IsOptional()
  gstNumber?: string;

  @IsString()
  @IsOptional()
  panNumber?: string;
}

export class UpdateCompanyDto extends CreateCompanyDto {
  @IsEnum(['pending_review', 'active', 'suspended'])
  @IsOptional()
  status?: 'pending_review' | 'active' | 'suspended';
}

export class CreateAddressDto {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country?: string;
  postalCode: string;
  isPrimary?: boolean;
}

export class AddGalleryImageDto {
  imageUrl: string;
  sortOrder?: number;
}

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCompany(userId: string, dto: CreateCompanyDto) {
    const existing = await this.prisma.company.findFirst({
      where: { OR: [{ slug: dto.slug }, { ownerId: userId }] },
    });

    if (existing) {
      if (existing.ownerId === userId) {
        throw new ConflictException('User already owns a company');
      }
      throw new ConflictException('Company slug already in use');
    }

    return this.prisma.company.create({
      data: {
        ...dto,
        ownerId: userId,
        status: 'pending_review',
      },
    });
  }

  async getCompanyBySlug(slug: string) {
    const company = await this.prisma.company.findUnique({
      where: { slug },
      include: {
        addresses: true,
        gallery: { orderBy: { sortOrder: 'asc' } },
        categories: true,
        products: {
          where: { status: 'active' },
          take: 10,
        },
      },
    });

    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async getMyCompany(userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
      include: {
        addresses: true,
        gallery: { orderBy: { sortOrder: 'asc' } },
        categories: true,
      },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async updateMyCompany(userId: string, dto: Partial<UpdateCompanyDto>) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (!company) throw new NotFoundException('Company profile not found');

    // Prevent sellers from forcefully making themselves 'active' if they are pending
    if (dto.status && company.status === 'pending_review' && dto.status === 'active') {
      delete dto.status;
    }

    return this.prisma.company.update({
      where: { id: company.id },
      data: dto,
    });
  }

  async searchCompanies(query: string, page = 1, limit = 20) {
    return this.prisma.paginate('company', {
      where: {
        status: 'active',
        companyName: { contains: query, mode: 'insensitive' },
      },
      page,
      limit,
    });
  }

  // ── Addresses ──────────────────────────────────────

  async addAddress(companyId: string, dto: CreateAddressDto) {
    return this.prisma.companyAddress.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async updateAddress(addressId: string, dto: Partial<CreateAddressDto>) {
    return this.prisma.companyAddress.update({
      where: { id: addressId },
      data: dto,
    });
  }

  async deleteAddress(addressId: string) {
    return this.prisma.companyAddress.delete({
      where: { id: addressId },
    });
  }

  // ── Gallery ───────────────────────────────────────

  async addGalleryImage(companyId: string, dto: AddGalleryImageDto) {
    return this.prisma.companyGallery.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async deleteGalleryImage(galleryId: string) {
    return this.prisma.companyGallery.delete({
      where: { id: galleryId },
    });
  }
}
