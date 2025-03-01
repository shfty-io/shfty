import { unstable_cache } from 'next/cache';

// Cache tag constants
export const CACHE_TAGS = {
  PRODUCTS: 'products',
  PRODUCT: (id: string) => `product:${id}`,
  USER: (id: string) => `user:${id}`,
  CATEGORIES: 'categories',
  TRENDING: 'trending',
  LATEST: 'latest',
};

// Default cache options
const defaultCacheOptions = {
  revalidate: 60, // 1 minute
};

/**
 * Cache a function with the given tags and options
 * @param fn The function to cache
 * @param tags Cache tags for invalidation
 * @param options Cache options
 * @returns The cached function
 */
export function cacheFunction<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  tags: string[],
  options: { revalidate?: number } = defaultCacheOptions
): (...args: TArgs) => Promise<TReturn> {
  return unstable_cache(fn, tags, options);
}

/**
 * Cache a database query with the given tags and options
 * @param queryFn The database query function
 * @param tags Cache tags for invalidation
 * @param options Cache options
 * @returns The cached query function
 */
export function cacheQuery<TArgs extends unknown[], TReturn>(
  queryFn: (...args: TArgs) => Promise<TReturn>,
  tags: string[],
  options: { revalidate?: number } = defaultCacheOptions
): (...args: TArgs) => Promise<TReturn> {
  return cacheFunction(queryFn, tags, options);
}

/**
 * Get a product by ID with caching
 * @param getProductFn The function to get a product
 * @param productId The product ID
 * @returns The cached product getter function
 */
export function getCachedProduct<T>(
  getProductFn: (id: string) => Promise<T>,
  productId: string
): Promise<T> {
  const cachedFn = cacheFunction<[string], T>(
    getProductFn,
    [CACHE_TAGS.PRODUCTS, CACHE_TAGS.PRODUCT(productId)],
    { revalidate: 300 } // 5 minutes
  );
  
  return cachedFn(productId);
}

/**
 * Get trending products with caching
 * @param getTrendingFn The function to get trending products
 * @param limit The number of products to get
 * @returns The cached trending products getter function
 */
export function getCachedTrending<T>(
  getTrendingFn: (limit: number) => Promise<T>,
  limit: number
): Promise<T> {
  const cachedFn = cacheFunction<[number], T>(
    getTrendingFn,
    [CACHE_TAGS.PRODUCTS, CACHE_TAGS.TRENDING],
    { revalidate: 600 } // 10 minutes
  );
  
  return cachedFn(limit);
}

/**
 * Get latest products with caching
 * @param getLatestFn The function to get latest products
 * @param limit The number of products to get
 * @returns The cached latest products getter function
 */
export function getCachedLatest<T>(
  getLatestFn: (limit: number) => Promise<T>,
  limit: number
): Promise<T> {
  const cachedFn = cacheFunction<[number], T>(
    getLatestFn,
    [CACHE_TAGS.PRODUCTS, CACHE_TAGS.LATEST],
    { revalidate: 300 } // 5 minutes
  );
  
  return cachedFn(limit);
}

/**
 * Get products by category with caching
 * @param getCategoryFn The function to get products by category
 * @param category The category
 * @param limit The number of products to get
 * @returns The cached category products getter function
 */
export function getCachedCategory<T>(
  getCategoryFn: (category: string, limit: number) => Promise<T>,
  category: string,
  limit: number
): Promise<T> {
  const cachedFn = cacheFunction<[string, number], T>(
    getCategoryFn,
    [CACHE_TAGS.PRODUCTS, CACHE_TAGS.CATEGORIES, `category:${category}`],
    { revalidate: 600 } // 10 minutes
  );
  
  return cachedFn(category, limit);
} 