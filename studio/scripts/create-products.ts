// Script to automatically create categories and products in Sanity
// Run with: npm run create-products

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'z3bustn3',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
  apiVersion: '2023-05-03',
});

// Categories to create
const categories = [
  {
    _type: 'category',
    name: 'Flyers & Leaflets',
    slug: { _type: 'slug', current: 'flyers-and-leaflets' },
    description: 'High-quality flyers and leaflets for marketing and promotion',
    sortOrder: 1,
    featured: true,
  },
  {
    _type: 'category',
    name: 'Booklets',
    slug: { _type: 'slug', current: 'booklets' },
    description: 'Professional booklets with various binding options',
    sortOrder: 2,
    featured: true,
  },
  {
    _type: 'category',
    name: 'Posters',
    slug: { _type: 'slug', current: 'posters' },
    description: 'Eye-catching posters in multiple sizes',
    sortOrder: 3,
    featured: true,
  },
  {
    _type: 'category',
    name: 'Business Cards',
    slug: { _type: 'slug', current: 'business-cards' },
    description: 'Professional business cards that make an impression',
    sortOrder: 4,
    featured: false,
  },
  {
    _type: 'category',
    name: 'Boards',
    slug: { _type: 'slug', current: 'boards' },
    description: 'Display boards, foam boards, and Xanita boards',
    sortOrder: 5,
    featured: false,
  },
  {
    _type: 'category',
    name: 'Banners',
    slug: { _type: 'slug', current: 'banners' },
    description: 'Large format banners for events and retail',
    sortOrder: 6,
    featured: false,
  },
];

// Standard configuration groups with _key for Sanity
const standardConfigGroups = [
  {
    _key: 'quantity-group',
    groupName: 'Quantity',
    choices: [
      { _key: 'qty-50', name: '50 units', priceModifier: 0, unit: 'units' },
      { _key: 'qty-100', name: '100 units', priceModifier: -1.25, unit: 'units' },
      { _key: 'qty-250', name: '250 units', priceModifier: -2.50, unit: 'units' },
      { _key: 'qty-500', name: '500 units', priceModifier: -3.75, unit: 'units' },
      { _key: 'qty-1000', name: '1000 units', priceModifier: -5.00, unit: 'units' },
      { _key: 'qty-2500', name: '2500 units', priceModifier: -6.25, unit: 'units' },
      { _key: 'qty-5000', name: '5000 units', priceModifier: -7.50, unit: 'units' },
    ],
  },
  {
    _key: 'paper-type-group',
    groupName: 'Paper Type',
    choices: [
      { _key: 'paper-economy', name: 'Economy', priceModifier: 0, unit: 'per sheet' },
      { _key: 'paper-standard', name: 'Standard', priceModifier: 0, unit: 'per sheet' },
      { _key: 'paper-premium', name: 'Premium', priceModifier: 0.10, unit: 'per sheet' },
    ],
  },
  {
    _key: 'finishing-group',
    groupName: 'Finishing',
    choices: [
      { _key: 'finish-none', name: 'None', priceModifier: 0, unit: 'per sheet' },
      { _key: 'finish-gloss', name: 'Gloss Lamination', priceModifier: 0.12, unit: 'per sheet' },
      { _key: 'finish-matt', name: 'Matt Lamination', priceModifier: 0.12, unit: 'per sheet' },
      { _key: 'finish-soft', name: 'Soft Touch Lamination', priceModifier: 0.18, unit: 'per sheet' },
    ],
  },
];

