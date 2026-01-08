// Tipos de Autenticação
export interface LoginRequest {
  username: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  username: string;
}

// Tipos de Categoria
export interface Categoria {
  id: number;
  nome: string;
}

export interface CategoriaRequest {
  nome: string;
}

// Tipos de Medicamento
export interface Medicamento {
  id: number;
  nome: string;
  descricao: string;
  dosagem: string;
  preco: number;
  estoqueMinimo: number;
  ativo: boolean;
  deletado: boolean;
  categoria: Categoria;
  criadoEm: string;
}

export interface MedicamentoRequest {
  nome: string;
  descricao: string;
  dosagem: string;
  preco: number;
  ativo?: boolean;
  categoriaId?: number;
}

export interface AlterarStatusRequest {
  ativo: boolean;
}

// Tipos de Cliente
export interface Cliente {
  id: number;
  nomeCompleto: string;
  cpf: string;
  email: string;
  dataNascimento: string;
  nomeResponsavel: string | null;
}

export interface ClienteRequest {
  nomeCompleto: string;
  cpf: string;
  email: string;
  dataNascimento: string;
  nomeResponsavel?: string | null;
}

export interface ClienteCreateResponse extends Cliente {
  message: string;
}

// Tipos de Estoque
export interface Estoque {
  id: number;
  medicamentoId: number;
  medicamentoNome: string;
  quantidadeAtual: number;
  dataVencimento: string;
}

export interface EntradaEstoqueRequest {
  medicamentoId: number;
  quantidade: number;
  dataVencimento: string;
  observacao?: string;
}

export interface SaidaEstoqueRequest {
  medicamentoId: number;
  quantidade: number;
  dataVencimento: string;
  observacao?: string;
}

export interface EstoqueResponse {
  message: string;
}

// Tipos de Venda
export interface ItemVenda {
  id: number;
  medicamentoId: number;
  medicamentoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Venda {
  id: number;
  cliente: Cliente;
  dataHora: string;
  valorTotal: number;
  itens: ItemVenda[];
}

export interface ItemVendaRequest {
  medicamentoId: number;
  quantidade: number;
}

export interface VendaRequest {
  clienteId: number;
  itens: ItemVendaRequest[];
}

// Tipos de Alerta
export interface AlertaEstoqueBaixo {
  medicamentoId: number;
  medicamentoNome: string;
  quantidadeAtual: number;
  limiteBaixo: number;
  preco: number;
}

export interface AlertaValidadeProxima {
  medicamentoId: number;
  medicamentoNome: string;
  quantidade: number;
  dataVencimento: string;
  diasParaVencer: number;
}

// Tipos de Erro
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details: any;
}

// Tipos de Mensagem
export interface MessageResponse {
  message: string;
}
