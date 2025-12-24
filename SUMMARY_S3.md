# AWS S3 Integration - Summary

## What Was Done

Your Mochila backend has been successfully updated to support AWS S3 for persistent image storage on Vercel!

### Files Created

1. **`AWS_S3_SETUP.md`** - Comprehensive setup guide with screenshots and troubleshooting
2. **`QUICKSTART_S3.md`** - Quick 15-minute setup guide
3. **`DEPLOYMENT_CHECKLIST_S3.md`** - Step-by-step deployment checklist for Vercel
4. **`utils/s3Upload.js`** - AWS S3 upload/delete utilities
5. **`test-s3.js`** - Automated S3 configuration test script
6. **`SUMMARY_S3.md`** - This file

### Files Modified

1. **`routes/user.js`** - Updated to support both S3 and local storage
2. **`index.js`** - Added S3 status to health check endpoint
3. **`package.json`** - Added `test-s3` script and AWS SDK dependencies
4. **`env.example`** - Added AWS S3 environment variables
5. **`README.md`** - Updated with S3 documentation

### New Dependencies

- `@aws-sdk/client-s3` - AWS S3 client
- `@aws-sdk/lib-storage` - Multi-part upload support

## Why This Was Needed

**Problem:** Vercel has a read-only filesystem. Images uploaded to the `/uploads` directory are immediately lost when the serverless function completes.

**Solution:** AWS S3 provides persistent, scalable cloud storage for images with public URLs.

## How It Works

### Automatic Storage Selection

The backend automatically chooses storage based on configuration:

```javascript
if (USE_S3_STORAGE === 'true' && AWS credentials present) {
  // Upload to S3 → Returns S3 URL
} else {
  // Upload to local filesystem (dev mode only)
}
```

### Upload Flow

1. Mobile app uploads image via `POST /api/user/profile/photo`
2. Backend receives image in memory (multer)
3. Backend uploads to S3 with unique filename
4. S3 returns public URL: `https://mochila-app-images.s3.ap-northeast-1.amazonaws.com/profile-photos/...`
5. Backend saves URL to database
6. Backend returns URL to app
7. App displays image from S3

### Old Image Handling

When replacing profile photo:
- Old image is automatically deleted from S3
- Prevents storage accumulation
- Keeps S3 costs low

## Next Steps

### 1. AWS Setup (Required)

Follow the quick setup guide:
```bash
# See QUICKSTART_S3.md for step-by-step instructions
```

Key steps:
- ✅ Create AWS account
- ✅ Create S3 bucket (`mochila-app-images`)
- ✅ Configure bucket policy (public read)
- ✅ Create IAM user with S3 permissions
- ✅ Generate access keys

### 2. Local Testing

```bash
# Add AWS credentials to .env
USE_S3_STORAGE=true
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=mochila-app-images
AWS_REGION=ap-northeast-1

# Test S3 configuration
npm run test-s3

# Start backend
npm run dev

# Check health endpoint
curl http://localhost:3000/health
```

Expected output:
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

### 3. Vercel Deployment

Add environment variables in Vercel Dashboard:
```
USE_S3_STORAGE = true
AWS_ACCESS_KEY_ID = AKIA...
AWS_SECRET_ACCESS_KEY = ...
AWS_S3_BUCKET = mochila-app-images
AWS_REGION = ap-northeast-1
```

Deploy:
```bash
vercel --prod
```

### 4. Verify from Mobile App

1. Open your app
2. Upload a profile photo
3. Check S3 bucket - image should appear
4. Image should display in app
5. Upload again - old image should be replaced

## Configuration Reference

### Environment Variables

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `USE_S3_STORAGE` | Yes | `true` | Enable S3 storage |
| `AWS_ACCESS_KEY_ID` | Yes | `AKIA...` | AWS access key from IAM |
| `AWS_SECRET_ACCESS_KEY` | Yes | `...` | AWS secret key from IAM |
| `AWS_S3_BUCKET` | Yes | `mochila-app-images` | S3 bucket name |
| `AWS_REGION` | Yes | `ap-northeast-1` | AWS region (Tokyo) |

### Recommended AWS Regions

- **Japan:** `ap-northeast-1` (Tokyo)
- **US East:** `us-east-1` (N. Virginia) - Lowest cost
- **US West:** `us-west-2` (Oregon)
- **Europe:** `eu-west-1` (Ireland)

## Testing Commands

```bash
# Test S3 configuration
npm run test-s3

# Test email (existing)
npm run test-email

# Check database
npm run prisma:studio

# View backend logs (Vercel)
vercel logs
```

## API Changes

### Image Upload Response

