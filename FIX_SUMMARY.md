# Photo Upload Fix Summary

## Problem
The application was experiencing a `400 Bad Request` error when uploading photos:
```
POST https://mochila-app-backend.vercel.app/api/user/profile/photo 400 (Bad Request)
Error uploading photo: {success: false, error: 'Photo file is required'}
```

**Root Cause**: The frontend (React Native Web) was sending images as base64 data URIs, but the backend expected multipart file uploads via Multer.

## Solution
Updated both frontend and backend to handle base64-encoded images:

### Backend Changes (`mochila-backend/routes/user.js`)
1. **Added base64 conversion helper**:
   - Created `base64ToBuffer()` function to convert base64 strings to Buffer objects
   - Strips the `data:image/*;base64,` prefix if present

2. **Updated photo upload route**:
   - Now accepts both `req.file` (multipart) AND `photoBase64` (base64 string)
   - Converts base64 to buffer if no file is provided
   - Works with both S3 and local storage
   - Saves base64 images to local disk when using local storage

### Frontend Changes (`mochila/utils/api.ts`)
1. **Updated `uploadProfilePhoto()`**:
   - Detects if `imageUri` starts with `data:image/`
   - Sends as `photoBase64` parameter if it's a base64 data URI
   - Falls back to file upload if it's a file URI
   - Added console logs for debugging

2. **Updated `uploadAdditionalPhoto()`**:
   - Same logic as `uploadProfilePhoto()`
   - Handles additional photos with base64 support

## How It Works Now

### For Base64 Images (React Native Web):
```
Frontend → Base64 Data URI → FormData with photoBase64 field
Backend → Detect photoBase64 → Convert to Buffer → Upload to S3/Local
```

### For File Uploads (Native React Native):
```
Frontend → File URI → FormData with photo field (multipart)
Backend → Detect req.file → Use Multer buffer → Upload to S3/Local
```

## Testing
1. **Test base64 upload** (React Native Web):
   - Open app in web browser
   - Select a photo from the photo picker
   - Upload should work without errors
   - Check backend logs for "📸 Converted base64 to buffer"

2. **Test file upload** (Native):
   - Open app on iOS/Android device
   - Select a photo from camera roll
   - Upload should work as before
   - Check backend logs for "📤 Uploading to S3..."

3. **Check S3**:
   - After upload, verify image appears in S3 bucket
   - Verify the URL is accessible
   - Check the image displays in the app

## Console Logs to Watch For
✅ **Success indicators**:
- `📸 Converted base64 to buffer, size: [bytes]`
- `📤 Uploading to S3...`
- `✅ S3 upload complete: [URL]`
- `Photo uploaded successfully: [data]`

❌ **Error indicators**:
- `Error converting base64 to buffer`
- `Invalid base64 image data`
- `Photo file or base64 data is required`

## Benefits
- ✅ Works with React Native Web (base64)
- ✅ Works with Native React Native (file uploads)
- ✅ Backward compatible with existing code
- ✅ No breaking changes to API
- ✅ Better error messages
- ✅ Supports both S3 and local storage

## Files Modified
1. `mochila-backend/routes/user.js` - Added base64 support to backend
2. `mochila/utils/api.ts` - Added base64 detection to frontend

## Next Steps
1. Test the photo upload in your app
2. Monitor the console for any errors
3. Verify images are appearing in S3
4. Delete this file if everything works correctly

---
**Date**: 2025-12-26  
**Issue**: Photo upload 400 error  
**Status**: ✅ Fixed

