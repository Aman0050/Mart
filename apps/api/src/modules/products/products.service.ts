import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PartialType } from '@nestjs/mapped-types';

import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  minimumOrderQuantity?: number;

  @IsString()
  @IsOptional()
  seoTitle?: string;

  @IsString()
  @IsOptional()
  seoDescription?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsEnum(['draft', 'pending', 'active', 'archived'])
  @IsOptional()
  status?: 'draft' | 'pending' | 'active' | 'archived';
}

export class ProductSpecDto {
  specName: string;
  specValue: string;
}

export class ProductImageDto {
  imageUrl: string;
  sortOrder?: number;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(userId: string, dto: CreateProductDto) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (!company) {
      throw new ForbiddenException('You must create a company profile first');
    }

    const slug = dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

    return this.prisma.product.create({
      data: {
        ...dto,
        companyId: company.id,
        status: 'draft',
        slug,
      },
    });
  }

  async getMyProducts(userId: string, page = 1, limit = 20) {
    const company = await this.prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (!company) {
      return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
    }

    return this.prisma.paginate('product', {
      where: { companyId: company.id },
      page,
      limit,
    });
  }

  async searchProducts(query: string, categoryId?: string, page = 1, limit = 20) {
    const mockProducts = [
      {
        id: '1',
        title: 'Industrial Heavy Duty Conveyor Belt',
        slug: 'industrial-conveyor-belt',
        price: 45000,
        minimumOrderQuantity: 10,
        images: [{ imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158' }],
        company: { companyName: 'Global Machineries Ltd', slug: 'global-machineries', logoUrl: '' }
      },
      {
        id: '2',
        title: 'Automated Packaging Machine V4',
        slug: 'automated-packaging-machine-v4',
        price: 120000,
        minimumOrderQuantity: 1,
        images: [{ imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc' }],
        company: { companyName: 'TechPack Solutions', slug: 'techpack-solutions', logoUrl: '' }
      },
      {
        id: '3',
        title: 'Premium Copper Wire 2.5mm',
        slug: 'premium-copper-wire-2-5mm',
        price: 450,
        minimumOrderQuantity: 100,
        images: [{ imageUrl: 'https://images.unsplash.com/photo-1601506521937-0121a7fc2a6b' }],
        company: { companyName: 'Metro Cables', slug: 'metro-cables', logoUrl: '' }
      }
    ];

    return {
      data: mockProducts,
      meta: {
        total: mockProducts.length,
        page,
        limit,
        totalPages: 1
      }
    };
  }

  async getProductBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        specifications: { orderBy: { sortOrder: 'asc' } },
        company: {
          include: { addresses: true },
        },
        category: true,
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }
    // Increment view count
    await this.prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });
    return product;
  }

  async getProductsByCompany(companyId: string) {
    return this.prisma.product.findMany({
      where: { companyId },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateProduct(productId: string, companyId: string, dto: Partial<UpdateProductDto>) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, companyId },
    });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.product.update({
      where: { id: productId },
      data: dto,
    });
  }

  async deleteProduct(productId: string, companyId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, companyId },
    });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.product.delete({
      where: { id: productId },
    });
  }

  // Specifications
  async addSpecification(productId: string, companyId: string, dto: ProductSpecDto) {
    // Validate ownership
    const product = await this.prisma.product.findFirst({ where: { id: productId, companyId } });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.productSpecification.create({
      data: {
        productId,
        ...dto,
      },
    });
  }

  async deleteSpecification(specId: string, companyId: string) {
    const spec = await this.prisma.productSpecification.findUnique({
      where: { id: specId },
      include: { product: true },
    });
    if (!spec || spec.product.companyId !== companyId) throw new NotFoundException();

    return this.prisma.productSpecification.delete({ where: { id: specId } });
  }

  // Images
  async addImage(productId: string, companyId: string, dto: ProductImageDto) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, companyId } });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.productImage.create({
      data: {
        productId,
        ...dto,
      },
    });
  }

  async deleteImage(imageId: string, companyId: string) {
    const img = await this.prisma.productImage.findUnique({
      where: { id: imageId },
      include: { product: true },
    });
    if (!img || img.product.companyId !== companyId) throw new NotFoundException();

    return this.prisma.productImage.delete({ where: { id: imageId } });
  }
}
