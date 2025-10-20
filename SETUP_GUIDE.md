# Quick Setup Guide

Follow these steps to get the RAG application running:

## Step 1: Install Backend

```bash
cd backend
npm install
```

## Step 2: Configure Environment

Edit `backend/.env` and add your DeepSeek API key:

```env
PORT=3000
DEEPSEEK_API_KEY=sk-your-actual-key-here
DEEPSEEK_API_BASE=https://api.deepseek.com/v1
CHROMA_PATH=./chroma_db
```

## Step 3: Start Backend

```bash
cd backend
npm start
```

Keep this terminal running. You should see:
```
Server is running on http://localhost:3000
ChromaDB collection initialized successfully
```

## Step 4: Install Frontend (New Terminal)

```bash
cd frontend
npm install
```

## Step 5: Start Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

## Step 6: Open Browser

Navigate to `http://localhost:5173` and you should see the RAG application!

## Step 7: Test the Application

### Upload a Test Document

1. Create a file called `test_document.txt` with this content:

```txt
Tesla Inc. is an American multinational automotive and clean energy company.
Founded in 2003, Tesla is headquartered in Austin, Texas.
The company was founded by Martin Eberhard and Marc Tarpenning.
Elon Musk became chairman in 2004 and later CEO.
Tesla's product line includes electric vehicles like Model S, Model 3, Model X, and Model Y.
The company also produces battery energy storage systems and solar panels.
In 2021, Tesla became the world's most valuable car manufacturer.
Tesla operates Gigafactories in several locations including Nevada, Texas, Berlin, and Shanghai.
```

2. Go to **Knowledge Base** tab
3. Click "Select File" and upload `test_document.txt`
4. Wait for success message

### Chat with Your Document

Go to **Chat** tab and try these questions:

- "When was Tesla founded?"
- "Where is Tesla headquartered?"
- "What products does Tesla make?"
- "Who is the CEO of Tesla?"
- "Where are Tesla's factories located?"

You should get accurate answers with source citations!

## Troubleshooting

### Error: "DEEPSEEK_API_KEY not set"
- Make sure you created `backend/.env` file
- Verify the API key is correct

### Error: "Port 3000 already in use"
- Stop any other processes using port 3000
- Or change PORT in `.env` file

### Frontend shows "Disconnected"
- Make sure backend is running
- Check that backend is on port 3000
- Look for errors in backend terminal

### File upload fails
- Check backend terminal for error messages
- Verify file type is .txt, .pdf, or .docx
- Make sure backend/uploads/ directory exists

## Next Steps

Once everything is working:

1. Upload your own documents
2. Customize the UI in `frontend/src/`
3. Adjust settings in the Settings tab
4. Modify chunk size, retrieval count, etc.

Enjoy your RAG application! 🚀