**Before (local storage - doesn't work on Vercel):**
```json
{
  "success": true,
  "photoUrl": "https://backend.vercel.app/uploads/photo-123.jpg",
  "storageType": "local"
}
```

**After (S3 storage - works everywhere):**
```json
{
  "success": true,
  "photoUrl": "https://mochila-app-images.s3.ap-northeast-1.amazonaws.com/profile-photos/photo-123.jpg",
  "storageType": "s3"
}
```

**Frontend Compatibility:** No changes needed! The API returns absolute URLs in both cases.

## Cost Estimation

### AWS Free Tier (12 months)
- ✅ 5 GB storage
- ✅ 20,000 GET requests/month
- ✅ 2,000 PUT requests/month

### After Free Tier
- **Storage:** ~$0.023/GB/month
- **GET requests:** $0.0004 per 1,000
- **PUT requests:** $0.005 per 1,000

### Example Cost (1,000 users)
- Users: 1,000
- Photos per user: 5
- Average size: 2 MB
- **Total storage:** 10 GB = **~$0.23/month**
- **Monthly uploads:** 5,000 = **~$0.025**
- **Monthly views:** 100,000 = **~$0.04**
- **Total:** **~$0.30/month**

**Conclusion:** Very affordable! 💰

## Security Best Practices

### ✅ DO:
- Store credentials in environment variables
- Use IAM user with limited S3 permissions
- Enable S3 versioning for backup
- Set up billing alerts in AWS
- Rotate access keys periodically

### ❌ DON'T:
- Commit AWS keys to git
- Use root AWS account credentials
- Allow public write access to bucket
- Store unencrypted credentials

## Troubleshooting

### S3 Not Enabled

**Symptoms:**
- Health check shows `s3Enabled: false`
- Images saved locally (lost on Vercel)

**Solution:**
```bash
# Check .env file
USE_S3_STORAGE=true  # Must be exactly "true"
```

### Access Denied

**Symptoms:**
- Upload fails with "Access Denied"
- 403 errors in logs

**Solution:**
1. Check bucket policy allows public read
2. Verify IAM user has S3 permissions
3. Confirm access keys are correct
4. Try uploading directly from AWS Console

### Images Don't Load

**Symptoms:**
- Upload succeeds
- Image URL returned
- Image doesn't display in app

**Solution:**
1. Test URL directly in browser
2. Check bucket policy (public read)
3. Verify CORS configuration
4. Check region in URL matches bucket region

### "Bucket Not Found"

**Symptoms:**
- Upload fails with bucket not found
- Can't connect to S3

**Solution:**
1. Verify bucket name (no typos)
2. Check region matches bucket location
3. Ensure bucket exists in AWS Console
4. Try `aws s3 ls` to list buckets

## Rollback Plan

If S3 causes issues, quickly disable it:

```bash
# In Vercel Dashboard:
USE_S3_STORAGE = false

# Or in .env for local:
USE_S3_STORAGE=false
```

**Note:** Images will use local storage (lost on Vercel), but app will still work.

## Future Enhancements

### 1. CloudFront CDN (Recommended)
- Faster image delivery worldwide
- Lower S3 costs
- HTTPS by default
- Easy AWS Console setup

### 2. Image Optimization
- Resize images before upload
- Generate thumbnails automatically
- Use WebP format
- Compress images

### 3. Advanced Features
- S3 lifecycle rules (archive old images)
- Image moderation (AWS Rekognition)
- Watermarking
- Backup to multiple regions

### 4. Performance
- Pre-signed URLs for direct upload
- Client-side compression
- Lazy loading
- Progressive image loading

## Documentation Index

- 📘 **[QUICKSTART_S3.md](./QUICKSTART_S3.md)** - Quick setup (15 min)
- 📗 **[AWS_S3_SETUP.md](./AWS_S3_SETUP.md)** - Detailed guide
- 📙 **[DEPLOYMENT_CHECKLIST_S3.md](./DEPLOYMENT_CHECKLIST_S3.md)** - Vercel deployment
- 📕 **[README.md](./README.md)** - General backend documentation

## Support

### Test Scripts
```bash
npm run test-s3       # Test S3 configuration
npm run test-email    # Test email service
npm run prisma:studio # View database
```

### Health Check
```bash
# Local
curl http://localhost:3000/health

# Production
curl https://your-backend.vercel.app/health
```

### AWS Resources
- S3 Console: https://s3.console.aws.amazon.com/
- IAM Console: https://console.aws.amazon.com/iam/
- Billing Dashboard: https://console.aws.amazon.com/billing/

### Vercel Resources
- Dashboard: https://vercel.com/dashboard
- Logs: `vercel logs`
- Environment Variables: Project → Settings → Environment Variables

## Success Checklist

- [ ] AWS account created
- [ ] S3 bucket created and configured
- [ ] IAM user created with access keys
- [ ] Environment variables added locally
- [ ] `npm run test-s3` passes
- [ ] Local upload tested
- [ ] Environment variables added to Vercel
- [ ] Deployed to Vercel
- [ ] Production health check shows S3 enabled
- [ ] Production upload tested from app
- [ ] Images visible in S3 bucket
- [ ] Images display in app

## Conclusion

Your backend is now ready for production deployment on Vercel with persistent image storage! 🎉

**What You Get:**
- ✅ Images persist forever
- ✅ Scalable storage
- ✅ Fast image delivery
- ✅ Low cost (~$0.30/month for 1,000 users)
- ✅ Professional infrastructure
- ✅ Easy to maintain

**Next Steps:**
1. Follow [QUICKSTART_S3.md](./QUICKSTART_S3.md) to set up AWS
2. Test locally with `npm run test-s3`
3. Deploy to Vercel
4. Ship your app! 🚀

---

**Questions?** Check the troubleshooting sections in the documentation or test with the provided scripts.

**Last Updated:** 2025-12-25

