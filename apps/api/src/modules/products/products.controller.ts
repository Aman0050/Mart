import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService, CreateProductDto, UpdateProductDto, ProductSpecDto, ProductImageDto } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('products')
@Controller({ path: 'products', version: '1' })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @Post()
  @ApiOperation({ summary: 'Create a new product (Sellers only)' })
  async createProduct(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.createProduct(userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  @Get('me')
  @ApiOperation({ summary: 'Get my products (Sellers only)' })
  async getMyProducts(
    @CurrentUser('sub') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.productsService.getMyProducts(userId, parseInt(page, 10), parseInt(limit, 10));
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search active products' })
  async searchProducts(
    @Query('q') query: string = '',
    @Query('category') categoryId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.productsService.searchProducts(query, categoryId, parseInt(page, 10), parseInt(limit, 10));
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get product by slug' })
  async getProduct(@Param('slug') slug: string) {
    return this.productsService.getProductBySlug(slug);
  }

  @Public()
  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get products by company ID' })
  async getProductsByCompany(@Param('companyId') companyId: string) {
    return this.productsService.getProductsByCompany(companyId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
  @Roles('seller', 'admin')
  @Patch(':id/:companyId')
  @ApiOperation({ summary: 'Update product' })
  async updateProduct(
    @Param('id') id: string,
    @Param('companyId') companyId: string,
    @Body() dto: Partial<UpdateProductDto>,
  ) {
    return this.productsService.updateProduct(id, companyId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
  @Roles('seller', 'admin')
  @Delete(':id/:companyId')
  @ApiOperation({ summary: 'Delete product' })
  async deleteProduct(
    @Param('id') id: string,
    @Param('companyId') companyId: string,
  ) {
    return this.productsService.deleteProduct(id, companyId);
  }

  // Specs
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
  @Roles('seller')
  @Post(':id/specifications/:companyId')
  @ApiOperation({ summary: 'Add product spec' })
  async addSpec(
    @Param('id') id: string,
    @Param('companyId') companyId: string,
    @Body() dto: ProductSpecDto,
  ) {
    return this.productsService.addSpecification(id, companyId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
  @Roles('seller')
  @Delete('specifications/:id/:companyId')
  @ApiOperation({ summary: 'Delete product spec' })
  async deleteSpec(
    @Param('id') id: string,
    @Param('companyId') companyId: string,
  ) {
    return this.productsService.deleteSpecification(id, companyId);
  }

  // Images
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
  @Roles('seller')
  @Post(':id/images/:companyId')
  @ApiOperation({ summary: 'Add product image' })
  async addImage(
    @Param('id') id: string,
    @Param('companyId') companyId: string,
    @Body() dto: ProductImageDto,
  ) {
    return this.productsService.addImage(id, companyId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
  @Roles('seller')
  @Delete('images/:id/:companyId')
  @ApiOperation({ summary: 'Delete product image' })
  async deleteImage(
    @Param('id') id: string,
    @Param('companyId') companyId: string,
  ) {
    return this.productsService.deleteImage(id, companyId);
  }
}
