const { GoogleGenerativeAI } = require('@google/generative-ai');
const WebScraper = require('./webScraper');
const VectorDB = require('./vectorDB');

class RAGService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        this.webScraper = new WebScraper();
        this.vectorDB = new VectorDB();
        this.initialized = false;
    }

    async initialize() {
        if (!this.initialized) {
            await this.vectorDB.initialize();
            
            // Check if we have data, if not scrape and index
            const stats = await this.vectorDB.getStats();
            if (stats.totalDocuments === 0) {
                console.log('No data found, scraping and indexing...');
                await this.scrapeAndIndexData();
            }
            
            this.initialized = true;
            console.log('RAG Service initialized successfully');
        }
    }

    async scrapeAndIndexData() {
        try {
            const appData = await this.webScraper.scrapeAppDocumentation();
            await this.vectorDB.indexAppData(appData);
            console.log('Data scraped and indexed successfully');
        } catch (error) {
            console.error('Error scraping and indexing data:', error);
        }
    }

    async askQuestion(question, conversationHistory = []) {
        await this.initialize();
        
        try {
            // Get relevant context from vector database
            const relevantDocs = await this.vectorDB.getRelevantContext(question);
            
            // Build context string
            const context = relevantDocs.map(doc => 
                `Content: ${doc.content}\nRelevance: ${(doc.similarity * 100).toFixed(1)}%\n`
            ).join('\n');

            // Build conversation history
            const historyContext = conversationHistory.map(msg => 
                `${msg.role}: ${msg.content}`
            ).join('\n');

            // Create prompt with RAG
            const prompt = `You are an AI assistant that helps users understand their mobile app. 
You have access to the app's documentation, code structure, components, and API endpoints.

CONTEXT ABOUT THE APP:
${context}

CONVERSATION HISTORY:
${historyContext}

USER QUESTION: ${question}

Please provide a helpful answer based on the context provided. If the context doesn't contain enough information, 
say so politely and provide general guidance. Be specific about the app's features, components, and structure.

Guidelines:
1. Use the provided context to answer accurately
2. If you mention code, be specific about file paths and component names
3. For API questions, mention the HTTP methods and endpoints
4. Keep answers concise but comprehensive
5. If you're unsure, admit it rather than guessing

Answer:`;

            // Generate response using Gemini
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const answer = response.text();

            return {
                answer: answer,
                sources: relevantDocs.map(doc => ({
                    content: doc.content.substring(0, 200) + '...',
                    similarity: doc.similarity,
                    metadata: doc.metadata
                })),
                contextUsed: relevantDocs.length > 0
            };

        } catch (error) {
            console.error('Error asking question:', error);
            return {
                answer: 'I apologize, but I encountered an error while processing your question. Please try again.',
                sources: [],
                contextUsed: false,
                error: error.message
            };
        }
    }

    async getAppOverview() {
        await this.initialize();
        
        try {
            const stats = await this.vectorDB.getStats();
            
            const prompt = `Based on the indexed app data with ${stats.totalDocuments} documents, 
provide a comprehensive overview of this mobile application. Include:
1. What type of app this is
2. Main features and components
3. Available API endpoints
4. Technology stack used
5. General architecture

Be helpful and informative for someone trying to understand the app structure.`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const overview = response.text();

            return {
                overview: overview,
                stats: stats
            };

        } catch (error) {
            console.error('Error getting app overview:', error);
            return {
                overview: 'Unable to generate app overview at this time.',
                stats: await this.vectorDB.getStats()
            };
        }
    }

    async reindexData() {
        try {
            console.log('Reindexing app data...');
            await this.scrapeAndIndexData();
            const stats = await this.vectorDB.getStats();
            return {
                success: true,
                message: 'Data reindexed successfully',
                stats: stats
            };
        } catch (error) {
            console.error('Error reindexing data:', error);
            return {
                success: false,
                message: 'Failed to reindex data',
                error: error.message
            };
        }
    }

    async searchDocuments(query) {
        await this.initialize();
        
        try {
            const results = await this.vectorDB.search(query, 10);
            return results.map(result => ({
                content: result.document.content,
                similarity: result.similarity,
                metadata: result.document.metadata,
                createdAt: result.document.createdAt
            }));
        } catch (error) {
            console.error('Error searching documents:', error);
            return [];
        }
    }
}

module.exports = RAGService;
