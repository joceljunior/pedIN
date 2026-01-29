// Cloud Code - pedIN
// Trigger automático para gerar número do pedido

Parse.Cloud.beforeSave("Pedido", async (request) => {
  const pedido = request.object;
  
  // Só gera número se for novo pedido e não tiver número
  if (pedido.isNew() && !pedido.get('numeroPedido')) {
    // Busca ou cria o contador
    const Contador = Parse.Object.extend("Contador");
    const query = new Parse.Query(Contador);
    query.equalTo("nome", "pedido");
    
    let contador = await query.first({ useMasterKey: true });
    
    if (!contador) {
      contador = new Contador();
      contador.set("nome", "pedido");
      contador.set("valor", 0);
    }
    
    // Incrementa o contador atomicamente
    const novoNumero = (contador.get("valor") || 0) + 1;
    contador.set("valor", novoNumero);
    await contador.save(null, { useMasterKey: true });
    
    // Define o número no pedido
    pedido.set("numeroPedido", novoNumero);
  }
  
  // Define status padrão se não tiver
  if (!pedido.get('status')) {
    pedido.set('status', 'pendente');
  }
  
  // Valida campos obrigatórios
  if (!pedido.get('nome')) {
    throw new Parse.Error(400, "Nome do cliente é obrigatório");
  }
  
  if (!pedido.get('mesa')) {
    throw new Parse.Error(400, "Número da mesa é obrigatório");
  }
  
  if (!pedido.get('itens') || pedido.get('itens').length === 0) {
    throw new Parse.Error(400, "Pedido deve ter pelo menos um item");
  }
});

// Função para criar pedido via Cloud Function (alternativa)
Parse.Cloud.define("criarPedido", async (request) => {
  const { nome, telefone, mesa, itens, observacoes, total } = request.params;
  
  // Validações
  if (!nome) throw new Parse.Error(400, "Nome é obrigatório");
  if (!mesa) throw new Parse.Error(400, "Mesa é obrigatória");
  if (!itens || itens.length === 0) throw new Parse.Error(400, "Itens são obrigatórios");
  
  const Pedido = Parse.Object.extend("Pedido");
  const pedido = new Pedido();
  
  pedido.set("nome", nome);
  pedido.set("telefone", telefone || "");
  pedido.set("mesa", mesa);
  pedido.set("itens", itens);
  pedido.set("observacoes", observacoes || "");
  pedido.set("total", total || 0);
  pedido.set("status", "pendente");
  
  // O número será gerado automaticamente pelo beforeSave
  
  const resultado = await pedido.save(null, { useMasterKey: true });
  
  return {
    success: true,
    objectId: resultado.id,
    numeroPedido: resultado.get("numeroPedido"),
    createdAt: resultado.createdAt
  };
});
