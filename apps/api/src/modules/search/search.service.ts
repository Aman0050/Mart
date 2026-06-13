import { Injectable, Inject } from '@nestjs/common';
import type { SearchProvider } from './providers/search.provider.interface';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SearchService {
  constructor(
    @Inject('SearchProvider') private readonly searchProvider: SearchProvider,
    private readonly prisma: PrismaService,
  ) {}

  private async logSearchQuery(query: string, userId: string | null, resultsCount: number) {
    if (!query || query.trim() === '') return;
    
    try {
      await this.prisma.searchQuery.create({
        data: {
          query: query.toLowerCase().trim(),
          userId,
          resultsCount,
        }
      });
    } catch (error) {
      console.error('Failed to log search query:', error);
    }
  }

  async globalSearch(query: string, page: number, limit: number, userId: string | null = null) {
    const results = await this.searchProvider.globalSearch(query, page, limit);
    if (page === 1) {
      this.logSearchQuery(query, userId, results.totalResults);
    }
    return results;
  }

  async searchProducts(query: string, filters: any, page: number, limit: number, userId: string | null = null) {
    const results = await this.searchProvider.searchProducts(query, filters, page, limit);
    if (page === 1) {
      this.logSearchQuery(query, userId, results.meta.total);
    }
    return results;
  }

  async searchSuppliers(query: string, filters: any, page: number, limit: number, userId: string | null = null) {
    const results = await this.searchProvider.searchSuppliers(query, filters, page, limit);
    if (page === 1) {
      this.logSearchQuery(query, userId, results.meta.total);
    }
    return results;
  }

  async searchCategories(query: string, page: number, limit: number) {
    return this.searchProvider.searchCategories(query, page, limit);
  }

  async suggest(query: string) {
    if (!query || query.trim() === '') {
      return { products: [], suppliers: [], categories: [] };
    }
    return this.searchProvider.suggest(query);
  }

  async getPopularSearches() {
    return ['machinery', 'packaging', 'electronics', 'textiles', 'medical'];
  }
}
