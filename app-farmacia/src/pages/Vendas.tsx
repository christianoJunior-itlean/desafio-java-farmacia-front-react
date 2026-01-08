// Importa React e hooks
import React, { useEffect, useState } from 'react';
// Importa ícone para botão de visualizar detalhes
import { FaEye } from 'react-icons/fa';

// Layout e componentes compartilhados
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';

// Serviços e tipos necessários para vendas
import { vendaService } from '../api/vendaService';
import { clienteService } from '../api/clienteService';
import { medicamentoService } from '../api/medicamentoService';
import { Venda, Cliente, Medicamento, ItemVendaRequest } from '../types';

// Toasts, utilitários e hook de ordenação
import { toast } from 'react-toastify';
import { formatCurrency, formatDateTime, calculateAge } from '../utils/formatters';
import { useTableSort } from '../hooks/useTableSort';

// Estilos compartilhados e específicos
import '../styles/forms.css';
import '../pages/Categorias.css';
import './Vendas.css';

// Página de Vendas: listagem, criação e detalhes de vendas
export const Vendas: React.FC = () => {
  // Listas e estados globais
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  // Controles de modais e item selecionado
  const [showModal, setShowModal] = useState(false);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Estados do formulário da venda
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [mostrarSugestoesCliente, setMostrarSugestoesCliente] = useState(false);
  const [carrinho, setCarrinho] = useState<Array<{ medicamento: Medicamento; quantidade: number }>>([]);
  const [medicamentoSelecionado, setMedicamentoSelecionado] = useState<Medicamento | null>(null);
  const [buscaMedicamento, setBuscaMedicamento] = useState('');
  const [mostrarSugestoesMedicamento, setMostrarSugestoesMedicamento] = useState(false);
  const [quantidade, setQuantidade] = useState(1);

  // Hook para ordenação da lista de vendas
  const { sortedData, requestSort, getSortIndicator, sortConfig } = useTableSort(vendas);

  // Filtra clientes baseado na busca (nome ou CPF)
  const clientesFiltrados = clientes.filter((cliente) => {
    const busca = buscaCliente.toLowerCase().trim();
    if (!busca) return false; // Não mostra nada se não houver busca
    
    // Busca por nome
    const nome = cliente.nomeCompleto.toLowerCase();
    if (nome.includes(busca)) return true;
    
    // Busca por CPF (remove formatação)
    const cpf = cliente.cpf.replace(/\D/g, '');
    const buscaSemFormatacao = busca.replace(/\D/g, '');
    if (buscaSemFormatacao && cpf.includes(buscaSemFormatacao)) return true;
    
    return false;
  });

  // Função para selecionar um cliente da lista de sugestões
  const handleSelecionarCliente = (cliente: Cliente) => {
    const idade = calculateAge(cliente.dataNascimento);
    if (idade < 18) {
      toast.error('Não é permitido vender para menores de idade.');
      return;
    }
    setClienteId(cliente.id);
    setClienteSelecionado(cliente);
    setBuscaCliente(`${cliente.nomeCompleto} - ${cliente.cpf}`);
    setMostrarSugestoesCliente(false);
  };

  // Função para limpar seleção de cliente
  const handleLimparCliente = () => {
    setClienteId('');
    setClienteSelecionado(null);
    setBuscaCliente('');
    setMostrarSugestoesCliente(false);
  };

  // Filtra medicamentos baseado na busca (nome ou dosagem)
  const medicamentosFiltrados = medicamentos.filter((medicamento) => {
    const busca = buscaMedicamento.toLowerCase().trim();
    if (!busca) return false;
    
    const nome = medicamento.nome.toLowerCase();
    if (nome.includes(busca)) return true;
    
    const dosagem = medicamento.dosagem.toLowerCase();
    if (dosagem.includes(busca)) return true;
    
    return false;
  });

  // Função para selecionar um medicamento da lista de sugestões
  const handleSelecionarMedicamento = (medicamento: Medicamento) => {
    setMedicamentoSelecionado(medicamento);
    setBuscaMedicamento(`${medicamento.nome} - ${medicamento.dosagem}`);
    setMostrarSugestoesMedicamento(false);
  };

  // Função para limpar seleção de medicamento
  const handleLimparMedicamento = () => {
    setMedicamentoSelecionado(null);
    setBuscaMedicamento('');
    setMostrarSugestoesMedicamento(false);
  };

  // Carrega vendas, clientes e medicamentos quando a página monta
  useEffect(() => {
    loadData();
  }, []);

  // Fecha as sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.form-field')) {
        setMostrarSugestoesCliente(false);
        setMostrarSugestoesMedicamento(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Busca dados iniciais em paralelo e filtra medicamentos ativos
  const loadData = async () => {
    try {
      setLoading(true);
      const [vendasData, clientesData, medicamentosData] = await Promise.all([
        vendaService.getAll(),
        clienteService.getAll(),
        medicamentoService.getAll(),
      ]);
      setVendas(vendasData);
      setClientes(clientesData);
      const ativos = medicamentosData.filter((m) => m.ativo);
      setMedicamentos(ativos);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Abre modal para iniciar uma nova venda
  const handleOpenModal = () => {
    setClienteId('');
    setClienteSelecionado(null);
    setBuscaCliente('');
    setMostrarSugestoesCliente(false);
    setCarrinho([]);
    setMedicamentoSelecionado(null);
    setBuscaMedicamento('');
    setMostrarSugestoesMedicamento(false);
    setQuantidade(1);
    setShowModal(true);
  };

  // Adiciona o medicamento selecionado ao carrinho com quantidade informada
  const handleAdicionarAoCarrinho = () => {
    if (!medicamentoSelecionado) {
      toast.error('Selecione um medicamento');
      return;
    }

    if (quantidade <= 0) {
      toast.error('A quantidade deve ser maior que zero');
      return;
    }

    // Se já existe no carrinho, soma a quantidade; senão, adiciona novo item
    const itemExistente = carrinho.find((item) => item.medicamento.id === medicamentoSelecionado.id);
    if (itemExistente) {
      setCarrinho(carrinho.map((item) => (item.medicamento.id === medicamentoSelecionado.id ? { ...item, quantidade: item.quantidade + quantidade } : item)));
    } else {
      setCarrinho([...carrinho, { medicamento: medicamentoSelecionado, quantidade }]);
    }

    setMedicamentoSelecionado(null);
    setBuscaMedicamento('');
    setQuantidade(1);
    toast.success('Medicamento adicionado ao carrinho');
  };

  // Remove item do carrinho pelo ID do medicamento
  const handleRemoverDoCarrinho = (medicamentoId: number) => {
    setCarrinho(carrinho.filter((item) => item.medicamento.id !== medicamentoId));
  };

  // Altera a quantidade de um item no carrinho; se zerar, remove
  const handleAlterarQuantidade = (medicamentoId: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      handleRemoverDoCarrinho(medicamentoId);
      return;
    }
    setCarrinho(carrinho.map((item) => (item.medicamento.id === medicamentoId ? { ...item, quantidade: novaQuantidade } : item)));
  };

  // Calcula o total da venda somando subtotais do carrinho
  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + item.medicamento.preco * item.quantidade, 0);
  };

  // Finaliza a venda: validações (cliente maior de idade, carrinho não vazio) e chamada ao backend
  const handleFinalizarVenda = async () => {
    if (!clienteId) {
      toast.error('Selecione um cliente');
      return;
    }

    const cliente = clientes.find((c) => c.id === Number(clienteId));
    if (!cliente) return;

    const idade = calculateAge(cliente.dataNascimento);
    if (idade < 18) {
      toast.error('Cliente menor de idade não pode realizar compras');
      return;
    }

    if (carrinho.length === 0) {
      toast.error('Adicione pelo menos um medicamento ao carrinho');
      return;
    }

    // Monta payload de itens para a API
    const itens: ItemVendaRequest[] = carrinho.map((item) => ({
      medicamentoId: item.medicamento.id,
      quantidade: item.quantidade,
    }));

    setSubmitting(true);

    try {
      await vendaService.create({ clienteId: Number(clienteId), itens });
      toast.success('Venda realizada com sucesso!');
      setShowModal(false);
      loadData();
    } catch (error: any) {
      console.error('Erro ao realizar venda:', error);
      const message = error.response?.data?.message || 'Erro ao realizar venda';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Abre modal de detalhes para uma venda
  const handleVerDetalhes = (venda: Venda) => {
    setVendaSelecionada(venda);
    setShowDetalhes(true);
  };

  // Exibe loading durante a busca inicial de dados
  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Container da página de vendas */}
      <div className="page-container">
        {/* Cabeçalho e ação de iniciar nova venda */}
        <div className="page-header">
          <h1>Vendas</h1>
          <button className="btn btn-primary" onClick={handleOpenModal}>
            + Nova Venda
          </button>
        </div>

        {/* Tabela de vendas registradas */}
        <div className="card">
          {vendas.length === 0 ? (
            <p className="empty-message">Nenhuma venda registrada.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    {/* Cabeçalhos ordenáveis */}
                    <th 
                      className={`sortable${sortConfig.key === 'id' ? ' sorted' : ''}`}
                      onClick={() => requestSort('id')}
                    >
                      ID{getSortIndicator('id')}
                    </th>
                    <th 
                      className={`sortable${sortConfig.key === 'cliente.nomeCompleto' ? ' sorted' : ''}`}
                      onClick={() => requestSort('cliente.nomeCompleto')}
                    >
                      Cliente{getSortIndicator('cliente.nomeCompleto')}
                    </th>
                    <th 
                      className={`sortable${sortConfig.key === 'dataHora' ? ' sorted' : ''}`}
                      onClick={() => requestSort('dataHora')}
                    >
                      Data/Hora{getSortIndicator('dataHora')}
                    </th>
                    <th 
                      className={`sortable${sortConfig.key === 'itens.length' ? ' sorted' : ''}`}
                      onClick={() => requestSort('itens.length')}
                    >
                      Qtd. Itens{getSortIndicator('itens.length')}
                    </th>
                    <th 
                      className={`sortable${sortConfig.key === 'valorTotal' ? ' sorted' : ''}`}
                      onClick={() => requestSort('valorTotal')}
                    >
                      Valor Total{getSortIndicator('valorTotal')}
                    </th>
                    <th className="text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((venda) => (
                    <tr key={venda.id}>
                      <td>{venda.id}</td>
                      <td>{venda.cliente.nomeCompleto}</td>
                      <td>{formatDateTime(venda.dataHora)}</td>
                      <td>{venda.itens.length}</td>
                      <td className="text-success">{formatCurrency(venda.valorTotal)}</td>
                      <td className="text-center">
                        <button 
                          className="btn-icon btn-icon-view" 
                          onClick={() => handleVerDetalhes(venda)}
                          title="Ver Detalhes"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal para criar uma nova venda */}
        {showModal && (
          <div className="modal-overlay" onClick={() => !submitting && setShowModal(false)}>
            <div className="modal-content modern-modal modern-modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nova Venda</h2>
                <button className="btn-close" onClick={() => setShowModal(false)} disabled={submitting}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="modern-form">
                  <div className="form-field form-grid-full" style={{ position: 'relative' }}>
                    <label htmlFor="buscaCliente" className="form-label form-label-required">Cliente</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        id="buscaCliente"
                        className="form-input"
                        placeholder="Digite o nome ou CPF do cliente..."
                        value={buscaCliente}
                        onChange={(e) => {
                          const valor = e.target.value;
                          setBuscaCliente(valor);
                          setClienteSelecionado(null);
                          setClienteId('');
                          setMostrarSugestoesCliente(valor.length > 0);
                        }}
                        onFocus={() => setMostrarSugestoesCliente(true)}
                        disabled={submitting}
                        autoComplete="off"
                      />
                      {clienteSelecionado && (
                        <button
                          type="button"
                          onClick={handleLimparCliente}
                          disabled={submitting}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            width: '28px',
                            height: '28px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            lineHeight: 1
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                    {mostrarSugestoesCliente && buscaCliente && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          maxHeight: '200px',
                          overflowY: 'auto',
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          zIndex: 1000,
                          marginTop: '4px'
                        }}
                      >
                        {clientesFiltrados.length === 0 ? (
                          <div style={{ padding: '12px', color: '#6b7280', textAlign: 'center' }}>
                            Nenhum cliente encontrado
                          </div>
                        ) : (
                          clientesFiltrados.map((cliente) => {
                            const idade = calculateAge(cliente.dataNascimento);
                            const menor = idade < 18;
                            return (
                              <div
                                key={cliente.id}
                                onClick={() => !menor && handleSelecionarCliente(cliente)}
                                style={{
                                  padding: '12px',
                                  cursor: menor ? 'not-allowed' : 'pointer',
                                  borderBottom: '1px solid #f3f4f6',
                                  backgroundColor: menor ? '#fee2e2' : 'transparent',
                                  opacity: menor ? 0.6 : 1,
                                  transition: 'background-color 0.15s'
                                }}
                                onMouseEnter={(e) => !menor && (e.currentTarget.style.backgroundColor = '#f9fafb')}
                                onMouseLeave={(e) => !menor && (e.currentTarget.style.backgroundColor = 'transparent')}
                              >
                                <div style={{ fontWeight: 500, color: '#111827' }}>{cliente.nomeCompleto}</div>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>
                                  CPF: {cliente.cpf} • {idade} anos {menor && '• Menor de idade'}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  <div className="add-item-section" style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>Adicionar Medicamento</h3>
                    <div className="form-grid">
                      <div className="form-field" style={{ position: 'relative' }}>
                        <label htmlFor="buscaMedicamento" className="form-label">Medicamento</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            id="buscaMedicamento"
                            className="form-input"
                            placeholder="Digite o nome ou dosagem..."
                            value={buscaMedicamento}
                            onChange={(e) => {
                              const valor = e.target.value;
                              setBuscaMedicamento(valor);
                              setMedicamentoSelecionado(null);
                              setMostrarSugestoesMedicamento(valor.length > 0);
                            }}
                            onFocus={() => setMostrarSugestoesMedicamento(buscaMedicamento.length > 0)}
                            disabled={submitting}
                            autoComplete="off"
                          />
                          {medicamentoSelecionado && (
                            <button
                              type="button"
                              onClick={handleLimparMedicamento}
                              disabled={submitting}
                              style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                width: '28px',
                                height: '28px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                lineHeight: 1
                              }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                        {mostrarSugestoesMedicamento && buscaMedicamento && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              maxHeight: '200px',
                              overflowY: 'auto',
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              zIndex: 1000,
                              marginTop: '4px'
                            }}
                          >
                            {medicamentosFiltrados.length === 0 ? (
                              <div style={{ padding: '12px', color: '#6b7280', textAlign: 'center' }}>
                                Nenhum medicamento encontrado
                              </div>
                            ) : (
                              medicamentosFiltrados.map((medicamento) => (
                                <div
                                  key={medicamento.id}
                                  onClick={() => handleSelecionarMedicamento(medicamento)}
                                  style={{
                                    padding: '12px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #f3f4f6',
                                    transition: 'background-color 0.15s'
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                  <div style={{ fontWeight: 500, color: '#111827' }}>{medicamento.nome}</div>
                                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>
                                    {medicamento.dosagem} • {formatCurrency(medicamento.preco)}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      <div className="form-field">
                        <label htmlFor="quantidade" className="form-label">Quantidade</label>
                        <input
                          type="number"
                          id="quantidade"
                          className="form-input"
                          value={quantidade}
                          onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                          min="1"
                          disabled={submitting}
                        />
                      </div>

                      <div className="form-field" style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button type="button" className="btn-form-primary" onClick={handleAdicionarAoCarrinho} disabled={submitting} style={{ width: '100%' }}>
                          Adicionar
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="carrinho-section" style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>Carrinho ({carrinho.length} {carrinho.length === 1 ? 'item' : 'itens'})</h3>
                    {carrinho.length === 0 ? (
                      <p className="empty-message" style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>Carrinho vazio</p>
                    ) : (
                      <>
                        <div className="carrinho-items">
                          {carrinho.map((item) => (
                            <div key={item.medicamento.id} className="carrinho-item">
                              <div className="item-info">
                                <strong>{item.medicamento.nome}</strong>
                                <span className="item-dosagem">{item.medicamento.dosagem}</span>
                                <span className="item-preco">{formatCurrency(item.medicamento.preco)} un.</span>
                              </div>
                              <div className="item-controls">
                                <input
                                  type="number"
                                  className="form-input qty-input"
                                  value={item.quantidade}
                                  onChange={(e) => handleAlterarQuantidade(item.medicamento.id, parseInt(e.target.value) || 0)}
                                  min="1"
                                  disabled={submitting}
                                  style={{ width: '80px' }}
                                />
                                <span className="item-subtotal" style={{ fontWeight: 600, color: '#059669' }}>{formatCurrency(item.medicamento.preco * item.quantidade)}</span>
                                <button
                                  type="button"
                                  className="btn-remove"
                                  onClick={() => handleRemoverDoCarrinho(item.medicamento.id)}
                                  disabled={submitting}
                                  style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', width: '32px', height: '32px', cursor: 'pointer' }}
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="carrinho-total" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '1.25rem', color: '#111827' }}>Total:</strong>
                          <span className="total-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669' }}>{formatCurrency(calcularTotal())}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-form-secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                    Cancelar
                  </button>
                  <button type="button" className="btn-form-primary" onClick={handleFinalizarVenda} disabled={submitting || carrinho.length === 0}>
                    {submitting ? 'Finalizando...' : 'Finalizar Venda'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalhes da venda selecionada */}
        {showDetalhes && vendaSelecionada && (
          <div className="modal-overlay" onClick={() => setShowDetalhes(false)}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Detalhes da Venda #{vendaSelecionada.id}</h2>
                <button className="btn-close" onClick={() => setShowDetalhes(false)}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="detalhes-section">
                  <div className="detalhes-group">
                    <h3>Informações do Cliente</h3>
                    <p>
                      <strong>Nome:</strong> {vendaSelecionada.cliente.nomeCompleto}
                    </p>
                    <p>
                      <strong>CPF:</strong> {vendaSelecionada.cliente.cpf}
                    </p>
                    <p>
                      <strong>Email:</strong> {vendaSelecionada.cliente.email}
                    </p>
                  </div>

                  <div className="detalhes-group">
                    <h3>Informações da Venda</h3>
                    <p>
                      <strong>Data/Hora:</strong> {formatDateTime(vendaSelecionada.dataHora)}
                    </p>
                    <p>
                      <strong>Valor Total:</strong> <span className="text-success">{formatCurrency(vendaSelecionada.valorTotal)}</span>
                    </p>
                  </div>
                </div>

                <div className="detalhes-itens">
                  <h3>Itens da Venda</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Medicamento</th>
                        <th>Quantidade</th>
                        <th>Preço Unit.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendaSelecionada.itens.map((item) => (
                        <tr key={item.id}>
                          <td>{item.medicamentoNome}</td>
                          <td>{item.quantidade}</td>
                          <td>{formatCurrency(item.precoUnitario)}</td>
                          <td>{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowDetalhes(false)}>
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
