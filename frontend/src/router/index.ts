import { createRouter, createWebHistory } from 'vue-router'
import Chat from '../views/Chat.vue'
import KnowledgeBase from '../views/KnowledgeBase.vue'
import Settings from '../views/Settings.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Chat',
      component: Chat
    },
    {
      path: '/knowledge-base',
      name: 'KnowledgeBase',
      component: KnowledgeBase
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    }
  ]
})

export default router

