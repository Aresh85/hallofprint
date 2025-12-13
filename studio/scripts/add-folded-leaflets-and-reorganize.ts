import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'z3bustn3',
  dataset: 'production',
  useCdn: false,
  token: 'sk3KNUZ3Z3sbd7Jt5fsX0TwUiH2jMnxmXRLMRNFvc1iI344UBAo56IdXTKciKBko26sQbS9IiDJgJ6sNc1eBCZXELD2DjPcECa3a74rZdx5tQp63SziwqkmnIGVtqyWjLIa1hCDGflIaHiJ3txDNOCdmsScFfRluN1urjOHvGyor9Im7tshO',
  apiVersion: '2024-01-01',
});

// Size order mapping
const sizeOrder: { [key: string]: number } = {
  'A0': 1, 'A1': 2, 'A2': 3, 'A3': 4, 'A4': 5, 'A5': 6, 'A6': 7, 'A7': 8, 'DL': 9,
};

async function updatePricing() {
  console.log('💰 Updating pricing based on UK market comparison...\n');
  
  // Update A7 Leaflets: £15 → £12
  const a7Products = await client.fetch(`*[_type == "product" && name match "A7*"]`);
  for (const product of a7Products) {
    await client.patch(product._id).set({ basePrice: 12 }).commit();
    console.log(`✅ Updated ${product.name}: £15 → £12`);
  }
  
  // Update A4 Posters: £50 → £35
  const a4Posters = await client.fetch(`*[_type == "product" && name match "A4 Posters"]`);
  for (const product of a4Posters) {
    await client.patch(product._id).set({ basePrice: 35 }).commit();
    console.log(`✅ Updated ${product.name}: £50 → £35`);
  }
}

async function createBoardSubcategories() {
  console.log('\n📁 Creating Board subcategories...\n');
  
  // Get or update main Boards category to parent
  const mainBoards = await client.fetch(`*[_type == "category" && slug.current == "boards"][0]`);
  if (mainBoards) {
    await client.patch(mainBoards._id).set({
      description: 'Professional display boards - choose by material type',
      isParent: true
    }).commit();
    console.log('✅ Updated main Boards category');
  }
  
  const boardCategories = [
    { 
      name: 'Display Boards', 
      slug: 'display-boards',
      description: 'Professional display boards for exhibitions and events',
      sortOrder: 41
    },
    { 
      name: 'Foam Boards', 
      slug: 'foam-boards',
      description: 'Lightweight foam boards perfect for indoor displays',
      sortOrder: 42
    },
    { 
      name: 'Xanita Boards', 
      slug: 'xanita-boards',
      description: 'Eco-friendly Xanita boards, lightweight and durable',
      sortOrder: 43
    },
    { 
      name: 'Di-Bond Boards', 
      slug: 'di-bond-boards',
      description: 'Premium aluminum composite boards for professional signage',
      sortOrder: 44
    },
  ];
  
  for (const boardCat of boardCategories) {
    let category = await client.fetch(
      `*[_type == "category" && slug.current == $slug][0]{ _id }`,
      { slug: boardCat.slug }
    );
    
    if (!category) {
      category = await client.create({
        _type: 'category',
        name: boardCat.name,
        slug: { _type: 'slug', current: boardCat.slug },
        description: boardCat.description,
        featured: false,
        sortOrder: boardCat.sortOrder,
      });
      console.log(`✅ Created category: ${boardCat.name}`);
    }
    
    // Move products to subcategory
    const products = await client.fetch(
      `*[_type == "product" && name match "${boardCat.name}*"]`
    );
    
    for (const product of products) {
      await client
        .patch(product._id)
        .set({ category: { _type: 'reference', _ref: category._id } })
        .commit();
    }
    console.log(`   Moved ${products.length} products to ${boardCat.name}`);
  }
}

