<template>
  <div class="caixa-container">
    <!-- Header -->
    <header class="caixa-header">
      <div class="header-left">
        <span class="logo-icon">🔥</span>
        <h1>pedIN</h1>
        <span class="badge badge-caixa">Caixa</span>
      </div>
      <div class="header-right">
        <span class="user-info">Olá, {{ authStore.user?.get('username') }}</span>
        <button @click="handleLogout" class="btn btn-outline btn-sm">Sair</button>
      </div>
    </header>

    <main class="caixa-main">
      <!-- Formulário de Pedido -->
      <section class="pedido-form-section">
        <h2>Novo Pedido</h2>
        
        <form @submit.prevent="criarPedido" class="pedido-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nome do Cliente *</label>
              <input 
                type="text" 
                v-model="pedido.nome" 
                class="form-input" 
                placeholder="Nome do cliente"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">Telefone</label>
              <input 
                type="tel" 
                v-model="pedido.telefone" 
                class="form-input" 
                placeholder="(51) 99999-9999"
              />
            </div>
            <div class="form-group form-group-sm">
              <label class="form-label">Mesa *</label>
              <input 
                type="number" 
                v-model="pedido.mesa" 
                class="form-input" 
                placeholder="Nº"
                min="1"
                required
              />
            </div>
          </div>

          <!-- Cardápio -->
          <div class="cardapio-section">
            <h3>Cardápio</h3>
            
            <!-- Crepe -->
            <div class="cardapio-categoria">
              <div class="categoria-header">
                <h4>🥞 Crepe - R$ 12,00</h4>
              </div>
              <div class="crepe-grid">
                <div 
                  v-for="sabor in saboresCrepe" 
                  :key="sabor"
                  class="crepe-item"
                  :class="{ disabled: !isItemDisponivel('Crepe - ' + sabor) }"
                >
                  <span class="crepe-sabor">{{ sabor }}</span>
                  <div class="quantidade-controle">
                    <button 
                      type="button"
                      @click="diminuirCrepe(sabor)" 
                      class="btn btn-sm btn-outline"
                      :disabled="!isItemDisponivel('Crepe - ' + sabor) || getQuantidadeCrepe(sabor) === 0"
                    >-</button>
                    <span class="quantidade">{{ getQuantidadeCrepe(sabor) }}</span>
                    <button 
                      type="button"
                      @click="aumentarCrepe(sabor)" 
                      class="btn btn-sm btn-outline"
                      :disabled="!isItemDisponivel('Crepe - ' + sabor)"
                    >+</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Milho -->
            <div class="cardapio-categoria">
              <div class="categoria-header">
                <h4>🌽 Milho - R$ 8,00</h4>
              </div>
              <div class="item-grid">
                <div 
                  v-for="variacaoMilho in variacoesMilho" 
                  :key="variacaoMilho.id"
                  class="item-card"
                >
                  <span class="item-nome">{{ variacaoMilho.nome }}</span>
                  <div class="quantidade-controle">
                    <button 
                      type="button"
                      @click="diminuirMilho(variacaoMilho.id)" 
                      class="btn btn-sm btn-outline"
                      :disabled="getMilhoQuantidade(variacaoMilho.id) === 0"
                    >-</button>
                    <span class="quantidade">{{ getMilhoQuantidade(variacaoMilho.id) }}</span>
                    <button 
                      type="button"
                      @click="aumentarMilho(variacaoMilho.id)" 
                      class="btn btn-sm btn-outline"
                    >+</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Açaí -->
            <div class="cardapio-categoria">
              <div class="categoria-header">
                <h4>🍇 Açaí 300ml - R$ 14,00</h4>
                <span class="info-text">(2 acompanhamentos inclusos, +R$3 cada adicional)</span>
              </div>
              <div class="acai-container">
                <div class="acai-quantidade-row">
                  <span class="item-nome">Açaí 300ml</span>
                  <div class="quantidade-controle">
                    <button 
                      type="button"
                      @click="diminuirAcai" 
                      class="btn btn-sm btn-outline"
                      :disabled="acaiQuantidade === 0"
                    >-</button>
                    <span class="quantidade">{{ acaiQuantidade }}</span>
                    <button 
                      type="button"
                      @click="aumentarAcai" 
                      class="btn btn-sm btn-outline"
                    >+</button>
                  </div>
                </div>
                <div v-if="acaiQuantidade > 0" class="acai-acompanhamentos">
                  <label class="form-label">Acompanhamentos (2 inclusos por açaí):</label>
                  <div class="checkbox-group">
                    <div 
                      v-for="acomp in acompanhamentosAcai" 
                      :key="acomp"
                      class="checkbox-item"
                      :class="{ disabled: !isItemDisponivel('Açaí - ' + acomp) }"
                    >
                      <input 
                        type="checkbox" 
                        :id="'acai-' + acomp"
                        :value="acomp"
                        v-model="acaiAcompanhamentos"
                        :disabled="!isItemDisponivel('Açaí - ' + acomp)"
                      />
                      <label :for="'acai-' + acomp">{{ acomp }}</label>
                    </div>
                  </div>
                  <div v-if="acaiExtrasCount > 0" class="acai-extras-info">
                    ⚠️ {{ acaiExtrasCount }} acompanhamento(s) extra(s): +R$ {{ (acaiExtrasCount * 3).toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Bebidas -->
            <div class="cardapio-categoria">
              <div class="categoria-header">
                <h4>🥤 Bebidas</h4>
              </div>
              <div class="item-grid">
                <div 
                  v-for="bebida in bebidasIndividuais" 
                  :key="bebida.nome"
                  class="item-card"
                >
                  <div class="item-info">
                    <span class="item-nome">{{ bebida.nome }}</span>
                    <span class="item-preco">R$ {{ bebida.preco.toFixed(2) }}</span>
                  </div>
                  <div class="quantidade-controle">
                    <button 
                      type="button"
                      @click="diminuirBebida(bebida.nome)" 
                      class="btn btn-sm btn-outline"
                      :disabled="getBebidaQuantidade(bebida.nome) === 0"
                    >-</button>
                    <span class="quantidade">{{ getBebidaQuantidade(bebida.nome) }}</span>
                    <button 
                      type="button"
                      @click="aumentarBebida(bebida.nome)" 
                      class="btn btn-sm btn-outline"
                    >+</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Combo -->
            <div class="cardapio-categoria combo-section">
              <div class="categoria-header">
                <h4>🎉 Combo - R$ 26,00</h4>
                <span class="info-text">2 crepes (qualquer sabor) + 1 bebida</span>
              </div>
              <div class="combo-quantidade-row">
                <span class="item-nome">Combo</span>
                <div class="quantidade-controle">
                  <button 
                    type="button"
                    @click="diminuirCombo" 
                    class="btn btn-sm btn-outline"
                    :disabled="comboQuantidade === 0 || !isItemDisponivel('Combo')"
                  >-</button>
                  <span class="quantidade">{{ comboQuantidade }}</span>
                  <button 
                    type="button"
                    @click="aumentarCombo" 
                    class="btn btn-sm btn-outline"
                    :disabled="!isItemDisponivel('Combo')"
                  >+</button>
                </div>
              </div>
              
              <div v-if="comboQuantidade > 0" class="combo-options">
                <div class="combo-group">
                  <label class="form-label">Crepe 1:</label>
                  <select v-model="combo.crepe1" class="form-input">
                    <option value="">Selecione...</option>
                    <option v-for="sabor in saboresCrepe" :key="'c1-' + sabor" :value="sabor">
                      {{ sabor }}
                    </option>
                  </select>
                </div>
                <div class="combo-group">
                  <label class="form-label">Crepe 2:</label>
                  <select v-model="combo.crepe2" class="form-input">
                    <option value="">Selecione...</option>
                    <option v-for="sabor in saboresCrepe" :key="'c2-' + sabor" :value="sabor">
                      {{ sabor }}
                    </option>
                  </select>
                </div>
                <div class="combo-group">
                  <label class="form-label">Bebida:</label>
                  <select v-model="combo.bebida" class="form-input">
                    <option value="">Selecione...</option>
                    <option v-for="bebida in bebidasCombo" :key="bebida" :value="bebida">
                      {{ bebida }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          <!-- Observações -->
          <div class="form-group">
            <label class="form-label">Observações</label>
            <textarea 
              v-model="pedido.observacoes" 
              class="form-input" 
              placeholder="Ex: Sem cebola, bem passado, alergia a amendoim..."
              rows="3"
            ></textarea>
          </div>

          <!-- Total e Botão -->
          <div class="pedido-footer">
            <div class="total-display">
              <span>Total:</span>
              <span class="total-value">R$ {{ calcularTotal.toFixed(2) }}</span>
            </div>
            <button type="submit" class="btn btn-success" :disabled="loading || (totalCrepes === 0 && totalMilho === 0 && acaiQuantidade === 0 && totalBebidas === 0 && comboQuantidade === 0 && extras.filter(e => e).length === 0)">
              <span v-if="loading" class="spinner-sm"></span>
              <span v-else>Criar Pedido</span>
            </button>
          </div>
        </form>
      </section>

      <!-- Pedidos Recentes -->
      <section class="pedidos-recentes">
        <h2>Pedidos Recentes</h2>
        <div v-if="pedidosRecentes.length === 0" class="empty-state">
          <p>Nenhum pedido ainda</p>
        </div>
        <div v-else class="pedidos-list">
          <div 
            v-for="p in pedidosRecentes" 
            :key="p.id" 
            class="pedido-card-mini"
            :class="{ 'has-obs': p.get('observacoes') }"
          >
            <div class="pedido-header-mini">
              <span class="pedido-numero">#{{ p.get('numeroPedido') || '---' }}</span>
              <span class="pedido-mesa">Mesa {{ p.get('mesa') }}</span>
              <span 
                class="pedido-origem" 
                :class="p.get('origem') === 'whatsapp' ? 'origem-wpp' : 'origem-sistema'"
              >
                {{ p.get('origem') === 'whatsapp' ? '📱' : '💻' }}
              </span>
              <span :class="'badge badge-' + p.get('status')">{{ p.get('status') }}</span>
            </div>
            <div class="pedido-nome">{{ p.get('nome') }}</div>
            <div class="pedido-total">R$ {{ p.get('total').toFixed(2) }}</div>
          </div>
        </div>
      </section>
    </main>

    <!-- Toast -->
    <div v-if="toast.show" :class="['toast', 'toast-' + toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../stores/auth'
import Parse, { Pedido, ItemCardapio, getProximoNumeroPedido } from '../services/parse'

const router = useRouter()

// Dados do cardápio
const saboresCrepe = ['Frango', 'Queijo', 'Calabresa e queijo', 'Batom branco', 'Batom preto', 'Stikadinho']
const apresentacaoMilho = ['Na espiga', 'No potinho']
const tipoMilho = ['Com manteiga', 'Sem manteiga']
const acompanhamentosAcai = ['Banana', 'Morango', 'Abacaxi', 'Leite condensado', 'Leite em pó']
const bebidasCombo = ['Refrigerante', 'Água com gás', 'Água sem gás']
const bebidasIndividuais = [
  { nome: 'Água com gás', preco: 3 },
  { nome: 'Água sem gás', preco: 3 },
  { nome: 'Refri Coca', preco: 5 }
]

// Estado
const loading = ref(false)
const pedidosRecentes = ref([])
const itensCardapio = ref([])
const toast = reactive({ show: false, message: '', type: 'success' })

const pedido = reactive({
  nome: '',
  telefone: '',
  mesa: null,
  itens: [],
  observacoes: ''
})

// Quantidade de crepes por sabor
const crepesQuantidade = reactive({})
saboresCrepe.forEach(sabor => {
  crepesQuantidade[sabor] = 0
})

// Variações de milho (combinações de apresentação e tipo)
const variacoesMilho = [
  { id: 'espiga-com', nome: 'Na espiga c/ manteiga', apresentacao: 'Na espiga', tipo: 'Com manteiga' },
  { id: 'espiga-sem', nome: 'Na espiga s/ manteiga', apresentacao: 'Na espiga', tipo: 'Sem manteiga' },
  { id: 'potinho-com', nome: 'No potinho c/ manteiga', apresentacao: 'No potinho', tipo: 'Com manteiga' },
  { id: 'potinho-sem', nome: 'No potinho s/ manteiga', apresentacao: 'No potinho', tipo: 'Sem manteiga' }
]

// Quantidade de milho por variação
const milhoQuantidade = reactive({})
variacoesMilho.forEach(v => {
  milhoQuantidade[v.id] = 0
})

// Açaí
const acaiQuantidade = ref(0)
const acaiAcompanhamentos = ref([])

// Bebidas - quantidade por tipo
const bebidasQuantidade = reactive({})
bebidasIndividuais.forEach(b => {
  bebidasQuantidade[b.nome] = 0
})

// Combo
const comboQuantidade = ref(0)
const combo = reactive({
  crepe1: '',
  crepe2: '',
  bebida: ''
})

const extras = ref([''])

// LiveQuery subscription
let cardapioSubscription = null
let cardapioPolling = null

// Verificar disponibilidade de item
function isItemDisponivel(nomeItem) {
  const item = itensCardapio.value.find(i => i.get('nome') === nomeItem)
  return item ? item.get('disponivel') : true
}

// Funções para controle de quantidade de crepes
function getQuantidadeCrepe(sabor) {
  return crepesQuantidade[sabor] || 0
}

function aumentarCrepe(sabor) {
  crepesQuantidade[sabor] = (crepesQuantidade[sabor] || 0) + 1
}

function diminuirCrepe(sabor) {
  if (crepesQuantidade[sabor] > 0) {
    crepesQuantidade[sabor]--
  }
}

// Total de crepes selecionados
const totalCrepes = computed(() => {
  return Object.values(crepesQuantidade).reduce((sum, qtd) => sum + qtd, 0)
})

// Funções para Milho
function getMilhoQuantidade(id) {
  return milhoQuantidade[id] || 0
}

function aumentarMilho(id) {
  milhoQuantidade[id] = (milhoQuantidade[id] || 0) + 1
}

function diminuirMilho(id) {
  if (milhoQuantidade[id] > 0) {
    milhoQuantidade[id]--
  }
}

const totalMilho = computed(() => {
  return Object.values(milhoQuantidade).reduce((sum, qtd) => sum + qtd, 0)
})

// Funções para Açaí
function aumentarAcai() {
  acaiQuantidade.value++
}

function diminuirAcai() {
  if (acaiQuantidade.value > 0) {
    acaiQuantidade.value--
    // Se zerou, limpa os acompanhamentos
    if (acaiQuantidade.value === 0) {
      acaiAcompanhamentos.value = []
    }
  }
}

// Funções para Bebidas
function getBebidaQuantidade(nome) {
  return bebidasQuantidade[nome] || 0
}

function aumentarBebida(nome) {
  bebidasQuantidade[nome] = (bebidasQuantidade[nome] || 0) + 1
}

function diminuirBebida(nome) {
  if (bebidasQuantidade[nome] > 0) {
    bebidasQuantidade[nome]--
  }
}

const totalBebidas = computed(() => {
  return Object.values(bebidasQuantidade).reduce((sum, qtd) => sum + qtd, 0)
})

// Funções para Combo
function aumentarCombo() {
  comboQuantidade.value++
}

function diminuirCombo() {
  if (comboQuantidade.value > 0) {
    comboQuantidade.value--
    // Se zerou, limpa as opções
    if (comboQuantidade.value === 0) {
      combo.crepe1 = ''
      combo.crepe2 = ''
      combo.bebida = ''
    }
  }
}

// Calcular total
const calcularTotal = computed(() => {
  let total = 0

  // Crepes (com quantidade)
  Object.entries(crepesQuantidade).forEach(([sabor, qtd]) => {
    total += qtd * 12
  })

  // Milho (com quantidade por variação)
  Object.entries(milhoQuantidade).forEach(([id, qtd]) => {
    total += qtd * 8
  })

  // Açaí (com quantidade)
  if (acaiQuantidade.value > 0) {
    // Preço base por açaí
    total += acaiQuantidade.value * 14
    // Acompanhamentos extras (mais de 2 por açaí total)
    const acompanhamentosInclusos = acaiQuantidade.value * 2
    const acompanhamentosExtras = Math.max(0, acaiAcompanhamentos.value.length - acompanhamentosInclusos)
    total += acompanhamentosExtras * 3
  }

  // Bebidas (com quantidade)
  bebidasIndividuais.forEach(bebida => {
    const qtd = bebidasQuantidade[bebida.nome] || 0
    total += qtd * bebida.preco
  })

  // Combo (com quantidade)
  total += comboQuantidade.value * 26

  // Extras
  extras.value.forEach(extra => {
    if (extra) total += 3
  })

  return total
})

// Calcular extras do açaí (2 acompanhamentos inclusos por açaí)
const acaiExtrasCount = computed(() => {
  const acompanhamentosInclusos = acaiQuantidade.value * 2
  return Math.max(0, acaiAcompanhamentos.value.length - acompanhamentosInclusos)
})

// Gerenciar extras
function adicionarExtra() {
  extras.value.push('')
}

function removerExtra(index) {
  extras.value.splice(index, 1)
}

// Criar pedido
async function criarPedido() {
  loading.value = true

  try {
    // Obtém próximo número de pedido
    const numeroPedido = await getProximoNumeroPedido()
    
    const novoPedido = new Pedido()
    
    // Montar lista de itens
    const itensFinais = []

    // Adicionar crepes com quantidade
    Object.entries(crepesQuantidade).forEach(([sabor, qtd]) => {
      if (qtd > 0) {
        itensFinais.push({
          produto: 'Crepe',
          sabor: sabor,
          quantidade: qtd,
          preco: 12
        })
      }
    })

    // Adicionar milho com quantidade
    variacoesMilho.forEach(variacao => {
      const qtd = milhoQuantidade[variacao.id] || 0
      if (qtd > 0) {
        itensFinais.push({
          produto: 'Milho',
          apresentacao: variacao.apresentacao,
          tipo: variacao.tipo,
          quantidade: qtd,
          preco: 8
        })
      }
    })

    // Adicionar açaí com quantidade
    if (acaiQuantidade.value > 0) {
      const acompanhamentosInclusos = acaiQuantidade.value * 2
      const extrasAcai = Math.max(0, acaiAcompanhamentos.value.length - acompanhamentosInclusos)
      const precoUnitarioAcai = 14
      const precoExtras = extrasAcai * 3
      itensFinais.push({
        produto: 'Açaí 300ml',
        acompanhamentos: acaiAcompanhamentos.value,
        quantidade: acaiQuantidade.value,
        extrasAcai: extrasAcai,
        preco: precoUnitarioAcai,
        precoExtras: precoExtras
      })
    }

    // Adicionar bebidas com quantidade
    bebidasIndividuais.forEach(bebida => {
      const qtd = bebidasQuantidade[bebida.nome] || 0
      if (qtd > 0) {
        itensFinais.push({
          produto: bebida.nome,
          quantidade: qtd,
          preco: bebida.preco
        })
      }
    })

    // Adicionar combo com quantidade
    if (comboQuantidade.value > 0) {
      itensFinais.push({
        produto: 'Combo',
        crepe1: combo.crepe1,
        crepe2: combo.crepe2,
        bebida: combo.bebida,
        quantidade: comboQuantidade.value,
        preco: 26
      })
    }

    // Adicionar extras
    extras.value.forEach(extra => {
      if (extra) {
        itensFinais.push({
          produto: 'Acompanhamento Extra',
          sabor: extra,
          preco: 3
        })
      }
    })

    novoPedido.set('numeroPedido', numeroPedido)
    novoPedido.set('nome', pedido.nome)
    novoPedido.set('telefone', pedido.telefone)
    novoPedido.set('mesa', parseInt(pedido.mesa))
    novoPedido.set('itens', itensFinais)
    novoPedido.set('observacoes', pedido.observacoes)
    novoPedido.set('total', calcularTotal.value)
    novoPedido.set('status', 'pendente')
    novoPedido.set('origem', 'sistema') // Pedido criado via interface do sistema

    await novoPedido.save()

    showToast(`Pedido #${numeroPedido} criado com sucesso!`, 'success')
    limparFormulario()
    carregarPedidosRecentes()
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    showToast('Erro ao criar pedido. Tente novamente.', 'error')
  } finally {
    loading.value = false
  }
}

// Limpar formulário
function limparFormulario() {
  pedido.nome = ''
  pedido.telefone = ''
  pedido.mesa = null
  pedido.itens = []
  pedido.observacoes = ''
  // Resetar quantidades de crepes
  saboresCrepe.forEach(sabor => {
    crepesQuantidade[sabor] = 0
  })
  // Resetar quantidades de milho
  variacoesMilho.forEach(v => {
    milhoQuantidade[v.id] = 0
  })
  // Resetar açaí
  acaiQuantidade.value = 0
  acaiAcompanhamentos.value = []
  // Resetar bebidas
  bebidasIndividuais.forEach(b => {
    bebidasQuantidade[b.nome] = 0
  })
  // Resetar combo
  comboQuantidade.value = 0
  combo.crepe1 = ''
  combo.crepe2 = ''
  combo.bebida = ''
  extras.value = ['']
}

// Carregar pedidos recentes
async function carregarPedidosRecentes() {
  try {
    const query = new Parse.Query(Pedido)
    query.descending('createdAt')
    query.limit(10)
    const results = await query.find()
    pedidosRecentes.value = results
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error)
  }
}

// Carregar itens do cardápio (disponibilidade)
async function carregarItensCardapio() {
  try {
    const query = new Parse.Query(ItemCardapio)
    const results = await query.find()
    itensCardapio.value = results

    // Configurar LiveQuery para atualizações em tempo real
    const liveQuery = new Parse.Query(ItemCardapio)
    cardapioSubscription = await liveQuery.subscribe()

    cardapioSubscription.on('update', (item) => {
      const index = itensCardapio.value.findIndex(i => i.id === item.id)
      if (index !== -1) {
        itensCardapio.value[index] = item
      }
    })
  } catch (error) {
    console.error('Erro ao carregar cardápio:', error)
  }
}

// Toast
function showToast(message, type) {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 3000)
}

// Logout
async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  carregarPedidosRecentes()
  carregarItensCardapio()
  
  // Polling a cada 5 segundos para atualizar disponibilidade
  cardapioPolling = setInterval(async () => {
    try {
      const query = new Parse.Query(ItemCardapio)
      const results = await query.find()
      itensCardapio.value = results
    } catch (error) {
      console.error('Erro ao atualizar cardápio:', error)
    }
  }, 5000)
})

