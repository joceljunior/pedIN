<template>
  <div class="login-container">
    <div class="login-bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
    
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <span class="logo-icon">🔥</span>
          <h1>pedIN</h1>
        </div>
        <p class="subtitle">Inconformados Jovens</p>
        <p class="church-name">Igreja Batista Filadélfia de Canoas</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label">Usuário</label>
          <input 
            type="text" 
            v-model="username" 
            class="form-input" 
            placeholder="Digite seu usuário"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Senha</label>
          <input 
            type="password" 
            v-model="password" 
            class="form-input" 
            placeholder="Digite sua senha"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
          <span v-if="loading" class="spinner-sm"></span>
          <span v-else>Entrar</span>
        </button>
      </form>

      <div class="login-footer">
        <p>Evento Especial 2026</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../stores/auth'

const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true

  try {
    const result = await authStore.login(username.value, password.value)
    
    if (result.success) {
      if (result.role === 'caixa') {
        router.push('/caixa')
      } else if (result.role === 'cozinha') {
        router.push('/cozinha')
      } else if (result.role === 'master') {
        router.push('/dashboard')
      }
    } else {
      error.value = 'Usuário ou senha inválidos'
    }
  } catch (err) {
    error.value = 'Erro ao fazer login. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-bg-shapes {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: var(--primary-pink);
  top: -100px;
  left: -100px;
  animation: float 8s ease-in-out infinite;
}

.shape-2 {
  width: 500px;
  height: 500px;
  background: var(--primary-purple);
  bottom: -150px;
  right: -150px;
  animation: float 10s ease-in-out infinite reverse;
}

.shape-3 {
  width: 300px;
  height: 300px;
  background: var(--primary-cyan);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(5deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.5;
  }
}

.login-card {
  background: rgba(15, 15, 25, 0.85);
  backdrop-filter: blur(30px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  padding: 48px;
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.logo-icon {
  font-size: 48px;
  animation: flame 1s ease-in-out infinite alternate;
}

@keyframes flame {
  0% {
    transform: scale(1) rotate(-5deg);
  }
  100% {
    transform: scale(1.1) rotate(5deg);
  }
}

.logo h1 {
  font-size: 3rem;
  font-weight: 800;
  margin: 0;
}

.subtitle {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-cyan);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.church-name {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.login-form {
  margin-bottom: 24px;
}

.btn-full {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  margin-top: 10px;
}

.error-message {
  background: rgba(255, 0, 110, 0.15);
  border: 1px solid var(--primary-pink);
  border-radius: 8px;
  padding: 12px 16px;
  color: var(--primary-pink);
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
}

.spinner-sm {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-left-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

.login-footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.login-footer p {
  font-size: 0.85rem;
  color: var(--text-muted);
}
</style>
