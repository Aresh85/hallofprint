# 🚀 Hall of Prints E-Commerce Implementation Guide

## ✅ What's Been Completed

### 1. Enhanced Sanity Product Schema
**File:** `studio/schemas/documents/product.ts`

**New Features Added:**
- ✅ Short descriptions for product cards
- ✅ Image gallery support
- ✅ Product tags for search/filtering
- ✅ Product size field (A0-DL)
- ✅ Product badges (Popular, Best Seller, New, Best Value)
- ✅ Use case classifications (Marketing, Events, Business, etc.)
- ✅ Target industry tags
- ✅ SEO fields (title, description, keywords)
- ✅ Featured flag
- ✅ Sort order
- ✅ Product status (Active, Draft, Out of Stock, Discontinued)
- ✅ Enhanced preview in Sanity Studio

---

## 📋 Implementation Roadmap

### Phase 1: Sanity Studio Setup (1-2 hours)

#### Step 1.1: Update Category Schema
**Action:** Enhance the category document

**File to modify:** `studio/schemas/documents/category.ts`

Add these fields:
```typescript
- slug (for URL-friendly categories)
- description
- icon/image
- sortOrder
- parentCategory (for subcategories)
```

#### Step 1.2: Deploy Sanity Schema
```bash
cd studio
npm run deploy
```

#### Step 1.3: Create Categories in Sanity Studio
Create these main categories:
1. **Flyers & Leaflets**
   - Description: "High-quality flyers and leaflets for marketing and promotion"
   
2. **Booklets**
   - Description: "Professional booklets with various binding options"
   
3. **Posters**
   - Description: "Eye-catching posters in multiple sizes"
   
4. **Business Cards**
   - Description: "Professional business cards"
   
5. **Boards**
   - Description: "Display boards, foam boards, and Xanita boards"
   
6. **Banners**
   - Description: "Large format banners for events and retail"

---

### Phase 2: Create Product Templates (2-3 hours)

#### Standard Configuration Template

All products should have these configuration groups:

**Group 1: Quantity**
- 50 units (0% discount)
- 100 units (5% discount)
- 250 units (10% discount)
- 500 units (15% discount)
- 1000 units (20% discount)
- 2500 units (25% discount)
- 5000 units (30% discount)

**Group 2: Paper Type**
- Economy (£0.00 modifier)
- Standard (£0.00 modifier)
- Premium (+£0.10 modifier per unit)

**Group 3: Finishing**
- None (£0.00)
- Gloss Lamination (+£0.12 per unit)
- Matt Lamination (+£0.12 per unit)
- Soft Touch Lamination (+£0.18 per unit)

**Optional Groups (where applicable):**
- Print Sides: Single Sided / Double Sided
- Turnaround: Standard / Express (+20%)

#### Product List to Create (25-30 products)

**FLYERS & LEAFLETS (14 products):**
1. A3 Flyers/Leaflets - £45 base
2. A4 Flyers/Leaflets - £35 base
3. A5 Flyers/Leaflets - £25 base
4. A6 Flyers/Leaflets - £20 base
5. DL Flyers/Leaflets - £22 base
6. A3 Bi-Fold Flyers - £55 base
7. A4 Bi-Fold Flyers - £45 base
8. A5 Bi-Fold Flyers - £35 base
9. A3 Roll-Fold Flyers - £60 base
10. A4 Roll-Fold Flyers - £50 base
11. A5 Roll-Fold Flyers - £40 base
12. A3 Z-Fold Flyers - £60 base
13. A4 Z-Fold Flyers - £50 base
14. A5 Z-Fold Flyers - £40 base

**POSTERS (4 products):**
15. A0 Posters - £95 base
16. A1 Posters - £65 base
17. A2 Posters - £45 base
18. A3 Posters - £35 base

