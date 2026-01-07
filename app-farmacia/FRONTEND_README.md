# Sistema de Farmácia - Frontend

Frontend completo em React + TypeScript para o Sistema de Gerenciamento de Farmácia.

## 🚀 Tecnologias Utilizadas

- **React 19** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset tipado do JavaScript
- **React Router DOM** - Gerenciamento de rotas
- **Axios** - Cliente HTTP para requisições à API
- **React Toastify** - Notificações e mensagens
- **CSS Modules** - Estilização componentizada

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Backend rodando em `http://localhost:8080`

## 🔧 Instalação

As dependências já foram instaladas. Caso precise reinstalar:

```bash
npm install
```

## ▶️ Executando o Projeto

```bash
npm start
```

O projeto será aberto automaticamente em `http://localhost:3000`

## 🏗️ Estrutura do Projeto

```
src/
├── api/                    # Serviços de API
│   ├── axios.ts           # Configuração do Axios
│   ├── authService.ts     # Serviço de autenticação
│   ├── categoriaService.ts
│   ├── medicamentoService.ts
│   ├── clienteService.ts
│   ├── estoqueService.ts
│   ├── vendaService.ts
│   └── alertaService.ts
├── components/            # Componentes reutilizáveis
│   ├── Layout.tsx        # Layout principal com menu
│   ├── Loading.tsx       # Indicador de carregamento
│   └── PrivateRoute.tsx  # Proteção de rotas
├── contexts/             # Contextos React
│   └── AuthContext.tsx   # Contexto de autenticação
├── pages/                # Páginas da aplicação
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Categorias.tsx
│   ├── Medicamentos.tsx
│   ├── Clientes.tsx
│   ├── EstoquePage.tsx
│   ├── Vendas.tsx
│   └── Alertas.tsx
├── types/                # Tipos TypeScript
│   └── index.ts
├── utils/                # Funções utilitárias
│   └── formatters.ts     # Formatação e validação
├── config/               # Configurações
│   └── constants.ts
├── App.tsx              # Componente raiz
└── index.tsx            # Ponto de entrada
```

## 🔐 Autenticação

O sistema usa autenticação JWT. Ao fazer login:
1. O token é armazenado no `localStorage`
2. Todas as requisições incluem o header `Authorization: Bearer {token}`
3. Em caso de 401/403, o usuário é redirecionado para login

### Credenciais de Teste
Consulte a documentação do backend para credenciais de teste.

## 📱 Funcionalidades Implementadas

### ✅ Autenticação
- Login com email e senha
- Logout
- Proteção de rotas
- Redirecionamento automático

### ✅ Dashboard
- Visão geral do sistema
- Cards com contadores de alertas
- Alertas de estoque baixo
- Alertas de validade próxima
- Medicamentos vencidos

### ✅ Categorias (CRUD Completo)
- Listar todas as categorias
- Criar nova categoria
- Editar categoria existente
- Deletar categoria (valida se há medicamentos vinculados)

### ✅ Medicamentos (CRUD Completo)
- Listar todos os medicamentos
- Filtrar por nome, dosagem, categoria e status
- Criar novo medicamento (com validações)
- Editar medicamento existente
- Alterar status (ativar/inativar)
- Deletar medicamento (soft delete se vendido)

**Validações:**
- Nome obrigatório
- Dosagem obrigatória
- Preço deve ser maior que zero
- Categoria opcional

### ✅ Clientes (CRUD Completo)
- Listar todos os clientes
- Buscar por nome, CPF ou email
- Criar novo cliente (com validações de idade)
- Editar cliente existente
- Deletar cliente
- Indicador visual para menores de idade

**Validações:**
- CPF válido (com dígitos verificadores)
- Email válido
- Data de nascimento no passado
- Responsável obrigatório para menores de 18 anos
- Alerta visual para clientes menores de idade

### ✅ Gestão de Estoque
- Consultar estoque por medicamento
- Visualizar todos os lotes com quantidades e datas de vencimento
- Registrar entrada de estoque (com data de vencimento futura)
- Registrar saída de estoque (usando FIFO automático)
- Indicadores visuais para lotes vencidos ou próximos do vencimento

**Validações:**
- Data de vencimento deve ser futura
- Quantidade deve ser maior que zero
- Valida estoque disponível antes de saída

### ✅ Sistema de Vendas
- Listar todas as vendas
- Ver detalhes completos de uma venda
- Criar nova venda com carrinho de compras
- Adicionar/remover itens do carrinho
- Alterar quantidades
- Cálculo automático de subtotais e total
- Preview antes de finalizar

**Validações:**
- Cliente deve ser maior de 18 anos
- Medicamento deve estar ativo
- Deve haver estoque disponível
- Pelo menos um item no carrinho

**Regras de Negócio:**
- Preço usado é o preço atual do medicamento
- Estoque é atualizado automaticamente (FIFO)
- Cliente menor de idade não pode comprar

### ✅ Alertas
- Alertas de estoque baixo (< 10 unidades)
- Alertas de validade próxima (< 30 dias)
- Medicamentos vencidos
- Filtros por tipo de alerta
- Atualização manual dos alertas

## 🎨 Design e UX

- Interface limpa e moderna
- Responsivo (mobile-friendly)
- Feedback visual para todas as ações
- Loading indicators
- Mensagens de sucesso/erro com toast
- Confirmações antes de deletar
- Badges e indicadores de status
- Cores semânticas (verde=sucesso, vermelho=erro, amarelo=aviso)

## 🔄 Integração com API

Todas as requisições são feitas para `http://localhost:8080`. Para mudar:

1. Edite o arquivo `.env`:
```
REACT_APP_API_BASE_URL=http://sua-url-aqui
```

2. Ou edite diretamente em `src/config/constants.ts`

## 📝 Validações Implementadas

### Frontend (UX)
- Campos obrigatórios
- Formatos de CPF, email, datas
- Valores numéricos (preço > 0, quantidade > 0)
- Idade do cliente
- Data de vencimento futura
- Estoque disponível

### Backend (Segurança)
O backend também valida tudo. As validações do frontend são para melhorar a UX.

## 🚨 Tratamento de Erros

- **401/403**: Redireciona para login
- **400**: Exibe mensagem de validação
- **404**: Exibe "não encontrado"
- **409**: Exibe conflito (ex: CPF duplicado)
- **500**: Exibe erro genérico

## 🔍 Funcionalidades Especiais

### Sistema FIFO
- Saídas de estoque e vendas usam FIFO automático
- Remove primeiro dos lotes mais próximos de vencer
- Transparente para o usuário

### Soft Delete
- Medicamentos vendidos são inativados permanentemente (não deletados)
- Mantém integridade histórica das vendas

### Validação de Idade
- Calcula idade automaticamente
- Bloqueia venda para menores de 18 anos
- Exige responsável para menores

### Alertas Inteligentes
- Atualização em tempo real
- Cores semânticas (vermelho=crítico, amarelo=atenção)
- Filtros e organização

## 🛠️ Build para Produção

```bash
npm run build
```

Gera a pasta `build/` com os arquivos otimizados.

## 📦 Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm test` - Executa os testes
- `npm run eject` - Ejeta do Create React App (irreversível)

## 🐛 Debugging

1. Verifique se o backend está rodando em `http://localhost:8080`
2. Abra o Console do navegador (F12) para ver erros
3. Verifique o Network tab para ver requisições

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais.

---

**Desenvolvido com ❤️ usando React + TypeScript**
