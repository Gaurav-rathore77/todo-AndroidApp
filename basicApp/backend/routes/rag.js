const express = require('express');
const { body, validationResult } = require('express-validator');
const RAGServiceDemo = require('../services/ragServiceDemo');

const router = express.Router();
const ragService = new RAGServiceDemo();

// Initialize the RAG service when the module loads
ragService.initialize().catch(console.error);

// Ask a question about the app
router.post('/ask', [
    body('question').trim().isLength({ min: 1, max: 500 }).withMessage('Question must be 1-500 characters'),
    body('conversationHistory').optional().isArray().withMessage('Conversation history must be an array')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { question, conversationHistory = [] } = req.body;

        const result = await ragService.askQuestion(question, conversationHistory);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error in /ask endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get app overview
router.get('/overview', async (req, res) => {
    try {
        const result = await ragService.getAppOverview();

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error in /overview endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Search documents
router.post('/search', [
    body('query').trim().isLength({ min: 1, max: 200 }).withMessage('Query must be 1-200 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { query } = req.body;
        const results = await ragService.searchDocuments(query);

        res.json({
            success: true,
            data: {
                query: query,
                results: results,
                count: results.length
            }
        });

    } catch (error) {
        console.error('Error in /search endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Reindex data (admin endpoint)
router.post('/reindex', async (req, res) => {
    try {
        const result = await ragService.reindexData();

        res.json({
            success: result.success,
            message: result.message,
            data: result.success ? result.stats : null
        });

    } catch (error) {
        console.error('Error in /reindex endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get system status
router.get('/status', async (req, res) => {
    try {
        const stats = await ragService.vectorDB.getStats();
        
        res.json({
            success: true,
            data: {
                service: 'RAG System',
                status: 'active',
                initialized: ragService.initialized,
                stats: stats,
                geminiConfigured: !!process.env.GEMINI_API_KEY,
            mode: 'full Gemini AI enabled'
            }
        });

    } catch (error) {
        console.error('Error in /status endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router;
