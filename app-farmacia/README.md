# Sistema de Farmácia - Frontend

Frontend React para o sistema de gerenciamento de farmácia com dashboard, CRUD de medicamentos, clientes, vendas e alertas.

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 16+ instalado
- Backend rodando em `http://localhost:8080`

### Setup

1. **Instale as dependências:**
```bash
npm install
```

2. **Configure a URL do backend** (se necessário):
   - Edite `src/config/axios.ts`
   - Padrão: `http://localhost:8080`

3. **Inicie o servidor de desenvolvimento:**
```bash
npm start
```

A aplicação abrirá em `http://localhost:3000`

## 📝 Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia em modo desenvolvimento (hot reload) |
| `npm run build` | Cria build otimizada para produção |
| `npm test` | Executa testes unitários |

## 🔐 Login

- **Usuário padrão**: admin / admin123
- **Credenciais de teste**: Ver backend

## 📚 Tecnologias

- **React 18** - UI
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Axios** - HTTP client
- **React Router** - Navegação
- **React Toastify** - Notificações
- **React Icons** - Ícones

## 🎨 Funcionalidades

- ✅ Dashboard com alertas (estoque baixo, validade próxima)
- ✅ CRUD completo: Medicamentos, Categorias, Clientes
- ✅ Gerenciamento de Estoque (entrada/saída)
- ✅ Sistema de Vendas com carrinho de compras
- ✅ Busca inteligente (nome/CPF para clientes, nome/dosagem para medicamentos)
- ✅ Design responsivo e moderno
- ✅ Autenticação com JWT

## 🐛 Troubleshooting

**"Cannot GET /"**
- Verifique se o servidor rodou em `npm start`

**"Failed to fetch"**
- Confirme que o backend está rodando
- Verifique a URL em `axios.ts`

**Estilos não aparecem**
- Execute `npm install` novamente
- Limpe cache: `npm run build && rm -rf node_modules && npm install`
