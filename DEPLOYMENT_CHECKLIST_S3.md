# Vercel Deployment Checklist - AWS S3 Integration

Use this checklist to ensure your AWS S3 integration is properly configured for Vercel deployment.

## Pre-Deployment Checklist

### ✅ AWS S3 Setup
- [ ] AWS account created
- [ ] S3 bucket created (e.g., `mochila-app-images`)
- [ ] Bucket region selected (e.g., `ap-northeast-1`)
- [ ] Bucket policy configured for public read access
- [ ] CORS configuration added to bucket
- [ ] IAM user created with S3 permissions
- [ ] Access keys generated and saved securely

### ✅ Code Updates
- [ ] AWS SDK installed (`@aws-sdk/client-s3`, `@aws-sdk/lib-storage`)
- [ ] `utils/s3Upload.js` created
- [ ] `routes/user.js` updated to use S3
- [ ] `index.js` updated with S3 health check
- [ ] `env.example` updated with S3 variables

### ✅ Local Testing
- [ ] `.env` file updated with AWS credentials
- [ ] `USE_S3_STORAGE=true` set in `.env`
- [ ] Backend starts without errors: `npm start`
- [ ] Health check shows S3 enabled: http://localhost:3000/health
- [ ] S3 test passes: `npm run test-s3`
- [ ] Image upload tested from mobile app
- [ ] Image visible in S3 bucket
- [ ] Image loads in app

## Vercel Deployment Steps

### 1. Add Environment Variables to Vercel

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add these variables:

#### AWS S3 Configuration
```
USE_S3_STORAGE = true
AWS_ACCESS_KEY_ID = AKIA...your-access-key...
AWS_SECRET_ACCESS_KEY = ...your-secret-access-key...
AWS_S3_BUCKET = mochila-app-images
AWS_REGION = ap-northeast-1
```

#### Existing Variables (keep these)
```
POSTGRES_PRISMA_URL = your-database-url
POSTGRES_URL_NON_POOLING = your-non-pooling-url
API_BASE_URL = https://your-backend.vercel.app
EMAIL_SERVICE = gmail
EMAIL_USER = your-email@gmail.com
EMAIL_PASSWORD = your-app-password
EMAIL_FROM = your-email@gmail.com
FRONTEND_URL = *
NODE_ENV = production
```

**Important:**
- ⚠️ Set environment scope to "Production", "Preview", and "Development"
- ⚠️ Never commit AWS credentials to git
- ⚠️ Use different buckets for production/staging if needed

### 2. Deploy to Vercel

#### Option A: Deploy via CLI
```bash
cd mochila-backend
vercel --prod
```

#### Option B: Deploy via Git Push
```bash
git add .
git commit -m "Add AWS S3 integration for image uploads"
git push
```

### 3. Verify Deployment

#### Check Health Endpoint
Visit: `https://your-backend.vercel.app/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-25T...",
  "storage": {
    "s3Enabled": true,
    "s3Configured": true,
    "bucket": "mochila-app-images",
    "region": "ap-northeast-1"
  },
  "email": {
    "service": "gmail"
  }
}
```

#### Verify S3 Status
- [ ] `s3Enabled` is `true`
- [ ] `s3Configured` is `true`
- [ ] `bucket` shows your bucket name
- [ ] `region` shows your AWS region

### 4. Test Image Upload from App

1. Open your mobile app
2. Navigate to profile photo upload
3. Select and upload an image
4. Check response includes S3 URL (not `/uploads/...`)
5. Verify image in AWS S3 Console
6. Confirm image displays in app

## Troubleshooting Vercel Deployment

### Issue: S3 shows as disabled in health check

**Solution:**
1. Check environment variables in Vercel dashboard
2. Ensure `USE_S3_STORAGE=true` is set
3. Verify all AWS variables are present
4. Redeploy: `vercel --prod --force`

### Issue: "Access Denied" errors

