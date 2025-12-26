# Postman Testing Guide for Photo Upload API

## 🎯 Quick Start

### Prerequisites
1. ✅ Backend server running (locally or on Vercel)
2. ✅ Postman installed ([Download here](https://www.postman.com/downloads/))
3. ✅ Test image file ready

---

## 📍 Endpoints to Test

### 1. Health Check (Test Server Connection)

**Method:** `GET`  
**URL:** `http://localhost:3000/health`  
or `https://mochila-app-backend.vercel.app/health`

**No body required**

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-26T01:00:00.000Z",
  "storage": {
    "s3Enabled": true,
    "s3Configured": true,
    "bucket": "mochila-app-images",
    "region": "ap-northeast-1"
  },
  "email": {
    "service": "console (testing mode)"
  }
}
```

---

## 📸 Main Test: Photo Upload

### Option 1: Upload with Multipart File (Recommended)

**Method:** `POST`  
**URL:** `http://localhost:3000/api/user/profile/photo`  
or `https://mochila-app-backend.vercel.app/api/user/profile/photo`

**Headers:**
- `Accept: application/json`

**Body Type:** `form-data`

**Body Parameters:**

| Key | Type | Value | Description |
|-----|------|-------|-------------|
| `photo` | File | *Select your image file* | **Required** - JPEG, PNG, GIF, WebP (max 10MB) |
| `email` | Text | `test@example.com` | **Required** - User email |
| `filter` | Text | `cool` | *Optional* - Filter name |
| `isAdditional` | Text | `false` | *Optional* - Set to `true` for additional photos |

**Step-by-Step in Postman:**
1. Select `POST` method
2. Enter URL: `http://localhost:3000/api/user/profile/photo`
3. Go to **"Body"** tab
4. Select **"form-data"**
5. Add parameters:
   - Key: `photo`, Type: **File** (change dropdown from Text to File)
   - Click "Select Files" and choose an image
   - Key: `email`, Type: Text, Value: `test@example.com`
   - Key: `filter`, Type: Text, Value: `cool`
6. Click **"Send"**

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Profile photo uploaded successfully",
  "photoUrl": "https://mochila-app-images.s3.ap-northeast-1.amazonaws.com/profile-photos/photo-1703552400000-123456789.jpg",
  "storageType": "s3",
  "user": {
    "id": "user-123",
    "email": "test@example.com",
    "profilePhotoUrl": "https://mochila-app-images.s3.ap-northeast-1.amazonaws.com/profile-photos/photo-1703552400000-123456789.jpg",
    "photos": [
      "https://mochila-app-images.s3.ap-northeast-1.amazonaws.com/profile-photos/photo-1703552400000-123456789.jpg"
    ],
    "profilePhotoFilter": "cool"
  }
}
```

---

### Option 2: Upload with Base64 (Alternative)

**Method:** `POST`  
**URL:** `http://localhost:3000/api/user/profile/photo`

**Headers:**
- `Content-Type: multipart/form-data`
- `Accept: application/json`

**Body Type:** `form-data`

**Body Parameters:**

| Key | Type | Value |
|-----|------|-------|
| `photoBase64` | Text | `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABg...` |
| `email` | Text | `test@example.com` |
| `filter` | Text | `cool` |

**How to get Base64:**
1. Go to https://www.base64-image.de/
2. Upload your image
3. Copy the full data URI (starts with `data:image/jpeg;base64,`)
4. Paste into `photoBase64` field

---

## 🧪 Test Scenarios

### Test 1: First User Profile Photo
```
POST /api/user/profile/photo
Body:
  - photo: [your-image.jpg]
  - email: newuser@example.com
  - filter: original

Expected: Creates new user with profile photo
```

### Test 2: Update Existing Profile Photo
```
POST /api/user/profile/photo
Body:
  - photo: [new-image.jpg]
  - email: newuser@example.com
  - filter: warm

Expected: Replaces old photo, deletes old file from S3
```

