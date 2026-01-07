import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { vendaService } from '../api/vendaService';
import { clienteService } from '../api/clienteService';
import { medicamentoService } from '../api/medicamentoService';
import { Venda, Cliente, Medicamento, ItemVendaRequest } from '../types';
import { toast } from 'react-toastify';
import { formatCurrency, formatDateTime, calculateAge } from '../utils/formatters';
import { useTableSort } from '../hooks/useTableSort';
import '../pages/Categorias.css';
import './Vendas.css';

export const Vendas: React.FC = () => {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [clienteId, setClienteId] = useState<number | ''>('');
  const [carrinho, setCarrinho] = useState<Array<{ medicamento: Medicamento; quantidade: number }>>([]);
  const [medicamentoSelecionado, setMedicamentoSelecionado] = useState<number | ''>('');
  const [quantidade, setQuantidade] = useState(1);

  // Hook para ordenação
  const { sortedData, requestSort, getSortIndicator, sortConfig } = useTableSort(vendas);

  useEffect(() => {
    loadData();
  }, []);

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

  const handleOpenModal = () => {
    setClienteId('');
    setCarrinho([]);
    setMedicamentoSelecionado('');
    setQuantidade(1);
    setShowModal(true);
  };

  const handleAdicionarAoCarrinho = () => {
    if (!medicamentoSelecionado) {
      toast.error('Selecione um medicamento');
      return;
    }

    if (quantidade <= 0) {
      toast.error('A quantidade deve ser maior que zero');
      return;
    }

    const medicamento = medicamentos.find((m) => m.id === Number(medicamentoSelecionado));
    if (!medicamento) return;

    // Verifica se já existe no carrinho
    const itemExistente = carrinho.find((item) => item.medicamento.id === medicamento.id);
    if (itemExistente) {
      setCarrinho(carrinho.map((item) => (item.medicamento.id === medicamento.id ? { ...item, quantidade: item.quantidade + quantidade } : item)));
    } else {
      setCarrinho([...carrinho, { medicamento, quantidade }]);
    }

    setMedicamentoSelecionado('');
    setQuantidade(1);
    toast.success('Medicamento adicionado ao carrinho');
  };

  const handleRemoverDoCarrinho = (medicamentoId: number) => {
    setCarrinho(carrinho.filter((item) => item.medicamento.id !== medicamentoId));
  };

  const handleAlterarQuantidade = (medicamentoId: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      handleRemoverDoCarrinho(medicamentoId);
      return;
    }
    setCarrinho(carrinho.map((item) => (item.medicamento.id === medicamentoId ? { ...item, quantidade: novaQuantidade } : item)));
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + item.medicamento.preco * item.quantidade, 0);
  };

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

  const handleVerDetalhes = (venda: Venda) => {
    setVendaSelecionada(venda);
    setShowDetalhes(true);
  };

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1>Vendas</h1>
          <button className="btn btn-primary" onClick={handleOpenModal}>
            + Nova Venda
          </button>
        </div>

        <div className="card">
          {vendas.length === 0 ? (
            <p className="empty-message">Nenhuma venda registrada.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
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
                        <button className="btn btn-sm btn-secondary" onClick={() => handleVerDetalhes(venda)}>
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => !submitting && setShowModal(false)}>
            <div className="modal-content modal-xl" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nova Venda</h2>
                <button className="btn-close" onClick={() => setShowModal(false)} disabled={submitting}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="venda-form">
                  <div className="form-group">
                    <label htmlFor="clienteId">Cliente *</label>
                    <select id="clienteId" className="form-control" value={clienteId} onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : '')} disabled={submitting}>
                      <option value="">-- Selecione o cliente --</option>
                      {clientes.map((cliente) => {
                        const idade = calculateAge(cliente.dataNascimento);
                        const menor = idade < 18;
                        return (
                          <option key={cliente.id} value={cliente.id} disabled={menor}>
                            {cliente.nomeCompleto} - {cliente.cpf} {menor && '(Menor de idade)'}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="add-item-section">
                    <h3>Adicionar Medicamento</h3>
                    <div className="add-item-form">
                      <div className="form-group">
                        <label htmlFor="medicamento">Medicamento</label>
                        <select
                          id="medicamento"
                          className="form-control"
                          value={medicamentoSelecionado}
                          onChange={(e) => setMedicamentoSelecionado(e.target.value ? Number(e.target.value) : '')}
                          disabled={submitting}
                        >
                          <option value="">-- Selecione --</option>
                          {medicamentos.map((med) => (
                            <option key={med.id} value={med.id}>
                              {med.nome} - {med.dosagem} - {formatCurrency(med.preco)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="quantidade">Quantidade</label>
                        <input
                          type="number"
                          id="quantidade"
                          className="form-control"
                          value={quantidade}
                          onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                          min="1"
                          disabled={submitting}
                        />
                      </div>

                      <button type="button" className="btn btn-success" onClick={handleAdicionarAoCarrinho} disabled={submitting}>
                        Adicionar
                      </button>
                    </div>
                  </div>

                  <div className="carrinho-section">
                    <h3>Carrinho ({carrinho.length} {carrinho.length === 1 ? 'item' : 'itens'})</h3>
                    {carrinho.length === 0 ? (
                      <p className="empty-message">Carrinho vazio</p>
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
                                  className="form-control qty-input"
                                  value={item.quantidade}
                                  onChange={(e) => handleAlterarQuantidade(item.medicamento.id, parseInt(e.target.value) || 0)}
                                  min="1"
                                  disabled={submitting}
                                />
                                <span className="item-subtotal">{formatCurrency(item.medicamento.preco * item.quantidade)}</span>
                                <button
                                  type="button"
                                  className="btn-remove"
                                  onClick={() => handleRemoverDoCarrinho(item.medicamento.id)}
                                  disabled={submitting}
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="carrinho-total">
                          <strong>Total:</strong>
                          <span className="total-value">{formatCurrency(calcularTotal())}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                    Cancelar
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleFinalizarVenda} disabled={submitting || carrinho.length === 0}>
                    {submitting ? 'Finalizando...' : 'Finalizar Venda'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
