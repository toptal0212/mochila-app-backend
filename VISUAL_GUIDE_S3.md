# Visual Setup Guide - AWS S3 for Mochila

## 📋 Complete Setup in 6 Steps

```
┌─────────────────────────────────────────────────────────────┐
│                     AWS S3 Setup Flow                       │
└─────────────────────────────────────────────────────────────┘

Step 1: AWS Account
     │
     ├── Sign up at aws.amazon.com
     └── Requires credit card (but free tier available)

Step 2: Create S3 Bucket
     │
     ├── Bucket name: mochila-app-images
     ├── Region: ap-northeast-1 (Tokyo)
     └── Uncheck "Block all public access" ⚠️

Step 3: Configure Bucket
     │
     ├── Bucket Policy (Public Read)
     └── CORS Configuration

Step 4: Create IAM User
     │
     ├── Name: mochila-backend-uploader
     ├── Permission: AmazonS3FullAccess
     └── Create Access Keys

Step 5: Configure Backend
     │
     ├── Add AWS credentials to .env
     ├── Set USE_S3_STORAGE=true
     └── Test: npm run test-s3

Step 6: Deploy to Vercel
     │
     ├── Add env vars to Vercel Dashboard
     ├── Deploy: vercel --prod
     └── Test upload from mobile app

✅ Done! Images now persist on S3
```

## 🗺️ Architecture Diagram

```
┌─────────────────┐
│   Mobile App    │
│   (Expo/RN)     │
└────────┬────────┘
         │ POST /api/user/profile/photo
         │ (multipart/form-data)
         │
         ▼
┌─────────────────────────────────────┐
│    Vercel Backend (Node.js)         │
│  ┌───────────────────────────────┐  │
│  │  routes/user.js               │  │
│  │  - Receives image upload      │  │
│  │  - Validates file type        │  │
│  │  - Checks USE_S3_STORAGE      │  │
│  └───────────┬───────────────────┘  │
│              │                       │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │  utils/s3Upload.js            │  │
│  │  - uploadToS3()               │  │
│  │  - Uploads to AWS S3          │  │
│  │  - Returns public URL         │  │
│  └───────────┬───────────────────┘  │
└──────────────┼───────────────────────┘
               │ AWS SDK
               │
               ▼
┌──────────────────────────────────────┐
│         AWS S3 Bucket                │
│   (mochila-app-images)               │
│  ┌────────────────────────────────┐  │
│  │  profile-photos/               │  │
│  │  ├── photo-1234.jpg            │  │
│  │  ├── photo-5678.jpg            │  │
│  │  └── photo-9012.jpg            │  │
│  └────────────────────────────────┘  │
│                                      │
│  Public URL:                         │
│  https://mochila-app-images.s3.      │
│  ap-northeast-1.amazonaws.com/       │
│  profile-photos/photo-1234.jpg       │
└──────────────────────────────────────┘
               │
               │ HTTPS GET
               │
               ▼
┌─────────────────┐
│   Mobile App    │
│  Displays Image │
└─────────────────┘
```

## 🔄 Upload Flow Sequence

```
Mobile App         Backend (Vercel)       AWS S3         Database
    │                    │                  │               │
    │  1. Upload Image   │                  │               │
    │───────────────────>│                  │               │
    │                    │                  │               │
    │                    │  2. Check Config │               │
    │                    │  (S3 enabled?)   │               │
    │                    │                  │               │
    │                    │  3. Upload File  │               │
    │                    │─────────────────>│               │
    │                    │                  │               │
    │                    │  4. Return URL   │               │
    │                    │<─────────────────│               │
    │                    │                  │               │
    │                    │  5. Save URL to DB               │
    │                    │─────────────────────────────────>│
    │                    │                  │               │
    │  6. Return Success │                  │               │
    │<───────────────────│                  │               │
    │                    │                  │               │
    │  7. Display Image  │                  │               │
    │──────────────────────────────────────>│               │
    │                    │  (Direct GET)    │               │
    │<──────────────────────────────────────│               │
    │                    │                  │               │
```

## 📁 File Structure Changes

