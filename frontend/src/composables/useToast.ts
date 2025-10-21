import { ref, readonly } from 'vue'

export interface Toast {
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
    
    // Set default duration based on toast type if not provided
    const defaultDuration = this.getDefaultDuration(toast.type)
    const duration = toast.duration ?? defaultDuration
    
    const newToast: Toast = {
      id,
      duration,
      ...toast
    }
    
    this.toasts.value.push(newToast)
    
    // Auto remove after duration (only if duration > 0)
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(id)
      }, duration)
    }
    
    return id
  }

  private getDefaultDuration(type: Toast['type']): number {
    const durations = {
      success: 3000,  // 3 seconds for success messages
      error: 3000,    // 3 seconds for error messages
      warning: 3000,  // 3 seconds for warnings
      info: 3000      // 3 seconds for info messages
    }
    return durations[type]
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

// Composable for easy access in components
export function useToast() {
  return {
    toasts: toastService.toastsList,
    success: toastService.success.bind(toastService),
    error: toastService.error.bind(toastService),
    warning: toastService.warning.bind(toastService),
    info: toastService.info.bind(toastService),
    remove: toastService.removeToast.bind(toastService)
  }
}
