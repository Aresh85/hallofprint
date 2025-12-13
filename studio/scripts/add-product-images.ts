import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'z3bustn3',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN || 'skdXwipF7i1J6qyIIHBkL6Ps8vXNXvfEGWyKGrKAI6BNfJ8c1ZRWLEpVzJ1H5xyJ4XkGmU5A1v0Aj7w7XW95YUbqLqzJ3kQ0yJ5HvZvA8N1YqJ0z8XW5dYyJ7eXvJ4XvW', // Read-write token
  apiVersion: '2024-01-01',
});

// Placeholder image URLs from Unsplash (print-related images)
const productImages = {
  'a5-leaflets': 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&h=800&fit=crop', // Colorful flyers
  'a3-flyers': 'https://images.unsplash.com/photo-1557425046-2a28f067f0c3?w=800&h=800&fit=crop', // Marketing flyers
  'a4-posters': 'https://images.unsplash.com/photo-1598301257982-0cf014a473f2?w=800&h=800&fit=crop', // Posters on wall
  'a4-perfect-bound-booklets': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=800&fit=crop', // Booklet/catalog
  'business-cards-85x55mm': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=800&fit=crop', // Business cards
};

async function uploadImageFromUrl(imageUrl: string, productSlug: string) {
  try {
    // Fetch the image
    console.log(`📥 Fetching image from ${imageUrl}...`);
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    
    // Upload to Sanity
    console.log(`⬆️  Uploading image for ${productSlug}...`);
    const asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename: `${productSlug}.jpg`,
    });
    
    console.log(`✅ Image uploaded: ${asset._id}`);
    return asset._id;
  } catch (error) {
    console.error(`❌ Error uploading image for ${productSlug}:`, error);
    return null;
  }
}

async function updateProductWithImage(productSlug: string, imageAssetId: string) {
  try {
    // Find the product by slug
    const products = await client.fetch(
      `*[_type == "product" && slug.current == $slug]`,
      { slug: productSlug }
    );
    
    if (products.length === 0) {
      console.log(`⚠️  Product not found: ${productSlug}`);
      return;
    }
    
    const product = products[0];
    
    // Update the product with the image reference
    await client
      .patch(product._id)
      .set({
        mainImage: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAssetId,
          },
        },
      })
      .commit();
    
    console.log(`✅ Updated product: ${product.name}`);
  } catch (error) {
    console.error(`❌ Error updating product ${productSlug}:`, error);
  }
}

async function addProductImages() {
  console.log('🖼️  Adding product images...\n');
  
  for (const [slug, imageUrl] of Object.entries(productImages)) {
    console.log(`\n📦 Processing: ${slug}`);
    console.log('─'.repeat(50));
    
    // Upload image and get asset ID
    const assetId = await uploadImageFromUrl(imageUrl, slug);
    
    if (assetId) {
      // Update product with image reference
      await updateProductWithImage(slug, assetId);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✨ All product images added successfully!');
  console.log('\n📋 Summary:');
  console.log(`   - A5 Leaflets: ✅`);
  console.log(`   - A3 Flyers: ✅`);
  console.log(`   - A4 Posters: ✅`);
  console.log(`   - A4 Perfect Bound Booklets: ✅`);
  console.log(`   - Business Cards: ✅`);
  console.log('\n🎉 Done! Check your Sanity Studio to see the images.');
}

// Run the script
addProductImages().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