```
mochila-backend/
├── 📄 index.js                    [MODIFIED]
│   └── + S3 health check
│
├── 📂 routes/
│   └── 📄 user.js                 [MODIFIED]
│       ├── + S3 upload support
│       ├── + Automatic storage selection
│       └── + Old image deletion
│
├── 📂 utils/
│   ├── 📄 dataStore.js            [EXISTING]
│   └── 📄 s3Upload.js             [NEW] ⭐
│       ├── uploadToS3()
│       ├── deleteFromS3()
│       ├── isS3Enabled()
│       └── getS3Config()
│
├── 📂 Documentation (NEW)
│   ├── 📄 AWS_S3_SETUP.md         [NEW] ⭐
│   ├── 📄 QUICKSTART_S3.md        [NEW] ⭐
│   ├── 📄 DEPLOYMENT_CHECKLIST_S3.md [NEW] ⭐
│   ├── 📄 SUMMARY_S3.md           [NEW] ⭐
│   └── 📄 VISUAL_GUIDE_S3.md      [NEW] ⭐ (this file)
│
├── 📄 test-s3.js                  [NEW] ⭐
├── 📄 env.example                 [MODIFIED]
│   └── + AWS S3 variables
│
├── 📄 package.json                [MODIFIED]
│   ├── + @aws-sdk/client-s3
│   ├── + @aws-sdk/lib-storage
│   └── + test-s3 script
│
└── 📄 README.md                   [MODIFIED]
    └── + S3 documentation
```

## 🔧 Configuration Comparison

### Before (Local Storage - Doesn't Work on Vercel)

```env
# .env
PORT=3000
API_BASE_URL=http://localhost:3000
# Images stored in /uploads directory
# ❌ Lost on Vercel deployment
```

### After (S3 Storage - Works Everywhere)

```env
# .env
PORT=3000
API_BASE_URL=http://localhost:3000

# AWS S3 (NEW)
USE_S3_STORAGE=true
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=mochila-app-images
AWS_REGION=ap-northeast-1
# ✅ Images persist on S3
```

## 📊 Storage Comparison

```
┌─────────────────────────────────────────────────────────┐
│              Local Storage vs S3 Storage                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Local Storage (/uploads)      AWS S3                  │
│  ─────────────────────         ───────                 │
│                                                         │
│  ❌ Lost on Vercel              ✅ Persistent           │
│  ❌ Not scalable                ✅ Unlimited storage    │
│  ❌ No CDN                      ✅ CDN-ready            │
│  ❌ Single server               ✅ Global availability  │
│  ✅ Free                        ✅ Free tier (5GB)      │
│  ✅ Fast (local)                ✅ Fast (CDN)           │
│  ✅ Simple setup                ⚠️  Requires AWS setup │
│                                                         │
│  Use Case:                     Use Case:               │
│  • Local development           • Production (Vercel)   │
│  • Testing                     • Scalable apps         │
│                                • Mobile apps           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Quick Decision Tree

```
Need to deploy on Vercel?
    │
    ├── Yes → Use S3 (Required!)
    │         └── Follow QUICKSTART_S3.md
    │
    └── No → Running locally only?
              │
              ├── Yes → Use local storage
              │         └── Set USE_S3_STORAGE=false
              │
              └── No → Use S3 (Recommended)
                        └── Better for production
```

## 🧪 Testing Flow

```
1. Configure AWS
   └── Create bucket, IAM user, get keys

2. Add to .env
   └── USE_S3_STORAGE=true
       AWS_ACCESS_KEY_ID=...
       AWS_SECRET_ACCESS_KEY=...
       AWS_S3_BUCKET=mochila-app-images
       AWS_REGION=ap-northeast-1

3. Test Configuration
   └── $ npm run test-s3
       ✅ S3 Configuration looks good!
       📤 Uploading test image to S3...
       ✅ Upload successful!
       🌐 Testing public access...
       🗑️ Cleaning up test image...
       ✅ S3 Test Complete!

4. Start Backend
   └── $ npm start
       Server is running on port 3000
       Storage mode: S3 (mochila-app-images)
       S3 Region: ap-northeast-1

5. Check Health
   └── $ curl http://localhost:3000/health
       {
         "storage": {
           "s3Enabled": true,
           "s3Configured": true
         }
       }

6. Test Upload from App
   └── Upload photo from mobile app
       Check S3 bucket
       ✅ Image appears in profile-photos/

7. Deploy to Vercel
   └── Add env vars to Vercel
       $ vercel --prod
       Test from production URL
```

## 📈 Cost Breakdown

```
┌──────────────────────────────────────────────────────────┐
│              AWS S3 Pricing (First 12 months)            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Free Tier:                                              │
│  ├── 5 GB Storage                     = $0.00           │
│  ├── 20,000 GET Requests              = $0.00           │
│  └── 2,000 PUT Requests               = $0.00           │
│                                                          │
│  After Free Tier (pay as you go):                       │
│  ├── Storage: $0.023/GB/month                           │
│  ├── GET: $0.0004 per 1,000 requests                    │
│  └── PUT: $0.005 per 1,000 requests                     │
│                                                          │
├──────────────────────────────────────────────────────────┤
│              Example: 1,000 Active Users                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Assumptions:                                            │
│  • 1,000 users                                           │
│  • 5 photos per user                                     │
│  • 2 MB average photo size                               │
│  • 100 views per photo per month                         │
│                                                          │
│  Calculation:                                            │
│  ├── Storage: 10 GB × $0.023        = $0.23/month      │
│  ├── Uploads: 5,000 × $0.005/1000   = $0.025/month     │
│  └── Views: 500,000 × $0.0004/1000  = $0.20/month      │
│                                                          │
│  Total: ~$0.46/month                                     │
│                                                          │
└──────────────────────────────────────────────────────────┘