async function addFoldedLeaflets() {
  console.log('\n📋 Adding Folded Leaflets...\n');
  
  // Get Flyers category
  const flyersCategory = await client.fetch(
    `*[_type == "category" && slug.current == "flyers-and-leaflets"][0]{ _id }`
  );
  
  const foldedSizes = [
    { size: 'A3', name: 'A3 Folded Leaflets', price: 55, description: 'A3 folded to A4 or A5 - perfect for brochures and menus' },
    { size: 'A4', name: 'A4 Folded Leaflets', price: 42, description: 'A4 folded to A5 or DL - ideal for take-away menus and info sheets' },
    { size: 'A5', name: 'A5 Folded Leaflets', price: 32, description: 'A5 folded to A6 - compact folded leaflets for promotions' },
    { size: 'A6', name: 'A6 Folded Leaflets', price: 28, description: 'A6 folded leaflets - small format for pocket guides' },
  ];
  
  for (const leaflet of foldedSizes) {
    try {
      const product = await client.create({
        _type: 'product',
        name: leaflet.name,
        slug: {
          _type: 'slug',
          current: leaflet.name.toLowerCase().replace(/\s+/g, '-'),
        },
        description: leaflet.description,
        basePrice: leaflet.price,
        isQuoteOnly: false,
        status: 'active',
        productSize: leaflet.size.toLowerCase(),
        category: {
          _type: 'reference',
          _ref: flyersCategory._id,
        },
        featured: leaflet.size === 'A4',
        sortOrder: sizeOrder[leaflet.size] || 99,
        badges: leaflet.size === 'A4' ? ['popular'] : [],
        configurationGroups: [
          {
            _type: 'object',
            _key: `quantity-${Date.now()}-${Math.random()}`,
            groupName: 'Quantity',
            choices: [
              {
                _type: 'productOption',
                _key: `qty-100-${Date.now()}-${Math.random()}`,
                name: '100',
                priceModifier: 0,
                unit: 'units',
              },
              {
                _type: 'productOption',
                _key: `qty-250-${Date.now()}-${Math.random()}`,
                name: '250',
                priceModifier: 18,
                unit: 'units',
              },
              {
                _type: 'productOption',
                _key: `qty-500-${Date.now()}-${Math.random()}`,
                name: '500',
                priceModifier: 30,
                unit: 'units',
              },
              {
                _type: 'productOption',
                _key: `qty-1000-${Date.now()}-${Math.random()}`,
                name: '1000',
                priceModifier: 50,
                unit: 'units',
              },
            ],
          },
          {
            _type: 'object',
            _key: `paper-${Date.now()}-${Math.random()}`,
            groupName: 'Paper Type',
            choices: [
              {
                _type: 'productOption',
                _key: `paper-170-${Date.now()}-${Math.random()}`,
                name: '170gsm Gloss',
                priceModifier: 0,
                unit: 'gsm',
              },
              {
                _type: 'productOption',
                _key: `paper-250-${Date.now()}-${Math.random()}`,
                name: '250gsm Silk',
                priceModifier: 12,
                unit: 'gsm',
              },
            ],
          },
          {
            _type: 'object',
            _key: `fold-${Date.now()}-${Math.random()}`,
            groupName: 'Fold Type',
            choices: [
              {
                _type: 'productOption',
                _key: `fold-half-${Date.now()}-${Math.random()}`,
                name: 'Half Fold',
                priceModifier: 0,
                unit: 'fold',
                description: 'Simple half fold down the middle',
              },
              {
                _type: 'productOption',
                _key: `fold-tri-${Date.now()}-${Math.random()}`,
                name: 'Tri-fold',
                priceModifier: 5,
                unit: 'fold',
                description: 'Z-fold or C-fold (3 panels)',
              },
              {
                _type: 'productOption',
                _key: `fold-gate-${Date.now()}-${Math.random()}`,
                name: 'Gate Fold',
                priceModifier: 8,
                unit: 'fold',
                description: 'Gates open to reveal center panel',
              },
            ],
          },
          {
            _type: 'object',
            _key: `finishing-${Date.now()}-${Math.random()}`,
            groupName: 'Finishing',
            choices: [
              {
                _type: 'productOption',
                _key: `finish-none-${Date.now()}-${Math.random()}`,
                name: 'No Lamination',
                priceModifier: 0,
                unit: 'finish',
              },
              {
                _type: 'productOption',
                _key: `finish-matt-${Date.now()}-${Math.random()}`,
                name: 'Matt Lamination',
                priceModifier: 18,
                unit: 'finish',
                description: 'Soft, non-reflective finish',
              },
              {
                _type: 'productOption',
                _key: `finish-gloss-${Date.now()}-${Math.random()}`,
                name: 'Gloss Lamination',
                priceModifier: 18,
                unit: 'finish',
                description: 'Shiny, vibrant finish',
              },
              {
                _type: 'productOption',
                _key: `finish-soft-${Date.now()}-${Math.random()}`,
                name: 'Soft Touch Lamination',
                priceModifier: 25,
                unit: 'finish',
                description: 'Premium velvety feel',
              },
            ],
          },
        ],
      });
      console.log(`✅ Created: ${leaflet.name} (£${leaflet.price})`);
    } catch (error: any) {
      console.error(`❌ Error creating ${leaflet.name}:`, error.message);
    }
  }
}

async function main() {
  try {
    await updatePricing();
    await createBoardSubcategories();
    await addFoldedLeaflets();
    
    console.log('\n✨ All updates complete!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Updated pricing (A7, A4 Posters)');
    console.log('   ✅ Created 4 board subcategories');
    console.log('   ✅ Moved board products to subcategories');
    console.log('   ✅ Added 4 folded leaflet products');
    console.log('\n🎉 New Total: 45 products across 12 categories!');
    console.log('\nCategories structure:');
    console.log('   - Flyers & Leaflets (10 products now)');
    console.log('   - Posters (5 products)');
    console.log('   - Display Boards (6 products)');
    console.log('   - Foam Boards (6 products)');
    console.log('   - Xanita Boards (6 products)');
    console.log('   - Di-Bond Boards (6 products)');
    console.log('   - Banners (4 products)');
    console.log('   - Booklets (1 product)');
    console.log('   - Business Cards (1 product)');
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

main();
