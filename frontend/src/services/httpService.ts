import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { toastService } from '../composables/useToast'
import { API_URL } from '../../config'

// HTTP Service class
class HttpService {
  private axiosInstance: AxiosInstance

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 10000, // 10 seconds default timeout
      headers: {
        'Content-Type': 'application/json'
      },
      baseURL: API_URL
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

  private handleError(error: any) {
    let message = '网络请求出现错误'

    if (error.response) {
      // Server responded with error status
      const data = error.response.data
      message = data?.message || `服务器错误 (${error.response.status})`
    } else if (error.request) {
      // Network error
      message = '无法连接到服务器，请检查网络连接'
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      message = '请求超时，请稍后重试'
    } else {
      // Other errors
      message = error.message || '未知错误'
    }

    toastService.error('请求失败', message)
  }

  // HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get(url, config)
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post(url, data, config)
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put(url, data, config)
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete(url, config)
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch(url, data, config)
  }

  // Method to update timeout for specific requests
  setRequestTimeout(timeout: number) {
    this.axiosInstance.defaults.timeout = timeout
  }

  // Method to add custom headers
  setDefaultHeader(key: string, value: string) {
    this.axiosInstance.defaults.headers.common[key] = value
  }
}

// Export singleton instance
export const httpService = new HttpService()
