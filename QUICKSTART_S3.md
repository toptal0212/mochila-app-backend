# Quick Start: AWS S3 Setup for Image Uploads

This is a condensed guide to get AWS S3 working quickly. For detailed instructions, see `AWS_S3_SETUP.md`.

## Prerequisites
✅ Backend code is already updated to support S3
✅ AWS SDK dependencies are installed

## Step-by-Step Setup (15 minutes)

### 1. Create AWS Account (5 min)
- Go to https://aws.amazon.com/
- Click "Create an AWS Account"
- Follow registration (requires credit card, but S3 free tier is generous)

### 2. Create S3 Bucket (3 min)
1. Login to AWS Console: https://console.aws.amazon.com/
2. Search for "S3" and click
3. Click **"Create bucket"**
4. Settings:
   - **Name**: `mochila-app-images` (or add your name if taken)
   - **Region**: `ap-northeast-1` (Tokyo) or closest to you
   - **Uncheck** "Block all public access" ⚠️
   - Click "Create bucket"

### 3. Configure Bucket (2 min)
1. Click on your bucket
2. Go to **Permissions** tab
3. **Bucket Policy** → Edit → Paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::mochila-app-images/*"
  }]
}
```
⚠️ Replace `mochila-app-images` with your bucket name!

4. **CORS** → Edit → Paste:

```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
  "AllowedOrigins": ["*"],
  "ExposeHeaders": ["ETag"]
}]
```

### 4. Create IAM User (3 min)
1. Go to IAM Console: https://console.aws.amazon.com/iam/
2. Click **Users** → **Create user**
3. Name: `mochila-backend-uploader`
4. **Next** → Select **"Attach policies directly"**
5. Search and select **"AmazonS3FullAccess"**
6. Click **Next** → **Create user**

### 5. Get Access Keys (2 min)
1. Click on user `mochila-backend-uploader`
2. **Security credentials** tab
3. Scroll to **Access keys** → **Create access key**
4. Select **"Application running outside AWS"**
5. **Next** → **Create access key**
6. **Copy both keys now!** (you won't see them again)

### 6. Update Environment Variables

#### Local Development (.env file):
Create/update `mochila-backend/.env`:

```env
# Enable S3
USE_S3_STORAGE=true

# AWS Credentials
AWS_ACCESS_KEY_ID=AKIA...your-key...
AWS_SECRET_ACCESS_KEY=...your-secret...
AWS_S3_BUCKET=mochila-app-images
AWS_REGION=ap-northeast-1
```

#### Vercel Production:
1. Go to https://vercel.com/dashboard
2. Select your backend project
3. **Settings** → **Environment Variables**
4. Add these variables:
   - `USE_S3_STORAGE` = `true`
   - `AWS_ACCESS_KEY_ID` = `your-access-key`
   - `AWS_SECRET_ACCESS_KEY` = `your-secret-key`
   - `AWS_S3_BUCKET` = `mochila-app-images`
   - `AWS_REGION` = `ap-northeast-1`

### 7. Test It!

#### Test Locally:
```bash
cd mochila-backend
npm start
```
Visit: http://localhost:3000/health

Should show:
```json
{
  "status": "ok",
  "storage": {
    "s3Enabled": true,
    "s3Configured": true,
    "bucket": "mochila-app-images"
  }
}
```

#### Test on Vercel:
```bash
vercel --prod
```
Visit: https://your-backend.vercel.app/health

### 8. Test Image Upload from App
1. Open your mobile app
2. Go to profile photo upload
3. Select and upload an image
4. Check S3 bucket - you should see the image!

## Troubleshooting

### "Access Denied" Error
✅ Check bucket policy is set correctly
✅ Verify IAM user has S3 permissions
✅ Confirm access keys are correct in `.env`

### "Bucket not found" Error
✅ Verify bucket name in `.env` matches actual bucket
✅ Check AWS region is correct

### Images not loading in app
✅ Bucket must allow public read access
✅ Test S3 URL directly in browser
✅ Check CORS configuration

### S3 not enabled (shows "local" in health check)
✅ Set `USE_S3_STORAGE=true` in `.env`
✅ Restart backend server
✅ For Vercel: redeploy after adding env vars

## Verify S3 Upload Worked

1. Go to S3 Console: https://s3.console.aws.amazon.com/
2. Click your bucket
3. Navigate to `profile-photos/` folder
4. You should see uploaded images
5. Click an image → Properties → Object URL
6. Open that URL in browser - image should load

## Cost Monitoring

AWS Free Tier (12 months):
- ✅ 5GB storage
- ✅ 20,000 GET requests/month
- ✅ 2,000 PUT requests/month

To monitor usage:
1. Go to AWS Console → Billing Dashboard
2. Enable billing alerts
3. Set budget alert (e.g., $1/month)

## What Changed in Code

The backend now:
1. ✅ Checks if S3 is enabled (`USE_S3_STORAGE=true`)
2. ✅ Uploads to S3 instead of local filesystem
3. ✅ Returns S3 URLs for images
4. ✅ Deletes old images from S3 when replaced
5. ✅ Falls back to local storage if S3 not configured (dev mode)

Files modified:
- `mochila-backend/utils/s3Upload.js` (new)
- `mochila-backend/routes/user.js` (updated)
- `mochila-backend/index.js` (updated health check)
- `mochila-backend/env.example` (added S3 vars)

## Security Notes

⚠️ **Never commit AWS keys to git!**
⚠️ **Use `.env` for local, Vercel dashboard for production**
⚠️ **Consider creating a limited IAM policy for production**

## Need Help?

Check detailed guide: `AWS_S3_SETUP.md`
Test email: test-email.js
Check database: `npm run prisma:studio`

---

**That's it!** 🎉 Your images will now persist on S3 instead of being lost on Vercel's read-only filesystem.

