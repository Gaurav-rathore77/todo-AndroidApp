const fs = require('fs').promises;
const path = require('path');

class VectorDB {
    constructor() {
        this.dataDir = path.join(__dirname, '../data');
        this.vectorsFile = path.join(this.dataDir, 'vectors.json');
        this.documents = [];
        this.vectors = [];
    }

    async initialize() {
        await this.ensureDataDir();
        await this.loadVectors();
    }

    async ensureDataDir() {
        try {
            await fs.access(this.dataDir);
        } catch {
            await fs.mkdir(this.dataDir, { recursive: true });
        }
    }

    async loadVectors() {
        try {
            const data = await fs.readFile(this.vectorsFile, 'utf8');
            const parsed = JSON.parse(data);
            this.documents = parsed.documents || [];
            this.vectors = parsed.vectors || [];
        } catch (error) {
            console.log('No existing vectors found, starting fresh');
            this.documents = [];
            this.vectors = [];
        }
    }

    async saveVectors() {
        try {
            await fs.writeFile(
                this.vectorsFile,
                JSON.stringify({
                    documents: this.documents,
                    vectors: this.vectors
                }, null, 2)
            );
        } catch (error) {
            console.error('Error saving vectors:', error);
        }
    }

    async addDocument(doc) {
        const document = {
            id: doc.id || Date.now().toString(),
            content: doc.content,
            metadata: doc.metadata || {},
            createdAt: new Date().toISOString()
        };

        this.documents.push(document);
        
        // Generate simple embedding (in production, use a proper embedding model)
        const embedding = await this.generateEmbedding(doc.content);
        this.vectors.push({
            id: document.id,
            embedding: embedding,
            metadata: document.metadata
        });

        await this.saveVectors();
        return document;
    }

    async generateEmbedding(text) {
        // Simple embedding generation using word frequency
        // In production, replace with actual embedding model (OpenAI, Cohere, etc.)
        const textWords = text.toLowerCase().split(/\s+/);
        const wordFreq = {};
        
        textWords.forEach(word => {
            word = word.replace(/[^a-z0-9]/g, '');
            if (word.length > 2) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });

        // Create a fixed-size vector (384 dimensions, similar to many embedding models)
        const embedding = new Array(384).fill(0);
        const uniqueWords = Object.keys(wordFreq);
        
        uniqueWords.forEach((word, index) => {
            const hash = this.simpleHash(word);
            const position = Math.abs(hash) % 384;
            embedding[position] = Math.sqrt(wordFreq[word]);
        });

        // Normalize the vector
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }

    async search(query, topK = 5) {
        const queryEmbedding = await this.generateEmbedding(query);
        
        const similarities = this.vectors.map((vector, index) => ({
            document: this.documents[index],
            similarity: this.cosineSimilarity(queryEmbedding, vector.embedding),
            metadata: vector.metadata
        }));

        return similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);
    }

    cosineSimilarity(vecA, vecB) {
        if (vecA.length !== vecB.length) return 0;
        
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        
        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);
        
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (normA * normB);
    }

    async indexAppData(appData) {
        console.log('Indexing app data...');
        
        // Index app information
        if (appData.appInfo) {
            await this.addDocument({
                content: `App Name: ${appData.appInfo.name}. Type: ${appData.appInfo.type}. Description: ${appData.appInfo.description}.`,
                metadata: { type: 'appInfo', source: 'scraped' }
            });
        }

        // Index components
        if (appData.components && appData.components.length > 0) {
            for (const component of appData.components) {
                await this.addDocument({
                    content: `Component: ${component.name}. File: ${component.file}. Props: ${component.props}. Usage: ${component.usage.join(', ')}.`,
                    metadata: { type: 'component', name: component.name, source: 'scraped' }
                });
            }
        }

        // Index API endpoints
        if (appData.apiEndpoints && appData.apiEndpoints.length > 0) {
            for (const endpoint of appData.apiEndpoints) {
                await this.addDocument({
                    content: `API Endpoint: ${endpoint.method} ${endpoint.path}. Description: ${endpoint.description}. File: ${endpoint.file}.`,
                    metadata: { type: 'api', method: endpoint.method, path: endpoint.path, source: 'scraped' }
                });
            }
        }

        // Index code structure
        if (appData.codeStructure && appData.codeStructure.length > 0) {
            for (const item of appData.codeStructure) {
                if (item.type === 'file' && item.preview) {
                    await this.addDocument({
                        content: `File: ${item.path}. Language: ${item.language}. Preview: ${item.preview}`,
                        metadata: { type: 'file', path: item.path, language: item.language, source: 'scraped' }
                    });
                }
            }
        }

        console.log(`Indexed ${this.documents.length} documents`);
    }

    async getRelevantContext(query) {
        const results = await this.search(query, 5);
        return results.map(result => ({
            content: result.document.content,
            similarity: result.similarity,
            metadata: result.document.metadata
        }));
    }

    async getStats() {
        return {
            totalDocuments: this.documents.length,
            documentTypes: this.documents.reduce((acc, doc) => {
                acc[doc.metadata.type] = (acc[doc.metadata.type] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

module.exports = VectorDB;
