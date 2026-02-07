<template>
  <div class="cozinha-container">
    <!-- Header -->
    <header class="cozinha-header">
      <div class="header-left">
        <span class="logo-icon">🔥</span>
        <h1>pedIN</h1>
        <span class="badge badge-cozinha">Cozinha</span>
      </div>
      <div class="header-center">
        <button 
          @click="showEstoqueModal = true" 
          class="btn btn-warning"
        >
          📦 Controle de Estoque
        </button>
      </div>
      <div class="header-right">
        <span class="stats">
          <span class="stat-item">
            <span class="stat-number">{{ pedidosPendentes.length }}</span>
            <span class="stat-label">Pendentes</span>
          </span>
          <span class="stat-item">
            <span class="stat-number">{{ pedidosFazendo.length }}</span>
            <span class="stat-label">Fazendo</span>
          </span>
          <span class="stat-item stat-entregues">
            <span class="stat-number">{{ totalEntregues }}</span>
            <span class="stat-label">Entregues</span>
          </span>
        </span>
        <button @click="handleLogout" class="btn btn-outline btn-sm">Sair</button>
      </div>
    </header>

    <main class="kanban-board">
      <!-- Coluna Pendentes -->
      <div class="kanban-column pendente">
        <div class="column-header">
          <h2>⏳ Pendentes</h2>
          <span class="column-count">{{ pedidosPendentes.length }}</span>
        </div>
        <div class="column-content">
          <div 
            v-for="pedido in pedidosPendentes" 
            :key="pedido.id"
            class="pedido-card"
            :class="{ 'has-observacoes': pedido.get('observacoes') }"
          >
            <div class="card-header">
              <span class="pedido-numero">#{{ pedido.get('numeroPedido') || '---' }}</span>
              <span class="pedido-mesa">Mesa {{ pedido.get('mesa') }}</span>
              <span 
                class="pedido-origem" 
                :class="pedido.get('origem') === 'whatsapp' ? 'origem-wpp' : 'origem-sistema'"
                :title="pedido.get('origem') === 'whatsapp' ? 'Pedido via WhatsApp' : 'Pedido via Sistema'"
              >
                {{ pedido.get('origem') === 'whatsapp' ? '📱 WPP' : '💻 SIS' }}
              </span>
              <span class="pedido-time">{{ formatTime(pedido.createdAt) }}</span>
            </div>
            <div class="card-cliente">
              <strong>{{ pedido.get('nome') }}</strong>
              <span v-if="pedido.get('telefone')">{{ pedido.get('telefone') }}</span>
            </div>
            <div class="card-itens">
              <div v-for="(item, idx) in pedido.get('itens')" :key="idx" class="item-linha">
                <span class="item-produto">
                  <span v-if="item.quantidade" class="item-quantidade">{{ item.quantidade }}x</span>
                  {{ item.produto }}
                </span>
                <span v-if="item.sabor" class="item-detalhe">{{ item.sabor }}</span>
                <span v-if="item.apresentacao" class="item-detalhe">{{ item.apresentacao }} - {{ item.tipo }}</span>
                <span v-if="Array.isArray(item.acompanhamentos) && item.acompanhamentos.length" class="item-detalhe">
                  {{ item.acompanhamentos.join(', ') }}
                </span>
                <span v-if="item.crepe1" class="item-detalhe">
                  {{ item.crepe1 }} + {{ item.crepe2 }} | {{ item.bebida }}
                </span>
              </div>
            </div>
            <div v-if="pedido.get('observacoes')" class="card-observacoes">
              <span class="obs-icon">⚠️</span>
              <span>{{ pedido.get('observacoes') }}</span>
            </div>
            <div class="card-footer">
              <span class="pedido-total">R$ {{ pedido.get('total').toFixed(2) }}</span>
              <div class="card-actions">
                <button @click="imprimirPedido(pedido)" class="btn btn-outline btn-sm" title="Imprimir">
                  🖨️
                </button>
                <button @click="abrirEdicao(pedido)" class="btn btn-warning btn-sm" title="Editar">
                  ✏️
                </button>
                <button @click="moverPedido(pedido, 'fazendo')" class="btn btn-primary btn-sm">
                  Iniciar
                </button>
                <button @click="cancelarPedido(pedido)" class="btn btn-danger btn-sm">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
          <div v-if="pedidosPendentes.length === 0" class="empty-column">
            <p>Nenhum pedido pendente</p>
          </div>
        </div>
      </div>

      <!-- Coluna Fazendo -->
      <div class="kanban-column fazendo">
        <div class="column-header">
          <h2>🔥 Fazendo</h2>
          <span class="column-count">{{ pedidosFazendo.length }}</span>
        </div>
        <div class="column-content">
          <div 
            v-for="pedido in pedidosFazendo" 
            :key="pedido.id"
            class="pedido-card"
            :class="{ 'has-observacoes': pedido.get('observacoes') }"
          >
            <div class="card-header">
              <span class="pedido-numero">#{{ pedido.get('numeroPedido') || '---' }}</span>
              <span class="pedido-mesa">Mesa {{ pedido.get('mesa') }}</span>
              <span 
                class="pedido-origem" 
                :class="pedido.get('origem') === 'whatsapp' ? 'origem-wpp' : 'origem-sistema'"
                :title="pedido.get('origem') === 'whatsapp' ? 'Pedido via WhatsApp' : 'Pedido via Sistema'"
              >
                {{ pedido.get('origem') === 'whatsapp' ? '📱 WPP' : '💻 SIS' }}
              </span>
              <span class="pedido-time">{{ formatTime(pedido.createdAt) }}</span>
            </div>
            <div class="card-cliente">
              <strong>{{ pedido.get('nome') }}</strong>
              <span v-if="pedido.get('telefone')">{{ pedido.get('telefone') }}</span>
            </div>
            <div class="card-itens">
              <div v-for="(item, idx) in pedido.get('itens')" :key="idx" class="item-linha">
                <span class="item-produto">
                  <span v-if="item.quantidade" class="item-quantidade">{{ item.quantidade }}x</span>
                  {{ item.produto }}
                </span>
                <span v-if="item.sabor" class="item-detalhe">{{ item.sabor }}</span>
                <span v-if="item.apresentacao" class="item-detalhe">{{ item.apresentacao }} - {{ item.tipo }}</span>
                <span v-if="Array.isArray(item.acompanhamentos) && item.acompanhamentos.length" class="item-detalhe">
                  {{ item.acompanhamentos.join(', ') }}
                </span>
                <span v-if="item.crepe1" class="item-detalhe">
                  {{ item.crepe1 }} + {{ item.crepe2 }} | {{ item.bebida }}
                </span>
              </div>
            </div>
            <div v-if="pedido.get('observacoes')" class="card-observacoes">
              <span class="obs-icon">⚠️</span>
              <span>{{ pedido.get('observacoes') }}</span>
            </div>
            <div class="card-footer">
              <span class="pedido-total">R$ {{ pedido.get('total').toFixed(2) }}</span>
              <div class="card-actions">
                <button @click="imprimirPedido(pedido)" class="btn btn-outline btn-sm" title="Imprimir">
                  🖨️
                </button>
                <button @click="moverPedido(pedido, 'pronto')" class="btn btn-success btn-sm">
                  Pronto!
                </button>
                <button @click="cancelarPedido(pedido)" class="btn btn-danger btn-sm">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
          <div v-if="pedidosFazendo.length === 0" class="empty-column">
            <p>Nenhum pedido em preparo</p>
          </div>
        </div>
      </div>

      <!-- Coluna Prontos -->
      <div class="kanban-column pronto">
        <div class="column-header">
          <h2>✅ Prontos</h2>
          <span class="column-count">{{ pedidosProntos.length }}</span>
        </div>
        <div class="column-content">
          <div 
            v-for="pedido in pedidosProntos" 
            :key="pedido.id"
            class="pedido-card pronto-card"
          >
            <div class="card-header">
              <span class="pedido-numero">#{{ pedido.get('numeroPedido') || '---' }}</span>
              <span class="pedido-mesa">Mesa {{ pedido.get('mesa') }}</span>
              <span 
                class="pedido-origem" 
                :class="pedido.get('origem') === 'whatsapp' ? 'origem-wpp' : 'origem-sistema'"
                :title="pedido.get('origem') === 'whatsapp' ? 'Pedido via WhatsApp' : 'Pedido via Sistema'"
              >
                {{ pedido.get('origem') === 'whatsapp' ? '📱 WPP' : '💻 SIS' }}
              </span>
              <span class="pedido-time">{{ formatTime(pedido.createdAt) }}</span>
            </div>
            <div class="card-cliente">
              <strong>{{ pedido.get('nome') }}</strong>
              <span v-if="pedido.get('telefone')">{{ pedido.get('telefone') }}</span>
            </div>
            <div class="card-itens">
              <div v-for="(item, idx) in pedido.get('itens')" :key="idx" class="item-linha">
                <span class="item-produto">
                  <span v-if="item.quantidade" class="item-quantidade">{{ item.quantidade }}x</span>
                  {{ item.produto }}
                </span>
                <span v-if="item.sabor" class="item-detalhe">{{ item.sabor }}</span>
                <span v-if="item.apresentacao" class="item-detalhe">{{ item.apresentacao }} - {{ item.tipo }}</span>
                <span v-if="Array.isArray(item.acompanhamentos) && item.acompanhamentos.length" class="item-detalhe">
                  {{ item.acompanhamentos.join(', ') }}
                </span>
                <span v-if="item.crepe1" class="item-detalhe">
                  {{ item.crepe1 }} + {{ item.crepe2 }} | {{ item.bebida }}
                </span>
              </div>
            </div>
            <div class="card-footer">
              <span class="pedido-total">R$ {{ pedido.get('total').toFixed(2) }}</span>
              <button @click="entregarPedido(pedido)" class="btn btn-success btn-sm">
                ✓ Entregue
              </button>
            </div>
          </div>
          <div v-if="pedidosProntos.length === 0" class="empty-column">
            <p>Nenhum pedido pronto</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Controle de Estoque -->
    <div v-if="showEstoqueModal" class="modal-overlay" @click.self="showEstoqueModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>📦 Controle de Estoque</h2>
          <button @click="showEstoqueModal = false" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-info">Marque os itens que estão ESGOTADOS:</p>
          
          <div class="estoque-categorias">
            <div v-for="categoria in categorias" :key="categoria" class="estoque-categoria">
              <h4>{{ categoria }}</h4>
              <div class="estoque-itens">
                <div 
                  v-for="item in getItensByCategoria(categoria)" 
                  :key="item.id"
                  class="estoque-item"
                  :class="{ 'esgotado': !item.get('disponivel') }"
                >
                  <label>
                    <input 
                      type="checkbox"
                      :checked="!item.get('disponivel')"
                      @change="toggleDisponibilidade(item)"
                    />
                    <span>{{ item.get('nome') }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Edição de Pedido -->
    <div v-if="showEdicaoModal" class="modal-overlay" @click.self="showEdicaoModal = false">
      <div class="modal-content modal-edicao">
        <div class="modal-header">
          <h2>✏️ Editar Pedido #{{ edicaoPedido.numeroPedido }}</h2>
          <button @click="showEdicaoModal = false" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <!-- Dados do Cliente -->
          <div class="edicao-secao">
            <h4>👤 Dados do Cliente</h4>
            <div class="edicao-grid">
              <div class="form-group">
                <label>Nome</label>
                <input type="text" v-model="edicaoPedido.nome" class="form-input" />
              </div>
              <div class="form-group">
                <label>Telefone</label>
                <input type="text" v-model="edicaoPedido.telefone" class="form-input" />
              </div>
              <div class="form-group">
                <label>Mesa</label>
                <input type="number" v-model.number="edicaoPedido.mesa" class="form-input" min="1" />
              </div>
            </div>
          </div>

          <!-- Itens do Pedido -->
          <div class="edicao-secao">
            <h4>🍽️ Itens do Pedido</h4>
            <div class="edicao-itens">
              <div v-for="(item, idx) in edicaoPedido.itens" :key="idx" class="edicao-item">
                <div class="edicao-item-info">
                  <strong>{{ item.produto }}</strong>
                  <span v-if="item.sabor" class="item-detalhe">{{ item.sabor }}</span>
                  <span v-if="item.apresentacao" class="item-detalhe">{{ item.apresentacao }} - {{ item.tipo }}</span>
                  <span v-if="Array.isArray(item.acompanhamentos) && item.acompanhamentos.length" class="item-detalhe">
                    {{ item.acompanhamentos.join(', ') }}
                  </span>
                  <span v-if="item.crepe1" class="item-detalhe">
                    {{ item.crepe1 }} + {{ item.crepe2 }} | {{ item.bebida }}
                  </span>
                  <span class="item-preco">R$ {{ item.preco.toFixed(2) }}</span>
                </div>
                <div class="edicao-item-acoes">
                  <div class="quantidade-controle">
                    <button @click="diminuirQuantidade(idx)" class="btn btn-sm btn-outline" :disabled="(item.quantidade || 1) <= 1">-</button>
                    <span class="quantidade">{{ item.quantidade || 1 }}</span>
                    <button @click="aumentarQuantidade(idx)" class="btn btn-sm btn-outline">+</button>
                  </div>
                  <button @click="removerItem(idx)" class="btn btn-danger btn-sm">🗑️</button>
                </div>
              </div>
              <div v-if="edicaoPedido.itens.length === 0" class="edicao-vazio">
                Nenhum item no pedido
              </div>
            </div>
          </div>

          <!-- Adicionar Novo Item -->
          <div class="edicao-secao">
            <h4>➕ Adicionar Item</h4>
            <div class="adicionar-item-container">
              <select v-model="novoItemSelecionado" class="form-input">
                <option value="">Selecione um item...</option>
                <option v-for="item in cardapioDisponivel" :key="item.id" :value="item.id">
                  {{ item.nome }} - R$ {{ item.preco.toFixed(2) }}
                </option>
              </select>
              
              <!-- Opções para Crepe -->
              <div v-if="novoItemSelecionado === 'crepe'" class="opcoes-item">
                <label>Sabor:</label>
                <select v-model="novoItemOpcoes.sabor" class="form-input">
                  <option value="">Selecione o sabor...</option>
                  <option v-for="sabor in saboresCrepe" :key="sabor" :value="sabor">{{ sabor }}</option>
                </select>
              </div>

              <!-- Opções para Milho -->
              <div v-if="novoItemSelecionado && novoItemSelecionado.startsWith('milho')" class="opcoes-item">
                <label>Apresentação:</label>
                <select v-model="novoItemOpcoes.apresentacao" class="form-input">
                  <option value="">Selecione...</option>
                  <option value="Na espiga">Na espiga</option>
                  <option value="No potinho">No potinho</option>
                </select>
              </div>

              <!-- Opções para Açaí -->
              <div v-if="novoItemSelecionado === 'acai'" class="opcoes-item">
                <label>Acompanhamentos:</label>
                <div class="checkbox-group">
                  <label v-for="acomp in acompanhamentosAcai" :key="acomp" class="checkbox-label">
                    <input type="checkbox" :value="acomp" v-model="novoItemOpcoes.acompanhamentos" />
                    {{ acomp }}
                  </label>
                </div>
              </div>

              <button @click="adicionarItem" class="btn btn-success" :disabled="!podeAdicionarItem">
                + Adicionar ao Pedido
              </button>
            </div>
          </div>

          <!-- Observações -->
          <div class="edicao-secao">
            <h4>📝 Observações</h4>
            <textarea 
              v-model="edicaoPedido.observacoes" 
              class="form-input textarea-obs"
              placeholder="Observações especiais..."
              rows="3"
            ></textarea>
          </div>

          <!-- Total e Ações -->
          <div class="edicao-footer">
            <div class="edicao-total">
              <span>Total:</span>
              <strong>R$ {{ calcularTotalEdicao.toFixed(2) }}</strong>
            </div>
            <div class="edicao-acoes">
              <button @click="showEdicaoModal = false" class="btn btn-outline">Cancelar</button>
              <button @click="salvarEdicao" class="btn btn-primary" :disabled="salvandoEdicao">
                {{ salvandoEdicao ? 'Salvando...' : '💾 Salvar Alterações' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

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
import Parse, { Pedido, ItemCardapio } from '../services/parse'
import { cardapio, saboresCrepe, acompanhamentosAcai } from '../data/cardapio'

const router = useRouter()

// Estado
const pedidos = ref([])
const itensCardapio = ref([])
const showEstoqueModal = ref(false)
const showEdicaoModal = ref(false)
const toast = reactive({ show: false, message: '', type: 'success' })
const totalEntregues = ref(0)

// Estado da edição
const pedidoEmEdicao = ref(null)
const edicaoPedido = reactive({
  numeroPedido: null,
  nome: '',
  telefone: '',
  mesa: 1,
  itens: [],
  observacoes: ''
})
const novoItemSelecionado = ref('')
const novoItemOpcoes = reactive({
  sabor: '',
  apresentacao: '',
  acompanhamentos: []
})
const salvandoEdicao = ref(false)

// Cardápio disponível para adicionar itens
const cardapioDisponivel = computed(() => {
  return cardapio.filter(item => item.tipo !== 'combo' && item.tipo !== 'adicional')
})

// Subscriptions
let pedidoSubscription = null
let cardapioSubscription = null
let pollingInterval = null

// Computed
const pedidosPendentes = computed(() => 
  pedidos.value.filter(p => p.get('status') === 'pendente')
    .sort((a, b) => a.createdAt - b.createdAt)
)

const pedidosFazendo = computed(() => 
  pedidos.value.filter(p => p.get('status') === 'fazendo')
    .sort((a, b) => a.createdAt - b.createdAt)
)

const pedidosProntos = computed(() => 
  pedidos.value.filter(p => p.get('status') === 'pronto')
    .sort((a, b) => b.updatedAt - a.updatedAt)
)

const categorias = computed(() => {
  const cats = new Set(itensCardapio.value.map(i => i.get('categoria')))
  return Array.from(cats)
})

// Computed para calcular total da edição
const calcularTotalEdicao = computed(() => {
  return edicaoPedido.itens.reduce((total, item) => {
    const quantidade = item.quantidade || 1
    return total + (item.preco * quantidade)
  }, 0)
})

// Computed para verificar se pode adicionar item
const podeAdicionarItem = computed(() => {
  if (!novoItemSelecionado.value) return false
  
  if (novoItemSelecionado.value === 'crepe' && !novoItemOpcoes.sabor) return false
  if (novoItemSelecionado.value.startsWith('milho') && !novoItemOpcoes.apresentacao) return false
  
  return true
})

// Funções
function getItensByCategoria(categoria) {
  return itensCardapio.value.filter(i => i.get('categoria') === categoria)
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

async function moverPedido(pedido, novoStatus) {
  try {
    // Atualiza localmente primeiro para resposta imediata
    const index = pedidos.value.findIndex(p => p.id === pedido.id)
    if (index !== -1) {
      pedidos.value[index].set('status', novoStatus)
      // Força reatividade
      pedidos.value = [...pedidos.value]
    }
    
    pedido.set('status', novoStatus)
    await pedido.save()
    showToast(`Pedido movido para ${novoStatus}!`, 'success')
  } catch (error) {
    console.error('Erro ao mover pedido:', error)
    showToast('Erro ao atualizar pedido', 'error')
    // Reverte em caso de erro
    carregarPedidos()
  }
}

async function cancelarPedido(pedido) {
  if (confirm('Tem certeza que deseja cancelar este pedido?')) {
    try {
      // Remove localmente primeiro
      const index = pedidos.value.findIndex(p => p.id === pedido.id)
      if (index !== -1) {
        pedidos.value.splice(index, 1)
        pedidos.value = [...pedidos.value]
      }
      
      pedido.set('status', 'cancelado')
      await pedido.save()
      showToast('Pedido cancelado', 'success')
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error)
      showToast('Erro ao cancelar pedido', 'error')
      carregarPedidos()
    }
  }
}

async function entregarPedido(pedido) {
  try {
    // Remove localmente primeiro
    const index = pedidos.value.findIndex(p => p.id === pedido.id)
    if (index !== -1) {
      pedidos.value.splice(index, 1)
      pedidos.value = [...pedidos.value]
    }
    
    pedido.set('status', 'entregue')
    await pedido.save()
    
    // Incrementa contador de entregues
    totalEntregues.value++
    
    showToast('Pedido marcado como entregue!', 'success')
  } catch (error) {
    console.error('Erro ao marcar entrega:', error)
    showToast('Erro ao atualizar pedido', 'error')
    carregarPedidos()
  }
}

// Carregar total de pedidos entregues do dia
async function carregarTotalEntregues() {
  try {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    const query = new Parse.Query(Pedido)
    query.equalTo('status', 'entregue')
    query.greaterThanOrEqualTo('createdAt', hoje)
    const count = await query.count()
    totalEntregues.value = count
  } catch (error) {
    console.error('Erro ao contar entregues:', error)
  }
}

async function toggleDisponibilidade(item) {
  try {
    const novoValor = !item.get('disponivel')
    item.set('disponivel', novoValor)
    await item.save()
    showToast(
      novoValor ? `${item.get('nome')} disponível!` : `${item.get('nome')} esgotado!`, 
      'success'
    )
  } catch (error) {
    console.error('Erro ao atualizar disponibilidade:', error)
    showToast('Erro ao atualizar item', 'error')
  }
}

// Funções de Edição de Pedido
function abrirEdicao(pedido) {
  pedidoEmEdicao.value = pedido
  
  // Copia os dados do pedido para edição
  edicaoPedido.numeroPedido = pedido.get('numeroPedido')
  edicaoPedido.nome = pedido.get('nome') || ''
  edicaoPedido.telefone = pedido.get('telefone') || ''
  edicaoPedido.mesa = pedido.get('mesa') || 1
  edicaoPedido.observacoes = pedido.get('observacoes') || ''
  
  // Copia os itens (deep copy)
  const itensOriginais = pedido.get('itens') || []
  edicaoPedido.itens = itensOriginais.map(item => ({
    ...item,
    quantidade: item.quantidade || 1
  }))
  
  // Limpa seleção de novo item
  novoItemSelecionado.value = ''
  novoItemOpcoes.sabor = ''
  novoItemOpcoes.apresentacao = ''
  novoItemOpcoes.acompanhamentos = []
  
  showEdicaoModal.value = true
}

function aumentarQuantidade(index) {
  if (edicaoPedido.itens[index]) {
    edicaoPedido.itens[index].quantidade = (edicaoPedido.itens[index].quantidade || 1) + 1
  }
}

function diminuirQuantidade(index) {
  if (edicaoPedido.itens[index] && (edicaoPedido.itens[index].quantidade || 1) > 1) {
    edicaoPedido.itens[index].quantidade--
  }
}

function removerItem(index) {
  edicaoPedido.itens.splice(index, 1)
}

function adicionarItem() {
  if (!podeAdicionarItem.value) return
  
  const itemCardapio = cardapio.find(c => c.id === novoItemSelecionado.value)
  if (!itemCardapio) return
  
  const novoItem = {
    produto: itemCardapio.nome,
    preco: itemCardapio.preco,
    quantidade: 1
  }
  
  // Adiciona opções específicas baseado no tipo
  if (novoItemSelecionado.value === 'crepe') {
    novoItem.sabor = novoItemOpcoes.sabor
  } else if (novoItemSelecionado.value.startsWith('milho')) {
    novoItem.apresentacao = novoItemOpcoes.apresentacao
    novoItem.tipo = novoItemSelecionado.value.includes('sem') ? 'sem manteiga' : 'com manteiga'
  } else if (novoItemSelecionado.value === 'acai') {
    novoItem.acompanhamentos = [...novoItemOpcoes.acompanhamentos]
  }
  
  edicaoPedido.itens.push(novoItem)
  
  // Limpa seleção
  novoItemSelecionado.value = ''
  novoItemOpcoes.sabor = ''
  novoItemOpcoes.apresentacao = ''
  novoItemOpcoes.acompanhamentos = []
  
  showToast('Item adicionado!', 'success')
}

async function salvarEdicao() {
  if (!pedidoEmEdicao.value) return
  
  if (edicaoPedido.itens.length === 0) {
    showToast('O pedido precisa ter pelo menos um item!', 'error')
    return
  }
  
  if (!edicaoPedido.nome.trim()) {
    showToast('O nome do cliente é obrigatório!', 'error')
    return
  }
  
  if (!edicaoPedido.mesa || edicaoPedido.mesa < 1) {
    showToast('A mesa é obrigatória!', 'error')
    return
  }
  
  salvandoEdicao.value = true
  
  try {
    const pedido = pedidoEmEdicao.value
    
    // Atualiza os campos
    pedido.set('nome', edicaoPedido.nome.trim())
    pedido.set('telefone', edicaoPedido.telefone.trim())
    pedido.set('mesa', edicaoPedido.mesa)
    pedido.set('observacoes', edicaoPedido.observacoes.trim())
    pedido.set('itens', edicaoPedido.itens)
    pedido.set('total', calcularTotalEdicao.value)
    
    await pedido.save()
    
    // Atualiza na lista local
    const index = pedidos.value.findIndex(p => p.id === pedido.id)
    if (index !== -1) {
      pedidos.value[index] = pedido
      pedidos.value = [...pedidos.value]
    }
    
    showToast('Pedido atualizado com sucesso!', 'success')
    showEdicaoModal.value = false
    pedidoEmEdicao.value = null
  } catch (error) {
    console.error('Erro ao salvar edição:', error)
    showToast('Erro ao salvar alterações', 'error')
  } finally {
    salvandoEdicao.value = false
  }
}

// Função para imprimir pedido em impressora térmica
function imprimirPedido(pedido) {
  const itens = pedido.get('itens') || []
  const observacoes = pedido.get('observacoes')
  const dataHora = new Date(pedido.createdAt).toLocaleString('pt-BR')
  const numPedido = pedido.get('numeroPedido') || '---'
  
  let conteudo = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Pedido #${numPedido}</title>
  <style>
    @page {
      size: 48mm auto;
      margin: 0;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      width: 48mm;
      margin: 0;
      padding: 2mm 1mm 2mm 3mm;
    }
    .header {
      text-align: center;
      border-bottom: 1px dashed #000;
      padding-bottom: 4px;
      margin-bottom: 4px;
    }
    .title {
      font-size: 13px;
      font-weight: bold;
    }
    .subtitle {
      font-size: 8px;
    }
    .info {
      margin-bottom: 4px;
      font-size: 10px;
      padding-left: 1mm;
    }
    .info-row {
      margin-bottom: 2px;
    }
    .info-row span {
      display: block;
    }
    .mesa {
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      padding: 4px;
      border: 2px solid #000;
      margin: 4px 0;
    }
    .items {
      border-top: 1px dashed #000;
      border-bottom: 1px dashed #000;
      padding: 4px 0 4px 1mm;
      margin: 4px 0;
    }
    .item {
      margin-bottom: 6px;
    }
    .item-nome {
      font-weight: bold;
      font-size: 12px;
    }
    .item-detalhe {
      padding-left: 6px;
      font-size: 11px;
    }
    .obs {
      background: #f0f0f0;
      padding: 4px;
      margin: 4px 0;
      border: 1px solid #000;
      font-size: 10px;
    }
    .obs-title {
      font-weight: bold;
      margin-bottom: 2px;
    }
    .total {
      font-size: 13px;
      font-weight: bold;
      text-align: center;
      margin-top: 4px;
    }
    .footer {
      text-align: center;
      margin-top: 8px;
      font-size: 8px;
      border-top: 1px dashed #000;
      padding-top: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">🔥 pedIN</div>
    <div class="subtitle">Inconformados Jovens</div>
  </div>
  
  <div class="info">
    <div class="info-row">
      <span><strong>Pedido:</strong> #${numPedido}</span>
      <span>${dataHora}</span>
    </div>
    <div><strong>Cliente:</strong> ${pedido.get('nome')}</div>
    ${pedido.get('telefone') ? `<div><strong>Tel:</strong> ${pedido.get('telefone')}</div>` : ''}
  </div>
  
  <div class="mesa">MESA ${pedido.get('mesa')}</div>
  
  <div class="items">
    <strong>ITENS:</strong>
    ${itens.map(item => `
      <div class="item">
        <div class="item-nome">• ${item.quantidade ? item.quantidade + 'x ' : ''}${item.produto}</div>
        ${item.sabor ? `<div class="item-detalhe">${item.sabor}</div>` : ''}
        ${item.apresentacao ? `<div class="item-detalhe">${item.apresentacao} - ${item.tipo}</div>` : ''}
        ${Array.isArray(item.acompanhamentos) && item.acompanhamentos.length ? `<div class="item-detalhe">${item.acompanhamentos.join(', ')}</div>` : ''}
        ${item.crepe1 ? `<div class="item-detalhe">${item.crepe1} + ${item.crepe2}</div><div class="item-detalhe">${item.bebida}</div>` : ''}
      </div>
    `).join('')}
  </div>
  
  ${observacoes ? `
  <div class="obs">
    <div class="obs-title">⚠️ OBSERVAÇÕES:</div>
    <div>${observacoes}</div>
  </div>
  ` : ''}
  
  <div class="total">TOTAL: R$ ${pedido.get('total').toFixed(2)}</div>
  
  <div class="footer">
    Igreja Batista Filadélfia de Canoas<br>
    Evento 2026
  </div>
</body>
</html>
  `
  
  // Abre janela de impressão
  const janela = window.open('', '_blank', 'width=200,height=500')
  janela.document.write(conteudo)
  janela.document.close()
  
  // Aguarda carregar e imprime
  janela.onload = function() {
    janela.print()
    // Fecha após imprimir (opcional)
    // janela.close()
  }
}

async function carregarPedidos() {
  try {
    const query = new Parse.Query(Pedido)
    query.containedIn('status', ['pendente', 'fazendo', 'pronto'])
    query.descending('createdAt')
    const results = await query.find()
    pedidos.value = results

    // Configurar LiveQuery para novos pedidos em tempo real
    const liveQuery = new Parse.Query(Pedido)
    pedidoSubscription = await liveQuery.subscribe()

    pedidoSubscription.on('create', (novoPedido) => {
      console.log('Novo pedido recebido:', novoPedido.id)
      if (['pendente', 'fazendo', 'pronto'].includes(novoPedido.get('status'))) {
        // Verifica se já não existe
        const existe = pedidos.value.find(p => p.id === novoPedido.id)
        if (!existe) {
          pedidos.value = [novoPedido, ...pedidos.value]
          playNotificationSound()
          showToast('🔔 Novo pedido recebido!', 'success')
        }
      }
    })

    pedidoSubscription.on('update', (pedidoAtualizado) => {
      console.log('Pedido atualizado:', pedidoAtualizado.id, pedidoAtualizado.get('status'))
      const index = pedidos.value.findIndex(p => p.id === pedidoAtualizado.id)
      const status = pedidoAtualizado.get('status')
      
      if (['cancelado', 'entregue'].includes(status)) {
        if (index !== -1) {
          pedidos.value.splice(index, 1)
          pedidos.value = [...pedidos.value]
        }
      } else if (index !== -1) {
        pedidos.value[index] = pedidoAtualizado
        pedidos.value = [...pedidos.value]
      } else if (['pendente', 'fazendo', 'pronto'].includes(status)) {
        pedidos.value = [pedidoAtualizado, ...pedidos.value]
      }
    })

    pedidoSubscription.on('delete', (pedidoDeletado) => {
      const index = pedidos.value.findIndex(p => p.id === pedidoDeletado.id)
      if (index !== -1) {
        pedidos.value.splice(index, 1)
        pedidos.value = [...pedidos.value]
      }
    })

    pedidoSubscription.on('open', () => {
      console.log('LiveQuery conectado!')
    })

    pedidoSubscription.on('error', (error) => {
      console.error('Erro no LiveQuery:', error)
    })

  } catch (error) {
    console.error('Erro ao carregar pedidos:', error)
  }
}

async function carregarItensCardapio() {
  try {
    const query = new Parse.Query(ItemCardapio)
    query.limit(100)
    const results = await query.find()
    itensCardapio.value = results

    // LiveQuery para atualizações
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

function playNotificationSound() {
  // Toca um som de notificação quando chega novo pedido
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp2bi4B4cXd8g4eFgX53c3R4gImRlpKKgXh0dXl/iJObnpmPg3pzdHh+ho+XmpaQhoB3cnR3fYWOlpeTj4aBd3F0d3yFj5aWko+Ggnd0eHyEjpWVkY6GgHZydXl+ho+VlZGOhX51c3d7hI6VlZGNhH50cnZ5g42VlZKNhYB3dHd7hI6VlZGNhYB2c3Z5g42Uk5GMhH91cnR4goyUk5CMhIB1cnR4gYuTk5CLg392cnR3gIqSkpGLg391cnR2f4iRkZCKgn50cXN2foiRkZCJgX50cXN1fYeQkI+JgX10cXN0fIaPj46IgHx0cHN0e4WOjo2Hf3t0cHF0eYSNjYuGfnp0cHBzeIOLi4mFfXl0b3BxdoKKioeEfHhzbm9wdYCIiYaEe3dybG5vdH+HiIWDendxbGxudH2GhoSDendwamtsdHuFhYOBd3VuamtrdHqDhIJ/dnRtaWprcoGCgH50cmxoaWpwf4F/fHNwa2hoaW59f312cG5qZ2docHt9enRwbGlmZmdteXp3cm9rZ2VlZWxzeHVwbWpnZWRkbHBzb2xpZmRjZGlub2xqZ2ViYmJma2xqaGZjYWFhZGloZmVjYWBgYGRmZmRjYV9fX2BiY2JhYF9dXl9fYF9fXl1cXFxcXV1cXFtbW1tbWltbWlpaWVlZWVlZWFlZWFhYWFdXV1dXV1dXVldWVlZWVVVVVVVVVVVVVFRUVFRUU1NTU1NTU1NTU1JTUlJSUlJSUlJSUVFRUVFRUVBQUFBQUFBQT09PT09PT09PTk5OTk5OTk5OTU1NTU1NTU1NTU1NTUxMTExMTExMTExMTExMS0tLS0tLS0tLS0tLS0tLS0tLSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSklJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUk=')
    audio.volume = 0.5
    audio.play()
  } catch (e) {
    // Ignora erro se não conseguir tocar o som
  }
}

function showToast(message, type) {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 3000)
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

// Polling para garantir atualização (fallback do LiveQuery)
async function atualizarPedidos() {
  try {
    const query = new Parse.Query(Pedido)
    query.containedIn('status', ['pendente', 'fazendo', 'pronto'])
    query.descending('createdAt')
    const results = await query.find()
    
    // Verifica se há novos pedidos
    const idsAtuais = pedidos.value.map(p => p.id)
    const novos = results.filter(r => !idsAtuais.includes(r.id))
    
    if (novos.length > 0) {
      playNotificationSound()
      showToast(`🔔 ${novos.length} novo(s) pedido(s)!`, 'success')
    }
    
    pedidos.value = results
  } catch (error) {
    console.error('Erro ao atualizar pedidos:', error)
  }
}

onMounted(() => {
  carregarPedidos()
  carregarItensCardapio()
  carregarTotalEntregues()
  
  // Polling a cada 5 segundos como fallback
  pollingInterval = setInterval(atualizarPedidos, 5000)
})

onUnmounted(() => {
  if (pedidoSubscription) {
    pedidoSubscription.unsubscribe()
  }
  if (cardapioSubscription) {
    cardapioSubscription.unsubscribe()
  }
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
})
</script>

<style scoped>
.cozinha-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
}

.cozinha-header {
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

.badge-cozinha {
  background: var(--gradient-warning);
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
  gap: 24px;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-cyan);
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
}

.stat-entregues .stat-number {
  color: #00c896;
}

.stat-entregues {
  padding-left: 16px;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

/* Kanban Board */
.kanban-board {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px;
  overflow-x: auto;
}

.kanban-column {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  min-height: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.kanban-column.pendente .column-header {
  background: linear-gradient(90deg, rgba(255, 190, 11, 0.3), rgba(255, 190, 11, 0.1));
  border-bottom: 3px solid #ffbe0b;
}

.kanban-column.fazendo .column-header {
  background: linear-gradient(90deg, rgba(58, 134, 255, 0.3), rgba(58, 134, 255, 0.1));
  border-bottom: 3px solid #3a86ff;
}

.kanban-column.pronto .column-header {
  background: linear-gradient(90deg, rgba(0, 200, 150, 0.3), rgba(0, 200, 150, 0.1));
  border-bottom: 3px solid #00c896;
}

.column-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 16px 16px 0 0;
}

.column-header h2 {
  font-size: 1.1rem;
  margin: 0;
  color: #1a1a2e;
}

.column-count {
  background: rgba(0, 0, 0, 0.1);
  padding: 4px 12px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.9rem;
  color: #1a1a2e;
}

.column-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Pedido Card */
.pedido-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  position: relative;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  min-height: 280px;
  max-height: 320px;
  display: flex;
  flex-direction: column;
}

.pedido-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.pedido-card.has-observacoes {
  border: 3px solid var(--primary-orange);
  animation: pulse-border-light 2s infinite;
}

@keyframes pulse-border-light {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.5);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 107, 53, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 107, 53, 0);
  }
}

.pedido-card.has-observacoes::before {
  content: '⚠️';
  position: absolute;
  top: -12px;
  right: -12px;
  font-size: 24px;
  z-index: 10;
}

.pronto-card {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border: 2px solid #28a745;
}

.pronto-card .card-itens {
  background: rgba(255, 255, 255, 0.5);
}

.pronto-card .pedido-numero,
.pronto-card .pedido-total {
  color: #155724;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.pedido-numero {
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--primary-purple);
}

.pedido-mesa {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
}

.pedido-time {
  margin-left: auto;
  font-size: 0.75rem;
  color: #888;
}

.pedido-origem {
  padding: 2px 8px;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.origem-wpp {
  background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
  color: white;
}

.origem-sistema {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-cliente {
  margin-bottom: 8px;
  color: #1a1a2e;
}

.card-cliente strong {
  font-size: 0.9rem;
}

.card-cliente span {
  display: block;
  font-size: 0.8rem;
  color: #666;
}

.card-itens {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  flex: 1;
  overflow-y: auto;
  max-height: 120px;
}

.card-itens.compact {
  text-align: center;
  padding: 8px;
  color: #555;
  flex: none;
  max-height: none;
}

.item-linha {
  padding: 4px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.item-linha:last-child {
  border-bottom: none;
}

.item-produto {
  font-weight: 600;
  font-size: 0.85rem;
  color: #e85d04;
}

.item-quantidade {
  background: var(--primary-purple);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-right: 4px;
}

.item-detalhe {
  display: block;
  font-size: 0.75rem;
  color: #555;
  padding-left: 10px;
}

.card-observacoes {
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid var(--primary-orange);
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 8px;
  display: flex;
  gap: 6px;
  align-items: flex-start;
  flex-shrink: 0;
}

.obs-icon {
  font-size: 1rem;
}

.card-observacoes span:last-child {
  font-size: 0.8rem;
  line-height: 1.3;
  color: #333;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  margin-top: auto;
  flex-shrink: 0;
}

.pedido-total {
  font-weight: 700;
  font-size: 1rem;
  color: var(--primary-purple);
}

.card-actions {
  display: flex;
  gap: 6px;
}

.empty-column {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 0.9rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 700px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
  color: white;
}

.modal-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.modal-info {
  color: #666;
  margin-bottom: 20px;
}

.estoque-categorias {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.estoque-categoria h4 {
  margin-bottom: 12px;
  color: var(--primary-purple);
  font-size: 1rem;
}

.estoque-itens {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.estoque-item {
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.2s;
  color: #333;
}

.estoque-item:hover {
  background: #eef0f2;
}

.estoque-item.esgotado {
  background: rgba(255, 0, 110, 0.1);
  border: 1px solid var(--primary-pink);
}

.estoque-item.esgotado span {
  text-decoration: line-through;
  opacity: 0.7;
}

.estoque-item label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.estoque-item input {
  width: 18px;
  height: 18px;
  accent-color: var(--primary-pink);
}

/* Modal de Edição */
.modal-edicao {
  max-width: 800px;
}

.edicao-secao {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.edicao-secao:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
}

.edicao-secao h4 {
  color: var(--primary-purple);
  margin-bottom: 16px;
  font-size: 1rem;
}

.edicao-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.85rem;
  color: #555;
  font-weight: 500;
}

.form-input {
  padding: 10px 14px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: #fff;
  color: #333;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-purple);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.textarea-obs {
  resize: vertical;
  min-height: 80px;
}

.edicao-itens {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.edicao-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.edicao-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.edicao-item-info strong {
  color: #e85d04;
  font-size: 0.95rem;
}

.edicao-item-info .item-detalhe {
  font-size: 0.8rem;
  color: #666;
}

.edicao-item-info .item-preco {
  font-size: 0.85rem;
  color: var(--primary-purple);
  font-weight: 600;
  margin-top: 4px;
}

.edicao-item-acoes {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantidade-controle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.quantidade-controle .quantidade {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
  color: #333;
}

.quantidade-controle button {
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edicao-vazio {
  text-align: center;
  padding: 24px;
  color: #888;
  background: #f8f9fa;
  border-radius: 10px;
}

.adicionar-item-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.opcoes-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #f0f2f5;
  border-radius: 8px;
}

.opcoes-item label {
  font-size: 0.85rem;
  color: #555;
  font-weight: 500;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  accent-color: var(--primary-purple);
}

.edicao-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 2px solid rgba(0, 0, 0, 0.1);
}

.edicao-total {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.2rem;
}

.edicao-total span {
  color: #666;
}

.edicao-total strong {
  color: var(--primary-purple);
  font-size: 1.5rem;
}

.edicao-acoes {
  display: flex;
  gap: 12px;
}

@media (max-width: 1000px) {
  .kanban-board {
    grid-template-columns: 1fr;
  }
  
  .kanban-column {
    min-height: 300px;
  }
  
  .cozinha-header {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .header-center {
    order: 3;
    width: 100%;
  }
  
  .header-center .btn {
    width: 100%;
  }
  
  .edicao-grid {
    grid-template-columns: 1fr;
  }
  
  .edicao-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .edicao-item-acoes {
    justify-content: space-between;
  }
  
  .edicao-footer {
    flex-direction: column;
    gap: 16px;
  }
  
  .edicao-acoes {
    width: 100%;
  }
  
  .edicao-acoes button {
    flex: 1;
  }
}
</style>
