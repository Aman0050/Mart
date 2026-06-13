export interface SearchResults {
  products: any[];
  suppliers: any[];
  categories: any[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
}

export interface SearchProvider {
  /**
   * Search across all types
   */
  globalSearch(query: string, page: number, limit: number): Promise<SearchResults>;
  
  /**
   * Search specifically for products
   */
  searchProducts(query: string, filters: any, page: number, limit: number): Promise<any>;

  /**
   * Search specifically for suppliers
   */
  searchSuppliers(query: string, filters: any, page: number, limit: number): Promise<any>;

  /**
   * Search specifically for categories
   */
  searchCategories(query: string, page: number, limit: number): Promise<any>;

  /**
   * Fast autocomplete suggestions
   */
  suggest(query: string): Promise<{ products: any[], suppliers: any[], categories: any[] }>;
}
