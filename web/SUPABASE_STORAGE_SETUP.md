# Supabase Storage Setup for Artwork Files

## Step 1: Create Storage Bucket

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Click "Storage"** in the left sidebar
4. **Click "New bucket"**
5. **Configure the bucket:**
   - **Name**: `artwork-files`
   - **Public bucket**: ✅ YES (check this box)
   - Click **"Create bucket"**

---

## Step 2: Configure Bucket Policies

1. **Click on the `artwork-files` bucket**
2. **Go to "Policies" tab**
3. **Add the following policies:**

### Policy 1: Public Read Access
```sql
-- Allow public to read files
CREATE POLICY "Public can read artwork files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'artwork-files');
```

### Policy 2: Authenticated Upload
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload artwork"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'artwork-files');
```

### Policy 3: Anonymous Upload (for non-logged-in customers)
```sql
-- Allow anonymous users to upload
CREATE POLICY "Anonymous can upload artwork"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'artwork-files');
```

---

## Step 3: Test the Setup

1. **Go to your upload form**: https://hallofprint.vercel.app/upload-file
2. **Fill in details and upload a test file**
3. **Check the browser console** - you should see:
   ```
   📤 Uploading file to Supabase Storage: artwork-submissions/...
   ✅ File uploaded successfully
   🔗 Public URL: https://...
   ```
4. **Go to admin dashboard**: https://hallofprint.vercel.app/admin/artwork-dashboard
5. **You'll see a green "Download File" button**
6. **Click it** - file downloads directly!

---

## File URL Format

Files will be stored at:
```
https://[YOUR-PROJECT-ID].supabase.co/storage/v1/object/public/artwork-files/artwork-submissions/[timestamp]-[filename]
```

---

## Benefits of This Solution

✅ **Direct download links** - no more email hunting!
✅ **Larger file support** - up to 50MB (configurable)
✅ **Full control** - files in your Supabase project
✅ **Secure** - proper access control with RLS
✅ **Fast** - CDN-backed file delivery
✅ **Cost-effective** - Supabase free tier includes storage

---

## Troubleshooting

### "Bucket not found" error
- Make sure bucket name is exactly: `artwork-files`
- Check bucket is created in correct project

### "Permission denied" error
- Verify policies are created correctly
- Make sure bucket is marked as Public

### Files not uploading
- Check browser console for errors
- Verify Supabase URL and keys in .env.local

---

## Next Steps

After creating the bucket:
1. ✅ Test file upload
2. ✅ Verify download button works
3. ✅ Deploy to production
4. ✅ Remove Web3Forms webhook (no longer needed!)

**Your artwork system now has direct file access!** 🎉
