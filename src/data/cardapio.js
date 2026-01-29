// Cardápio do evento dos Inconformados Jovens
export const cardapio = [
  {
    id: 'crepe',
    nome: 'Crepe',
    preco: 12.00,
    opcoes: [
      'Frango',
      'Queijo',
      'Calabresa e queijo',
      'Batom branco',
      'Batom preto',
      'Stikadinho'
    ],
    tipo: 'selecao_unica'
  },
  {
    id: 'milho_com_manteiga',
    nome: 'Milho com Manteiga',
    preco: 8.00,
    opcoes: [
      'Na espiga',
      'No potinho'
    ],
    tipo: 'selecao_unica'
  },
  {
    id: 'milho_sem_manteiga',
    nome: 'Milho sem Manteiga',
    preco: 8.00,
    opcoes: [
      'Na espiga',
      'No potinho'
    ],
    tipo: 'selecao_unica'
  },
  {
    id: 'acai',
    nome: 'Açaí 300ml',
    preco: 14.00,
    opcoes: [
      'Banana',
      'Morango',
      'Abacaxi',
      'Leite condensado',
      'Leite em pó'
    ],
    tipo: 'multipla_selecao'
  },
  {
    id: 'combo',
    nome: 'Combo',
    preco: 26.00,
    descricao: '2 crepes (qualquer sabor) + 1 refri ou água + 2 acompanhamentos',
    tipo: 'combo',
    inclui: {
      crepes: 2,
      bebida: 1,
      acompanhamentos: 2
    }
  },
  {
    id: 'acompanhamento_extra',
    nome: 'Acompanhamento Adicional',
    preco: 3.00,
    tipo: 'adicional'
  }
]

export const bebidasCombo = [
  'Refrigerante',
  'Água com gás',
  'Água sem gás'
]

export const saboresCrepe = [
  'Frango',
  'Queijo',
  'Calabresa e queijo',
  'Batom branco',
  'Batom preto',
  'Stikadinho'
]

export const acompanhamentosAcai = [
  'Banana',
  'Morango',
  'Abacaxi',
  'Leite condensado',
  'Leite em pó'
]
