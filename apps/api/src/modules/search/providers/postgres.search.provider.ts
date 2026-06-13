import { Injectable } from '@nestjs/common';
import { SearchProvider, SearchResults } from './search.provider.interface';
import { PrismaService } from '../../../database/prisma.service';

// --- SYNONYM ENGINE ---
// Maps user keywords to broader synonyms to improve relevance
const SYNONYM_DICT: Record<string, string[]> = {
  'shoes': ['footwear', 'sneakers', 'boots'],
  'apparel': ['clothing', 'garment', 'textile', 'wear'],
  'mobile': ['phone', 'smartphone', 'cellphone'],
  'auto': ['automotive', 'vehicle', 'car'],
  'machinery': ['machine', 'equipment', 'industrial'],
};

@Injectable()
export class PostgresSearchProvider implements SearchProvider {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Expands query using synonyms and formats it into a valid PostgreSQL tsquery string.
   * e.g. "industrial shoes" -> "industrial | shoes | footwear | sneakers | boots | industrial:* | shoes:*"
   */
  private buildFtsQuery(query: string): string {
    if (!query) return '';
    const words = query.trim().toLowerCase().split(/\s+/).filter(w => w.length > 0);
    
    const expandedWords = new Set<string>();
    for (const w of words) {
      expandedWords.add(w);
      expandedWords.add(`${w}:*`); // Prefix match for partials
      
      // Synonym Expansion
      if (SYNONYM_DICT[w]) {
        for (const syn of SYNONYM_DICT[w]) {
          expandedWords.add(syn);
          expandedWords.add(`${syn}:*`);
        }
      }
    }

    // Join with OR (|) for tsquery
    return Array.from(expandedWords).join(' | ');
  }

  async globalSearch(query: string, page: number, limit: number): Promise<SearchResults> {
    const skip = (page - 1) * limit;
    const ftsQuery = this.buildFtsQuery(query);
    
    // Concurrently fetch from all 3 domains using Full Text Search OR Contains
    const [products, suppliers, categories, prodCount, suppCount, catCount] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          status: 'active',
          OR: [
            { title: { search: ftsQuery } },
            { description: { search: ftsQuery } },
            { title: { contains: query, mode: 'insensitive' } } // Fallback for pure substrings
          ]
        },
        include: { images: { take: 1 }, company: { select: { companyName: true, slug: true } }, category: true },
        skip,
        take: limit,
      }),
      this.prisma.company.findMany({
        where: {
          status: 'active',
          OR: [
            { companyName: { search: ftsQuery } },
            { description: { search: ftsQuery } },
            { companyName: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: { addresses: { take: 1 } },
        skip,
        take: limit,
      }),
      this.prisma.category.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { search: ftsQuery } },
            { description: { search: ftsQuery } },
            { name: { contains: query, mode: 'insensitive' } }
          ]
        },
        skip,
        take: limit,
      }),
      this.prisma.product.count({
        where: {
          status: 'active',
          OR: [
            { title: { search: ftsQuery } },
            { description: { search: ftsQuery } },
            { title: { contains: query, mode: 'insensitive' } }
          ]
        }
      }),
      this.prisma.company.count({
        where: {
          status: 'active',
          OR: [
            { companyName: { search: ftsQuery } },
            { description: { search: ftsQuery } },
            { companyName: { contains: query, mode: 'insensitive' } }
          ]
        }
      }),
      this.prisma.category.count({
        where: {
          isActive: true,
          OR: [
            { name: { search: ftsQuery } },
            { description: { search: ftsQuery } },
            { name: { contains: query, mode: 'insensitive' } }
          ]
        }
      })
    ]);

    const totalResults = prodCount + suppCount + catCount;

    return {
      products,
      suppliers,
      categories,
      totalResults,
      currentPage: page,
      totalPages: Math.ceil(totalResults / limit)
    };
  }

  async searchProducts(query: string, filters: any, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where: any = { status: 'active' };

    if (query && query.trim() !== '') {
      const ftsQuery = this.buildFtsQuery(query);
      where.OR = [
        { title: { search: ftsQuery } },
        { description: { search: ftsQuery } },
        { title: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (filters.category) {
      where.categoryId = filters.category;
    }

    if (filters.supplier) {
      where.companyId = filters.supplier;
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { images: { take: 1 }, company: { select: { companyName: true, slug: true } }, category: true },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async searchSuppliers(query: string, filters: any, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where: any = { status: 'active' };

    if (query && query.trim() !== '') {
      const ftsQuery = this.buildFtsQuery(query);
      where.OR = [
        { companyName: { search: ftsQuery } },
        { description: { search: ftsQuery } },
        { companyName: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (filters.industry) {
      where.businessType = filters.industry;
    }

    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        include: { addresses: { take: 1 } },
        skip,
        take: limit,
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async searchCategories(query: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where: any = { isActive: true };

    if (query && query.trim() !== '') {
      const ftsQuery = this.buildFtsQuery(query);
      where.OR = [
        { name: { search: ftsQuery } },
        { description: { search: ftsQuery } },
        { name: { contains: query, mode: 'insensitive' } }
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  // --- AUTO SUGGESTION OPTIMIZATION ---
  async suggest(query: string) {
    // Fast startsWith / FTS queries with extremely tight limits to ensure sub-100ms response
    const ftsQuery = this.buildFtsQuery(query);
    
    const [products, suppliers, categories] = await Promise.all([
      this.prisma.product.findMany({
        where: { 
          status: 'active', 
          OR: [
            { title: { startsWith: query, mode: 'insensitive' } },
            { title: { search: ftsQuery } }
          ]
        },
        select: { id: true, title: true, slug: true },
        take: 4,
      }),
      this.prisma.company.findMany({
        where: { 
          status: 'active', 
          OR: [
            { companyName: { startsWith: query, mode: 'insensitive' } },
            { companyName: { search: ftsQuery } }
          ]
        },
        select: { id: true, companyName: true, slug: true },
        take: 3,
      }),
      this.prisma.category.findMany({
        where: { 
          isActive: true, 
          OR: [
            { name: { startsWith: query, mode: 'insensitive' } },
            { name: { search: ftsQuery } }
          ]
        },
        select: { id: true, name: true, slug: true },
        take: 3,
      })
    ]);

    return { products, suppliers, categories };
  }
}
