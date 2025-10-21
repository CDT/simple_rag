import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ref, readonly } from 'vue'

// Toast notification system
interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

class ToastService {
  private toasts = ref<Toast[]>([])
  private toastId = 0

  get toastsList() {
    return readonly(this.toasts)
  }

  private generateId(): string {
    return `toast-${++this.toastId}`
  }

  private addToast(toast: Omit<Toast, 'id'>): string {
    const id = this.generateId()
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
    }
    
    this.toasts.value.push(newToast)
    
    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.removeToast(id)
      }, newToast.duration)
    }
    
    return id
  }

  removeToast(id: string) {
    const index = this.toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      this.toasts.value.splice(index, 1)
    }
  }

  success(title: string, message?: string, duration?: number) {
    return this.addToast({ type: 'success', title, message, duration })
  }

  error(title: string, message?: string, duration?: number) {
    return this.addToast({ type: 'error', title, message, duration })
  }

  warning(title: string, message?: string, duration?: number) {
    return this.addToast({ type: 'warning', title, message, duration })
  }

  info(title: string, message?: string, duration?: number) {
    return this.addToast({ type: 'info', title, message, duration })
  }
}

// Global toast service instance
export const toastService = new ToastService()

// HTTP Service class
class HttpService {
  private axiosInstance: AxiosInstance

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

  private handleError(error: any) {
    let title = '请求失败'
    let message = '网络请求出现错误'

    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 400:
          title = '请求错误'
          message = data?.message || '请求参数有误'
          break
        case 401:
          title = '未授权'
          message = '请检查您的认证信息'
          break
        case 403:
          title = '禁止访问'
          message = '您没有权限执行此操作'
          break
        case 404:
          title = '未找到'
          message = '请求的资源不存在'
          break
        case 500:
          title = '服务器错误'
          message = data?.message || '服务器内部错误'
          break
        default:
          title = `请求失败 (${status})`
          message = data?.message || '服务器返回错误'
      }
    } else if (error.request) {
      // Network error
      title = '网络错误'
      message = '无法连接到服务器，请检查网络连接'
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      title = '请求超时'
      message = '请求超时，请稍后重试'
    } else {
      // Other errors
      title = '请求失败'
      message = error.message || '未知错误'
    }

    toastService.error(title, message)
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

// Export types
export type { Toast }
