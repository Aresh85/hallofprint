# 🚀 Quick Start Guide - E-Commerce Products

**Goal:** Get your first 5 products live in 30 minutes!

---

## Step 1: Deploy Updated Schemas (5 minutes)

Run the deployment script:

```bash
./deploy-schemas.sh
```

Or manually:

```bash
cd studio
npm run deploy
```

✅ **Done?** Schemas are now updated in Sanity!

---

## Step 2: Start Sanity Studio (1 minute)

```bash
cd studio
npm run dev
```

Open: http://localhost:3333

✅ **Done?** You can see Sanity Studio!

---

## Step 3: Create 6 Categories (5 minutes)

In Sanity Studio, click "Product Category" → "Create"

Create these categories:

### 1. Flyers & Leaflets
- **Name:** Flyers & Leaflets
- **Slug:** flyers-and-leaflets (auto-generated)
- **Description:** High-quality flyers and leaflets for marketing and promotion
- **Featured:** ✓ (check this)
- **Sort Order:** 1

### 2. Booklets
- **Name:** Booklets
- **Slug:** booklets
- **Description:** Professional booklets with various binding options
- **Featured:** ✓
- **Sort Order:** 2

### 3. Posters
- **Name:** Posters
- **Slug:** posters
- **Description:** Eye-catching posters in multiple sizes
- **Featured:** ✓
- **Sort Order:** 3

### 4. Business Cards
- **Name:** Business Cards
- **Slug:** business-cards
- **Description:** Professional business cards that make an impression
- **Sort Order:** 4

### 5. Boards
- **Name:** Boards
- **Slug:** boards
- **Description:** Display boards, foam boards, and Xanita boards
- **Sort Order:** 5

### 6. Banners
- **Name:** Banners
- **Slug:** banners
- **Description:** Large format banners for events and retail
- **Sort Order:** 6

✅ **Done?** You have 6 categories!

---

## Step 4: Create Your First Product - A5 Leaflets (10 minutes)

In Sanity Studio, click "Product (Print Item)" → "Create"

### Basic Information:
- **Product Name:** A5 Leaflets
- **Slug:** Click "Generate" → `a5-leaflets`
- **Description:**
  ```
  Professional A5 leaflets perfect for marketing campaigns, events, and promotions. High-quality printing on premium paper stock with optional lamination finishes. Choose from a range of quantities to suit your budget and needs. Fast turnaround available. Ideal for restaurants, real estate agents, retail stores, and event organizers.
  ```
- **Short Description:** Professional A5 leaflets for marketing and events
- **Base Price:** 25.00
- **Request a Quote Only:** ❌ (unchecked)

### Media:
- **Main Image:** Upload or skip for now (you can add later)
- **Category:** Select "Flyers & Leaflets"

### Classification:
- **Product Tags:** marketing, promotion, flyers, leaflets
- **Product Size:** a5
- **Product Badges:** popular, bestseller
- **Use Case:** Marketing & Promotion, Events & Exhibitions, Business & Corporate
- **Target Industry:** Restaurant & Hospitality, Retail & E-commerce, Events & Entertainment

### Configuration Groups:

**Add 3 groups - click "Add item" for each:**

#### Group 1: Quantity
- **Group Name:** Quantity
- **Choices:** (Click "Add item" 7 times)
  
  1. Name: `50 units`, Price Modifier: `0`, Unit: `units`
  2. Name: `100 units`, Price Modifier: `-1.25`, Unit: `units`
  3. Name: `250 units`, Price Modifier: `-2.50`, Unit: `units`
  4. Name: `500 units`, Price Modifier: `-3.75`, Unit: `units`
  5. Name: `1000 units`, Price Modifier: `-5.00`, Unit: `units`
  6. Name: `2500 units`, Price Modifier: `-6.25`, Unit: `units`
  7. Name: `5000 units`, Price Modifier: `-7.50`, Unit: `units`

#### Group 2: Paper Type
- **Group Name:** Paper Type
- **Choices:**
  
  1. Name: `Economy`, Price Modifier: `0`, Unit: `per sheet`
  2. Name: `Standard`, Price Modifier: `0`, Unit: `per sheet`
  3. Name: `Premium`, Price Modifier: `0.10`, Unit: `per sheet`

