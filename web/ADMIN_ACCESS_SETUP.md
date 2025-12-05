# Admin Dashboard Access Setup

## 🔐 Who Can Access Admin Dashboards?

Users can access **Admin Dashboards** (`/admin/orders` and `/admin/price-match-dashboard`) if their role is:
- `operator` 
- `admin`

Regular customers cannot access these pages.

---

## 🛠️ How to Grant Admin Access

### Step 1: Find the User's ID

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find the user's email
3. Copy their **User ID** (UUID)

### Step 2: Update Their Role in Database

Go to **SQL Editor** in Supabase and run:

```sql
-- Make a user an ADMIN
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- OR make them an OPERATOR
UPDATE user_profiles 
SET role = 'operator' 
WHERE email = 'your-email@example.com';
```

**OR if you want to use the User ID:**

```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = 'user-uuid-here';
```

---

## 📋 Role Definitions

### **Admin Role**
- Full access to all admin features
- Can manage price matches
- Can manage all orders
- Can update order statuses
- Can update payment statuses

### **Operator Role**
- Same access as Admin
- Can manage price matches
- Can manage all orders
- Can update order statuses
- Can update payment statuses

### **Customer Role** (default)
- No admin access
- Can only see their own orders
- Can submit price match requests
- Can manage their own profile

---

## 🧪 How to Test Access

### 1. Make Yourself an Admin:

```sql
-- Replace with YOUR email
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### 2. Logout and Login Again

Important: You must **logout and login again** for the role change to take effect!

### 3. Check Your Account Page

After logging back in:
- Go to `/account`
- You should now see **two admin cards**:
  - "Price Match Dashboard" (blue border)
  - "Order Management" (green border)

### 4. Access the Dashboards

- Click **"Order Management"** → `/admin/orders`
- Click **"Price Match Dashboard"** → `/admin/price-match-dashboard`

---

## 🔍 Check Current User Roles

To see all users and their roles:

```sql
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM user_profiles
ORDER BY created_at DESC;
```

---

## 🚨 Troubleshooting

### "I updated the role but can't access admin dashboards"

**Solution:** Logout and login again! The role is checked when you login.

### "The admin cards don't show on /account page"

**Check:**
1. Logout completely
2. Clear browser cache
3. Login again
4. Go to `/account`

### "I'm redirected to /account when I try to access /admin/orders"

**This means:**
- Your role is still `'customer'` (default)
- Run the SQL update again
- Make sure to logout/login after updating

---

## 💡 Quick Setup for Testing

```sql
-- Make your account an admin (replace email)
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify it worked
SELECT email, role 
FROM user_profiles 
WHERE email = 'your-email@example.com';
```

Then:
1. **Logout**
2. **Login**
3. Go to `/account`
4. See admin dashboard cards!

---

## 📌 Important Notes

- Only users with `role = 'admin'` or `role = 'operator'` can access admin dashboards
- The default role for new users is `'customer'`
- You must logout/login after changing roles
- Admin access is checked on every page load for security

---

## 🎯 Summary

**To grant admin access:**
```sql
UPDATE user_profiles SET role = 'admin' WHERE email = 'user@example.com';
```

**Then the user must:**
1. Logout
2. Login again
3. Access `/account` to see admin options
