# 🏗️ Arquitetura do Frontend - Sistema de Farmácia

## 📐 Visão Geral

O frontend foi construído seguindo os princípios de **Clean Architecture** e **Separation of Concerns**, garantindo:
- ✅ Código limpo e organizado
- ✅ Fácil manutenção
- ✅ Escalabilidade
- ✅ Reutilização de componentes
- ✅ Testabilidade

## 📁 Estrutura de Camadas

```
src/
├── api/              # Camada de Serviços (API)
├── components/       # Componentes Reutilizáveis
├── contexts/         # Estado Global (Context API)
├── pages/            # Páginas/Views
├── types/            # Definições TypeScript
├── utils/            # Funções Utilitárias
├── config/           # Configurações
└── App.tsx          # Componente Raiz
```

## 🔄 Fluxo de Dados

```
User Interaction
      ↓
  Component
      ↓
   Service (API)
      ↓
   Backend (REST API)
      ↓
   Response
      ↓
   Component Update
      ↓
   UI Update
```

## 📦 Camadas Detalhadas

### 1. API Layer (`/api`)

**Responsabilidade:** Comunicação com o backend

**Arquivos:**
- `axios.ts` - Configuração base do Axios com interceptors
- `authService.ts` - Serviços de autenticação
- `categoriaService.ts` - CRUD de categorias
- `medicamentoService.ts` - CRUD de medicamentos
- `clienteService.ts` - CRUD de clientes
- `estoqueService.ts` - Gestão de estoque
- `vendaService.ts` - Sistema de vendas
- `alertaService.ts` - Consulta de alertas

**Padrão utilizado:** Service Pattern

```typescript
// Exemplo de serviço
export const medicamentoService = {
  getAll: async (): Promise<Medicamento[]> => {
    const response = await api.get<Medicamento[]>('/medicamentos');
    return response.data;
  },
  // ... outros métodos
};
```

**Interceptors:**
1. **Request:** Adiciona token JWT automaticamente
2. **Response:** Trata erro 401 e redireciona para login

### 2. Components Layer (`/components`)

**Responsabilidade:** Componentes reutilizáveis

**Componentes:**
- `Layout` - Layout principal com sidebar e header
- `Loading` - Indicador de carregamento
- `PrivateRoute` - HOC para proteção de rotas

**Características:**
- Componentes funcionais (React Hooks)
- Props tipadas com TypeScript
- Estilos isolados (CSS Modules)

### 3. Context Layer (`/contexts`)

**Responsabilidade:** Estado global da aplicação

**Contextos:**
- `AuthContext` - Gerencia autenticação e usuário logado

**Por que Context API?**
- Projeto de médio porte
- Estado simples (apenas autenticação)
- Evita prop drilling
- Não justifica Redux/Zustand

```typescript
// Uso do contexto
const { isAuthenticated, username, login, logout } = useAuth();
```

### 4. Pages Layer (`/pages`)

**Responsabilidade:** Páginas completas da aplicação

**Páginas:**
- `Login` - Autenticação
- `Dashboard` - Visão geral
- `Categorias` - CRUD de categorias
- `Medicamentos` - CRUD de medicamentos
- `Clientes` - CRUD de clientes
- `EstoquePage` - Gestão de estoque
- `Vendas` - Sistema de vendas
- `Alertas` - Alertas do sistema

**Padrão:** Container/Presenter (implícito)
- As páginas gerenciam estado e lógica
- Renderizam UI e componentes reutilizáveis

### 5. Types Layer (`/types`)

**Responsabilidade:** Definições de tipos TypeScript

**Organização:**
- Interfaces para todas as entidades
- DTOs de request/response
- Tipos de erro

**Benefícios:**
- Autocomplete no VSCode
- Detecção de erros em tempo de desenvolvimento
- Documentação implícita

### 6. Utils Layer (`/utils`)

**Responsabilidade:** Funções utilitárias puras

**Funções:**
- Formatação de moeda
- Formatação de datas
- Validação de CPF
- Cálculo de idade
- Máscaras de input

**Características:**
- Funções puras (sem side effects)
- Reutilizáveis
- Testáveis

## 🔐 Segurança

### Autenticação JWT

1. **Login:** Usuário envia credenciais
2. **Backend:** Valida e retorna token JWT
3. **Storage:** Token salvo em localStorage
4. **Requests:** Token incluído em todas as requisições
5. **Expiração:** Redirect automático para login

### Proteção de Rotas

```typescript
<PrivateRoute>
  <Dashboard />
</PrivateRoute>
```

- Verifica se usuário está autenticado
- Redireciona para login se não estiver

## 🎨 Estilização

### Estratégia: CSS Puro + CSS Modules

**Por quê?**
- Projeto não exige UI complexa
- CSS puro é suficiente
- Evita dependências pesadas (Material-UI, etc.)
- Totalmente customizável

**Organização:**
- Estilos globais em `App.css` e `index.css`
- Estilos de componentes em arquivos `.css` separados
- Reutilização via classes compartilhadas

**Vantagens:**
- Sem conflito de nomes (CSS Modules)
- Performance ótima
- Bundle menor

## 🔄 Gerenciamento de Estado

### Estado Local (useState)
```typescript
const [loading, setLoading] = useState(false);
const [data, setData] = useState<Type[]>([]);
```