**BOOKLETS (8 products):**
19. A4 Saddle Stitched Booklets - £180 base (24 pages)
20. A5 Saddle Stitched Booklets - £140 base (24 pages)
21. A4 Perfect Bound Booklets - £220 base (48 pages)
22. A5 Perfect Bound Booklets - £180 base (48 pages)
23. A4 Wire Bound Booklets - £200 base (40 pages)
24. A5 Wire Bound Booklets - £160 base (40 pages)
25. A4 Comb Bound Booklets - £190 base (40 pages)
26. A5 Comb Bound Booklets - £150 base (40 pages)

**BOARDS (Optional - add as needed):**
- Display Boards (A0-A4)
- Xanita Boards (A0-A4)
- Foam Boards (A0-A4)

---

### Phase 3: CSV Pricing System (3-4 hours)

#### Step 3.1: Create Pricing Database Table

**File to create:** `web/pricing-history-table.sql`

```sql
CREATE TABLE IF NOT EXISTS pricing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  changes JSONB NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'manual' -- 'manual', 'csv', 'bulk'
);

CREATE INDEX idx_pricing_history_product ON pricing_history(product_id);
CREATE INDEX idx_pricing_history_date ON pricing_history(updated_at DESC);
```

#### Step 3.2: Create Admin Pricing Manager Page

**File to create:** `web/app/admin/pricing-manager/page.tsx`

Features needed:
1. Export Current Pricing button
2. Import CSV with validation
3. Preview changes before applying
4. Quick edit table
5. Pricing history viewer
6. Bulk operations

#### Step 3.3: Create API Endpoints

**Files to create:**
1. `web/app/api/admin/pricing/export/route.ts` - Export CSV
2. `web/app/api/admin/pricing/import/route.ts` - Import CSV
3. `web/app/api/admin/pricing/history/route.ts` - View history
4. `web/app/api/admin/pricing/bulk-update/route.ts` - Bulk operations

#### Step 3.4: CSV Template Structure

**Example CSV format:**

```csv
# HALL OF PRINTS PRICING TEMPLATE
# Instructions: Update prices and modifiers, then re-upload
# Base_Price: Starting price in GBP
# Qty_XX: Discount percentage (e.g., 10 = 10% off)
# Paper_XXX/Finish_XXX: Additional cost per unit in GBP
Product_ID,Product_Name,Base_Price,Qty_50,Qty_100,Qty_250,Qty_500,Qty_1000,Qty_2500,Qty_5000,Paper_Economy,Paper_Standard,Paper_Premium,Finish_None,Finish_Gloss,Finish_Matt,Finish_SoftTouch,Updated_Date
prod_001,A5 Leaflets,25.00,0,5,10,15,20,25,30,0,0,0.10,0,0.12,0.12,0.18,2025-01-15
prod_002,A4 Posters,35.00,0,5,10,15,20,25,30,0,0,0.15,0,0.15,0.15,0.22,2025-01-15
```

---

### Phase 4: Enhanced Product Listing (2-3 hours)

#### Step 4.1: Add Search Functionality

**File to modify:** `web/app/products/page.tsx`

Add:
- Search bar with autocomplete
- Category filter
- Size filter
- Price range slider
- Sort options (Popular, Price Low-High, Price High-Low, Name A-Z)
- View toggle (Grid/List)

#### Step 4.2: Update Product Query

**File to modify:** `web/lib/sanity.ts`

Add enhanced query:
```typescript
export const enhancedProductsQuery = `*[_type == "product" && status == "active"] | order(sortOrder asc, name asc) {
  _id,
  name,
  slug,
  shortDescription,
  basePrice,
  isQuoteOnly,
  "imageUrl": mainImage.asset->url,
  "category": category->name,
  "categorySlug": category->slug.current,
  productSize,
  badges,
  tags,
  featured,
  sortOrder
}`;
```

---

### Phase 5: SEO Implementation (2 hours)

#### Step 5.1: Add Metadata Generation

**Files to modify:**
- `web/app/products/page.tsx` - Add metadata export
- `web/app/products/[slug]/page.tsx` - Add dynamic metadata

