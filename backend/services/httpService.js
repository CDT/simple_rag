import axios from 'axios'
import { servicesLogger } from '../config/logger.js'

class HttpService {
  constructor() {
    this.axiosInstance = axios.create({
      timeout: 10000, // 10 seconds default timeout
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        this.handleError(error)
        return Promise.reject(error)
      }
    )
  }

  handleError(error) {
    let message = 'HTTP request failed'

    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 400:
          message = data?.message || 'Bad request'
          break
        case 401:
          message = 'Unauthorized - check your API key'
          break
        case 403:
          message = 'Forbidden - insufficient permissions'
          break
        case 404:
          message = 'Resource not found'
          break
        case 429:
          message = 'Rate limit exceeded'
          break
        case 500:
          message = data?.message || 'Internal server error'
          break
        default:
          message = data?.message || `HTTP error ${status}`
      }
    } else if (error.request) {
      // Network error
      message = 'Network error - unable to connect to server'
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      message = 'Request timeout'
    } else {
      // Other errors
      message = error.message || 'Unknown error'
    }

    servicesLogger.error('HTTP Service Error:', {
      message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    })
  }

  // HTTP methods
  async get(url, config = {}) {
    return this.axiosInstance.get(url, config)
  }

  async post(url, data, config = {}) {
    return this.axiosInstance.post(url, data, config)
  }

  async put(url, data, config = {}) {
    return this.axiosInstance.put(url, data, config)
  }

  async delete(url, config = {}) {
    return this.axiosInstance.delete(url, config)
  }

  async patch(url, data, config = {}) {
    return this.axiosInstance.patch(url, data, config)
  }

  // Method to update timeout for specific requests
  setRequestTimeout(timeout) {
    this.axiosInstance.defaults.timeout = timeout
  }

  // Method to add custom headers
  setDefaultHeader(key, value) {
    this.axiosInstance.defaults.headers.common[key] = value
  }
}

// Export singleton instance
export default new HttpService()
