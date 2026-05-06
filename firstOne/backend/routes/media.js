// Media Routes - Audio and Video Recording
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, path.join(uploadPath, file.originalname));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

// In-memory storage for demo (replace with database storage in production)
let mediaRecordings = [];

// Upload audio recording
router.post('/upload-audio', upload.single('audio'), (req, res) => {
  try {
    console.log('🎙 Uploading audio recording...');
    
    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { duration, transcript, timestamp } = req.body;
    
    // Create recording object
    const recording = {
      id: 'audio_' + Date.now(),
      type: 'audio',
      url: `/uploads/${req.file.filename}`,
      duration: parseInt(duration) || 0,
      transcript: transcript || null,
      timestamp: timestamp || new Date().toISOString(),
      metadata: {
        size: req.file.size,
        format: 'audio/mp4',
        quality: 'high'
      }
    };

    // Store in memory (replace with database in production)
    mediaRecordings.push(recording);

    console.log('✅ Audio uploaded successfully:', recording);
    res.json({
      id: recording.id,
      url: `http://192.168.1.3:3000/uploads/${req.file.filename}`,
      type: 'audio',
      timestamp: recording.timestamp,
      transcript: recording.transcript,
      metadata: recording.metadata
    });

  } catch (error) {
    console.error('❌ Audio upload error:', error);
    res.status(500).json({ error: 'Failed to upload audio' });
  }
});

// Upload video recording to ImageKit
router.post('/upload-video', upload.single('video'), async (req, res) => {
  try {
    console.log('🎥 Uploading video recording to ImageKit...');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { duration, transcript, timestamp } = req.body;
    
    // Upload to ImageKit
    const imagekit = require('../config/image');
    
    const uploadResult = await new Promise((resolve, reject) => {
      const fs = require('fs');
      const filePath = req.file.path;
      
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        
        const base64Data = data.toString('base64');
        const file = `data:video/mp4;base64,${base64Data}`;
        
        imagekit.upload({
          file: file,
          fileName: `video_${Date.now()}.mp4`,
          folder: '/videos',
          useUniqueFileName: true,
        }, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    });

    // Create recording object
    const recording = {
      id: 'video_' + Date.now(),
      type: 'video',
      url: uploadResult.url,
      duration: parseInt(duration) || 0,
      transcript: transcript || null,
      timestamp: timestamp || new Date().toISOString(),
      metadata: {
        size: req.file.size,
        format: 'video/mp4',
        quality: 'high',
        imagekitId: uploadResult.fileId
      }
    };

    // Store in memory (replace with database in production)
    mediaRecordings.push(recording);

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    console.log('✅ Video uploaded to ImageKit successfully:', recording);
    res.json({
      id: recording.id,
      url: recording.url,
      type: 'video',
      timestamp: recording.timestamp,
      transcript: recording.transcript,
      metadata: recording.metadata
    });
  } catch (error) {
    console.error('❌ Video upload error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// Get all recordings for a user
router.get('/user/:userId', (req, res) => {
  try {
    console.log('📋 Fetching recordings for user:', req.params.userId);
    
    // Filter recordings by user (in production, query database)
    const userRecordings = mediaRecordings.filter(recording => 
      recording.userId === req.params.userId
    );

    console.log('✅ Recordings fetched successfully');
    res.json({
      recordings: userRecordings,
      total: userRecordings.length
    });

  } catch (error) {
    console.error('❌ Fetch recordings error:', error);
    res.status(500).json({ error: 'Failed to fetch recordings' });
  }
});

// Get specific recording by ID
router.get('/:recordingId', (req, res) => {
  try {
    console.log('🎬 Fetching recording:', req.params.recordingId);
    
    const recording = mediaRecordings.find(r => r.id === req.params.recordingId);
    
    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }

    console.log('✅ Recording fetched successfully');
    res.json(recording);

  } catch (error) {
    console.error('❌ Fetch recording error:', error);
    res.status(500).json({ error: 'Failed to fetch recording' });
  }
});

// Delete a recording
router.delete('/:recordingId', (req, res) => {
  try {
    console.log('🗑️ Deleting recording:', req.params.recordingId);
    
    const recordingIndex = mediaRecordings.findIndex(r => r.id === req.params.recordingId);
    
    if (recordingIndex === -1) {
      return res.status(404).json({ error: 'Recording not found' });
    }

    // Remove from memory (in production, delete from database)
    mediaRecordings.splice(recordingIndex, 1);

    console.log('✅ Recording deleted successfully');
    res.json({ message: 'Recording deleted successfully' });

  } catch (error) {
    console.error('❌ Delete recording error:', error);
    res.status(500).json({ error: 'Failed to delete recording' });
  }
});

// Serve uploaded files
router.get('/uploads/:filename', (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads', req.params.filename);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('❌ Serve file error:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

module.exports = router;