// Products to create
const products = [
  {
    _type: 'product',
    name: 'A5 Leaflets',
    slug: { _type: 'slug', current: 'a5-leaflets' },
    description: 'Professional A5 leaflets perfect for marketing campaigns, events, and promotions. High-quality printing on premium paper stock with optional lamination finishes. Choose from a range of quantities to suit your budget and needs. Fast turnaround available. Ideal for restaurants, real estate agents, retail stores, and event organizers.',
    shortDescription: 'Professional A5 leaflets for marketing and events',
    basePrice: 25.00,
    isQuoteOnly: false,
    categorySlug: 'flyers-and-leaflets',
    productSize: 'a5',
    tags: ['marketing', 'promotion', 'flyers', 'leaflets'],
    badges: ['popular', 'bestseller'],
    useCase: ['marketing', 'events', 'business'],
    targetIndustry: ['restaurant', 'retail', 'events'],
    seoTitle: 'A5 Leaflets | Starting from £25 | Hall of Prints',
    seoDescription: 'Professional A5 leaflets with fast turnaround. Choose from 50-5000 units. Premium paper stocks and lamination options available. Order online today.',
    seoKeywords: ['a5 leaflets', 'flyers', 'marketing materials', 'print leaflets'],
    featured: true,
    sortOrder: 1,
    status: 'active',
  },
  {
    _type: 'product',
    name: 'A4 Posters',
    slug: { _type: 'slug', current: 'a4-posters' },
    description: 'High-quality A4 posters perfect for promotions, events, and retail displays. Printed on premium paper with vibrant colors and sharp detail. Available in various quantities with optional lamination for durability. Ideal for shop windows, notice boards, exhibitions, and marketing campaigns.',
    shortDescription: 'Professional A4 posters for promotions and displays',
    basePrice: 35.00,
    isQuoteOnly: false,
    categorySlug: 'posters',
    productSize: 'a4',
    tags: ['posters', 'marketing', 'promotional', 'display'],
    badges: ['popular'],
    useCase: ['marketing', 'events', 'retail'],
    targetIndustry: ['retail', 'events', 'corporate'],
    seoTitle: 'A4 Posters | Starting from £35 | Hall of Prints',
    seoDescription: 'Professional A4 posters for promotions and events. High-quality printing with optional lamination. Fast turnaround. Order online today.',
    seoKeywords: ['a4 posters', 'promotional posters', 'marketing posters', 'print posters'],
    featured: true,
    sortOrder: 2,
    status: 'active',
  },
  {
    _type: 'product',
    name: 'A4 Perfect Bound Booklets',
    slug: { _type: 'slug', current: 'a4-perfect-bound-booklets' },
    description: 'Professional A4 perfect bound booklets with a square spine for a polished, book-like appearance. Perfect for magazines, brochures, catalogs, manuals, and reports. High-quality printing on premium paper stocks. Available in multiple page counts. Durable binding that lays flat when open. Ideal for corporate materials, publications, and marketing collateral.',
    shortDescription: 'Professional A4 booklets with perfect binding',
    basePrice: 220.00,
    isQuoteOnly: false,
    categorySlug: 'booklets',
    productSize: 'a4',
    tags: ['booklets', 'perfect bound', 'catalogs', 'magazines', 'brochures'],
    badges: ['bestseller'],
    useCase: ['business', 'marketing', 'education'],
    targetIndustry: ['corporate', 'retail', 'education'],
    seoTitle: 'A4 Perfect Bound Booklets | Starting from £220 | Hall of Prints',
    seoDescription: 'Professional A4 perfect bound booklets for catalogs, magazines, and brochures. High-quality printing and durable binding. Fast turnaround.',
    seoKeywords: ['a4 booklets', 'perfect bound', 'catalogs', 'brochures', 'magazines'],
    featured: true,
    sortOrder: 3,
    status: 'active',
  },
  {
    _type: 'product',
    name: 'Business Cards',
    slug: { _type: 'slug', current: 'business-cards' },
    description: 'Premium business cards that make a lasting impression. Printed on high-quality card stock with crisp, professional results. Available in standard 85mm x 55mm size with various finishing options including gloss, matt, and soft touch lamination. Perfect for networking, client meetings, and professional representation. Fast turnaround available.',
    shortDescription: 'Premium business cards for professionals',
    basePrice: 30.00,
    isQuoteOnly: false,
    categorySlug: 'business-cards',
    productSize: 'custom',
    tags: ['business cards', 'professional', 'networking', 'corporate'],
    badges: ['popular', 'bestseller'],
    useCase: ['business', 'marketing'],
    targetIndustry: ['corporate', 'realestate', 'retail'],
    seoTitle: 'Business Cards | Starting from £30 | Hall of Prints',
    seoDescription: 'Premium business cards with professional finish. High-quality printing on premium card stock. Multiple lamination options. Fast delivery.',
    seoKeywords: ['business cards', 'professional cards', 'premium cards', 'corporate cards'],
    featured: true,
    sortOrder: 4,
    status: 'active',
  },
  {
    _type: 'product',
    name: 'A3 Flyers',
    slug: { _type: 'slug', current: 'a3-flyers' },
    description: 'Large format A3 flyers perfect for high-impact marketing and promotions. Excellent for events, sales promotions, product launches, and point-of-sale displays. Printed on premium paper with vibrant colors and sharp detail. Available in various quantities with optional lamination for added durability and professional finish. Ideal for restaurants, retail stores, real estate, and event promotion.',
    shortDescription: 'Large format A3 flyers for high-impact marketing',
    basePrice: 45.00,
    isQuoteOnly: false,
    categorySlug: 'flyers-and-leaflets',
    productSize: 'a3',
    tags: ['flyers', 'marketing', 'promotional', 'large format'],
    badges: ['new'],
    useCase: ['marketing', 'events', 'retail'],
    targetIndustry: ['restaurant', 'retail', 'realestate', 'events'],
    seoTitle: 'A3 Flyers | Starting from £45 | Hall of Prints',
    seoDescription: 'Large format A3 flyers for high-impact marketing. Professional printing with optional lamination. Perfect for events and promotions.',
    seoKeywords: ['a3 flyers', 'large flyers', 'promotional flyers', 'marketing flyers'],
    featured: true,
    sortOrder: 5,
    status: 'active',
  },
];

