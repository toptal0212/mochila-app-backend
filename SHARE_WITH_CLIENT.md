# Quick Guide: Sharing Backend with Client via ngrok

## Quick Start (3 Steps)

### 1. Start Backend
```bash
cd mochila-backend
npm run dev
```
✅ Server running on `http://localhost:3000`

### 2. Start ngrok
```bash
ngrok http 3000
```
✅ Copy the **HTTPS URL** (e.g., `https://abc123.ngrok.io`)

### 3. Share with Client
Send them:
- **API Base URL:** `https://abc123.ngrok.io`
- **Example endpoint:** `https://abc123.ngrok.io/api/user/profile`

---

## For Stable URL (Recommended)

### Setup Once:
1. Sign up at https://dashboard.ngrok.com (free)
2. Get authtoken from dashboard
3. Run: `ngrok config add-authtoken YOUR_TOKEN`
4. Reserve a free domain in dashboard

### Then Use:
```bash
ngrok http 3000 --domain=your-domain.ngrok-free.app
```
✅ URL stays the same every time!

---

## Monitor Requests

While ngrok is running, open: **http://localhost:4040**

See all client requests in real-time!

---

## Important Notes

- ⚠️ Keep both backend AND ngrok running
- ⚠️ URL changes if you restart ngrok (unless using custom domain)
- ⚠️ Anyone with the URL can access - only share with trusted clients
- ✅ For production, use Vercel deployment URL instead

---

## Common API Endpoints to Share

- `GET /api/user/profile/:email` - Get user profile
- `POST /api/user/profile` - Create/update profile
- `POST /api/user/profile/photo` - Upload photo
- `GET /api/members` - Get members list
- `GET /api/members/:memberId` - Get member details
- `POST /api/members/likes` - Add a like

Full list: See `README.md` → API Endpoints section