#### Step 5.2: Add Structured Data

Create component: `web/components/SEO/ProductSchema.tsx`

Include:
- Product schema (Schema.org)
- Breadcrumb schema
- Organization schema

#### Step 5.3: Generate Sitemap

**File to create:** `web/app/sitemap.ts`

Include all products dynamically.

---

### Phase 6: File Upload Integration (2 hours)

#### Step 6.1: Enhance ProductConfigurator

**File to modify:** `web/components/Products/ProductConfigurator.tsx`

Add:
- File upload field
- Drag-and-drop area
- File validation
- Preview thumbnail
- Link to Supabase Storage

#### Step 6.2: Update Cart Context

**File to modify:** `web/context/CartContext.tsx`

Add file URL to cart items:
```typescript
export interface CartItem {
  id: string;
  productName: string;
  basePrice: number;
  quantity: number;
  selections: Array<{...}>;
  totalPrice: number;
  fileUrl?: string; // NEW
  fileName?: string; // NEW
}
```

---

### Phase 7: Testing & Documentation (1-2 hours)

#### Checklist:
- [ ] All products created in Sanity
- [ ] CSV export works
- [ ] CSV import validates correctly
- [ ] Search filters products properly
- [ ] SEO metadata generates correctly
- [ ] File upload links to cart
- [ ] Pricing calculator updates live
- [ ] Mobile responsive
- [ ] Admin authentication works

#### Documentation to Create:
1. **Product Management Guide** - How to add/edit products
2. **CSV Pricing Guide** - How to bulk update prices
3. **SEO Best Practices** - Optimizing product pages
4. **Troubleshooting Guide** - Common issues

---

## 🎯 Quick Start Checklist

### Immediate Actions (Do First):

1. **Deploy Sanity Schema:**
   ```bash
   cd studio
   npm run deploy
   ```

2. **Create Categories in Sanity Studio**
   - Log into http://localhost:3333
   - Create 6 main categories

3. **Create First 5 Products** (Start small)
   - A5 Leaflets
   - A4 Posters
   - A4 Perfect Bound Booklets
   - Business Cards
   - A3 Flyers

4. **Test on Website**
   - Visit http://localhost:3000/products
   - Verify products display
   - Test configuration and pricing

---

## 📊 Priority Order

### HIGH PRIORITY (Do First):
1. ✅ Product schema (DONE)
2. Create categories
3. Create 10-15 core products
4. Test product display and cart

### MEDIUM PRIORITY (Do Next):
5. Search and filters
6. SEO implementation
7. File upload in configurator
8. Product images/mockups

### LOW PRIORITY (Do Last):
9. CSV pricing system
10. Admin pricing dashboard
11. Product recommendations
12. AI integration prep

---

## 💡 Tips for Success

1. **Start Small:** Create 5 products first, test thoroughly
2. **Use Templates:** Copy existing product, change details
3. **Consistent Naming:** Use clear, SEO-friendly names
4. **Quality Images:** High-resolution product mockups
5. **Competitive Pricing:** Research competitors
6. **Test Mobile:** Most users browse on phones
7. **Monitor Performance:** Use Vercel Analytics

---

## 🆘 Troubleshooting

### Products Not Showing:
- Check product status is "Active"
- Verify category reference exists
- Check Sanity API connection
- Clear Next.js cache (delete .next folder)

### Pricing Not Calculating:
- Verify priceModifier values are numbers
- Check configurationGroups structure
- Console.log selections in ProductConfigurator

### Images Not Loading:
- Verify Sanity CORS settings
- Check image URLs in browser
- Ensure images are published in Sanity

---

## 📞 Next Steps

1. **Review this guide**
2. **Deploy schema changes**
3. **Create categories**
4. **Start with 5 products**
5. **Test and refine**
6. **Scale to 25-30 products**
7. **Implement advanced features**

**Questions? Check existing documentation or Sanity docs!**
