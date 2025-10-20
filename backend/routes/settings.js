import express from 'express';
import chromaService from '../services/chromaService.js';

const router = express.Router();

// Get current settings
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      apiProvider: 'DeepSeek',
      embeddingDimensions: 384,
      chunkSize: 500,
      chunkOverlap: 50,
      retrievalCount: 5,
      temperature: 0.7,
      maxTokens: 2000
    }
  });
});

// Update settings (placeholder - extend as needed)
router.put('/', (req, res) => {
  try {
    const settings = req.body;
    
    // If API key is provided, update the environment variable
    if (settings.apiKey) {
      process.env.DEEPSEEK_API_KEY = settings.apiKey;
      console.log('DeepSeek API key updated');
      
      // Remove apiKey from response for security
      delete settings.apiKey;
    }
    
    // In a real app, you'd persist these settings to a database or config file
    console.log('Settings update requested:', settings);
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ 
      error: 'Failed to update settings', 
      message: error.message 
    });
  }
});

// Reset database
router.post('/reset', async (req, res) => {
  try {
    await chromaService.reset();
    
    res.json({
      success: true,
      message: 'Database reset successfully'
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ 
      error: 'Failed to reset database', 
      message: error.message 
    });
  }
});

export default router;

