# AWS S3 Setup Guide for Image Uploads

This guide will walk you through setting up AWS S3 for handling image uploads in your Mochila app backend.

## Why AWS S3?

Vercel has a **read-only filesystem**, meaning files uploaded to the server are lost after the serverless function completes. AWS S3 provides:
- ✅ Persistent storage for images
- ✅ Scalable and reliable
- ✅ CDN integration with CloudFront
- ✅ Cost-effective for image storage

---

## Step 1: Create AWS Account & Setup S3 Bucket

### 1.1 Sign Up for AWS
1. Go to [AWS Console](https://aws.amazon.com/)
2. Click "Create an AWS Account"
3. Follow the registration process (requires credit card, but S3 has a generous free tier)

### 1.2 Create S3 Bucket
1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Search for **S3** in the services search bar
3. Click **"Create bucket"**

#### Bucket Configuration:
- **Bucket name**: `mochila-app-images` (must be globally unique, try `mochila-app-images-yourname`)
- **AWS Region**: Choose closest to your users (e.g., `ap-northeast-1` for Tokyo/Japan)
- **Object Ownership**: ACLs disabled (recommended)
- **Block Public Access settings**: 
  - ✅ **UNCHECK** "Block all public access" (we need public read access for images)
  - ⚠️ Acknowledge the warning (we'll set proper permissions)
- **Bucket Versioning**: Disabled (optional: enable for backup)
- **Encryption**: Enable (Server-side encryption with Amazon S3 managed keys)
- Click **"Create bucket"**

### 1.3 Configure Bucket Policy (Public Read Access)
1. Click on your newly created bucket
2. Go to **"Permissions"** tab
3. Scroll down to **"Bucket policy"**
4. Click **"Edit"** and paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mochila-app-images/*"
    }
  ]
}
```

⚠️ **Replace** `mochila-app-images` with your actual bucket name!

5. Click **"Save changes"**

### 1.4 Configure CORS (for web uploads)
1. Still in the **"Permissions"** tab
2. Scroll down to **"Cross-origin resource sharing (CORS)"**
3. Click **"Edit"** and paste:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

4. Click **"Save changes"**

---

## Step 2: Create IAM User for Programmatic Access

### 2.1 Create IAM User
1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click **"Users"** in the left sidebar
3. Click **"Create user"**
4. **User name**: `mochila-backend-uploader`
5. Click **"Next"**

### 2.2 Set Permissions
1. Select **"Attach policies directly"**
2. Search for **"AmazonS3FullAccess"** and check it
   - (For production, create a custom policy with limited access to only your bucket)
3. Click **"Next"**
4. Review and click **"Create user"**

### 2.3 Create Access Keys
1. Click on the newly created user `mochila-backend-uploader`
2. Go to **"Security credentials"** tab
3. Scroll down to **"Access keys"**
4. Click **"Create access key"**
5. Select **"Application running outside AWS"**
6. Click **"Next"**
7. Add description: "Mochila backend S3 upload"
8. Click **"Create access key"**

### 2.4 Save Credentials
⚠️ **IMPORTANT**: Copy and save these credentials immediately (you won't see them again!)

- **Access key ID**: `AKIAXXXXXXXXXXXXXXXX`
- **Secret access key**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## Step 3: Install AWS SDK in Backend

Run this command in your `mochila-backend` directory:

```bash
npm install aws-sdk
```

Or if you prefer the newer AWS SDK v3 (recommended):

```bash
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage
```

---

## Step 4: Update Environment Variables

Add these to your `mochila-backend/.env` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=ap-northeast-1
AWS_S3_BUCKET=mochila-app-images

# Optional: Use S3 instead of local storage
USE_S3_STORAGE=true
```

### For Vercel Deployment:
Add these environment variables in Vercel dashboard:
1. Go to your Vercel project
2. Click **"Settings"** → **"Environment Variables"**
3. Add each variable above

---

## Step 5: Code Implementation

The code has been updated to use AWS S3 for image uploads. See:
- `mochila-backend/utils/s3Upload.js` - S3 upload utility
- `mochila-backend/routes/user.js` - Updated to use S3

---

## Step 6: Testing

### Local Testing:
1. Update your `.env` file with AWS credentials
2. Start your backend:
   ```bash
   cd mochila-backend
   npm start
   ```
3. Test image upload from your app

### Production Testing (Vercel):
1. Add AWS environment variables to Vercel
2. Deploy your backend:
   ```bash
   vercel --prod
   ```
3. Test from your mobile app

---

## Step 7: Verify S3 Upload

1. Go to [S3 Console](https://s3.console.aws.amazon.com/)
2. Click on your bucket `mochila-app-images`
3. You should see uploaded images in the `profile-photos/` folder
4. Click on an image → **"Object URL"** should be publicly accessible

---

## Cost Estimation

AWS S3 Free Tier (First 12 months):
- ✅ 5GB of storage
- ✅ 20,000 GET requests
- ✅ 2,000 PUT requests

After free tier:
- Storage: ~$0.023 per GB/month
- Requests: Very low cost per request

**Example**: 1000 users × 5 photos × 2MB = 10GB = ~$0.23/month

---

## Security Best Practices

### For Production:
1. **Create Custom IAM Policy** (instead of full S3 access):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::mochila-app-images/*"
    }
  ]
}
```

2. **Use Environment Variables**: Never commit AWS credentials to git
3. **Enable S3 Versioning**: Recover from accidental deletions
4. **Set up CloudFront CDN**: For faster image delivery worldwide
5. **Implement Image Optimization**: Compress images before upload

---

## Troubleshooting

### Error: "Access Denied"
- ✅ Check bucket policy is set correctly
- ✅ Verify IAM user has S3 permissions
- ✅ Confirm access keys are correct in `.env`

### Error: "Bucket not found"
- ✅ Verify bucket name in `.env` matches actual bucket
- ✅ Check AWS region is correct

### Images not loading in app
- ✅ Check bucket policy allows public read access
- ✅ Verify S3 URLs are being returned correctly
- ✅ Test URL directly in browser

---

## Next Steps

1. ✅ Set up AWS account and S3 bucket
2. ✅ Install dependencies
3. ✅ Update code to use S3
4. ✅ Add environment variables
5. ✅ Test locally
6. ✅ Deploy to Vercel with AWS env vars
7. 🎉 Images now persist!

---

## Optional Enhancements

### CloudFront CDN (for faster image loading)
1. Go to CloudFront console
2. Create distribution
3. Set S3 bucket as origin
4. Update code to use CloudFront URLs

### Image Resizing (Lambda + S3)
1. Create Lambda function for image resizing
2. Trigger on S3 upload
3. Generate thumbnails automatically

### Backup Strategy
1. Enable S3 versioning
2. Set up S3 lifecycle rules
3. Configure cross-region replication