**Uso:** Estado específico de componente

### Estado Global (Context API)
```typescript
const { isAuthenticated, username } = useAuth();
```

**Uso:** Estado compartilhado entre componentes

### Estado de Formulários
```typescript
const [formData, setFormData] = useState<RequestType>({
  campo1: '',
  campo2: 0,
});
```

**Uso:** Dados de formulários com validação

## 📡 Comunicação com API

### Padrão de Chamadas

```typescript
const loadData = async () => {
  try {
    setLoading(true);
    const data = await service.getAll();
    setData(data);
  } catch (error) {
    console.error('Erro:', error);
    toast.error('Mensagem de erro');
  } finally {
    setLoading(false);
  }
};
```

### Tratamento de Erros

1. **Try/Catch:** Captura erros
2. **Console.error:** Log para debug
3. **Toast:** Feedback visual ao usuário
4. **Finally:** Sempre executa (ex: setLoading(false))

## 🎯 Padrões de Design Utilizados

### 1. Service Pattern
Camada de serviços isola lógica de API

### 2. Container/Presenter
Páginas gerenciam estado, componentes apenas renderizam

### 3. Higher-Order Component (HOC)
`PrivateRoute` envolve componentes com lógica de autenticação

### 4. Custom Hooks
Possibilidade de criar hooks customizados (não implementado por simplicidade)

### 5. Composition
Componentes pequenos e compostos

## 🚀 Performance

### Otimizações Implementadas

1. **Code Splitting:** React Router faz automaticamente
2. **Lazy Loading:** Possível adicionar com React.lazy
3. **Memoization:** Possível adicionar com useMemo/useCallback
4. **Axios Interceptors:** Evita repetição de código
5. **CSS Modules:** Apenas estilos necessários carregados

### Melhorias Futuras

- React.lazy para páginas
- useMemo para cálculos pesados
- useCallback para callbacks em listas
- Virtual scrolling para listas grandes
- Debounce em filtros

## 🧪 Testabilidade

O código foi estruturado para facilitar testes:

### Testes de Unidade
- Funções utilitárias (utils/)
- Serviços (api/)

### Testes de Integração
- Componentes com Context
- Fluxos de autenticação

### Testes E2E
- Fluxos completos (login → venda)
- Validações de formulários

## 📚 Convenções de Código

### Nomenclatura

- **Componentes:** PascalCase (`Dashboard.tsx`)
- **Arquivos:** camelCase (`authService.ts`)
- **Constantes:** UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Interfaces:** PascalCase com prefixo I opcional (`Medicamento`)

### Estrutura de Arquivo

```typescript
// 1. Imports
import React, { useState } from 'react';
import { Service } from '../api/service';

// 2. Types/Interfaces
interface Props {
  id: number;
}

// 3. Component
export const Component: React.FC<Props> = ({ id }) => {
  // 4. State
  const [data, setData] = useState();
  
  // 5. Effects
  useEffect(() => {}, []);
  
  // 6. Handlers
  const handleClick = () => {};
  
  // 7. Render
  return <div></div>;
};
```

### Comentários

- Evitados quando código é autoexplicativo
- Usados para lógica complexa ou regras de negócio

## 🔧 Configuração

### Variáveis de Ambiente

```
REACT_APP_API_BASE_URL=http://localhost:8080
```

- Prefixo `REACT_APP_` obrigatório (Create React App)
- Acessível via `process.env.REACT_APP_API_BASE_URL`

### TypeScript Config

- Target: ES5
- Strict mode: true
- JSX: react-jsx

## 📈 Escalabilidade

### Como adicionar nova funcionalidade?

1. **Criar tipos** em `types/index.ts`
2. **Criar serviço** em `api/nomeService.ts`
3. **Criar página** em `pages/Nome.tsx`
4. **Adicionar rota** em `App.tsx`
5. **Adicionar no menu** em `components/Layout.tsx`

### Como adicionar validação?

1. Adicionar função em `utils/formatters.ts`
2. Usar no componente antes de submit

### Como adicionar novo contexto?

1. Criar em `contexts/NomeContext.tsx`
2. Adicionar Provider no `App.tsx`
3. Criar hook `useNome()` para consumir

## 🎓 Decisões Arquiteturais

### Por que não usar Redux?
- Projeto pequeno/médio
- Context API suficiente
- Evita boilerplate desnecessário

### Por que não usar Material-UI?
- Bundle muito grande
- Customização limitada
- CSS puro dá total controle

### Por que não usar React Query?
- Não há necessidade de cache complexo
- Axios + useState suficiente
- Evita dependência extra

### Por que TypeScript?
- Type safety
- Melhor DX (autocomplete)
- Reduz bugs
- Documentação implícita

## 🔮 Próximos Passos

### Melhorias Possíveis

1. **Testes:** Jest + React Testing Library
2. **E2E:** Cypress ou Playwright
3. **Performance:** React.lazy, useMemo
4. **Acessibilidade:** ARIA labels, keyboard navigation
5. **Internacionalização:** i18next
6. **Tema:** Light/Dark mode
7. **PWA:** Service Worker, offline mode

---

**Arquitetura pensada para crescimento e manutenibilidade** 🚀
