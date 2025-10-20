# ⚡ Quick Start - After Fixes

## ✅ Both errors are FIXED!
- pdf-parse test file error ✅
- Circular dependency error ✅

### Start Backend (Terminal 1)

```bash
cd backend
node server.js
```

**Expected output**:
```
Server is running on http://localhost:3000
```

### Start Frontend (Terminal 2)

```bash
cd frontend
npm install    # First time only
npm run dev
```

**Opens**: http://localhost:5173

### Optional: Add DeepSeek API Key

Edit `backend/.env`:
```env
DEEPSEEK_API_KEY=sk-your-actual-key-here
```

Without it: Server starts, but chat won't work  
With it: Full RAG functionality ✅

---

## That's It! 🚀

The application is ready to use. See:
- `FIX_SUMMARY.md` - What was fixed and why
- `WORKING_EXAMPLE.md` - How to use the app
- `README.md` - Full documentation

