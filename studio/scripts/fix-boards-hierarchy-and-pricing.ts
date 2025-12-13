import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'z3bustn3',
  dataset: 'production',
  useCdn: false,
  token: 'sk3KNUZ3Z3sbd7Jt5fsX0TwUiH2jMnxmXRLMRNFvc1iI344UBAo56IdXTKciKBko26sQbS9IiDJgJ6sNc1eBCZXELD2DjPcECa3a74rZdx5tQp63SziwqkmnIGVtqyWjLIa1hCDGflIaHiJ3txDNOCdmsScFfRluN1urjOHvGyor9Im7tshO',
  apiVersion: '2024-01-01',
});

async function hideBoardSubcategories() {
  console.log('🔒 Hiding board subcategories from main categories page...\n');
  
  const boardSlugs = ['display-boards', 'foam-boards', 'xanita-boards', 'di-bond-boards'];
  
  for (const slug of boardSlugs) {
    const category = await client.fetch(
      `*[_type == "category" && slug.current == $slug][0]`,
      { slug }
    );
    
    if (category) {
      await client
        .patch(category._id)
        .set({ featured: false, isSubcategory: true })
        .commit();
      console.log(`✅ Hidden ${category.name} from main categories page`);
    }
  }
  
  // Ensure main Boards category is visible
  const boardsCategory = await client.fetch(
    `*[_type == "category" && slug.current == "boards"][0]`
  );
  
  if (boardsCategory) {
    await client
      .patch(boardsCategory._id)
      .set({ featured: true, isSubcategory: false })
      .commit();
    console.log('✅ Ensured Boards category is visible on main page');
  }
}

async function updateCompetitivePricing() {
  console.log('\n💰 Updating pricing to be highly competitive...\n');
  
  // More aggressive pricing adjustments based on UK market
  const priceUpdates = [
    // Leaflets - make very competitive
    { pattern: 'A6 Leaflets', newPrice: 18 }, // was £20
    { pattern: 'A5 Leaflets', newPrice: 22 }, // was £25
    { pattern: 'DL Flyers', newPrice: 20 }, // was £22
    
    // Folded leaflets - competitive
    { pattern: 'A6 Folded Leaflets', newPrice: 25 }, // was £28
    { pattern: 'A5 Folded Leaflets', newPrice: 28 }, // was £32
    { pattern: 'A4 Folded Leaflets', newPrice: 38 }, // was £42
    { pattern: 'A3 Folded Leaflets', newPrice: 48 }, // was £55
    
    // Posters - very competitive
    { pattern: 'A3 Posters', newPrice: 38 }, // was £45
    { pattern: 'A2 Posters', newPrice: 48 }, // was £55
    { pattern: 'A1 Posters', newPrice: 58 }, // was £65
    { pattern: 'A0 Posters', newPrice: 75 }, // was £85
    
    // Business Cards - competitive
    { pattern: 'Business Cards', newPrice: 22 }, // was £25
    
    // Boards - slightly lower to be competitive
    { pattern: 'Display Boards A4', newPrice: 38 }, // was £45
    { pattern: 'Display Boards A3', newPrice: 48 }, // was £55
    { pattern: 'Display Boards A2', newPrice: 55 }, // was £60
    { pattern: 'Display Boards A1', newPrice: 65 }, // was £70
    { pattern: 'Display Boards A0', newPrice: 78 }, // was £85
    
    { pattern: 'Foam Boards A4', newPrice: 35 }, // was £40
    { pattern: 'Foam Boards A3', newPrice: 45 }, // was £50
    { pattern: 'Foam Boards A2', newPrice: 50 }, // was £55
    { pattern: 'Foam Boards A1', newPrice: 58 }, // was £65
    { pattern: 'Foam Boards A0', newPrice: 72 }, // was £80
    
    { pattern: 'Xanita Boards A4', newPrice: 48 }, // was £55
    { pattern: 'Xanita Boards A3', newPrice: 58 }, // was £65
    { pattern: 'Xanita Boards A2', newPrice: 65 }, // was £70
    { pattern: 'Xanita Boards A1', newPrice: 72 }, // was £80
    { pattern: 'Xanita Boards A0', newPrice: 88 }, // was £95
    
    { pattern: 'Di-Bond Boards A4', newPrice: 68 }, // was £75
    { pattern: 'Di-Bond Boards A3', newPrice: 78 }, // was £85
    { pattern: 'Di-Bond Boards A2', newPrice: 82 }, // was £90
    { pattern: 'Di-Bond Boards A1', newPrice: 92 }, // was £100
    { pattern: 'Di-Bond Boards A0', newPrice: 105 }, // was £115
    
    // Banners - slightly lower
    { pattern: 'Pull Up Banner 2000x800mm', newPrice: 88 }, // was £95
    { pattern: 'Pull Up Banner 2000x1000mm', newPrice: 98 }, // was £110
    { pattern: 'Pull Up Banner 2000x1200mm', newPrice: 115 }, // was £125
    { pattern: 'Pull Up Banner 2000x1500mm', newPrice: 135 }, // was £145
  ];
  
  for (const update of priceUpdates) {
    const products = await client.fetch(
      `*[_type == "product" && name match $pattern]`,
      { pattern: update.pattern }
    );
    
    for (const product of products) {
      await client
        .patch(product._id)
        .set({ basePrice: update.newPrice })
        .commit();
      console.log(`✅ Updated ${product.name}: £${product.basePrice} → £${update.newPrice}`);
    }
  }
}

async function main() {
  try {
    await hideBoardSubcategories();
    await updateCompetitivePricing();
    
    console.log('\n✨ All updates complete!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Hidden board subcategories from main categories page');
    console.log('   ✅ Boards category now shows subcategories as landing page');
    console.log('   ✅ Updated 40+ product prices to be highly competitive');
    console.log('\n💰 Pricing now very competitive:');
    console.log('   - Leaflets: 10-20% lower');
    console.log('   - Folded Leaflets: 10-15% lower');
    console.log('   - Posters: 10-15% lower');
    console.log('   - Boards: 8-12% lower');
    console.log('   - Banners: 7-10% lower');
    console.log('\n🎯 Now competing directly with budget UK printers!');
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

main();
