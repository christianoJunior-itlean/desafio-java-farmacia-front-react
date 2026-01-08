// Importa React e hooks
import React, { useEffect, useState } from 'react';
// Importa ícones para botões de ação
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
// Importa React Hook Form e resolver Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { medicamentoSchema, type MedicamentoFormData } from '../schemas/formSchemas';

// Layout e componentes de UI
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { ConfirmDialog } from '../components/ConfirmDialog';

// Serviços de medicamentos e categorias
import { medicamentoService } from '../api/medicamentoService';
import { categoriaService } from '../api/categoriaService';

// Tipos de dados e requisições
import { Medicamento, Categoria } from '../types';

// Toasts e utilitários
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/formatters';

// Hook para ordenação
import { useTableSort } from '../hooks/useTableSort';

// Estilos compartilhados e específicos
import '../styles/shared.css';
import '../styles/forms.css';
import '../pages/Categorias.css';
import './Medicamentos.css';

// Página de gestão de medicamentos
export const Medicamentos: React.FC = () => {
  // Estados principais
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filteredMedicamentos, setFilteredMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<number | ''>('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  
  // React Hook Form setup
  const { register, handleSubmit: handleFormSubmit, formState: { errors }, reset } = useForm<MedicamentoFormData>({
    resolver: zodResolver(medicamentoSchema),
    mode: 'onSubmit',
    defaultValues: {
      nome: '',
      dosagem: '',
      categoriaId: 0,
      preco: 0,
      estoqueMinimo: 0,
      ativo: true,
    },
  });
  
  // Diálogo de confirmação para alterar status/deletar
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Carrega dados iniciais (medicamentos + categorias)
  useEffect(() => {
    loadData();
  }, []);

  // Recalcula a lista filtrada sempre que filtros ou a lista mudar
  useEffect(() => {
    filterMedicamentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicamentos, searchTerm, filterCategoria, filterStatus]);

  // Prepara ordenação para a tabela a partir da lista filtrada
  const { sortedData, requestSort, getSortIndicator, sortConfig } = useTableSort(filteredMedicamentos);

  // Busca medicamentos e categorias em paralelo
  const loadData = async () => {
    try {
      setLoading(true);
      const [medicamentosData, categoriasData] = await Promise.all([
        medicamentoService.getAll(),
        categoriaService.getAll(),
      ]);
      setMedicamentos(medicamentosData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Aplica os filtros de busca, categoria e status
  const filterMedicamentos = () => {
    let filtered = [...medicamentos];

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.dosagem.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoria
    if (filterCategoria) {
      filtered = filtered.filter((m) => m.categoria?.id === filterCategoria);
    }

    // Filtro por status
    if (filterStatus === 'ativos') {
      filtered = filtered.filter((m) => m.ativo);
    } else if (filterStatus === 'inativos') {
      filtered = filtered.filter((m) => !m.ativo);
    }

    setFilteredMedicamentos(filtered);
  };

  // Abre modal para criar/editar medicamento
  const handleOpenModal = (medicamento?: Medicamento) => {
    if (medicamento) {
      setEditingId(medicamento.id);
      reset({
        nome: medicamento.nome,
        dosagem: medicamento.dosagem,
        preco: medicamento.preco,
        estoqueMinimo: medicamento.estoqueMinimo || 0,
        categoriaId: medicamento.categoria?.id || 0,
        ativo: medicamento.ativo,
      });
    } else {
      setEditingId(null);
      reset({
        nome: '',
        dosagem: '',
        preco: 0,
        estoqueMinimo: 0,
        categoriaId: 0,
        ativo: true,
      });
    }
    setShowModal(true);
  };

  // Fecha modal e reseta formulário
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    reset();
  };

  // Cria ou atualiza medicamento com validações
  const handleSubmit = async (data: MedicamentoFormData) => {
    setSubmitting(true);

    try {
      const payload: any = {
        ...data,
        categoriaId: data.categoriaId || undefined,
      };
      
      if (editingId) {
        await medicamentoService.update(editingId, payload);
        toast.success('Medicamento atualizado com sucesso!');
      } else {
        await medicamentoService.create(payload);
        toast.success('Medicamento criado com sucesso!');
      }
      handleCloseModal();
      loadData();
    } catch (error: any) {
      console.error('Erro ao salvar medicamento:', error);
      const message = error.response?.data?.message || 'Erro ao salvar medicamento';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Abre diálogo para confirmação de alteração de status (ativo/inativo)
  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const action = currentStatus ? 'inativar' : 'ativar';
    setConfirmDialog({
      isOpen: true,
      title: 'Confirmar Altera\u00e7\u00e3o de Status',
      message: `Deseja realmente ${action} este medicamento?`,
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          await medicamentoService.updateStatus(id, { ativo: !currentStatus });
          toast.success(`Medicamento ${action}do com sucesso!`);
          loadData();
        } catch (error: any) {
          console.error('Erro ao alterar status:', error);
          const message = error.response?.data?.message || 'Erro ao alterar status';
          toast.error(message);
        }
      },
    });
  };

  // Abre diálogo e remove medicamento após confirmação
  const handleDelete = async (id: number, nome: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirmar Exclusão',
      message: `Deseja realmente deletar o medicamento "${nome}"?`,
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          const response = await medicamentoService.delete(id);
          toast.success(response.message);
          loadData();
        } catch (error: any) {
          console.error('Erro ao deletar medicamento:', error);
          const message = error.response?.data?.message || 'Erro ao deletar medicamento';
          toast.error(message);
        }
      },
    });
  };

  // Mostra loading enquanto carrega dados
  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Container da página de medicamentos */}
      <div className="page-container">
        {/* Cabeçalho com ação de novo cadastro */}
        <div className="page-header">
          <h1>Medicamentos</h1>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            + Novo Medicamento
          </button>
        </div>

        {/* Filtros: busca, categoria e status */}
        <div className="card filters-card">
          <div className="filters">
            <div className="filter-group">
              <input
                type="text"
                placeholder="Buscar por nome ou dosagem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <select className="form-control" value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Todas as categorias</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select className="form-control" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
                <option value="todos">Todos</option>
                <option value="ativos">Ativos</option>
                <option value="inativos">Inativos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela de medicamentos ou mensagem quando vazia */}
        <div className="card">
          {filteredMedicamentos.length === 0 ? (
            <p className="empty-message">Nenhum medicamento encontrado.</p>
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
                      className={`sortable${sortConfig.key === 'nome' ? ' sorted' : ''}`}
                      onClick={() => requestSort('nome')}
                    >
                      Nome{getSortIndicator('nome')}
                    </th>
                    <th 
                      className={`sortable${sortConfig.key === 'dosagem' ? ' sorted' : ''}`}
                      onClick={() => requestSort('dosagem')}
                    >
                      Dosagem{getSortIndicator('dosagem')}
                    </th>
                    <th 
                      className={`sortable${sortConfig.key === 'categoria.nome' ? ' sorted' : ''}`}
                      onClick={() => requestSort('categoria.nome')}
                    >
                      Categoria{getSortIndicator('categoria.nome')}
                    </th>
                    <th 
                      className={`sortable${sortConfig.key === 'preco' ? ' sorted' : ''}`}
                      onClick={() => requestSort('preco')}
                    >
                      Preço{getSortIndicator('preco')}
                    </th>
                    <th 
                      className={`sortable${sortConfig.key === 'ativo' ? ' sorted' : ''}`}
                      onClick={() => requestSort('ativo')}
                    >
                      Status{getSortIndicator('ativo')}
                    </th>
                    <th className="text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((medicamento) => (
                    <tr key={medicamento.id}>
                      <td>{medicamento.id}</td>
                      <td>{medicamento.nome}</td>
                      <td>{medicamento.dosagem}</td>
                      <td>{medicamento.categoria?.nome || '-'}</td>
                      <td>{formatCurrency(medicamento.preco)}</td>
                      <td>
                        <span className={`badge ${medicamento.ativo ? 'badge-success' : 'badge-danger'}`}>
                          {medicamento.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="text-center">
                        <button 
                          className="btn-icon btn-icon-edit" 
                          onClick={() => handleOpenModal(medicamento)}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className={`btn-icon ${medicamento.ativo ? 'btn-icon-toggle-off' : 'btn-icon-toggle-on'}`}
                          onClick={() => handleToggleStatus(medicamento.id, medicamento.ativo)}
                          title={medicamento.ativo ? 'Inativar' : 'Ativar'}
                        >
                          {medicamento.ativo ? <FaToggleOff /> : <FaToggleOn />}
                        </button>
                        <button 
                          className="btn-icon btn-icon-delete" 
                          onClick={() => handleDelete(medicamento.id, medicamento.nome)}
                          title="Deletar"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de criação/edição de medicamento */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content modern-modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? 'Editar Medicamento' : 'Novo Medicamento'}</h2>
                <button className="btn-close" onClick={handleCloseModal}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleFormSubmit(handleSubmit)} className="modern-form">
                  <div className="form-grid">
                    <div className="form-field">
                      <label htmlFor="nome" className="form-label form-label-required">
                        Nome do Medicamento
                      </label>
                      <input
                        type="text"
                        id="nome"
                        className={`form-input ${errors.nome ? 'form-input-error' : ''}`}
                        placeholder="Ex: Paracetamol, Dipirona..."
                        disabled={submitting}
                        {...register('nome')}
                      />
                      {errors.nome && (
                        <span className="form-error">{errors.nome.message}</span>
                      )}
                    </div>

                    <div className="form-field">
                      <label htmlFor="dosagem" className="form-label form-label-required">
                        Dosagem
                      </label>
                      <input
                        type="text"
                        id="dosagem"
                        className={`form-input ${errors.dosagem ? 'form-input-error' : ''}`}
                        placeholder="Ex: 500mg, 10ml..."
                        disabled={submitting}
                        {...register('dosagem')}
                      />
                      {errors.dosagem && (
                        <span className="form-error">{errors.dosagem.message}</span>
                      )}
                    </div>

                    <div className="form-field">
                      <label htmlFor="preco" className="form-label form-label-required">
                        Preço (R$)
                      </label>
                      <input
                        type="number"
                        id="preco"
                        className={`form-input ${errors.preco ? 'form-input-error' : ''}`}
                        placeholder="0.00"
                        step="0.01"
                        min="0.01"
                        disabled={submitting}
                        {...register('preco', { valueAsNumber: true })}
                      />
                      {errors.preco && (
                        <span className="form-error">{errors.preco.message}</span>
                      )}
                    </div>

                    <div className="form-field">
                      <label htmlFor="estoqueMinimo" className="form-label form-label-required">
                        Estoque Mínimo
                      </label>
                      <input
                        type="number"
                        id="estoqueMinimo"
                        className={`form-input ${errors.estoqueMinimo ? 'form-input-error' : ''}`}
                        placeholder="0"
                        min="0"
                        disabled={submitting}
                        {...register('estoqueMinimo', { valueAsNumber: true })}
                      />
                      {errors.estoqueMinimo && (
                        <span className="form-error">{errors.estoqueMinimo.message}</span>
                      )}
                    </div>

                    <div className="form-field form-grid-full">
                      <label htmlFor="categoriaId" className="form-label form-label-required">
                        Categoria
                      </label>
                      <select
                        id="categoriaId"
                        className={`form-select ${errors.categoriaId ? 'form-select-error' : ''}`}
                        disabled={submitting}
                        {...register('categoriaId', { valueAsNumber: true })}
                      >
                        <option value="">Selecione uma categoria</option>
                        {categorias.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nome}
                          </option>
                        ))}
                      </select>
                      {errors.categoriaId && (
                        <span className="form-error">{errors.categoriaId.message}</span>
                      )}
                    </div>

                    <div className="form-field form-grid-full">
                      <div className="form-checkbox-wrapper">
                        <input
                          type="checkbox"
                          id="ativo"
                          className="form-checkbox"
                          disabled={submitting}
                          {...register('ativo')}
                        />
                        <label htmlFor="ativo" className="form-checkbox-label">
                          Medicamento Ativo
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-form-secondary"
                      onClick={handleCloseModal}
                      disabled={submitting}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`btn-form-primary ${submitting ? 'btn-loading' : ''}`}
                      disabled={submitting}
                    >
                      {submitting ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Confirmação para alterar status/deletar */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          confirmText={confirmDialog.title.includes('Status') ? 'Alterar' : 'Deletar'}
          cancelText="Cancelar"
          isDangerous={confirmDialog.title.includes('Exclusão')}
        />
      </div>
    </Layout>
  );
};
