<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-left">
        <span class="logo-icon">🔥</span>
        <h1>pedIN</h1>
        <span class="badge badge-master">Dashboard</span>
      </div>
      <div class="header-center">
        <nav class="nav-links">
          <router-link to="/dashboard" class="nav-link active">📊 Dashboard</router-link>
          <router-link to="/caixa" class="nav-link">💳 Caixa</router-link>
          <router-link to="/cozinha" class="nav-link">🍳 Cozinha</router-link>
        </nav>
      </div>
      <div class="header-right">
        <span class="user-info">Olá, {{ authStore.user?.get('username') }}</span>
        <button @click="handleLogout" class="btn btn-outline btn-sm">Sair</button>
      </div>
    </header>

    <main class="dashboard-main">
      <!-- Cards de Resumo -->
      <section class="stats-grid">
        <div class="stat-card entregues">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.entregues }}</span>
            <span class="stat-label">Pedidos Entregues</span>
          </div>
        </div>

        <div class="stat-card cancelados">
          <div class="stat-icon">❌</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.cancelados }}</span>
            <span class="stat-label">Pedidos Cancelados</span>
          </div>
        </div>

        <div class="stat-card tempo">
          <div class="stat-icon">⏱️</div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.tempoMedio }}</span>
            <span class="stat-label">Tempo Médio</span>
          </div>
        </div>

        <div class="stat-card faturamento">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <span class="stat-value">R$ {{ stats.faturamento.toFixed(2) }}</span>
            <span class="stat-label">Faturamento Total</span>
          </div>
        </div>
      </section>

      <!-- Filtros -->
      <section class="filtros-section">
        <h2>Período</h2>
        <div class="filtros">
          <button 
            @click="setPeriodo('hoje')" 
            :class="['btn', periodo === 'hoje' ? 'btn-primary' : 'btn-outline']"
          >
            Hoje
          </button>
          <button 
            @click="setPeriodo('semana')" 
            :class="['btn', periodo === 'semana' ? 'btn-primary' : 'btn-outline']"
          >
            Esta Semana
          </button>
          <button 
            @click="setPeriodo('mes')" 
            :class="['btn', periodo === 'mes' ? 'btn-primary' : 'btn-outline']"
          >
            Este Mês
          </button>
          <button 
            @click="setPeriodo('todos')" 
            :class="['btn', periodo === 'todos' ? 'btn-primary' : 'btn-outline']"
          >
            Todos
          </button>
        </div>
      </section>

      <!-- Tabela de Pedidos -->
      <section class="pedidos-section">
        <div class="section-header">
          <h2>Histórico de Pedidos</h2>
          <span class="total-registros">{{ pedidos.length }} registros</span>
        </div>

        <div class="tabela-container">
          <table class="tabela-pedidos">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Mesa</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Status</th>
                <th>Tempo</th>
                <th>Data/Hora</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pedido in pedidos" :key="pedido.id">
                <td class="pedido-num">#{{ pedido.get('numeroPedido') || '---' }}</td>
                <td>{{ pedido.get('nome') }}</td>
                <td>{{ pedido.get('mesa') }}</td>
                <td>{{ pedido.get('itens')?.length || 0 }} item(s)</td>
                <td class="pedido-total">R$ {{ pedido.get('total')?.toFixed(2) || '0.00' }}</td>
                <td>
                  <span :class="'badge badge-' + pedido.get('status')">
                    {{ pedido.get('status') }}
                  </span>
                </td>
                <td>{{ calcularTempo(pedido) }}</td>
                <td>{{ formatDateTime(pedido.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Resumo por Item -->
      <section class="resumo-itens-section">
        <h2>Itens Mais Vendidos</h2>
        <div class="itens-grid">
          <div v-for="(qtd, nome) in itensMaisVendidos" :key="nome" class="item-vendido">
            <span class="item-nome">{{ nome }}</span>
            <span class="item-qtd">{{ qtd }}x</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../stores/auth'
import Parse, { Pedido } from '../services/parse'

const router = useRouter()

const periodo = ref('hoje')
const pedidos = ref([])
const loading = ref(false)

const stats = reactive({
  entregues: 0,
  cancelados: 0,
  tempoMedio: '0 min',
  faturamento: 0
})

// Itens mais vendidos
const itensMaisVendidos = computed(() => {
  const contagem = {}
  pedidos.value.forEach(p => {
    const itens = p.get('itens') || []
    itens.forEach(item => {
      const nome = item.produto
      contagem[nome] = (contagem[nome] || 0) + 1
    })
  })
  
  // Ordenar por quantidade
  const sorted = Object.entries(contagem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  
  return Object.fromEntries(sorted)
})

function setPeriodo(p) {
  periodo.value = p
  carregarDados()
}

function getDataInicio() {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  switch (periodo.value) {
    case 'hoje':
      return hoje
    case 'semana':
      const semana = new Date(hoje)
      semana.setDate(semana.getDate() - 7)
      return semana
    case 'mes':
      const mes = new Date(hoje)
      mes.setMonth(mes.getMonth() - 1)
      return mes
    default:
      return null
  }
}

async function carregarDados() {
  loading.value = true
  
  try {
    const query = new Parse.Query(Pedido)
    
    const dataInicio = getDataInicio()
    if (dataInicio) {
      query.greaterThanOrEqualTo('createdAt', dataInicio)
    }
    
    query.descending('createdAt')
    query.limit(500)
    
    const results = await query.find()
    pedidos.value = results
    
    calcularEstatisticas(results)
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  } finally {
    loading.value = false
  }
}

function calcularEstatisticas(pedidosList) {
  const entregues = pedidosList.filter(p => p.get('status') === 'entregue')
  const cancelados = pedidosList.filter(p => p.get('status') === 'cancelado')
  
  stats.entregues = entregues.length
  stats.cancelados = cancelados.length
  
  // Faturamento (apenas entregues)
  stats.faturamento = entregues.reduce((sum, p) => sum + (p.get('total') || 0), 0)
  
  // Tempo médio (do criado até atualizado para entregue)
  if (entregues.length > 0) {
    let totalMinutos = 0
    entregues.forEach(p => {
      const criado = new Date(p.createdAt)
      const atualizado = new Date(p.updatedAt)
      const diffMs = atualizado - criado
      totalMinutos += diffMs / 1000 / 60
    })
    const media = totalMinutos / entregues.length
    stats.tempoMedio = `${Math.round(media)} min`
  } else {
    stats.tempoMedio = '0 min'
  }
}

function calcularTempo(pedido) {
  const criado = new Date(pedido.createdAt)
  const atualizado = new Date(pedido.updatedAt)
  const diffMs = atualizado - criado
  const minutos = Math.round(diffMs / 1000 / 60)
  return `${minutos} min`
}

function formatDateTime(date) {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  carregarDados()
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
}

.dashboard-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left .logo-icon {
  font-size: 28px;
}

.header-left h1 {
  font-size: 1.5rem;
  margin: 0;
  background: var(--gradient-main);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.badge-master {
  background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
  color: #0a0a0f;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-links {
  display: flex;
  gap: 8px;
}

.nav-link {
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-link.router-link-active {
  background: var(--gradient-main);
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.dashboard-main {
  flex: 1;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.stat-card.entregues {
  border-left: 4px solid #00c896;
}

.stat-card.cancelados {
  border-left: 4px solid #ff006e;
}

.stat-card.tempo {
  border-left: 4px solid #3a86ff;
}

.stat-card.faturamento {
  border-left: 4px solid #ffd700;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
}

.stat-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Filtros */
.filtros-section {
  margin-bottom: 32px;
}

.filtros-section h2 {
  font-size: 1.2rem;
  margin-bottom: 16px;
  color: #fff;
}

.filtros {
  display: flex;
  gap: 12px;
}

/* Tabela */
.pedidos-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 1.3rem;
  color: #fff;
  margin: 0;
}

.total-registros {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

.tabela-container {
  overflow-x: auto;
}

.tabela-pedidos {
  width: 100%;
  border-collapse: collapse;
}

.tabela-pedidos th,
.tabela-pedidos td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.tabela-pedidos th {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
}

.tabela-pedidos td {
  color: #fff;
  font-size: 0.9rem;
}

.tabela-pedidos tr:hover td {
  background: rgba(255, 255, 255, 0.03);
}

.pedido-num {
  font-weight: 700;
  color: var(--primary-cyan) !important;
}

.pedido-total {
  font-weight: 600;
  color: #00c896 !important;
}

/* Itens mais vendidos */
.resumo-itens-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.resumo-itens-section h2 {
  font-size: 1.3rem;
  color: #fff;
  margin-bottom: 20px;
}

.itens-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.item-vendido {
  background: rgba(255, 255, 255, 0.08);
  padding: 16px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-nome {
  font-weight: 500;
  color: #fff;
}

.item-qtd {
  background: var(--gradient-main);
  padding: 4px 12px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.85rem;
}

@media (max-width: 1000px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filtros {
    flex-wrap: wrap;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
