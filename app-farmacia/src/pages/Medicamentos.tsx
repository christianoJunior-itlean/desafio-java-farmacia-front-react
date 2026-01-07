import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { medicamentoService } from '../api/medicamentoService';
import { categoriaService } from '../api/categoriaService';
import { Medicamento, MedicamentoRequest, Categoria } from '../types';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/formatters';
import { useTableSort } from '../hooks/useTableSort';
import '../pages/Categorias.css';
import './Medicamentos.css';

export const Medicamentos: React.FC = () => {
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

  const [formData, setFormData] = useState<MedicamentoRequest>({
    nome: '',
    descricao: '',
    dosagem: '',
    preco: 0,
    ativo: true,
    categoriaId: undefined,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterMedicamentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicamentos, searchTerm, filterCategoria, filterStatus]);

  const { sortedData, requestSort, getSortIndicator, sortConfig } = useTableSort(filteredMedicamentos);

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

  const handleOpenModal = (medicamento?: Medicamento) => {
    if (medicamento) {
      setEditingId(medicamento.id);
      setFormData({
        nome: medicamento.nome,
        descricao: medicamento.descricao,
        dosagem: medicamento.dosagem,
        preco: medicamento.preco,
        ativo: medicamento.ativo,
        categoriaId: medicamento.categoria?.id,
      });
    } else {
      setEditingId(null);
      setFormData({
        nome: '',
        descricao: '',
        dosagem: '',
        preco: 0,
        ativo: true,
        categoriaId: undefined,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      nome: '',
      descricao: '',
      dosagem: '',
      preco: 0,
      ativo: true,
      categoriaId: undefined,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.nome.trim()) {
      toast.error('O nome do medicamento é obrigatório');
      return;
    }

    if (!formData.dosagem.trim()) {
      toast.error('A dosagem é obrigatória');
      return;
    }

    if (formData.preco <= 0) {
      toast.error('O preço deve ser maior que zero');
      return;
    }

    setSubmitting(true);

    try {
      if (editingId) {
        await medicamentoService.update(editingId, formData);
        toast.success('Medicamento atualizado com sucesso!');
      } else {
        await medicamentoService.create(formData);
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
          <h1>Medicamentos</h1>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            + Novo Medicamento
          </button>
        </div>

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

        <div className="card">
          {filteredMedicamentos.length === 0 ? (
            <p className="empty-message">Nenhum medicamento encontrado.</p>
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
                        <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(medicamento)}>
                          Editar
                        </button>
                        <button
                          className={`btn btn-sm ${medicamento.ativo ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => handleToggleStatus(medicamento.id, medicamento.ativo)}
                        >
                          {medicamento.ativo ? 'Inativar' : 'Ativar'}
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(medicamento.id, medicamento.nome)}>
                          Deletar
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
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? 'Editar Medicamento' : 'Novo Medicamento'}</h2>
                <button className="btn-close" onClick={handleCloseModal}>
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nome">Nome *</label>
                    <input
                      type="text"
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Paracetamol"
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dosagem">Dosagem *</label>
                    <input
                      type="text"
                      id="dosagem"
                      value={formData.dosagem}
                      onChange={(e) => setFormData({ ...formData, dosagem: e.target.value })}
                      placeholder="Ex: 500mg"
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="descricao">Descrição</label>
                  <textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Ex: Analgésico e antitérmico"
                    disabled={submitting}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="preco">Preço (R$) *</label>
                    <input
                      type="number"
                      id="preco"
                      value={formData.preco}
                      onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      step="0.01"
                      min="0.01"
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="categoriaId">Categoria</label>
                    <select
                      id="categoriaId"
                      className="form-control"
                      value={formData.categoriaId || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          categoriaId: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      disabled={submitting}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                      disabled={submitting}
                    />
                    <span>Ativo</span>
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={submitting}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
