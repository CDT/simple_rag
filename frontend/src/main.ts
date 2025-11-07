import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import 'highlight.js/styles/github-dark.css' // Syntax highlighting theme
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')