onUnmounted(() => {
  if (cardapioSubscription) {
    cardapioSubscription.unsubscribe()
  }
  if (cardapioPolling) {
    clearInterval(cardapioPolling)
  }
})
</script>

<style scoped>
.caixa-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.caixa-header {
  background: rgba(15, 15, 25, 0.9);
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
}

.badge-caixa {
  background: var(--gradient-success);
  color: #0a0a0f;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  color: var(--text-secondary);
  font-size: 14px;
}

.caixa-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 24px;
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.pedido-form-section {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 32px;
}

.pedido-form-section h2 {
  margin-bottom: 24px;
  background: var(--gradient-main);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 100px;
  gap: 16px;
  margin-bottom: 24px;
}

.form-group-sm {
  max-width: 100px;
}

.cardapio-section h3 {
  margin-bottom: 20px;
  font-size: 1.4rem;
}

.cardapio-categoria {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.categoria-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.categoria-header h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.info-text {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* Crepe Grid com Quantidade */
.crepe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.crepe-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
}

.crepe-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.crepe-item.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.crepe-sabor {
  font-weight: 500;
  color: var(--text-primary);
}

.quantidade-controle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 8px;
  border-radius: 8px;
}

.quantidade-controle .quantidade {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
  color: var(--primary-cyan);
  font-size: 1.1rem;
}