### Test 3: Add Additional Photo
```
POST /api/user/profile/photo
Body:
  - photo: [additional-image.jpg]
  - email: newuser@example.com
  - isAdditional: true

Expected: Adds to photos array, keeps main profile photo
```

### Test 4: Error - Missing Email
```
POST /api/user/profile/photo
Body:
  - photo: [image.jpg]

Expected: 400 Bad Request
Response: { "success": false, "error": "Email is required" }
```

### Test 5: Error - Missing Photo
```
POST /api/user/profile/photo
Body:
  - email: test@example.com

Expected: 400 Bad Request
Response: { "success": false, "error": "Photo file or base64 data is required" }
```

### Test 6: Error - Invalid File Type
```
POST /api/user/profile/photo
Body:
  - photo: [document.pdf]
  - email: test@example.com

Expected: 400 Bad Request
Response: { "success": false, "error": "Only image files are allowed..." }
```

---

## 🔍 Debugging Tips

### Check Backend Logs

When you send a request, watch your backend terminal for these logs:

```
📋 Request details:
- Has req.file: true
- Has photoBase64: false
- photoBase64 length: 0
- req.body keys: [ 'email', 'filter' ]
- Content-Type: multipart/form-data; boundary=...

📤 Uploading to S3...
✅ S3 upload complete: https://mochila-app-images.s3.ap-northeast-1.amazonaws.com/...
```

### Common Issues

#### 1. "Cannot find module '@aws-sdk/client-s3'"
**Solution:** Run `npm install` in backend folder

#### 2. "Photo file or base64 data is required"
**Solution:** Make sure:
- Key name is exactly `photo` (lowercase)
- Type is set to **File** (not Text)
- Image file is selected

#### 3. "403 Forbidden" or "Access Denied" from S3
**Solution:** Check environment variables in Vercel:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` matches your bucket region
- `AWS_S3_BUCKET` matches your bucket name

#### 4. "404 Not Found"
**Solution:** Make sure URL path includes `/api/` prefix:
- ✅ `http://localhost:3000/api/user/profile/photo`
- ❌ `http://localhost:3000/user/profile/photo`

---

## 📊 Testing Checklist

- [ ] Health check returns `"status": "ok"`
- [ ] S3 configuration shows in health check
- [ ] Upload profile photo succeeds
- [ ] Photo URL is accessible (visit in browser)
- [ ] Photo appears in S3 bucket console
- [ ] Update profile photo (old one deleted)
- [ ] Add additional photo
- [ ] Error handling works (missing fields)
- [ ] File size limit works (try >10MB)
- [ ] File type validation works (try .txt file)

---

## 🚀 Advanced: Import into Postman

Save this as a **Postman Collection**:

```json
{
  "info": {
    "name": "Mochila Backend API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/health",
          "host": ["{{baseUrl}}"],
          "path": ["health"]
        }
      }
    },
    {
      "name": "Upload Profile Photo",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Accept",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "photo",
              "type": "file",
              "src": []
            },
            {
              "key": "email",
              "value": "test@example.com",
              "type": "text"
            },
            {
              "key": "filter",
              "value": "cool",
              "type": "text"
            }
          ]
        },
        "url": {
          "raw": "{{baseUrl}}/api/user/profile/photo",
          "host": ["{{baseUrl}}"],
          "path": ["api", "user", "profile", "photo"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    }
  ]
}
```

**To import:**
1. Copy the JSON above
2. In Postman: **Import** → **Raw text** → Paste → **Import**
3. Set `baseUrl` variable:
   - For local: `http://localhost:3000`
   - For Vercel: `https://mochila-app-backend.vercel.app`

---

## 🎬 Next Steps

After successful Postman testing:
1. ✅ Test with your React Native frontend
2. ✅ Verify images appear in AWS S3 Console
3. ✅ Check image URLs are publicly accessible
4. ✅ Deploy to Vercel with correct environment variables

---

Need help? Check the backend logs for detailed error messages!

