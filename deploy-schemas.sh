#!/bin/bash

# Hall of Prints - Deploy Sanity Schemas
# This script deploys your updated product and category schemas to Sanity

echo "🚀 Deploying Sanity Schemas..."
echo ""

# Navigate to studio directory
cd studio || { echo "❌ Error: studio directory not found"; exit 1; }

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Building schemas..."
npm run build

echo ""
echo "☁️  Deploying to Sanity..."
npm run deploy

echo ""
echo "✅ Schema deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Open Sanity Studio: http://localhost:3333"
echo "2. Create 6 categories (Flyers & Leaflets, Booklets, Posters, etc.)"
echo "3. Create your first 5 products"
echo "4. Test on website: http://localhost:3000/products"
echo ""
echo "📖 For detailed instructions, see: ECOMMERCE_IMPLEMENTATION_GUIDE.md"
