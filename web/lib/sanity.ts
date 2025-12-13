import { createClient } from 'next-sanity';

// Ensure your .env.local file in the 'web' directory has these keys:
// NEXT_PUBLIC_SANITY_PROJECT_ID
// NEXT_PUBLIC_SANITY_DATASET

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const apiVersion = '2024-05-10'; // Use a recent date

// If you ever need to use a token for secured queries (e.g., draft content)
const token = process.env.SANITY_API_TOKEN; 

// The standard client configuration
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Use the CDN for faster static content fetching
  token: token, // Used only if you need authenticated access
});

// Helper function to fetch data using the client and GROQ queries
export async function sanityFetch<T>(query: string, params: Record<string, any> = {}): Promise<T> {
  return client.fetch<T>(query, params, { 
    // Recommended: use noCache for development to see instant updates, 
    // but rely on Next.js caching (fetch) in production for speed.
    cache: process.env.NODE_ENV === 'development' ? 'no-store' : 'force-cache',
    // We use the Next.js native fetch cache in app router components instead of this,
    // but keeping it here for older deployments or simple API routes.
  });
}

// GROQ Query Examples (you will use these later)
export const productsQuery = `*[_type == "product" && status == "active"] | order(sortOrder asc, name asc) {
  _id,
  name,
  slug,
  basePrice,
  isQuoteOnly,
  "imageUrl": mainImage.asset->url,
  "category": category->{name, "slug": slug.current},
  productSize,
  badges,
  configurationGroups[]{
    groupName,
    choices[]{
      name,
      priceModifier,
      unit
    }
  }
}`;

export const categoriesQuery = `*[_type == "category"] | order(sortOrder asc, name asc) {
  _id,
  name,
  "slug": slug.current,
  description,
  featured,
  sortOrder
}`;
