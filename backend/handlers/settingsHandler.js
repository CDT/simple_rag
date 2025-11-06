import chromaService from '../services/chromaService.js'
import settingsService from '../services/settingsService.js'
import { routesLogger } from '../config/logger.js'

export const getSettings = (req, res) => {
  try {
    const settings = settingsService.getFrontendSettings()
    res.json({
      success: true,
      data: settings
    })
  } catch (error) {
    routesLogger.error('Error getting settings:', error)
    res.status(500).json({ 
      error: '获取设置失败', 
      message: error.message 
    })
  }
}

export const updateSettings = (req, res) => {
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
        message: '设置更新成功',
        data: updatedSettings
      })
    } else {
      res.status(500).json({ 
        error: '更新设置失败', 
        message: '无法保存设置到文件' 
      })
    }
  } catch (error) {
    routesLogger.error('Error updating settings:', error)
    res.status(500).json({ 
      error: '更新设置失败', 
      message: error.message 
    })
  }
}

export const resetDatabase = async (req, res) => {
  try {
    await chromaService.reset()
    
    res.json({
      success: true,
      message: '数据库重置成功'
    })
  } catch (error) {
    routesLogger.error('Error resetting database:', error)
    res.status(500).json({ 
      error: '重置数据库失败', 
      message: error.message 
    })
  }
}

