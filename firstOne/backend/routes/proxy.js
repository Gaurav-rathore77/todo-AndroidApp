const express = require('express');
const router = express.Router();
const axios = require('axios');

// Proxy endpoint for images that don't work in React Native
router.post('/image', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    
    console.log('🔄 Proxying image:', imageUrl);
    
    // Download the image from ImageKit
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000
    });
    
    // Convert to base64
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    const mimeType = response.headers['content-type'] || 'image/jpeg';
    
    // Return as base64 data URL
    const dataUrl = `data:${mimeType};base64,${base64}`;
    
    console.log('✅ Image proxied successfully, size:', base64.length);
    
    res.json({
      proxyUrl: dataUrl,
      mimeType: mimeType,
      size: base64.length
    });
    
  } catch (error) {
    console.error('❌ Image proxy error:', error.message);
    res.status(500).json({ error: 'Failed to proxy image' });
  }
});

module.exports = router;
