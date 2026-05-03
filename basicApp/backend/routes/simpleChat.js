const express = require('express');
const SimpleChatService = require('../services/simpleChatService');

const router = express.Router();
const chatService = new SimpleChatService();

// Chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { message, conversationHistory } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log('Processing message:', message);
        
        // Try quick answer first
        const quickAnswer = await chatService.quickAnswer(message);
        let response = quickAnswer || await chatService.chat(message, conversationHistory);
        
        // Handle empty response
        if (!response || response.trim() === '') {
            response = "Sorry, I couldn't generate a response. Please try again.";
        }
        
        console.log('Generated response:', response);
        
        res.json({
            response,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
            error: 'Failed to process chat message',
            response: "Sorry, I'm having technical difficulties. Please try again."
        });
    }
});

// Get app info
router.get('/app-info', async (req, res) => {
    try {
        await chatService.initialize();
        res.json({
            appInfo: chatService.appData?.appInfo || {},
            features: chatService.appData?.appInfo?.features || []
        });
    } catch (error) {
        console.error('App info error:', error);
        res.status(500).json({ error: 'Failed to get app info' });
    }
});

// Health check
router.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'Simple Chat Service',
        initialized: chatService.initialized 
    });
});

// Simple test endpoint
router.get('/test', (req, res) => {
    res.json({ 
        message: 'Chat service is working!',
        timestamp: new Date().toISOString(),
        ip: req.ip || req.connection.remoteAddress
    });
});

module.exports = router;