.quantidade-controle button {
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

/* Grid de itens genérico */
.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
}

.item-card:hover {
  background: rgba(255, 255, 255, 0.08);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-nome {
  font-weight: 500;
  color: var(--text-primary);
}

.item-preco {
  font-size: 0.85rem;
  color: var(--primary-cyan);
}

/* Açaí quantidade row */
.acai-quantidade-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
}

/* Combo quantidade row */
.combo-quantidade-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(131, 56, 236, 0.2);
  border-radius: 10px;
  border: 1px solid rgba(131, 56, 236, 0.3);
  margin-bottom: 16px;
}

.acai-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.acai-toggle,
.combo-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
}

.acai-toggle input,
.combo-toggle input {
  width: 20px;
  height: 20px;
  accent-color: var(--primary-pink);
}

.acai-toggle label,
.combo-toggle label,
.milho-toggle label {
  font-weight: 500;
  cursor: pointer;
}

.milho-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.milho-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
}

.milho-toggle input {
  width: 20px;
  height: 20px;
  accent-color: var(--primary-pink);
}

.milho-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.milho-group label.form-label {
  margin-bottom: 10px;
}

.acai-acompanhamentos {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.acai-extras-info {
  background: rgba(255, 107, 53, 0.2);
  border: 1px solid var(--primary-orange);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.9rem;
  color: var(--primary-orange);
  font-weight: 500;
}

.combo-section {
  border: 2px solid var(--primary-purple);
  background: rgba(131, 56, 236, 0.1);
}

.combo-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.combo-group-full {
  grid-column: span 3;
}

.combo-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Fix dropdown/select styling */
select.form-input {
  background-color: #1a1a2e;
  color: #ffffff;
  cursor: pointer;
}

select.form-input option {
  background-color: #1a1a2e;
  color: #ffffff;
  padding: 10px;
}

.extras-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.extra-item {
  display: flex;
  gap: 12px;
}

.extra-item .form-input {
  flex: 1;
}

.pedido-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.total-display {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 1.2rem;
}

.total-value {
  font-size: 2rem;
  font-weight: 800;
  background: var(--gradient-success);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Pedidos Recentes */
.pedidos-recentes {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border-radius: var(--border-radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 100px;
}

.pedidos-recentes h2 {
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.pedidos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pedido-card-mini {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}

.pedido-card-mini:hover {
  background: rgba(255, 255, 255, 0.08);
}

.pedido-card-mini.has-obs {
  border-left: 4px solid var(--primary-orange);
}

.pedido-header-mini {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.pedido-numero {
  font-weight: 700;
  color: var(--primary-cyan);
}

.pedido-mesa {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.pedido-origem {
  padding: 2px 6px;
  border-radius: 50px;
  font-size: 0.7rem;
}

.origem-wpp {
  background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
}

.origem-sistema {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.pedido-nome {
  font-weight: 500;
  margin-bottom: 4px;
}

.pedido-total {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.spinner-sm {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-left-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@media (max-width: 1100px) {
  .caixa-main {
    grid-template-columns: 1fr;
  }
  
  .pedidos-recentes {
    position: static;
  }
  
  .form-row {
    grid-template-columns: 1fr 1fr;
  }
  
  .form-group-sm {
    max-width: none;
  }
  
  .combo-options {
    grid-template-columns: 1fr;
  }
  
  .combo-group-full {
    grid-column: span 1;
  }
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .caixa-header {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
