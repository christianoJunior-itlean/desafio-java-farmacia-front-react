// Importa React e hooks
import React, { useEffect, useState } from 'react';
// Importa React Hook Form e resolver Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { entradaEstoqueSchema, saidaEstoqueSchema, type EntradaEstoqueFormData, type SaidaEstoqueFormData } from '../schemas/formSchemas';

// Layout e componentes de UI
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';

// Serviços de estoque e medicamentos
import { estoqueService } from '../api/estoqueService';
import { medicamentoService } from '../api/medicamentoService';

// Tipos para dados e requisições desta página
import { Estoque, Medicamento } from '../types';

// Toasts e utilitários
import { toast } from 'react-toastify';
import { formatDate } from '../utils/formatters';

// Estilos compartilhados e específicos
import '../styles/forms.css';
import '../pages/Categorias.css';
import './Estoque.css';

// Página de gestão de estoque: entradas e saídas por lote
export const EstoquePage: React.FC = () => {
  // Lista de medicamentos (apenas não excluídos)
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  // Lotes de estoque do medicamento selecionado
  const [estoque, setEstoque] = useState<Estoque[]>([]);
  // Loading inicial e loading específico do estoque
  const [loading, setLoading] = useState(true);
  const [loadingEstoque, setLoadingEstoque] = useState(false);
  // Medicamento selecionado (id) para consultar/operar estoque
  const [selectedMedicamento, setSelectedMedicamento] = useState<number | ''>('');
  // Controles dos modais de entrada e saída de estoque
  const [showEntradaModal, setShowEntradaModal] = useState(false);
  const [showSaidaModal, setShowSaidaModal] = useState(false);
  // Controle de envio de formulários
  const [submitting, setSubmitting] = useState(false);

  // React Hook Form setup para entrada de estoque
  const { register: registerEntrada, handleSubmit: handleEntradaFormSubmit, formState: { errors: entradaErrors }, reset: resetEntrada } = useForm<EntradaEstoqueFormData>({
    resolver: zodResolver(entradaEstoqueSchema),
    mode: 'onSubmit',
    defaultValues: {
      quantidade: 0,
      dataVencimento: '',
      observacao: '',
    },
  });

  // React Hook Form setup para saída de estoque
  const { register: registerSaida, handleSubmit: handleSaidaFormSubmit, formState: { errors: saidaErrors }, reset: resetSaida } = useForm<SaidaEstoqueFormData>({
    resolver: zodResolver(saidaEstoqueSchema),
    mode: 'onSubmit',
    defaultValues: {
      quantidade: 0,
      dataVencimento: '',
      observacao: '',
    },
  });

  // Carrega a lista de medicamentos ao montar
  useEffect(() => {
    loadMedicamentos();
  }, []);

  // Toda vez que muda o medicamento selecionado, recarrega seus lotes
  useEffect(() => {
    if (selectedMedicamento) {
      loadEstoque(Number(selectedMedicamento));
    } else {
      setEstoque([]);
    }
  }, [selectedMedicamento]);

  // Busca medicamentos e filtra os não excluídos
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

  // Busca lotes de estoque para o medicamento selecionado
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

  // Abre modal de entrada de estoque (valida seleção do medicamento)
  const handleOpenEntradaModal = () => {
    if (!selectedMedicamento) {
      toast.error('Selecione um medicamento primeiro');
      return;
    }
    resetEntrada({
      quantidade: 0,
      dataVencimento: '',
      observacao: '',
    });
    setShowEntradaModal(true);
  };

  // Abre modal de saída de estoque, sugerindo o lote mais próximo de vencer (FIFO)
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
    
    resetSaida({
      quantidade: 0,
      dataVencimento: dataVencimentoMaisProxima,
      observacao: '',
    });
    setShowSaidaModal(true);
  };

  // Registra entrada de estoque
  const handleEntradaSubmit = async (data: EntradaEstoqueFormData) => {
    setSubmitting(true);

    try {
      const requestData = {
        medicamentoId: Number(selectedMedicamento),
        quantidade: data.quantidade,
        dataVencimento: data.dataVencimento,
        observacao: data.observacao || '',
      };
      const response = await estoqueService.registrarEntrada(requestData);
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

  // Registra saída de estoque, respeitando limites e FIFO no backend
  const handleSaidaSubmit = async (data: SaidaEstoqueFormData) => {
    const totalEstoque = Array.isArray(estoque) ? estoque.reduce((sum, e) => sum + e.quantidadeAtual, 0) : 0;
    if (data.quantidade > totalEstoque) {
      toast.error(`Estoque insuficiente. Disponível: ${totalEstoque}`);
      return;
    }

    setSubmitting(true);

    try {
      const requestData = {
        medicamentoId: Number(selectedMedicamento),
        quantidade: data.quantidade,
        dataVencimento: data.dataVencimento || '',
        observacao: data.observacao || '',
      };
      const response = await estoqueService.registrarSaida(requestData);
      toast.success(response.message);
      setShowSaidaModal(false);
      loadEstoque(Number(selectedMedicamento));
    } catch (error: any) {
      console.error('Erro ao registrar saída:', error);
      const message = error.response?.data?.message || 'Erro ao registrar saída';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Exibe loading inicial
  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  // Soma total de unidades em estoque do medicamento selecionado
  const totalEstoque = Array.isArray(estoque) ? estoque.reduce((sum, e) => sum + e.quantidadeAtual, 0) : 0;

  return (
    <Layout>
      {/* Container principal */}
      <div className="page-container">
        <div className="page-header">
          <h1>Gestão de Estoque</h1>
        </div>

        {/* Card de controles: seleção de medicamento e ações */}
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

        {/* Se um medicamento está selecionado, mostra o resumo e a tabela de lotes */}
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

        {/* Modal para registrar entrada de estoque */}
        {showEntradaModal && (
          <div className="modal-overlay" onClick={() => setShowEntradaModal(false)}>
            <div className="modal-content modern-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Registrar Entrada de Estoque</h2>
                <button className="btn-close" onClick={() => setShowEntradaModal(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleEntradaFormSubmit(handleEntradaSubmit)} className="modern-form">
                  <div className="form-field">
                    <label htmlFor="quantidade" className="form-label form-label-required">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      id="quantidade"
                      className={`form-input ${entradaErrors.quantidade ? 'form-input-error' : ''}`}
                      min="1"
                      placeholder="Ex: 100"
                      disabled={submitting}
                      {...registerEntrada('quantidade', { valueAsNumber: true })}
                    />
                    {entradaErrors.quantidade && (
                      <span className="form-error">{entradaErrors.quantidade.message}</span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="dataVencimento" className="form-label form-label-required">
                      Data de Vencimento
                    </label>
                    <input
                      type="date"
                      id="dataVencimento"
                      className={`form-input ${entradaErrors.dataVencimento ? 'form-input-error' : ''}`}
                      disabled={submitting}
                      {...registerEntrada('dataVencimento')}
                    />
                    {entradaErrors.dataVencimento && (
                      <span className="form-error">{entradaErrors.dataVencimento.message}</span>
                    )}
                    <small style={{ display: 'block', marginTop: '0.25rem', color: '#6b7280' }}>A data deve ser futura</small>
                  </div>

                  <div className="form-field">
                    <label htmlFor="observacao" className="form-label">
                      Número do Lote (opcional)
                    </label>
                    <input
                      type="text"
                      id="observacao"
                      className={`form-input ${entradaErrors.observacao ? 'form-input-error' : ''}`}
                      placeholder="Ex: LOTE-2025-001"
                      disabled={submitting}
                      {...registerEntrada('observacao')}
                    />
                    {entradaErrors.observacao && (
                      <span className="form-error">{entradaErrors.observacao.message}</span>
                    )}
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-form-secondary" onClick={() => setShowEntradaModal(false)} disabled={submitting}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-form-primary" disabled={submitting}>
                      {submitting ? 'Registrando...' : 'Registrar Entrada'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal para registrar saída de estoque */}
        {showSaidaModal && (
          <div className="modal-overlay" onClick={() => setShowSaidaModal(false)}>
            <div className="modal-content modern-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Registrar Saída de Estoque</h2>
                <button className="btn-close" onClick={() => setShowSaidaModal(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSaidaFormSubmit(handleSaidaSubmit)} className="modern-form">
                  <div className="alert-info" style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #bfdbfe' }}>
                    <strong>Estoque disponível:</strong> {totalEstoque} unidades
                    <br />
                    <small style={{ color: '#6b7280' }}>A saída será feita automaticamente usando FIFO (primeiro a vencer, primeiro a sair)</small>
                  </div>

                  <div className="form-field">
                    <label htmlFor="quantidadeSaida" className="form-label form-label-required">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      id="quantidadeSaida"
                      className={`form-input ${saidaErrors.quantidade ? 'form-input-error' : ''}`}
                      min="1"
                      max={totalEstoque}
                      placeholder="Ex: 10"
                      disabled={submitting}
                      {...registerSaida('quantidade', { valueAsNumber: true })}
                    />
                    {saidaErrors.quantidade && (
                      <span className="form-error">{saidaErrors.quantidade.message}</span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="observacaoSaida" className="form-label">
                      Observação (opcional)
                    </label>
                    <input
                      type="text"
                      id="observacaoSaida"
                      className={`form-input ${saidaErrors.observacao ? 'form-input-error' : ''}`}
                      placeholder="Ex: Venda manual, Perda, etc."
                      disabled={submitting}
                      {...registerSaida('observacao')}
                    />
                    {saidaErrors.observacao && (
                      <span className="form-error">{saidaErrors.observacao.message}</span>
                    )}
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-form-secondary" onClick={() => setShowSaidaModal(false)} disabled={submitting}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-form-primary" disabled={submitting}>
                      {submitting ? 'Registrando...' : 'Registrar Saída'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
