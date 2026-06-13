export interface Product {
  id: string;
  title: string;
  slug: string;
  minPrice?: number;
  maxPrice?: number;
  status: 'draft' | 'pending' | 'active' | 'rejected' | 'archived';
  createdAt: Date;
}
