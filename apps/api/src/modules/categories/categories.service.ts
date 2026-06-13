import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories() {
    return [
      { id: '1', name: 'Machinery', slug: 'machinery', icon: 'Settings', isActive: true, sortOrder: 1 },
      { id: '2', name: 'Electronics', slug: 'electronics', icon: 'Cpu', isActive: true, sortOrder: 2 },
      { id: '3', name: 'Chemicals', slug: 'chemicals', icon: 'FlaskConical', isActive: true, sortOrder: 3 },
      { id: '4', name: 'Packaging', slug: 'packaging', icon: 'Box', isActive: true, sortOrder: 4 },
      { id: '5', name: 'Apparel', slug: 'apparel', icon: 'Shirt', isActive: true, sortOrder: 5 },
      { id: '6', name: 'Agriculture', slug: 'agriculture', icon: 'Leaf', isActive: true, sortOrder: 6 }
    ];
  }

  async getCategoryTree() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    // Build tree
    const categoryMap = new Map<string, any>();
    const tree: any[] = [];

    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    categoryMap.forEach(cat => {
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId).children.push(cat);
      } else {
        tree.push(cat);
      }
    });

    return tree;
  }
}
