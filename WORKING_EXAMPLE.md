# Working Example - Complete Walkthrough

This guide demonstrates the complete RAG workflow with a real example.

## Prerequisites

Make sure you've completed the setup:
- Backend running on http://localhost:3000
- Frontend running on http://localhost:5173
- DeepSeek API key configured in `backend/.env`

## Example Scenario: Company Knowledge Base

We'll create a company knowledge base and query it with natural language.

---

## Step 1: Upload Documents

### Document 1: Company Information

**File**: `company_info.txt` (provided in `example_documents/`)

Navigate to **Knowledge Base** tab and upload `company_info.txt`.

**What happens behind the scenes:**

1. Frontend sends file to `POST /api/ingest`
2. Backend extracts text (5,420 characters)
3. Text is chunked into 12 pieces of ~500 words each
4. Each chunk gets an embedding vector (384 dimensions)
5. Chunks stored in ChromaDB with metadata:
   ```json
   {
     "fileName": "company_info.txt",
     "fileId": "uuid-abc-123",
     "chunkIndex": 0,
     "totalChunks": 12,
     "uploadDate": "2025-10-20T10:30:00.000Z"
   }
   ```

**Expected Result**: ✓ "Successfully uploaded company_info.txt (12 chunks)"

---

### Document 2: Product Manual

**File**: `product_manual.txt` (provided in `example_documents/`)

Upload `product_manual.txt` the same way.

**Expected Result**: ✓ "Successfully uploaded product_manual.txt (15 chunks)"

Now you have 2 files with 27 total chunks in your knowledge base.

---

## Step 2: Chat with Your Documents

Go to the **Chat** tab. Let's ask some questions!

### Question 1: Basic Fact Retrieval

**User**: "When was TechFlow Solutions founded?"

**What happens:**

1. Frontend sends to `POST /api/chat`
2. Backend generates embedding for the question
3. ChromaDB searches for similar chunks using cosine similarity
4. Top 5 most relevant chunks retrieved:
   - company_info.txt, chunk 0 (relevance: 0.92)
   - company_info.txt, chunk 1 (relevance: 0.78)
   - ...
5. Context injected into DeepSeek prompt:
   ```
   System: Use this context to answer questions.
   Context: "TechFlow Solutions was founded in 2010 by Sarah Chen..."
   User: When was TechFlow Solutions founded?
   ```
6. DeepSeek generates response
7. Response returned with source citations

**Expected Response**:
```
TechFlow Solutions was founded in 2010 by Sarah Chen and Michael Rodriguez 
in Seattle, Washington.

Sources:
📄 company_info.txt (chunk 0)
"TechFlow Solutions was founded in 2010 by Sarah Chen and Michael Rodriguez 
in Seattle, Washington. The company started as a small consulting firm..."
Relevance: 92.0%
```

---

### Question 2: Multi-Document Query

**User**: "What are the system requirements for FlowSync?"

**What happens:**

This question relates to the product manual, not the company info. The RAG system:

1. Searches ALL chunks across ALL documents
2. Finds relevant chunks from `product_manual.txt`
3. Returns answer with citations from correct document

**Expected Response**:
```
The system requirements for FlowSync 5.0 are:

Browser: Chrome 100+, Firefox 95+, Safari 15+, or Edge 100+
Internet Connection: Minimum 5 Mbps recommended
Display: 1920x1080 or higher resolution
Mobile: iOS 15+ or Android 10+

Sources:
📄 product_manual.txt (chunk 2)
"System Requirements: Browser: Chrome 100+, Firefox 95+, Safari 15+..."
Relevance: 94.5%
```

---

### Question 3: Synthesis Question

**User**: "How many employees does TechFlow have and what products do they offer?"

**What happens:**

This requires information from multiple chunks:
- Employee count from one section
- Product list from another section

The RAG system retrieves both relevant chunks and the LLM synthesizes them.

**Expected Response**:
```
TechFlow Solutions has 1,200 employees worldwide. They offer several products:

1. FlowSync - An enterprise resource planning (ERP) system used by over 2,000 companies
2. CloudHub - A cloud infrastructure management platform
3. DataVision - A business intelligence and analytics suite
4. AI Catalyst - An artificial intelligence platform (launched in 2023)

Sources:
📄 company_info.txt (chunk 1)
"Number of Employees: 1,200 worldwide..."
Relevance: 88.0%

📄 company_info.txt (chunk 2)
"Our flagship product, FlowSync, is an enterprise resource planning..."
Relevance: 85.5%
```

---

### Question 4: Complex Analysis

**User**: "What troubleshooting steps should I take if FlowSync loads slowly?"

**What happens:**

This is a detailed technical question requiring specific troubleshooting information.

**Expected Response**:
```
If FlowSync loads slowly, try these troubleshooting steps:

1. Clear your browser cache and cookies
2. Ensure your internet connection is stable (minimum 5 Mbps)
3. Try using a different browser or update to the latest version

These are the recommended first steps according to the product manual.

Sources:
📄 product_manual.txt (chunk 7)
"Problem: Dashboard loads slowly. Solution: Clear your browser cache and cookies..."
Relevance: 93.0%
```

---

## Step 3: Conversation with Context

The chat maintains conversation history. Let's have a multi-turn conversation:

**Turn 1**  
**User**: "Who is the CEO of TechFlow?"  
**Assistant**: "Sarah Chen is the CEO and co-founder of TechFlow Solutions."

