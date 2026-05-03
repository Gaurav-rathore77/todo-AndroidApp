const WebScraper = require('./webScraper');
const VectorDB = require('./vectorDB');

class RAGServiceDemo {
    constructor() {
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
            console.log('RAG Service Demo initialized successfully');
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

            // Generate demo response based on context
            const answer = this.generateDemoResponse(question, relevantDocs);

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

    generateDemoResponse(question, relevantDocs) {
        const lowerQuestion = question.toLowerCase();
        
        // Human-like responses in Hindi and English mix
        if (lowerQuestion.includes('what') && lowerQuestion.includes('app')) {
            return `यह एक React Native mobile app है जो Expo पर बनी है। इसमें authentication, user management और बहुत सारे features हैं। ${relevantDocs.length} documents मिले।`;
        }
        
        if (lowerQuestion.includes('component') || lowerQuestion.includes('कंपोनेंट')) {
            const componentDocs = relevantDocs.filter(doc => doc.metadata.type === 'component');
            if (componentDocs.length > 0) {
                return `आपके app में ${componentDocs.length} components हैं - UI elements, authentication, navigation के लिए। सभी reusable हैं!`;
            }
            return `आपके app में standard React Native components और कुछ custom components हैं।`;
        }
        
        if (lowerQuestion.includes('api') || lowerQuestion.includes('endpoint')) {
            const apiDocs = relevantDocs.filter(doc => doc.metadata.type === 'api');
            if (apiDocs.length > 0) {
                return `आपके पास ${apiDocs.length} API endpoints हैं - login, register, user management सब कुछ। Node.js + Express पर बना है।`;
            }
            return `Backend API है authentication और data management के लिए।`;
        }
        
        if (lowerQuestion.includes('feature') || lowerQuestion.includes('फीचर')) {
            return `Main features: user authentication, login/logout, data management, responsive UI. React Native + Expo + Node.js use किया है।`;
        }
        
        if (lowerQuestion.includes('how') && (lowerQuestion.includes('work') || lowerQuestion.includes('काम'))) {
            return `React Native frontend + Node.js backend। Mobile interface API से बात करता है। JWT authentication और MongoDB database।`;
        }
        
        // Hindi support
        if (lowerQuestion.includes('hindi') || lowerQuestion.includes('हिंदी')) {
            return `हाँ! मैं आपसे Hindi में बात कर सकता हूं। आपके app के बारे में कुछ भी पूछ सकते हैं! 😊`;
        }
        
        // Detailed, content-rich responses
        if (relevantDocs.length > 0) {
            const topDoc = relevantDocs[0];
            
            // Extract specific content from documents
            const appInfo = relevantDocs.filter(doc => doc.metadata.type === 'appInfo');
            const components = relevantDocs.filter(doc => doc.metadata.type === 'component');
            const apis = relevantDocs.filter(doc => doc.metadata.type === 'api');
            const files = relevantDocs.filter(doc => doc.metadata.type === 'file');
            
            if (topDoc.metadata.type === 'component' && components.length > 0) {
                const componentNames = components.map(c => c.content.split('name: ')[1]?.split('"')[0] || c.name).filter(Boolean);
                return `आपके app में ${componentNames.join(', ')} components हैं। यह UI elements, forms, navigation के लिए बनाए गए हैं।`;
            } else if (topDoc.metadata.type === 'api' && apis.length > 0) {
                const apiList = apis.map(a => a.content.split('path: ')[1]?.split('"')[0] || a.path).filter(Boolean);
                return `आपके पास ${apiList.length} API endpoints हैं: ${apiList.join(', ')}। यह login, register, user management के लिए backend services हैं।`;
            } else if (appInfo.length > 0) {
                const info = appInfo[0].content;
                const features = info.includes('features') ? info.split('features: ')[1]?.split(',') || [] : [];
                return `आपका React Native + Expo app है। Main features: ${features.slice(0, 3).join(', ')} और भी authentication system है।`;
            } else if (files.length > 0) {
                const fileTypes = files.map(f => f.language);
                return `आपके app में ${fileTypes.join(', ')} files हैं। Configuration, components, और source code समिलित हैं।`;
            } else {
                return `${relevantDocs.length} documents मिले। ${topDoc.metadata?.type || 'general'} files से detailed information मिले।`;
            }
        }
        
        return `मैं आपके app के बारे में बता सकता हूं! Components, APIs, features - कुछ भी पूछें। 😊`;
    }

    async getAppOverview() {
        await this.initialize();
        
        try {
            const stats = await this.vectorDB.getStats();
            
            const overview = `📱 **आपका App**

यह एक React Native mobile app है जो Expo पर बनी है।

**🔧 Setup:**
- Frontend: React Native + Expo  
- Backend: Node.js + Express
- Database: MongoDB
- Authentication: JWT

**✨ Main Features:**
- User authentication 
- Secure login/register
- Mobile UI responsive
- RESTful APIs
- Modern components

**📊 Stats:**
- Total docs: ${stats.totalDocuments}
- Types: ${Object.entries(stats.documentTypes).map(([type, count]) => `${type}: ${count}`).join(', ')}

**यह app modern best practices follow करता है!** 😊`;

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

module.exports = RAGServiceDemo;
