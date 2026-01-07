import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { categoriaService } from '../api/categoriaService';
import { Categoria, CategoriaRequest } from '../types';
import { toast } from 'react-toastify';
import { useTableSort } from '../hooks/useTableSort';
import './Categorias.css';

export const Categorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CategoriaRequest>({ nome: '' });
  const [submitting, setSubmitting] = useState(false);
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

  const { sortedData, requestSort, getSortIndicator, sortConfig } = useTableSort(categorias);

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      setLoading(true);
      const data = await categoriaService.getAll();
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (categoria?: Categoria) => {
    if (categoria) {
      setEditingId(categoria.id);
      setFormData({ nome: categoria.nome });
    } else {
      setEditingId(null);
      setFormData({ nome: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ nome: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast.error('O nome da categoria é obrigatório');
      return;
    }

    setSubmitting(true);

    try {
      if (editingId) {
        await categoriaService.update(editingId, formData);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await categoriaService.create(formData);
        toast.success('Categoria criada com sucesso!');
      }
      handleCloseModal();
      loadCategorias();
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error);
      const message = error.response?.data?.message || 'Erro ao salvar categoria';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, nome: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirmar Exclusão',
      message: `Deseja realmente deletar a categoria "${nome}"?`,
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          await categoriaService.delete(id);
          toast.success('Categoria deletada com sucesso!');
          loadCategorias();
        } catch (error: any) {
          console.error('Erro ao deletar categoria:', error);
          const message =
            error.response?.data?.message ||
            'Erro ao deletar categoria. Verifique se não há medicamentos vinculados.';
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
          <h1>Categorias</h1>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            + Nova Categoria
          </button>
        </div>

        <div className="card">
          {categorias.length === 0 ? (
            <p className="empty-message">Nenhuma categoria cadastrada.</p>
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
                    <th className="text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((categoria) => (
                    <tr key={categoria.id}>
                      <td>{categoria.id}</td>
                      <td>{categoria.nome}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleOpenModal(categoria)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(categoria.id, categoria.nome)}
                        >
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
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h2>
                <button className="btn-close" onClick={handleCloseModal}>
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nome">Nome *</label>
                  <input
                    type="text"
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Analgésicos"
                    disabled={submitting}
                    required
                  />
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
          confirmText="Deletar"
          cancelText="Cancelar"
          isDangerous={true}
        />
      </div>
    </Layout>
  );
};