**Solution:**
1. Verify AWS credentials are correct in Vercel
2. Check IAM user has S3 permissions
3. Confirm bucket policy allows public read
4. Test credentials locally first

### Issue: Images upload but don't load

**Solution:**
1. Check bucket policy for public read access
2. Verify CORS configuration
3. Test S3 URL directly in browser
4. Check region in `.env` matches bucket region

### Issue: "Bucket not found" error

**Solution:**
1. Verify bucket name in Vercel env vars
2. Check bucket exists in correct AWS region
3. Ensure no typos in bucket name

## Post-Deployment Verification

### Automated Checks
- [ ] Health endpoint returns 200 OK
- [ ] S3 enabled: `true`
- [ ] S3 configured: `true`
- [ ] No errors in Vercel logs

### Manual Checks
- [ ] Upload test image from app
- [ ] Image appears in S3 bucket
- [ ] Image loads in app
- [ ] Old images are replaced (not accumulated)
- [ ] Multiple images can be uploaded

### AWS Monitoring
- [ ] Check S3 bucket contains uploaded images
- [ ] Verify folder structure: `profile-photos/`
- [ ] Monitor AWS billing (should be free tier)
- [ ] Set up billing alerts

## Security Checklist

- [ ] AWS credentials stored only in Vercel dashboard
- [ ] No credentials in git repository
- [ ] `.env` file in `.gitignore`
- [ ] Bucket allows only necessary public access
- [ ] IAM user has minimal required permissions
- [ ] Enable S3 versioning for backup (optional)
- [ ] Consider CloudFront for CDN (optional)

## Rollback Plan

If S3 integration causes issues:

1. **Quick Fix:** Disable S3 temporarily
   ```
   # In Vercel dashboard:
   USE_S3_STORAGE = false
   ```
   - Redeploy
   - App will fallback to local storage (images lost on restart)

2. **Full Rollback:**
   ```bash
   git revert HEAD
   git push
   ```

## Performance Optimization (Optional)

### Enable CloudFront CDN
1. Create CloudFront distribution
2. Set S3 bucket as origin
3. Update code to use CloudFront URLs
4. Faster image delivery worldwide

### Image Optimization
1. Compress images before upload
2. Generate thumbnails
3. Use WebP format
4. Implement lazy loading

### Cost Optimization
1. Enable S3 lifecycle rules
2. Move old images to Glacier
3. Clean up orphaned images
4. Monitor storage usage

## Maintenance

### Regular Tasks
- [ ] Monitor S3 storage usage
- [ ] Review AWS billing monthly
- [ ] Check for orphaned images
- [ ] Update AWS SDK dependencies
- [ ] Rotate access keys periodically

### Backup Strategy
- [ ] Enable S3 versioning
- [ ] Set up cross-region replication
- [ ] Export user data regularly
- [ ] Document recovery procedures

## Support Resources

- AWS S3 Documentation: https://docs.aws.amazon.com/s3/
- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- Troubleshooting Guide: See `AWS_S3_SETUP.md`
- Test Script: `npm run test-s3`

## Environment Variables Reference

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `USE_S3_STORAGE` | Yes | `true` | Enable S3 storage |
| `AWS_ACCESS_KEY_ID` | Yes | `AKIA...` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Yes | `...` | AWS secret key |
| `AWS_S3_BUCKET` | Yes | `mochila-app-images` | S3 bucket name |
| `AWS_REGION` | Yes | `ap-northeast-1` | AWS region |
| `API_BASE_URL` | Yes | `https://...vercel.app` | Backend URL |
| `POSTGRES_PRISMA_URL` | Yes | `postgres://...` | Database URL |
| `EMAIL_SERVICE` | No | `gmail` | Email provider |
| `FRONTEND_URL` | No | `*` | CORS origin |

---

**Last Updated:** 2025-12-25

**Status:** ✅ Ready for production deployment

🎉 Once all checkboxes are complete, your AWS S3 integration is ready!

