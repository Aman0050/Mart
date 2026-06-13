import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService, CreateCompanyDto, UpdateCompanyDto, CreateAddressDto, AddGalleryImageDto } from './companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('companies')
@Controller({ path: 'companies', version: '1' })
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  @Post()
  @ApiOperation({ summary: 'Create a new company profile' })
  async createCompany(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCompanyDto,
  ) {
    return this.companiesService.createCompany(userId, dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search active companies' })
  async searchCompanies(
    @Query('q') query: string = '',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.companiesService.searchCompanies(query, parseInt(page, 10), parseInt(limit, 10));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  @Get('my-company')
  @ApiOperation({ summary: 'Get authenticated user company profile' })
  async getMyCompany(@CurrentUser('sub') userId: string) {
    return this.companiesService.getMyCompany(userId);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get public company profile' })
  async getCompany(@Param('slug') slug: string) {
    return this.companiesService.getCompanyBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
  @Roles('seller')
  @Patch(':companyId')
  @ApiOperation({ summary: 'Update company profile by ID' })
  async updateCompany(
    @Param('companyId') companyId: string,
    @Body() dto: Partial<UpdateCompanyDto>,
  ) {
    return this.companiesService.updateMyCompany(companyId, dto); 
  }

  // ── Addresses ──────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
  @Roles('seller')
  @Post(':companyId/address')
  @ApiOperation({ summary: 'Add company address' })
  async addAddress(
    @Param('companyId') companyId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.companiesService.addAddress(companyId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  @Patch('/addresses/:id')
  @ApiOperation({ summary: 'Update address' })
  async updateAddress(
    @Param('id') addressId: string,
    @Body() dto: Partial<CreateAddressDto>,
  ) {
    return this.companiesService.updateAddress(addressId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  @Delete('/addresses/:id')
  @ApiOperation({ summary: 'Delete address' })
  async deleteAddress(@Param('id') addressId: string) {
    return this.companiesService.deleteAddress(addressId);
  }

  // ── Gallery ───────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
  @Roles('seller')
  @Post(':companyId/gallery')
  @ApiOperation({ summary: 'Add gallery image' })
  async addGalleryImage(
    @Param('companyId') companyId: string,
    @Body() dto: AddGalleryImageDto,
  ) {
    return this.companiesService.addGalleryImage(companyId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  @Delete('/gallery/:id')
  @ApiOperation({ summary: 'Delete gallery image' })
  async deleteGalleryImage(@Param('id') galleryId: string) {
    return this.companiesService.deleteGalleryImage(galleryId);
  }
}
