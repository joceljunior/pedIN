import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { authStore } from './stores/auth'

// Inicializa o auth store antes de montar o app
authStore.init().then(() => {
  const app = createApp(App)
  app.use(router)
  app.mount('#app')
})
