import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('search')
@Controller({ path: 'search', version: '1' })
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  private extractUserId(req: any): string | null {
    // If user is authenticated, we might have req.user from JWT
    // But since endpoints are @Public, req.user might be undefined
    return req.user?.sub || null;
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Global unified search' })
  async globalSearch(
    @Query('q') query: string = '',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Req() req: any,
  ) {
    return this.searchService.globalSearch(query, parseInt(page, 10), parseInt(limit, 10), this.extractUserId(req));
  }

  @Public()
  @Get('products')
  @ApiOperation({ summary: 'Search products' })
  async searchProducts(
    @Query('q') query: string = '',
    @Query('category') category: string,
    @Query('supplier') supplier: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Req() req: any,
  ) {
    const filters = { category, supplier };
    return this.searchService.searchProducts(query, filters, parseInt(page, 10), parseInt(limit, 10), this.extractUserId(req));
  }

  @Public()
  @Get('suppliers')
  @ApiOperation({ summary: 'Search suppliers' })
  async searchSuppliers(
    @Query('q') query: string = '',
    @Query('industry') industry: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Req() req: any,
  ) {
    const filters = { industry };
    return this.searchService.searchSuppliers(query, filters, parseInt(page, 10), parseInt(limit, 10), this.extractUserId(req));
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Search categories' })
  async searchCategories(
    @Query('q') query: string = '',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.searchService.searchCategories(query, parseInt(page, 10), parseInt(limit, 10));
  }

  @Public()
  @Get('suggestions')
  @ApiOperation({ summary: 'Auto-suggestions for search bar' })
  async suggest(@Query('q') query: string = '') {
    return this.searchService.suggest(query);
  }

  @Public()
  @Get('popular')
  @ApiOperation({ summary: 'Get popular searches' })
  async getPopular() {
    const popular = await this.searchService.getPopularSearches();
    return { data: popular };
  }
}
