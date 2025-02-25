/**
 * Types for product filtering
 */
export interface ProductFilter {
  type: string;
  value: string;
  rawText: string;
}

export interface PriceRange {
  min?: number;
  max?: number;
}

export interface FilterGroup {
  title: string;
  filters: ProductFilter[];
  subgroups?: FilterGroup[];
}

export interface FilterData {
  groups: FilterGroup[];
  categories: string[];
  priceRanges: PriceRange[];
  ratings: number[];
  keywords: string[];
}

/**
 * Parse a price range string like "$10 - $100" into min and max values
 */
export function parsePriceRange(text: string): PriceRange {
  // Remove the "Price Range: " prefix if present
  const cleanText = text.replace(/^Price Range:\s*/i, '');
  
  // Look for patterns like "$10 - $100" or "10 - 100" or "$10-$100"
  const regex = /\$?(\d+(?:\.\d+)?)\s*-\s*\$?(\d+(?:\.\d+)?)/;
  const match = cleanText.match(regex);
  
  if (match) {
    return {
      min: parseFloat(match[1]),
      max: parseFloat(match[2])
    };
  }
  
  // Check if it's a "Under $X" or "Over $X" pattern
  const underMatch = cleanText.match(/under\s+\$?(\d+(?:\.\d+)?)/i);
  if (underMatch) {
    return { max: parseFloat(underMatch[1]) };
  }
  
  const overMatch = cleanText.match(/over\s+\$?(\d+(?:\.\d+)?)/i);
  if (overMatch) {
    return { min: parseFloat(overMatch[1]) };
  }
  
  return {};
}

/**
 * Parse a rating string like "4 stars" into a number
 */
export function parseRating(text: string): number {
  // Remove the "Min Rating: " prefix if present
  const cleanText = text.replace(/^Min Rating:\s*/i, '');
  
  // Look for patterns like "4 stars" or "4.5" or "4+"
  const match = cleanText.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    return parseFloat(match[1]);
  }
  
  return 0;
}

/**
 * Parse a keyword string like "Keyword: wireless" into just "wireless"
 */
export function parseKeyword(text: string): string {
  return text.replace(/^Keyword:\s*/i, '').trim();
}

/**
 * Parse a category string like "Category: Electronics" into just "Electronics"
 */
export function parseCategory(text: string): string {
  return text.replace(/^Category:\s*/i, '').trim();
}

/**
 * Parse HTML from the rich text editor into structured filter data
 */
export function parseFilterHtml(html: string): FilterData {
  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  const result: FilterData = {
    groups: [],
    categories: [],
    priceRanges: [],
    ratings: [],
    keywords: []
  };
  
  // Current group being processed
  let currentGroup: FilterGroup | null = null;
  
  // Process all elements
  Array.from(tempDiv.children).forEach((element) => {
    const tagName = element.tagName.toLowerCase();
    const text = element.textContent || '';
    
    // Handle headings as group titles
    if (tagName === 'h2') {
      currentGroup = {
        title: text,
        filters: [],
        subgroups: []
      };
      result.groups.push(currentGroup);
    } 
    // Handle h3 as subgroup titles
    else if (tagName === 'h3' && currentGroup) {
      const subgroup: FilterGroup = {
        title: text,
        filters: []
      };
      currentGroup.subgroups = currentGroup.subgroups || [];
      currentGroup.subgroups.push(subgroup);
      // Set current group to the subgroup
      currentGroup = subgroup;
    }
    // Handle paragraphs as filter criteria
    else if (tagName === 'p') {
      const lowerText = text.toLowerCase();
      let filter: ProductFilter | null = null;
      
      // Determine filter type
      if (lowerText.startsWith('category:')) {
        const category = parseCategory(text);
        filter = { type: 'category', value: category, rawText: text };
        result.categories.push(category);
      }
      else if (lowerText.startsWith('price range:')) {
        const priceRange = parsePriceRange(text);
        filter = { type: 'price', value: JSON.stringify(priceRange), rawText: text };
        result.priceRanges.push(priceRange);
      }
      else if (lowerText.startsWith('min rating:')) {
        const rating = parseRating(text);
        filter = { type: 'rating', value: rating.toString(), rawText: text };
        result.ratings.push(rating);
      }
      else if (lowerText.startsWith('keyword:')) {
        const keyword = parseKeyword(text);
        filter = { type: 'keyword', value: keyword, rawText: text };
        result.keywords.push(keyword);
      }
      else {
        // Generic text filter
        filter = { type: 'text', value: text, rawText: text };
      }
      
      // Add filter to current group or to the root if no group
      if (filter) {
        if (currentGroup) {
          currentGroup.filters.push(filter);
        } else {
          // Create a default group if none exists
          currentGroup = {
            title: 'Default Filters',
            filters: [filter]
          };
          result.groups.push(currentGroup);
        }
      }
    }
  });
  
  return result;
}

/**
 * Convert structured filter data into a query object that can be used with API requests
 */
export function filtersToQueryObject(filterData: FilterData): Record<string, any> {
  const query: Record<string, any> = {};
  
  // Add categories
  if (filterData.categories.length > 0) {
    query.categories = filterData.categories;
  }
  
  // Add price ranges
  if (filterData.priceRanges.length > 0) {
    // Use the first price range for simplicity, or combine them if needed
    const priceRange = filterData.priceRanges[0];
    if (priceRange.min !== undefined) {
      query.minPrice = priceRange.min;
    }
    if (priceRange.max !== undefined) {
      query.maxPrice = priceRange.max;
    }
  }
  
  // Add ratings
  if (filterData.ratings.length > 0) {
    // Use the highest minimum rating
    query.minRating = Math.max(...filterData.ratings);
  }
  
  // Add keywords
  if (filterData.keywords.length > 0) {
    query.keywords = filterData.keywords;
  }
  
  return query;
} 