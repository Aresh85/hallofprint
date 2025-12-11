# Customer Data & Email Notifications

## Where Customer Data is Stored

Currently, the Hall of Print application handles customer data in the following ways:

### 1. File Upload Submissions

When customers submit artwork through `/upload-file`:

**Data Logged to Vercel:**
- All customer information and file details are logged to Vercel's function logs
- Access logs: Vercel Dashboard → Your Project → Functions → View Logs

**Logged Information:**
```
- Order ID
- Customer Name
- Customer Email
- Customer Phone
- Customer Notes/Special Instructions
- File Name
- File Type
- File Size
```

### 2. Email Notifications

Email notifications are sent to `a1@inteeka.com` using **Resend** (https://resend.com).

**Setup Required:**

1. **Sign up for Resend** (if not already done):
   - Go to https://resend.com
   - Create a free account
   - Get your API key

2. **Add Environment Variable to Vercel**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add new variable:
     - **Name:** `RESEND_API_KEY`
     - **Value:** Your Resend API key (starts with `re_`)
   - Click "Save"
   - Redeploy for changes to take effect

3. **Email Format:**
   The notification email includes:
   - Customer contact information (name, email, phone)
   - Order ID
   - File details (name, type, size)
   - Any special instructions/notes

## Accessing Customer Submissions

### Via Vercel Logs (Current Method)

1. Go to https://vercel.com
2. Select "hallofprint" project
3. Click "Functions" tab
4. Find `/api/upload-file` function
5. Click "View Logs"
6. Filter by successful submissions (look for "FILE UPLOAD SUCCESS")

### Via Email Notifications

Once `RESEND_API_KEY` is configured:
- Instant email to a1@inteeka.com for each submission
- Includes all customer and file information
- No need to check logs manually

## Future Enhancements

For production, consider:

1. **Database Storage:**
   - Store submissions in Sanity CMS
   - Create "fileSubmissions" schema
   - Query submissions via Sanity Studio

2. **File Storage:**
   - Upload files to AWS S3 or Sanity Assets
   - Store file URLs in database
   - Enable file download from admin panel

3. **Admin Dashboard:**
   - Create `/admin` route
   - List all submissions
   - View/download submitted files
   - Update submission status

4. **Customer Confirmation:**
   - Send confirmation email to customer
   - Include submission reference number
   - Set expectations for response time

## Testing Email Notifications

To test the email system:

1. Ensure `RESEND_API_KEY` is set in Vercel
2. Visit: https://hallofprint.vercel.app/upload-file
3. Fill in customer information
4. Upload a small test file
5. Submit
6. Check a1@inteeka.com inbox for notification

## Troubleshooting

**Not receiving emails?**
- Check Vercel environment variables include `RESEND_API_KEY`
- Verify API key is valid in Resend dashboard
- Check Vercel function logs for email errors
- Verify Resend account has sending enabled

**Need to change notification email?**
- Update `web/app/api/upload-file/route.ts`
- Find `to: ['a1@inteeka.com']`
- Change to desired email address
- Commit and push changes
