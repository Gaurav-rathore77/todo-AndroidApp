# RAG System Implementation

This directory contains a complete RAG (Retrieval-Augmented Generation) system for your mobile app using Gemini API.

## Features

- **Web Scraping**: Automatically scrapes app documentation, components, and API endpoints
- **Vector Database**: Stores and indexes app information for efficient retrieval
- **Smart Chat**: AI-powered assistant that can answer questions about your app
- **Context-Aware**: Uses RAG to provide accurate answers based on your app's actual code
- **Mobile Interface**: Beautiful chat interface in the mobile app

##  File Structure

```
backend/
├── services/
│   ├── webScraper.js      # Scrapes app data and documentation
│   ├── vectorDB.js        # Vector database for embeddings
│   ├── ragService.js      # Main RAG service with Gemini API
│   └── ragServiceDemo.js  # Demo version (working without API key)
├── routes/
│   └── rag.js            # API endpoints for RAG functionality
├── data/                 # Stored vectors and scraped data
└── RAG_README.md        # This file
```

##  Setup Instructions

### 1. Install Dependencies
```bash
npm install @google/generative-ai cheerio axios faiss-node
```

### 2. Configure Environment Variables
Add your Gemini API key to `.env`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Start the Server
```bash
npm start
```

##  Mobile App Integration

The mobile app includes a chat screen at `app/(app)/chat.tsx` that communicates with the RAG API.

### API Endpoints

- **POST /api/rag/ask** - Ask questions about your app
- **GET /api/rag/overview** - Get app overview
- **POST /api/rag/search** - Search documents
- **POST /api/rag/reindex** - Reindex app data
- **GET /api/rag/status** - Check system status

### Example Usage
```javascript
// Ask a question
const response = await fetch('http://localhost:5001/api/rag/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: 'What components does my app use?',
    conversationHistory: []
  })
});
```

##  Demo Mode

The system currently runs in **demo mode** with intelligent responses based on app patterns. To enable full Gemini AI:

1. Get a valid Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Update the `.env` file with your real API key
3. Change the import in `routes/rag.js`:
   ```javascript
   const RAGService = require('../services/ragService'); // Instead of ragServiceDemo
   ```

##  How It Works

1. **Data Collection**: The web scraper analyzes your app structure, components, and API endpoints
2. **Embedding Generation**: Documents are converted to vector embeddings
3. **Vector Storage**: Embeddings are stored in a vector database for similarity search
4. **Query Processing**: When you ask a question, relevant documents are retrieved
5. **AI Generation**: Gemini AI generates answers based on retrieved context
6. **Response Delivery**: Answers are returned with sources and confidence scores

##  System Status

Check the system status:
```bash
curl http://localhost:5001/api/rag/status
```

##  Search Capabilities

The RAG system can answer questions about:
- App architecture and structure
- Component usage and props
- API endpoints and functionality
- File organization and dependencies
- Features and capabilities
- Technology stack

##  Future Enhancements

- Real-time code analysis
- Multi-language support
- Advanced embedding models
- File upload for custom documentation
- Voice input support
- Export functionality

##  Troubleshooting

### Common Issues

1. **Port 5000 already in use**
   - Change PORT in `.env` to 5001 or another available port

2. **Invalid Gemini API key**
   - Ensure your API key is valid and properly formatted
   - Use demo mode for testing without API key

3. **MongoDB connection issues**
   - Ensure MongoDB is running on localhost:27017
   - Check MONGODB_URI in `.env`

4. **No documents indexed**
   - The system automatically scrapes and indexes on first run
   - Use `/api/rag/reindex` to force reindexing
##  Example Questions

Try asking the AI assistant:
- "What is this app about?"
- "What components does my app use?"
- "How does authentication work?"
- "What API endpoints are available?"
- "What technologies are used?"

##  Best Practices

1. Keep your API key secure and never commit it to version control
2. Regularly reindex data when making significant code changes
3. Use specific questions for better results
4. Monitor system status and performance
5. Implement proper error handling in production

##  Support

For issues or questions:
1. Check the server logs for error messages
2. Verify all dependencies are installed
3. Ensure environment variables are correctly set
4. Test with demo mode first before using real API key

---

**Note**: The demo mode provides intelligent responses based on app patterns. For full AI capabilities, configure a valid Gemini API key.