#### Group 3: Finishing
- **Group Name:** Finishing
- **Choices:**
  
  1. Name: `None`, Price Modifier: `0`, Unit: `per sheet`
  2. Name: `Gloss Lamination`, Price Modifier: `0.12`, Unit: `per sheet`
  3. Name: `Matt Lamination`, Price Modifier: `0.12`, Unit: `per sheet`
  4. Name: `Soft Touch Lamination`, Price Modifier: `0.18`, Unit: `per sheet`

### SEO:
- **SEO Title:** A5 Leaflets | Starting from £25 | Hall of Prints
- **SEO Description:** Professional A5 leaflets with fast turnaround. Choose from 50-5000 units. Premium paper stocks and lamination options available. Order online today.
- **SEO Keywords:** a5 leaflets, flyers, marketing materials, print leaflets

### Status:
- **Featured Product:** ✓ (check this)
- **Sort Order:** 1
- **Product Status:** Active

Click **"Publish"**!

✅ **Done?** Your first product is live!

---

## Step 5: Create 4 More Quick Products (10 minutes)

### Product 2: A4 Posters
- **Name:** A4 Posters
- **Base Price:** 35.00
- **Category:** Posters
- **Size:** a4
- **Badges:** popular
- **Use same configuration groups as A5 Leaflets**

### Product 3: A4 Perfect Bound Booklets
- **Name:** A4 Perfect Bound Booklets
- **Base Price:** 220.00
- **Category:** Booklets
- **Size:** a4
- **Badges:** bestseller

### Product 4: Business Cards
- **Name:** Business Cards
- **Base Price:** 30.00
- **Category:** Business Cards
- **Badges:** popular, bestseller

### Product 5: A3 Flyers
- **Name:** A3 Flyers
- **Base Price:** 45.00
- **Category:** Flyers & Leaflets
- **Size:** a3
- **Featured:** ✓

✅ **Done?** You have 5 products!

---

## Step 6: Test on Website (2 minutes)

### Start Next.js (if not running):
```bash
cd web
npm run dev
```

### View Products:
Open: http://localhost:3000/products

✅ **Success if you see:**
- Grid of 5 products
- Product images (or placeholders)
- Prices displayed
- "Starting from £XX" text

### Test a Product:
1. Click on "A5 Leaflets"
2. See product detail page
3. Try changing quantity, paper, finishing
4. Watch price update
5. Click "Add to Cart"

✅ **Done?** Your e-commerce system works!

---

## 🎉 Congratulations!

You now have:
- ✅ 6 product categories
- ✅ 5 live products
- ✅ Working product pages
- ✅ Functional cart
- ✅ Dynamic pricing

---

## 📋 Next Steps:

### This Week:
1. **Add Product Images** - Use Canva or similar to create mockups
2. **Create 10 more products** - Follow same template
3. **Test on mobile** - Most customers browse on phones
4. **Write better descriptions** - Include benefits and use cases

### Next Week:
5. **Add search functionality** (see Implementation Guide)
6. **Implement file upload** in product configurator
7. **Add SEO metadata** to all pages
8. **Create CSV pricing system** for bulk updates

### Later:
9. **Add product recommendations**
10. **Implement AI assistant** for product selection
11. **Add customer reviews**
12. **Create admin dashboard** for pricing

---

## 💡 Pro Tips:

1. **Copy Products:** Duplicate existing products to save time
2. **Use Consistent Pricing:** Keep same discount structure
3. **Add Tags:** Help customers find products
4. **Test Frequently:** Check website after each change
5. **Mobile First:** Most users will browse on phones

---

## 🆘 Problems?

### Products not showing?
```bash
# Clear Next.js cache
cd web
rm -rf .next
npm run dev
```

### Sanity connection issues?
- Check `.env.local` has correct Sanity credentials
- Verify CORS settings in Sanity dashboard

### Pricing not calculating?
- Check priceModifier values are numbers (not strings)
- Console.log in ProductConfigurator to debug

---

## 📖 Full Documentation:

- **Implementation Guide:** `ECOMMERCE_IMPLEMENTATION_GUIDE.md`
- **CSV Pricing:** Template at `web/public/pricing-template.csv`
- **Product Schema:** `studio/schemas/documents/product.ts`

---

**Need help? Check the Implementation Guide or existing documentation!**

**Good luck! 🚀**
