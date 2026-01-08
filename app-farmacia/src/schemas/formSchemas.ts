import { z } from 'zod';

// ========== CATEGORIA SCHEMA ==========
export const categoriaSchema = z.object({
  nome: z.string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
});

export type CategoriaFormData = z.infer<typeof categoriaSchema>;

// ========== CLIENTE SCHEMA ==========
export const clienteSchema = z.object({
  nomeCompleto: z.string()
    .min(1, 'Nome completo é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string()
    .min(1, 'CPF é obrigatório')
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  dataNascimento: z.string()
    .min(1, 'Data de nascimento é obrigatória'),
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  nomeResponsavel: z.string().optional(),
}).refine((data) => {
  // Validação customizada será feita no componente
  return true;
});

export type ClienteFormData = z.infer<typeof clienteSchema>;

// ========== MEDICAMENTO SCHEMA ==========
export const medicamentoSchema = z.object({
  nome: z.string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  dosagem: z.string()
    .min(1, 'Dosagem é obrigatória'),
  categoriaId: z.number().min(1, 'Categoria é obrigatória'),
  preco: z.number().min(0.01, 'Preço deve ser maior que zero'),
  estoqueMinimo: z.number().min(0, 'Estoque mínimo deve ser maior ou igual a zero'),
  ativo: z.boolean(),
});

export type MedicamentoFormData = z.infer<typeof medicamentoSchema>;

// ========== LOGIN SCHEMA ==========
export const loginSchema = z.object({
  username: z.string()
    .min(1, 'Usuário é obrigatório')
    .min(3, 'Usuário deve ter no mínimo 3 caracteres'),
  password: z.string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ========== REGISTER SCHEMA ==========
export const registerSchema = z.object({
  username: z.string()
    .min(1, 'Usuário é obrigatório')
    .min(3, 'Usuário deve ter no mínimo 3 caracteres')
    .max(50, 'Usuário deve ter no máximo 50 caracteres'),
  password: z.string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// ========== ENTRADA ESTOQUE SCHEMA ==========
export const entradaEstoqueSchema = z.object({
  quantidade: z.number().min(1, 'Quantidade deve ser maior que zero'),
  dataVencimento: z.string()
    .min(1, 'Data de vencimento é obrigatória'),
  observacao: z.string().optional(),
});

export type EntradaEstoqueFormData = z.infer<typeof entradaEstoqueSchema>;

// ========== SAIDA ESTOQUE SCHEMA ==========
export const saidaEstoqueSchema = z.object({
  quantidade: z.number().min(1, 'Quantidade deve ser maior que zero'),
  dataVencimento: z.string().optional(),
  observacao: z.string().optional(),
});

export type SaidaEstoqueFormData = z.infer<typeof saidaEstoqueSchema>;
