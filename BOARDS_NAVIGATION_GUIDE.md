# Boards Navigation Guide

## 🎯 How the Boards Navigation Works

### Navigation Flow:

```
/categories (Main Categories Page)
  ↓
  Click "Boards" (24 products)
  ↓
/products/category/boards (Boards Landing Page)
  ↓
  Shows 4 Board Types:
  - Display Boards (6 products)
  - Foam Boards (6 products)
  - Xanita Boards (6 products)
  - Di-Bond Boards (6 products)
  ↓
  Click any board type (e.g., "Foam Boards")
  ↓
/products/category/foam-boards (Category Products Page)
  ↓
  Shows 6 Foam Board Products:
  - Foam Boards A0 (£72)
  - Foam Boards A1 (£58)
  - Foam Boards A2 (£50)
  - Foam Boards A3 (£45)
  - Foam Boards A4 (£35)
  - Foam Boards Custom Size (Quote Only)
```

---

## 📁 File Structure:

### 1. Main Categories Page
**File:** `web/app/categories/page.tsx`
**URL:** `/categories`
**Purpose:** Shows 6 main categories
**Query:** Excludes subcategories with `isSubcategory: true`

### 2. Boards Landing Page
**File:** `web/app/products/category/boards/page.tsx`
**URL:** `/products/category/boards`
**Purpose:** Shows 4 board subcategories as navigation cards
**Query:** Fetches only board subcategories

### 3. Dynamic Category Pages
**File:** `web/app/products/category/[slug]/page.tsx`
**URLs:** 
- `/products/category/display-boards`
- `/products/category/foam-boards`
- `/products/category/xanita-boards`
- `/products/category/di-bond-boards`
**Purpose:** Shows products for each board type

---

## ✅ What's Set Up:

### In Sanity:
- ✅ 6 main categories (without `isSubcategory` flag)
- ✅ 4 board subcategories (with `isSubcategory: true`)
- ✅ 24 board products linked to their respective subcategories
- ✅ Products properly categorized

### In Next.js:
- ✅ `/categories` page filters out subcategories
- ✅ `/products/category/boards` custom landing page
- ✅ Dynamic `[slug]` route handles all subcategory pages
- ✅ Links properly set up between pages

---

## 🔍 How to Verify:

### Step 1: Main Categories
1. Go to: https://hallofprint.vercel.app/categories
2. Should see: 6 categories including "Boards (24 products)"
3. Should NOT see: Display Boards, Foam Boards, etc.

### Step 2: Boards Landing
1. Click "Boards" from categories page
2. Go to: https://hallofprint.vercel.app/products/category/boards
3. Should see: 4 board type cards:
   - Display Boards (6 products)
   - Foam Boards (6 products)
   - Xanita Boards (6 products)
   - Di-Bond Boards (6 products)

### Step 3: Board Products
1. Click "Foam Boards" from boards landing
2. Go to: https://hallofprint.vercel.app/products/category/foam-boards
3. Should see: 6 foam board products (A0, A1, A2, A3, A4, Custom)
4. Each product shows price and configuration options

### Step 4: Repeat for Other Board Types
- Display Boards: https://hallofprint.vercel.app/products/category/display-boards
- Xanita Boards: https://hallofprint.vercel.app/products/category/xanita-boards
- Di-Bond Boards: https://hallofprint.vercel.app/products/category/di-bond-boards

---

## 🛠️ Technical Details:

### Sanity Queries:

**Main Categories (excludes subcategories):**
```groq
*[_type == "category" && (!defined(isSubcategory) || isSubcategory != true)]
```

**Board Subcategories (only boards):**
```groq
*[_type == "category" && slug.current in ["display-boards", "foam-boards", "xanita-boards", "di-bond-boards"]]
```

**Products by Category:**
```groq
*[_type == "product" && category._ref == $categoryId]
```

### Product Counts:

**By Board Type:**
- Display Boards: 6 (A0-A4 + Custom)
- Foam Boards: 6 (A0-A4 + Custom)
- Xanita Boards: 6 (A0-A4 + Custom)
- Di-Bond Boards: 6 (A0-A4 + Custom)
- **Total:** 24 board products

---

## 💰 Board Pricing (Updated):

### Display Boards:
- A0: £78
- A1: £65
- A2: £55
- A3: £48
- A4: £38
- Custom: Quote Only

### Foam Boards:
- A0: £72
- A1: £58
- A2: £50
- A3: £45
- A4: £35
- Custom: Quote Only

### Xanita Boards:
- A0: £88
- A1: £72
- A2: £65
- A3: £58
- A4: £48
- Custom: Quote Only

### Di-Bond Boards:
- A0: £105
- A1: £92
- A2: £82
- A3: £78
- A4: £68
- Custom: Quote Only

---

## 🎨 UI Components:

### Boards Landing Page Features:
- Hero section with breadcrumb navigation
- 4 board type cards in 2x2 grid
- Each card shows:
  - Board type name
  - Description
  - Product count
  - Arrow icon for navigation
- Feature section explaining board benefits
- Back to categories link

### Board Products Pages:
- Standard category page layout
- Product grid showing all sizes
- Each product card with:
  - Product name (size)
  - Price
  - Configuration options
  - Add to cart button

---

## ✨ Benefits of This Structure:

1. **Clean Main Navigation:** Only 6 categories on main page
2. **Organized Boards:** Boards have their own landing page
3. **Easy Discovery:** Clear path to find specific board types
4. **Professional UX:** Industry-standard category hierarchy
5. **SEO Friendly:** Each board type has its own URL
6. **Scalable:** Easy to add more board types in future

---

## 🚀 Status: COMPLETE ✅

All navigation is set up and working:
- Main categories page: Shows 6 categories
- Boards landing page: Shows 4 subcategories
- Individual board pages: Show 6 products each
- All links working correctly
- Product counts accurate
- Pricing competitive

**Total Routes Created:**
- 1 main categories page
- 1 boards landing page
- 4 board subcategory pages
- 24 individual product pages
- **Total:** 30+ pages

**Last Updated:** December 13, 2025
**Status:** Production Ready