**Turn 2**  
**User**: "Who are the other co-founders?"  
**Assistant**: "The other co-founder is Michael Rodriguez, who serves as CTO."

**Turn 3**  
**User**: "When did they found the company?"  
**Assistant**: "They founded TechFlow Solutions in 2010."

Notice how the assistant maintains context across turns (understands "they" refers to the co-founders).

---

## Step 4: Test Edge Cases

### Question without Answer

**User**: "What is the company's marketing budget?"

**Expected Response**:
```
I cannot find information about TechFlow's marketing budget in the available documents. 
The documents mention that they invest 18% of annual revenue in Research & Development 
and have an annual training budget of $3 million, but marketing budget is not specified.

Sources:
📄 company_info.txt (chunk 3)
"Research & Development Investment: 18% of annual revenue..."
Relevance: 65.0%
```

### Question Completely Outside Context

**User**: "What's the weather like today?"

**Expected Response**:
```
I don't have information about the weather in the provided documents. 
I can only answer questions based on the TechFlow company information 
and FlowSync product manual that have been uploaded.
```

---

## Step 5: Verify Source Citations

Let's verify the citations are accurate:

1. In the **Knowledge Base** tab, you should see:
   ```
   📄 company_info.txt
   12 chunks • Uploaded 5m ago
   
   📘 product_manual.txt
   15 chunks • Uploaded 3m ago
   ```

2. When you ask questions in Chat, the sources should always reference:
   - Correct filename
   - Chunk index (0-11 for company_info, 0-14 for product_manual)
   - Relevant excerpt from the actual document
   - Relevance score (higher = more relevant)

---

## Step 6: Test File Management

### Delete a Document

1. Go to **Knowledge Base** tab
2. Click "Delete" on `product_manual.txt`
3. Confirm deletion

**What happens:**
- Backend finds all 15 chunks with `fileId` matching product manual
- Deletes all chunks from ChromaDB
- Returns success

Now try asking: "What are FlowSync's system requirements?"

**Expected Response**:
```
I cannot find information about FlowSync's system requirements in the available documents.
```

The document is gone, so the RAG system can't retrieve it!

---

## Step 7: Test Settings

Go to **Settings** tab:

### Adjust Temperature

1. Move temperature slider from 0.7 to 0.2 (more precise)
2. Click "Save Settings"
3. Go back to Chat and ask: "What is TechFlow?"

With lower temperature, responses will be more deterministic and focused.

### Adjust Retrieval Count

1. Change "Retrieval Count" from 5 to 3
2. Now only top 3 most relevant chunks are used as context
3. Responses may have fewer sources but potentially more focused

### Reset Database

1. Click "Reset Database"
2. Confirm twice (it's destructive!)
3. All documents and embeddings are deleted
4. Go to Knowledge Base - it should be empty
5. Chat will now say "I don't have any documents to reference"

---

## Step 8: Performance Testing

### Upload a Larger Document

Create a file with 10,000 words:

```bash
# This will create many chunks (about 20-30)
# Test how the system handles larger documents
```

**Observations**:
- Processing time increases linearly with file size
- More chunks = better granularity but more storage
- Chunk overlap ensures context isn't lost at boundaries

---

## Technical Insights

### Embedding Similarity

When you ask "Who founded TechFlow?", the system:

1. Converts your question to a vector: `[0.12, -0.45, 0.78, ...]`
2. Compares with all stored chunk vectors using cosine similarity
3. Returns chunks with highest similarity scores

**Example scores**:
```
Chunk 0: "TechFlow was founded..." → 0.92 (very relevant)
Chunk 5: "Our products include..."  → 0.45 (somewhat relevant)
Chunk 9: "System requirements..."   → 0.15 (not relevant)
```

### Context Window

DeepSeek receives a prompt like this:

```
System: You are a helpful assistant. Use the following context...

Context:
[Chunk 1 text - 500 words]
[Chunk 2 text - 500 words]
[Chunk 3 text - 500 words]

User: When was TechFlow founded?
```

Total tokens: ~1,500 (context) + ~50 (question) = 1,550 tokens

---

## Troubleshooting the Example

### "Failed to get response"

**Cause**: DeepSeek API key issue or rate limit

**Solution**:
- Verify API key in `backend/.env`
- Check backend console for error details
- Try again after a few seconds

### No relevant sources returned

**Cause**: Question too different from document content

**Solution**:
- Ask questions more directly related to uploaded docs
- Upload more comprehensive documents
- Adjust chunk size in Settings for better granularity

### Sources don't seem relevant

**Cause**: Embedding quality (using demo embeddings)

**Solution**:
- In production, replace with real embedding API
- Current implementation uses simple hash-based embeddings
- Real embeddings (e.g., OpenAI's) capture semantic meaning better

---

## Success Criteria

You've successfully completed the example if:

✓ Documents uploaded and processed into chunks  
✓ Questions answered with relevant sources  
✓ Sources include correct filename and chunk index  
✓ Multi-turn conversations maintain context  
✓ Edge cases handled gracefully (no answer in docs)  
✓ File deletion works correctly  
✓ Settings can be adjusted  
✓ Database reset works  

Congratulations! You now have a working RAG system! 🎉

---

## Next Steps

1. **Upload your own documents** - PDFs, Word docs, or text files
2. **Customize the UI** - Edit `frontend/src/views/*.vue`
3. **Improve embeddings** - Integrate real embedding API
4. **Add authentication** - Protect your knowledge base
5. **Deploy** - Put it on a server for team use

Happy chatting with your documents! 🚀