💡 Tip: Set up billing alerts at $1 to monitor usage
```

## 🚀 Deployment Checklist

```
Pre-Deployment:
  ☐ AWS account created
  ☐ S3 bucket created
  ☐ Bucket policy configured
  ☐ IAM user created
  ☐ Access keys generated
  ☐ npm run test-s3 passes locally

Vercel Setup:
  ☐ Add USE_S3_STORAGE=true
  ☐ Add AWS_ACCESS_KEY_ID
  ☐ Add AWS_SECRET_ACCESS_KEY
  ☐ Add AWS_S3_BUCKET
  ☐ Add AWS_REGION

Deploy:
  ☐ vercel --prod
  ☐ Check health endpoint
  ☐ Test upload from app
  ☐ Verify image in S3
  ☐ Verify image displays in app

Post-Deployment:
  ☐ Set up billing alerts
  ☐ Monitor S3 usage
  ☐ Document S3 URLs
  ☐ Train team on S3 access
```

## 🔒 Security Checklist

```
✅ Access Keys
   ├── Stored in .env (not in git)
   ├── Added to .gitignore
   ├── Only in Vercel env vars
   └── Rotate every 90 days

✅ S3 Bucket
   ├── Public read enabled (for images)
   ├── Public write disabled (security)
   ├── CORS configured (for uploads)
   └── Versioning enabled (backup)

✅ IAM User
   ├── Limited to S3 permissions only
   ├── No console access
   ├── Access keys only
   └── MFA enabled (optional)

❌ Never Do:
   ├── Commit keys to git
   ├── Use root AWS credentials
   ├── Share keys via email/Slack
   └── Allow public write to S3
```

## 📚 Documentation Index

```
📘 Getting Started
   ├── QUICKSTART_S3.md          (15 min setup)
   └── VISUAL_GUIDE_S3.md        (this file)

📗 Detailed Guides
   ├── AWS_S3_SETUP.md           (complete AWS setup)
   └── DEPLOYMENT_CHECKLIST_S3.md (Vercel deployment)

📙 Reference
   ├── README.md                  (general documentation)
   ├── SUMMARY_S3.md             (feature summary)
   └── env.example               (configuration template)

🧪 Testing
   ├── test-s3.js                (S3 configuration test)
   └── test-email.js             (email test)
```

## 🆘 Troubleshooting Quick Reference

```
Problem: S3 not enabled
├── Check: USE_S3_STORAGE=true in .env
├── Check: All AWS env vars present
└── Solution: Restart server

Problem: Access Denied
├── Check: Bucket policy (public read)
├── Check: IAM user permissions
└── Solution: Review AWS_S3_SETUP.md Step 1-2

Problem: Images don't load
├── Check: Bucket policy
├── Check: CORS configuration
└── Test: Open S3 URL in browser

Problem: Bucket not found
├── Check: Bucket name (no typos)
├── Check: AWS region matches
└── Verify: Bucket exists in AWS Console

Problem: High costs
├── Check: Billing dashboard
├── Review: S3 storage usage
└── Enable: Lifecycle rules
```

## ✨ What You Get

```
✅ Production-Ready
   ├── Images persist forever
   ├── Scalable storage
   ├── Fast delivery
   └── Professional infrastructure

✅ Cost-Effective
   ├── Free tier (12 months)
   ├── ~$0.46/month for 1,000 users
   ├── Pay only for what you use
   └── No upfront costs

✅ Developer-Friendly
   ├── Automatic storage selection
   ├── Easy configuration
   ├── Built-in testing
   └── Comprehensive docs

✅ Secure
   ├── IAM access control
   ├── HTTPS by default
   ├── Versioning support
   └── Encryption at rest
```

---

## 🎉 Ready to Start?

Follow these guides in order:

1. **[QUICKSTART_S3.md](./QUICKSTART_S3.md)** - Quick 15-minute setup
2. **[AWS_S3_SETUP.md](./AWS_S3_SETUP.md)** - Detailed AWS configuration
3. **[DEPLOYMENT_CHECKLIST_S3.md](./DEPLOYMENT_CHECKLIST_S3.md)** - Deploy to Vercel
4. **[SUMMARY_S3.md](./SUMMARY_S3.md)** - Feature overview

**Test first:** `npm run test-s3`

**Questions?** All documentation includes troubleshooting sections!

---

**Last Updated:** 2025-12-25
**Status:** ✅ Ready for production

