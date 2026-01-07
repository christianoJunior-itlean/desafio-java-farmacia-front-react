# 🚀 Guia Rápido - Sistema de Farmácia

## ⚡ Início Rápido

### 1. Iniciar o Backend (Java/Spring Boot)
```bash
cd DesafiosJava
./mvnw spring-boot:run
```
O backend rodará em: `http://localhost:8080`

### 2. Iniciar o Frontend (React)
```bash
cd DesafioJava-farmacia-front/app-farmacia
npm start
```
O frontend abrirá automaticamente em: `http://localhost:3000`

## 🔐 Credenciais de Teste

**IMPORTANTE:** Você precisará criar um usuário no backend primeiro ou usar as credenciais que já existem no banco.

Exemplo de login:
- **Email:** admin@farmacia.com
- **Senha:** (verifique no backend)

## 📋 Checklist de Funcionalidades

### ✅ Autenticação
- [x] Login com JWT
- [x] Logout
- [x] Proteção de rotas
- [x] Redirecionamento automático em caso de token inválido

### ✅ Dashboard
- [x] Contadores de alertas
- [x] Listagem de estoque baixo
- [x] Listagem de medicamentos vencidos
- [x] Listagem de validade próxima

### ✅ Categorias
- [x] Listar todas
- [x] Criar nova
- [x] Editar existente
- [x] Deletar (com validação)

### ✅ Medicamentos
- [x] Listar todos
- [x] Filtrar por nome, dosagem, categoria, status
- [x] Criar novo (com todas validações)
- [x] Editar existente
- [x] Alterar status (ativar/inativar)
- [x] Deletar (soft delete se vendido)
- [x] Permite mesmo nome com dosagens diferentes

### ✅ Clientes
- [x] Listar todos
- [x] Buscar por nome, CPF, email
- [x] Criar novo (com validação de CPF e idade)
- [x] Editar existente
- [x] Deletar
- [x] Validação de menor de idade
- [x] Responsável obrigatório para menores
- [x] Indicador visual para menores

### ✅ Estoque
- [x] Consultar por medicamento
- [x] Visualizar todos os lotes
- [x] Registrar entrada (com data futura obrigatória)
- [x] Registrar saída (FIFO automático)
- [x] Indicadores de lotes vencidos/próximos

### ✅ Vendas
- [x] Listar todas
- [x] Ver detalhes completos
- [x] Criar nova venda
- [x] Sistema de carrinho
- [x] Validação de idade do cliente (>= 18 anos)
- [x] Validação de estoque
- [x] Cálculo automático de totais
- [x] Atualização automática de estoque (FIFO)

### ✅ Alertas
- [x] Estoque baixo (< 10 unidades)
- [x] Validade próxima (< 30 dias)
- [x] Medicamentos vencidos
- [x] Filtros por tipo
- [x] Atualização manual

## 🎯 Fluxos de Teste Recomendados

### 1. Primeiro Acesso
1. Faça login
2. Acesse o Dashboard para ver a visão geral
3. Explore o menu lateral

### 2. Configuração Inicial
1. **Categorias**: Crie algumas categorias (ex: Analgésicos, Antibióticos, Vitaminas)
2. **Medicamentos**: Cadastre medicamentos vinculando às categorias
3. **Clientes**: Cadastre clientes (teste com maiores e menores de idade)
4. **Estoque**: Adicione estoque aos medicamentos

### 3. Teste de Validações

#### Medicamentos:
- ✅ Tente criar com preço zero → Bloqueado
- ✅ Crie "Paracetamol 500mg"
- ✅ Crie "Paracetamol 750mg" → Permitido (dosagens diferentes)
- ✅ Inative um medicamento
- ✅ Tente deletar um medicamento vendido → Soft delete

#### Clientes:
- ✅ Tente criar menor sem responsável → Bloqueado
- ✅ Crie cliente menor COM responsável → Sucesso
- ✅ Tente CPF inválido → Bloqueado
- ✅ Tente email inválido → Bloqueado

#### Estoque:
- ✅ Tente data de vencimento passada → Bloqueado
- ✅ Adicione lotes com datas diferentes
- ✅ Tente saída maior que estoque → Bloqueado
- ✅ Faça saída e veja FIFO funcionando

#### Vendas:
- ✅ Tente vender para menor de idade → Bloqueado
- ✅ Tente vender medicamento inativo → Bloqueado
- ✅ Tente vender sem estoque → Bloqueado
- ✅ Crie venda válida → Sucesso
- ✅ Verifique estoque atualizado automaticamente

### 4. Teste de Alertas
1. Crie medicamento com estoque < 10 unidades
2. Crie lote com vencimento em menos de 30 dias
3. Acesse Dashboard ou Alertas para ver os avisos

## 🐛 Problemas Comuns

### Backend não está rodando
**Erro:** "Network Error" ou "ERR_CONNECTION_REFUSED"
**Solução:** Certifique-se que o backend está rodando em `http://localhost:8080`

### Erro 401 ao fazer login
**Possíveis causas:**
- Credenciais incorretas
- Usuário não existe no banco
**Solução:** Verifique as credenciais ou crie um novo usuário no backend

### Token expira muito rápido
**Solução:** Configure o tempo de expiração do JWT no backend

### CORS Error
**Solução:** Verifique se o backend tem configuração CORS para aceitar `http://localhost:3000`

## 📊 Estrutura de Dados

### Formato de CPF
- Com pontuação: `123.456.789-00`
- O frontend aplica máscara automaticamente
- Validação de dígitos verificadores

### Formato de Datas
- **Backend:** ISO 8601 (`YYYY-MM-DD` ou `YYYY-MM-DDTHH:mm:ss`)
- **Frontend exibe:** DD/MM/YYYY ou DD/MM/YYYY HH:mm

### Valores Monetários
- **Backend:** Number (ex: 15.50)
- **Frontend exibe:** R$ 15,50

## 🔄 Fluxo FIFO (First In, First Out)

O sistema usa FIFO automaticamente para saídas e vendas:
1. Remove primeiro dos lotes mais próximos de vencer
2. Pode consumir múltiplos lotes em uma única operação
3. Transparente para o usuário

Exemplo:
```
Lotes disponíveis:
- Lote 1: 20 unidades (vence em 10 dias)
- Lote 2: 30 unidades (vence em 20 dias)

Venda de 25 unidades:
- Remove 20 do Lote 1 (zerado)
- Remove 5 do Lote 2 (sobram 25)
```

## 📝 Regras de Negócio Importantes

1. **Medicamento com mesmo nome e dosagens diferentes é permitido**
2. **Cliente menor de 18 anos NÃO pode comprar**
3. **Medicamento vendido NÃO pode ser deletado (soft delete)**
4. **Data de vencimento DEVE ser futura**
5. **Categoria vinculada a medicamentos NÃO pode ser deletada**
6. **Preço deve ser maior que zero**
7. **Vendas atualizam estoque automaticamente**

## 🎨 Dicas de UI/UX

- **Verde** = Sucesso, Ativo, OK
- **Vermelho** = Erro, Inativo, Vencido, Crítico
- **Amarelo** = Aviso, Atenção
- **Azul** = Informação

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Verifique o console do navegador (F12)
2. Verifique os logs do backend
3. Consulte a documentação da API

---

**Sistema desenvolvido com React + TypeScript + Spring Boot**
