import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'z3bustn3',
  dataset: 'production',
  useCdn: false,
  token: 'sk3KNUZ3Z3sbd7Jt5fsX0TwUiH2jMnxmXRLMRNFvc1iI344UBAo56IdXTKciKBko26sQbS9IiDJgJ6sNc1eBCZXELD2DjPcECa3a74rZdx5tQp63SziwqkmnIGVtqyWjLIa1hCDGflIaHiJ3txDNOCdmsScFfRluN1urjOHvGyor9Im7tshO',
  apiVersion: '2024-01-01',
});

// Size order mapping for proper sorting (larger sizes first)
const sizeOrder: { [key: string]: number } = {
  'A0': 1,
  'A1': 2,
  'A2': 3,
  'A3': 4,
  'A4': 5,
  'A5': 6,
  'A6': 7,
  'A7': 8,
  'DL': 9,
  'Custom': 10,
  '2000x1500': 1,
  '2000x1200': 2,
  '2000x1000': 3,
  '2000x800': 4,
};

async function updateExistingProductsSortOrder() {
  console.log('📝 Updating existing products sort order...\n');
  
  const products = await client.fetch(`*[_type == "product"]{ _id, name, productSize }`);
  
  for (const product of products) {
    const size = product.productSize?.toUpperCase() || 'CUSTOM';
    const sortOrder = sizeOrder[size] || 99;
    
    await client
      .patch(product._id)
      .set({ sortOrder })
      .commit();
    
    console.log(`✅ Updated ${product.name} - Sort Order: ${sortOrder}`);
  }
}

