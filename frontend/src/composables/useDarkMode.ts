import { ref, watch, onMounted } from 'vue'

const isDark = ref(false)

export function useDarkMode() {
  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    updateDOM()
    localStorage.setItem('darkMode', isDark.value ? 'dark' : 'light')
  }

  const updateDOM = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const initDarkMode = () => {
    // Check localStorage first
    const savedMode = localStorage.getItem('darkMode')
    
    if (savedMode) {
      isDark.value = savedMode === 'dark'
    } else {
      // Check system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    
    updateDOM()
  }

  return {
    isDark,
    toggleDarkMode,
    initDarkMode
  }
}

