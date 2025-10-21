import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { servicesLogger } from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SettingsService {
  constructor() {
    this.settingsPath = path.join(__dirname, '..', 'settings.json');
    this.settings = null;
    this.loadSettings();
  }

  loadSettings() {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const data = fs.readFileSync(this.settingsPath, 'utf8');
        this.settings = JSON.parse(data);
        servicesLogger.info('Settings loaded from settings.json');
      } else {
        // Create default settings if file doesn't exist
        this.settings = this.getDefaultSettings();
        this.saveSettings();
        servicesLogger.info('Created default settings.json');
      }
    } catch (error) {
      servicesLogger.error('Error loading settings:', error);
      this.settings = this.getDefaultSettings();
    }
  }

  getDefaultSettings() {
    return {
      api: {
        provider: 'DeepSeek',
        apiKey: '',
        apiBase: 'https://api.deepseek.com/v1'
      },
      server: {
        port: 3000
      },
      database: {
        chromaPath: './chroma_db'
      },
      embedding: {
        dimensions: 384
      },
      processing: {
        chunkSize: 500,
        chunkOverlap: 50,
        retrievalCount: 5
      },
      model: {
        temperature: 0.7,
        maxTokens: 2000
      }
    };
  }

  getSettings() {
    return this.settings;
  }

  getSetting(path) {
    const keys = path.split('.');
    let value = this.settings;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  updateSettings(updates) {
    try {
      // Merge updates with existing settings
      this.settings = this.deepMerge(this.settings, updates);
      this.saveSettings();
      servicesLogger.info('Settings updated successfully');
      return true;
    } catch (error) {
      servicesLogger.error('Error updating settings:', error);
      return false;
    }
  }

  saveSettings() {
    try {
      fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2));
      servicesLogger.info('Settings saved to settings.json');
    } catch (error) {
      servicesLogger.error('Error saving settings:', error);
      throw error;
    }
  }

  // Deep merge utility function
  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  // Get settings in the format expected by the frontend
  getFrontendSettings() {
    return {
      apiProvider: this.settings.api.provider,
      apiKey: this.settings.api.apiKey,
      embeddingDimensions: this.settings.embedding.dimensions,
      chunkSize: this.settings.processing.chunkSize,
      chunkOverlap: this.settings.processing.chunkOverlap,
      retrievalCount: this.settings.processing.retrievalCount,
      temperature: this.settings.model.temperature,
      maxTokens: this.settings.model.maxTokens,
      apiBase: this.settings.api.apiBase,
      chromaPath: this.settings.database.chromaPath,
      port: this.settings.server.port
    };
  }

  // Update settings from frontend format
  updateFromFrontend(frontendSettings) {
    const updates = {
      api: {
        provider: frontendSettings.apiProvider,
        apiKey: frontendSettings.apiKey,
        apiBase: frontendSettings.apiBase
      },
      server: {
        port: frontendSettings.port
      },
      database: {
        chromaPath: frontendSettings.chromaPath
      },
      embedding: {
        dimensions: frontendSettings.embeddingDimensions
      },
      processing: {
        chunkSize: frontendSettings.chunkSize,
        chunkOverlap: frontendSettings.chunkOverlap,
        retrievalCount: frontendSettings.retrievalCount
      },
      model: {
        temperature: frontendSettings.temperature,
        maxTokens: frontendSettings.maxTokens
      }
    };

    return this.updateSettings(updates);
  }
}

export default new SettingsService();
