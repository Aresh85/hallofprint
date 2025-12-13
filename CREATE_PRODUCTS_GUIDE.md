# 🎨 Automatic Product Creation Guide

## What This Does

Automatically creates **6 categories** and **5 products** in your Sanity CMS:

### Categories:
1. Flyers & Leaflets
2. Booklets
3. Posters
4. Business Cards
5. Boards
6. Banners

### Products:
1. A5 Leaflets (£25)
2. A4 Posters (£35)
3. A4 Perfect Bound Booklets (£220)
4. Business Cards (£30)
5. A3 Flyers (£45)

Each product includes:
- ✅ Full descriptions (SEO-optimized)
- ✅ Standard configurations (Quantity, Paper, Finishing)
- ✅ Tags and badges
- ✅ Use case attributes
- ✅ SEO metadata

---

## How to Run

### Step 1: Get Sanity Write Token

1. Go to: https://sanity.io/manage
2. Select your project
3. Click "API" → "Tokens"
4. Click "Add API Token"
5. Name it: "Product Creation"
6. Permissions: **Editor**
7. Click "Create"
8. **Copy the token** (you won't see it again!)

### Step 2: Set Environment Variable

```bash
export SANITY_WRITE_TOKEN=your-token-here
```

### Step 3: Run the Script

```bash
cd studio
npm run create-products
```

### Expected Output:

```
🚀 Starting Sanity product creation...

Project: your-project-id
Dataset: production

🏗️  Creating categories...

✅ Created category: Flyers & Leaflets (category-id-1)
✅ Created category: Booklets (category-id-2)
✅ Created category: Posters (category-id-3)
✅ Created category: Business Cards (category-id-4)
✅ Created category: Boards (category-id-5)
✅ Created category: Banners (category-id-6)

✅ Created 6 categories

📦 Creating products...

✅ Created product: A5 Leaflets (product-id-1)
✅ Created product: A4 Posters (product-id-2)
✅ Created product: A4 Perfect Bound Booklets (product-id-3)
✅ Created product: Business Cards (product-id-4)
✅ Created product: A3 Flyers (product-id-5)

✅ Created 5 products

🎉 All done! Your categories and products have been created!
```

---

## Verify Results

### In Sanity Studio:
1. Open: https://hall-of-print.sanity.studio/
2. Click "Product Category" - see 6 categories
3. Click "Product (Print Item)" - see 5 products

### On Your Website:
1. Start Next.js: `cd web && npm run dev`
2. Open: http://localhost:3000/products
3. See your 5 products displayed!

---

## What Each Product Has

### Standard Configuration (All Products):

**Quantity Options:**
- 50, 100, 250, 500, 1000, 2500, 5000 units
- With progressive discounts

**Paper Types:**
- Economy (£0.00)
- Standard (£0.00)
- Premium (+£0.10/unit)

**Finishing:**
- None (£0.00)
- Gloss Lamination (+£0.12/unit)
- Matt Lamination (+£0.12/unit)
- Soft Touch Lamination (+£0.18/unit)

---

## Troubleshooting

### Error: SANITY_WRITE_TOKEN not set
- Make sure you ran: `export SANITY_WRITE_TOKEN=your-token`
- Token must have "Editor" permissions

### Error: Category not found
- Script creates categories first, then products
- If it fails partway, delete created items and run again

### Products not showing on website
- Check Sanity Studio - products should be there
- Restart Next.js: `cd web && npm run dev`
- Clear cache: `cd web && rm -rf .next && npm run dev`

---

## After Creation

### Next Steps:
1. ✅ Products created automatically
2. Add product images in Sanity Studio
3. Test products on website
4. Deploy to Vercel
5. Add more products (use these as templates!)

---

## Script Details

**Location:** `studio/scripts/create-products.ts`
**Command:** `npm run create-products`
**Duration:** ~10 seconds
**Creates:** 6 categories + 5 products

---

**Ready to create your products? Follow the steps above!** 🚀
