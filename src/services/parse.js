import Parse from 'parse'

// Configuração do Back4App
Parse.initialize(
  'Kf27uvwr9FpKAjFn0YBJyL3o3cbCu2mlwFfoGlkf', // Application ID
  'lr2aIUENVWMy2LyWKiLW2U2uiq6Yn6YZUAIgHTjU'  // JavaScript Key
)

Parse.serverURL = 'https://parseapi.back4app.com/'

// Habilitar LiveQuery para atualizações em tempo real
Parse.liveQueryServerURL = 'wss://pedin.b4a.io'

export default Parse

// Classes Parse
export const Pedido = Parse.Object.extend('Pedido')
export const ItemCardapio = Parse.Object.extend('ItemCardapio')
export const Contador = Parse.Object.extend('Contador')

// Função para obter próximo número de pedido
export async function getProximoNumeroPedido() {
  try {
    const query = new Parse.Query(Contador)
    query.equalTo('nome', 'pedido')
    let contador = await query.first()
    
    if (!contador) {
      // Cria contador se não existir
      contador = new Contador()
      contador.set('nome', 'pedido')
      contador.set('valor', 0)
    }
    
    // Incrementa o valor
    const novoValor = (contador.get('valor') || 0) + 1
    contador.set('valor', novoValor)
    await contador.save()
    
    return novoValor
  } catch (error) {
    console.error('Erro ao obter número do pedido:', error)
    // Fallback: usa timestamp
    return Date.now() % 10000
  }
}