import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'z3bustn3',
  dataset: 'production',
  useCdn: false,
  token: 'skdXwipF7i1J6qyIIHBkL6Ps8vXNXvfEGWyKGrKAI6BNfJ8c1ZRWLEpVzJ1H5xyJ4XkGmU5A1v0Aj7w7XW95YUbqLqzJ3kQ0yJ5HvZvA8N1YqJ0z8XW5dYyJ7eXvJ4XvW',
  apiVersion: '2024-01-01',
});

async function addSizeVariations() {
  console.log('📦 Adding size variations for Flyers & Posters...\n');

  // Get the Flyers category
  const flyersCategory = await client.fetch(
    `*[_type == "category" && slug.current == "flyers-and-leaflets"][0]{ _id }`
  );

  // Get the Posters category  
  const postersCategory = await client.fetch(
    `*[_type == "category" && slug.current == "posters"][0]{ _id }`
  );

  // Flyer/Leaflet sizes: A7, A6, A4, DL (A5 and A3 already exist)
  const flyerSizes = [
    { size: 'A7', name: 'A7 Leaflets', price: 15, description: 'Compact A7 leaflets perfect for small promotions and handouts' },
    { size: 'A6', name: 'A6 Leaflets', price: 20, description: 'Versatile A6 leaflets ideal for menus, flyers, and promotional materials' },
    { size: 'A4', name: 'A4 Flyers', price: 35, description: 'Standard A4 flyers for maximum impact and readability' },
    { size: 'DL', name: 'DL Flyers', price: 22, description: 'Popular DL size flyers, perfect for direct mail and rack cards' },
  ];

  // Poster sizes: A0, A1, A2, A3 (A4 already exists)
  const posterSizes = [
    { size: 'A0', name: 'A0 Posters', price: 85, description: 'Large format A0 posters for maximum visual impact' },
    { size: 'A1', name: 'A1 Posters', price: 65, description: 'Eye-catching A1 posters perfect for events and promotions' },
    { size: 'A2', name: 'A2 Posters', price: 55, description: 'Popular A2 posters ideal for retail displays and advertising' },
    { size: 'A3', name: 'A3 Posters', price: 45, description: 'Versatile A3 posters for indoor and outdoor use' },
  ];

  console.log('Creating Flyer/Leaflet variations...');
  for (const flyer of flyerSizes) {
    try {
      const product = await client.create({
        _type: 'product',
        name: flyer.name,
        slug: {
          _type: 'slug',
          current: flyer.name.toLowerCase().replace(/\s+/g, '-'),
        },
        description: flyer.description,
        basePrice: flyer.price,
        isQuoteOnly: false,
        status: 'active',
        productSize: flyer.size.toLowerCase(),
        category: {
          _type: 'reference',
          _ref: flyersCategory._id,
        },
        featured: false,
        sortOrder: 10,
        badges: ['popular'],
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
                priceModifier: 15,
                unit: 'units',
              },
              {
                _type: 'productOption',
                _key: `qty-500-${Date.now()}-${Math.random()}`,
                name: '500',
                priceModifier: 25,
                unit: 'units',
              },
              {
                _type: 'productOption',
                _key: `qty-1000-${Date.now()}-${Math.random()}`,
                name: '1000',
                priceModifier: 40,
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
                priceModifier: 10,
                unit: 'gsm',
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
                priceModifier: 15,
                unit: 'finish',
              },
              {
                _type: 'productOption',
                _key: `finish-gloss-${Date.now()}-${Math.random()}`,
                name: 'Gloss Lamination',
                priceModifier: 15,
                unit: 'finish',
              },
            ],
          },
        ],
      });
      console.log(`✅ Created: ${flyer.name}`);
    } catch (error) {
      console.error(`❌ Error creating ${flyer.name}:`, error);
    }
  }

  console.log('\nCreating Poster variations...');
  for (const poster of posterSizes) {
    try {
      const product = await client.create({
        _type: 'product',
        name: poster.name,
        slug: {
          _type: 'slug',
          current: poster.name.toLowerCase().replace(/\s+/g, '-'),
        },
        description: poster.description,
        basePrice: poster.price,
        isQuoteOnly: false,
        status: 'active',
        productSize: poster.size.toLowerCase(),
        category: {
          _type: 'reference',
          _ref: postersCategory._id,
        },
        featured: false,
        sortOrder: 10,
        badges: ['popular'],
        configurationGroups: [
          {
            _type: 'object',
            _key: `quantity-${Date.now()}-${Math.random()}`,
            groupName: 'Quantity',
            choices: [
              {
                _type: 'productOption',
                _key: `qty-10-${Date.now()}-${Math.random()}`,
                name: '10',
                priceModifier: 0,
                unit: 'units',
              },
              {
                _type: 'productOption',
                _key: `qty-25-${Date.now()}-${Math.random()}`,
                name: '25',
                priceModifier: 20,
                unit: 'units',
              },
              {
                _type: 'productOption',
                _key: `qty-50-${Date.now()}-${Math.random()}`,
                name: '50',
                priceModifier: 35,
                unit: 'units',
              },
              {
                _type: 'productOption',
                _key: `qty-100-${Date.now()}-${Math.random()}`,
                name: '100',
                priceModifier: 60,
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
                _key: `paper-150-${Date.now()}-${Math.random()}`,
                name: '150gsm Silk',
                priceModifier: 0,
                unit: 'gsm',
              },
              {
                _type: 'productOption',
                _key: `paper-200-${Date.now()}-${Math.random()}`,
                name: '200gsm Gloss',
                priceModifier: 15,
                unit: 'gsm',
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
                priceModifier: 20,
                unit: 'finish',
              },
            ],
          },
        ],
      });
      console.log(`✅ Created: ${poster.name}`);
    } catch (error) {
      console.error(`❌ Error creating ${poster.name}:`, error);
    }
  }

  console.log('\n✨ All size variations added!');
  console.log('\n📋 Summary:');
  console.log('   Flyers & Leaflets:');
  console.log('   - A7 Leaflets ✅');
  console.log('   - A6 Leaflets ✅');
  console.log('   - A5 Leaflets ✅ (existing)');
  console.log('   - A4 Flyers ✅');
  console.log('   - A3 Flyers ✅ (existing)');
  console.log('   - DL Flyers ✅');
  console.log('\n   Posters:');
  console.log('   - A0 Posters ✅');
  console.log('   - A1 Posters ✅');
  console.log('   - A2 Posters ✅');
  console.log('   - A3 Posters ✅');
  console.log('   - A4 Posters ✅ (existing)');
}

addSizeVariations().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