async function createCategories() {
  console.log('🏗️  Creating categories...\n');
  
  const createdCategories: { [key: string]: any } = {};
  
  for (const category of categories) {
    try {
      const result = await client.create(category);
      createdCategories[category.slug.current] = result;
      console.log(`✅ Created category: ${category.name} (${result._id})`);
    } catch (error) {
      console.error(`❌ Failed to create category: ${category.name}`, error);
    }
  }
  
  console.log(`\n✅ Created ${Object.keys(createdCategories).length} categories\n`);
  return createdCategories;
}

async function createProducts(categories: { [key: string]: any }) {
  console.log('📦 Creating products...\n');
  
  let createdCount = 0;
  
  for (const product of products) {
    try {
      const categoryRef = categories[product.categorySlug];
      
      if (!categoryRef) {
        console.error(`❌ Category not found: ${product.categorySlug}`);
        continue;
      }
      
      const productDoc = {
        ...product,
        category: {
          _type: 'reference',
          _ref: categoryRef._id,
        },
        configurationGroups: standardConfigGroups,
      };
      
      // Remove the categorySlug field (only needed for lookup)
      delete (productDoc as any).categorySlug;
      
      const result = await client.create(productDoc);
      createdCount++;
      console.log(`✅ Created product: ${product.name} (${result._id})`);
    } catch (error) {
      console.error(`❌ Failed to create product: ${product.name}`, error);
    }
  }
  
  console.log(`\n✅ Created ${createdCount} products\n`);
}

async function main() {
  console.log('🚀 Starting Sanity product creation...\n');
  console.log(`Project: ${client.config().projectId}`);
  console.log(`Dataset: ${client.config().dataset}\n`);
  
  if (!client.config().token) {
    console.error('❌ Error: SANITY_WRITE_TOKEN environment variable not set');
    console.log('\nTo get a write token:');
    console.log('1. Go to: https://sanity.io/manage');
    console.log('2. Select your project');
    console.log('3. Go to API → Tokens');
    console.log('4. Create a token with "Editor" permissions');
    console.log('5. Set environment variable: export SANITY_WRITE_TOKEN=your-token\n');
    process.exit(1);
  }
  
  try {
    const categories = await createCategories();
    await createProducts(categories);
    
    console.log('🎉 All done! Your categories and products have been created!');
    console.log('\n📋 Next steps:');
    console.log('1. Open Sanity Studio: https://hall-of-print.sanity.studio/');
    console.log('2. Verify all products are there');
    console.log('3. Add product images');
    console.log('4. Test on your website: http://localhost:3000/products\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