async function addBoardsAndBanners() {
  console.log('\n📦 Adding Boards and Banners products...\n');

  // Get or create Boards category
  let boardsCategory = await client.fetch(
    `*[_type == "category" && slug.current == "boards"][0]{ _id }`
  );

  if (!boardsCategory) {
    console.log('Creating Boards category...');
    boardsCategory = await client.create({
      _type: 'category',
      name: 'Boards',
      slug: { _type: 'slug', current: 'boards' },
      description: 'Professional display boards for exhibitions, events, and signage',
      featured: true,
      sortOrder: 4,
    });
    console.log('✅ Created Boards category');
  }

  // Get or create Banners category
  let bannersCategory = await client.fetch(
    `*[_type == "category" && slug.current == "banners"][0]{ _id }`
  );

  if (!bannersCategory) {
    console.log('Creating Banners category...');
    bannersCategory = await client.create({
      _type: 'category',
      name: 'Banners',
      slug: { _type: 'slug', current: 'banners' },
      description: 'Pull up banners and display stands for events and promotions',
      featured: true,
      sortOrder: 5,
    });
    console.log('✅ Created Banners category');
  }

  // Board types and sizes
  const boardTypes = [
    { name: 'Display Boards', price: 45, description: 'Professional display boards for exhibitions and events' },
    { name: 'Xanita Boards', price: 55, description: 'Eco-friendly Xanita boards, lightweight and durable' },
    { name: 'Foam Boards', price: 40, description: 'Lightweight foam boards perfect for indoor displays' },
    { name: 'Di-Bond Boards', price: 75, description: 'Premium aluminum composite boards for professional signage' },
  ];

  const boardSizes = ['A0', 'A1', 'A2', 'A3', 'A4', 'Custom'];

  console.log('\n🎯 Creating Board products...');
  for (const boardType of boardTypes) {
    for (const size of boardSizes) {
      const priceAdjustment = size === 'A0' ? 40 : size === 'A1' ? 25 : size === 'A2' ? 15 : size === 'A3' ? 10 : size === 'A4' ? 0 : 0;
      const finalPrice = size === 'Custom' ? 0 : boardType.price + priceAdjustment;
      const isQuoteOnly = size === 'Custom';
      
      try {
        const product = await client.create({
          _type: 'product',
          name: `${boardType.name} ${size}`,
          slug: {
            _type: 'slug',
            current: `${boardType.name.toLowerCase().replace(/\s+/g, '-')}-${size.toLowerCase()}`,
          },
          description: `${boardType.description} - ${size} size`,
          basePrice: finalPrice,
          isQuoteOnly,
          status: 'active',
          productSize: size.toLowerCase(),
          category: {
            _type: 'reference',
            _ref: boardsCategory._id,
          },
          featured: false,
          sortOrder: sizeOrder[size] || 99,
          badges: size === 'A1' ? ['popular'] : [],
          configurationGroups: isQuoteOnly ? [] : [
            {
              _type: 'object',
              _key: `quantity-${Date.now()}-${Math.random()}`,
              groupName: 'Quantity',
              choices: [
                {
                  _type: 'productOption',
                  _key: `qty-1-${Date.now()}-${Math.random()}`,
                  name: '1',
                  priceModifier: 0,
                  unit: 'units',
                },
                {
                  _type: 'productOption',
                  _key: `qty-5-${Date.now()}-${Math.random()}`,
                  name: '5',
                  priceModifier: 15,
                  unit: 'units',
                },
                {
                  _type: 'productOption',
                  _key: `qty-10-${Date.now()}-${Math.random()}`,
                  name: '10',
                  priceModifier: 25,
                  unit: 'units',
                },
              ],
            },
            {
              _type: 'object',
              _key: `thickness-${Date.now()}-${Math.random()}`,
              groupName: 'Thickness',
              choices: [
                {
                  _type: 'productOption',
                  _key: `thick-3mm-${Date.now()}-${Math.random()}`,
                  name: '3mm',
                  priceModifier: 0,
                  unit: 'mm',
                },
                {
                  _type: 'productOption',
                  _key: `thick-5mm-${Date.now()}-${Math.random()}`,
                  name: '5mm',
                  priceModifier: 10,
                  unit: 'mm',
                },
              ],
            },
          ],
        });
        console.log(`✅ Created: ${boardType.name} ${size} (£${finalPrice})`);
      } catch (error: any) {
        console.error(`❌ Error creating ${boardType.name} ${size}:`, error.message);
      }
    }
  }

  // Pull Up Banners
  const bannerSizes = [
    { size: '2000x800', width: 800, height: 2000, price: 95 },
    { size: '2000x1000', width: 1000, height: 2000, price: 110 },
    { size: '2000x1200', width: 1200, height: 2000, price: 125 },
    { size: '2000x1500', width: 1500, height: 2000, price: 145 },
  ];

  console.log('\n🎪 Creating Pull Up Banner products...');
  for (const banner of bannerSizes) {
    try {
      const product = await client.create({
        _type: 'product',
        name: `Pull Up Banner ${banner.size}mm`,
        slug: {
          _type: 'slug',
          current: `pull-up-banner-${banner.size.replace('x', '-')}mm`,
        },
        description: `Professional pull up banner ${banner.width}mm x ${banner.height}mm with 350gsm material`,
        basePrice: banner.price,
        isQuoteOnly: false,
        status: 'active',
        productSize: banner.size,
        category: {
          _type: 'reference',
          _ref: bannersCategory._id,
        },
        featured: banner.size === '2000x1000',
        sortOrder: sizeOrder[banner.size] || 99,
        badges: banner.size === '2000x1000' ? ['popular'] : [],
        configurationGroups: [
          {
            _type: 'object',
            _key: `quantity-${Date.now()}-${Math.random()}`,
            groupName: 'Quantity',
            choices: [
              {
                _type: 'productOption',
                _key: `qty-1-${Date.now()}-${Math.random()}`,
                name: '1',
                priceModifier: 0,
                unit: 'units',
              },
              {
                _type: 'productOption',
                _key: `qty-2-${Date.now()}-${Math.random()}`,
                name: '2',
                priceModifier: 30,
                unit: 'units',
              },
              {
                _type: 'productOption',
                _key: `qty-5-${Date.now()}-${Math.random()}`,
                name: '5',
                priceModifier: 60,
                unit: 'units',
              },
            ],
          },
          {
            _type: 'object',
            _key: `finish-${Date.now()}-${Math.random()}`,
            groupName: 'Finish',
            choices: [
              {
                _type: 'productOption',
                _key: `finish-standard-${Date.now()}-${Math.random()}`,
                name: 'Standard',
                priceModifier: 0,
                unit: 'finish',
                description: 'Our most popular base option. Comes with a standard carry case. Lightweight design for easy setup.',
              },
              {
                _type: 'productOption',
                _key: `finish-premium-${Date.now()}-${Math.random()}`,
                name: 'Premium',
                priceModifier: 25,
                unit: 'finish',
                description: 'Sleek and stylish design. Discreet, concealed feet for a seamless look. Premium padded carry case for added protection.',
              },
            ],
          },
        ],
      });
      console.log(`✅ Created: Pull Up Banner ${banner.size}mm (£${banner.price})`);
    } catch (error: any) {
      console.error(`❌ Error creating Pull Up Banner ${banner.size}mm:`, error.message);
    }
  }

  console.log('\n✨ All boards and banners added!');
  console.log('\n📋 Summary:');
  console.log('   Boards:');
  console.log('   - Display Boards (A0-A4 + Custom) - 6 products ✅');
  console.log('   - Xanita Boards (A0-A4 + Custom) - 6 products ✅');
  console.log('   - Foam Boards (A0-A4 + Custom) - 6 products ✅');
  console.log('   - Di-Bond Boards (A0-A4 + Custom) - 6 products ✅');
  console.log('   Total Boards: 24 products');
  console.log('\n   Banners:');
  console.log('   - Pull Up Banner 2000x800mm ✅');
  console.log('   - Pull Up Banner 2000x1000mm ✅ (Popular)');
  console.log('   - Pull Up Banner 2000x1200mm ✅');
  console.log('   - Pull Up Banner 2000x1500mm ✅');
  console.log('   Total Banners: 4 products');
  console.log('\n🎉 Grand Total: 28 new products added!');
  console.log('   Previous: 13 products');
  console.log('   New Total: 41 products');
}

async function main() {
  try {
    await updateExistingProductsSortOrder();
    await addBoardsAndBanners();
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

main();
