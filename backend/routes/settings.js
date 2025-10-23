import express from 'express'
import chromaService from '../services/chromaService.js'
import settingsService from '../services/settingsService.js'
import { routesLogger } from '../config/logger.js'

const router = express.Router()

// Get current settings
router.get('/', (req, res) => {
  try {
    const settings = settingsService.getFrontendSettings()
    res.json({
      success: true,
      data: settings
    })
  } catch (error) {
    routesLogger.error('Error getting settings:', error)
    res.status(500).json({ 
      error: 'Failed to get settings', 
      message: error.message 
    })
  }
});

// Update settings
router.put('/', (req, res) => {
  try {
    const settings = req.body
    
    // Update settings using the settings service
    const success = settingsService.updateFromFrontend(settings)
    
    if (success) {
      routesLogger.info('Settings updated successfully')
      
      // Return updated settings (without sensitive data)
      const updatedSettings = settingsService.getFrontendSettings()
      res.json({
        success: true,
        message: 'Settings updated successfully',
        data: updatedSettings
      })
    } else {
      res.status(500).json({ 
        error: 'Failed to update settings', 
        message: 'Could not save settings to file' 
      })
    }
  } catch (error) {
    routesLogger.error('Error updating settings:', error)
    res.status(500).json({ 
      error: 'Failed to update settings', 
      message: error.message 
    })
  }
})

// Reset database
router.post('/reset', async (req, res) => {
  try {
    await chromaService.reset()
    
    res.json({
      success: true,
      message: 'Database reset successfully'
    })
  } catch (error) {
    routesLogger.error('Error resetting database:', error)
    res.status(500).json({ 
      error: 'Failed to reset database', 
      message: error.message 
    })
  }
})

export default router

