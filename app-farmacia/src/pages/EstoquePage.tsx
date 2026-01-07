import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { estoqueService } from '../api/estoqueService';
import { medicamentoService } from '../api/medicamentoService';
import { Estoque, Medicamento, EntradaEstoqueRequest, SaidaEstoqueRequest } from '../types';
import { toast } from 'react-toastify';
import { formatDate, isFutureDate } from '../utils/formatters';
import '../pages/Categorias.css';
import './Estoque.css';

export const EstoquePage: React.FC = () => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [estoque, setEstoque] = useState<Estoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEstoque, setLoadingEstoque] = useState(false);
  const [selectedMedicamento, setSelectedMedicamento] = useState<number | ''>('');
  const [showEntradaModal, setShowEntradaModal] = useState(false);
  const [showSaidaModal, setShowSaidaModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [entradaData, setEntradaData] = useState<EntradaEstoqueRequest>({
    medicamentoId: 0,
    quantidade: 0,
    dataVencimento: '',
    observacao: '',
  });

  const [saidaData, setSaidaData] = useState<SaidaEstoqueRequest>({
    medicamentoId: 0,
    quantidade: 0,
    dataVencimento: '',
    observacao: '',
  });

  useEffect(() => {
    loadMedicamentos();
  }, []);

  useEffect(() => {
    if (selectedMedicamento) {
      loadEstoque(Number(selectedMedicamento));
    } else {
      setEstoque([]);
    }
  }, [selectedMedicamento]);

  const loadMedicamentos = async () => {
    try {
      setLoading(true);
      const data = await medicamentoService.getAll();
      const naoExcluidos = data.filter((m) => !m.deletado);
      setMedicamentos(naoExcluidos);
    } catch (error) {
      console.error('Erro ao carregar medicamentos:', error);
      toast.error('Erro ao carregar medicamentos');
    } finally {
      setLoading(false);
    }
  };

  const loadEstoque = async (medicamentoId: number) => {
    try {
      setLoadingEstoque(true);
      const data = await estoqueService.getLotesByMedicamento(medicamentoId);
      setEstoque(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar estoque:', error);
      toast.error('Erro ao carregar estoque');
      setEstoque([]);
    } finally {
      setLoadingEstoque(false);
    }
  };

  const handleOpenEntradaModal = () => {
    if (!selectedMedicamento) {
      toast.error('Selecione um medicamento primeiro');
      return;
    }
    setEntradaData({
      medicamentoId: Number(selectedMedicamento),
      quantidade: 0,
      dataVencimento: '',
      observacao: '',
    });
    setShowEntradaModal(true);
  };

  const handleOpenSaidaModal = () => {
    if (!selectedMedicamento) {
      toast.error('Selecione um medicamento primeiro');
      return;
    }
    const totalEstoque = Array.isArray(estoque) ? estoque.reduce((sum, e) => sum + e.quantidadeAtual, 0) : 0;
    if (totalEstoque === 0) {
      toast.error('Não há estoque disponível para este medicamento');
      return;
    }
    
    // Encontra o lote com data de vencimento mais próxima (FIFO)
    let dataVencimentoMaisProxima = '';
    if (Array.isArray(estoque) && estoque.length > 0) {
      const lotesOrdenados = [...estoque].sort((a, b) => 
        new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime()
      );
      dataVencimentoMaisProxima = lotesOrdenados[0].dataVencimento;
    }
    
    setSaidaData({
      medicamentoId: Number(selectedMedicamento),
      quantidade: 0,
      dataVencimento: dataVencimentoMaisProxima,
      observacao: '',
    });
    setShowSaidaModal(true);
  };

  const handleEntradaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (entradaData.quantidade <= 0) {
      toast.error('A quantidade deve ser maior que zero');
      return;
    }

    if (!entradaData.dataVencimento) {
      toast.error('A data de vencimento é obrigatória');
      return;
    }

    if (!isFutureDate(entradaData.dataVencimento)) {
      toast.error('A data de vencimento deve ser futura');
      return;
    }

    setSubmitting(true);

    try {
      const response = await estoqueService.registrarEntrada(entradaData);
      toast.success(response.message);
      setShowEntradaModal(false);
      loadEstoque(Number(selectedMedicamento));
    } catch (error: any) {
      console.error('Erro ao registrar entrada:', error);
      const message = error.response?.data?.message || 'Erro ao registrar entrada';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaidaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saidaData.quantidade <= 0) {
      toast.error('A quantidade deve ser maior que zero');
      return;
    }

    const totalEstoque = Array.isArray(estoque) ? estoque.reduce((sum, e) => sum + e.quantidadeAtual, 0) : 0;
    if (saidaData.quantidade > totalEstoque) {
      toast.error(`Estoque insuficiente. Disponível: ${totalEstoque}`);
      return;
    }

    setSubmitting(true);

    console.log('Dados da saída:', saidaData);

    try {
      const response = await estoqueService.registrarSaida(saidaData);
      toast.success(response.message);
      setShowSaidaModal(false);
      loadEstoque(Number(selectedMedicamento));
    } catch (error: any) {
      console.error('Erro ao registrar saída:', error);
      console.error('Detalhes do erro:', error.response?.data);
      const message = error.response?.data?.message || 'Erro ao registrar saída';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  const totalEstoque = Array.isArray(estoque) ? estoque.reduce((sum, e) => sum + e.quantidadeAtual, 0) : 0;

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1>Gestão de Estoque</h1>
        </div>

        <div className="card">
          <div className="estoque-controls">
            <div className="form-group">
              <label htmlFor="medicamento">Selecione o Medicamento</label>
              <select
                id="medicamento"
                value={selectedMedicamento}
                onChange={(e) => setSelectedMedicamento(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">-- Selecione um medicamento --</option>
                {medicamentos.map((med) => (
                  <option key={med.id} value={med.id}>
                    {med.nome} - {med.dosagem}
                  </option>
                ))}
              </select>
            </div>

            {selectedMedicamento && (
              <div className="estoque-actions">
                <button className="btn btn-success" onClick={handleOpenEntradaModal}>
                  + Entrada de Estoque
                </button>
                <button className="btn btn-warning" onClick={handleOpenSaidaModal}>
                  - Saída de Estoque
                </button>
              </div>
            )}
          </div>
        </div>

        {selectedMedicamento && (
          <div className="card">
            <div className="estoque-summary">
              <h3>Total em Estoque: {totalEstoque} unidades</h3>
            </div>

            {loadingEstoque ? (
              <Loading />
            ) : estoque.length === 0 ? (
              <p className="empty-message">Nenhum lote em estoque para este medicamento.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Lote ID</th>
                      <th>Quantidade</th>
                      <th>Data de Vencimento</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(estoque) && estoque.length > 0 ? (
                      estoque.map((lote) => {
                        const dataVenc = new Date(lote.dataVencimento);
                        const hoje = new Date();
                        hoje.setHours(0, 0, 0, 0);
                        const vencido = dataVenc < hoje;
                        const proximoVencimento = !vencido && (dataVenc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24) <= 30;

                        return (
                          <tr key={lote.id} className={vencido ? 'row-danger' : proximoVencimento ? 'row-warning' : ''}>
                          <td>{lote.id}</td>
                          <td>{lote.quantidadeAtual}</td>
                          <td>{formatDate(lote.dataVencimento)}</td>
                          <td>
                            {vencido ? (
                              <span className="badge badge-danger">Vencido</span>
                            ) : proximoVencimento ? (
                              <span className="badge badge-warning">Vence em breve</span>
                            ) : (
                              <span className="badge badge-success">OK</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center' }}>
                          Nenhum lote em estoque
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {showEntradaModal && (
          <div className="modal-overlay" onClick={() => setShowEntradaModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Registrar Entrada de Estoque</h2>
                <button className="btn-close" onClick={() => setShowEntradaModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleEntradaSubmit}>
                <div className="form-group">
                  <label htmlFor="quantidade">Quantidade *</label>
                  <input
                    type="number"
                    id="quantidade"
                    value={entradaData.quantidade || ''}
                    onChange={(e) => setEntradaData({ ...entradaData, quantidade: parseInt(e.target.value) || 0 })}
                    min="1"
                    placeholder="Ex: 100"
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dataVencimento">Data de Vencimento *</label>
                  <input
                    type="date"
                    id="dataVencimento"
                    value={entradaData.dataVencimento}
                    onChange={(e) => setEntradaData({ ...entradaData, dataVencimento: e.target.value })}
                    disabled={submitting}
                    required
                  />
                  <small>A data deve ser futura</small>
                </div>

                <div className="form-group">
                  <label htmlFor="observacao">Número do Lote (opcional)</label>
                  <input
                    type="text"
                    id="observacao"
                    value={entradaData.observacao}
                    onChange={(e) => setEntradaData({ ...entradaData, observacao: e.target.value })}
                    placeholder="Ex: LOTE-2025-001"
                    disabled={submitting}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEntradaModal(false)} disabled={submitting}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Registrando...' : 'Registrar Entrada'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showSaidaModal && (
          <div className="modal-overlay" onClick={() => setShowSaidaModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Registrar Saída de Estoque</h2>
                <button className="btn-close" onClick={() => setShowSaidaModal(false)}>
                  ×
                </button>
              </div>
              <form onSubmit={handleSaidaSubmit}>
                <div className="alert-info">
                  <strong>Estoque disponível:</strong> {totalEstoque} unidades
                  <br />
                  <small>A saída será feita automaticamente usando FIFO (primeiro a vencer, primeiro a sair)</small>
                </div>

                <div className="form-group">
                  <label htmlFor="quantidadeSaida">Quantidade *</label>
                  <input
                    type="number"
                    id="quantidadeSaida"
                    value={saidaData.quantidade || ''}
                    onChange={(e) => setSaidaData({ ...saidaData, quantidade: parseInt(e.target.value) || 0 })}
                    min="1"
                    max={totalEstoque}
                    placeholder="Ex: 10"
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="observacaoSaida">Observação (opcional)</label>
                  <input
                    type="text"
                    id="observacaoSaida"
                    value={saidaData.observacao}
                    onChange={(e) => setSaidaData({ ...saidaData, observacao: e.target.value })}
                    placeholder="Ex: Venda manual, Perda, etc."
                    disabled={submitting}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowSaidaModal(false)} disabled={submitting}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Registrando...' : 'Registrar Saída'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
