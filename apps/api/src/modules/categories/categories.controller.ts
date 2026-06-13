import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { CategoriesService } from './categories.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('categories')
@Controller({ path: 'categories', version: '1' })
@UseInterceptors(CacheInterceptor)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @CacheTTL(3600000) // 1 hour
  @ApiOperation({ summary: 'Get all categories flat list' })
  async getCategories() {
    return this.categoriesService.getCategories();
  }

  @Public()
  @Get('tree')
  @CacheTTL(3600000) // 1 hour
  @ApiOperation({ summary: 'Get categories in a tree structure' })
  async getCategoryTree() {
    return this.categoriesService.getCategoryTree();
  }
}
