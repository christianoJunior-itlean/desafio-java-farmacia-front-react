// Importa React e hooks para estado/efeitos
import React, { useEffect, useState } from 'react';
// Importa ícones para botões de ação
import { FaEdit, FaTrash } from 'react-icons/fa';
// Importa React Hook Form e resolver Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categoriaSchema, type CategoriaFormData } from '../schemas/formSchemas';

// Importa componentes compartilhados de layout e UI
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { ConfirmDialog } from '../components/ConfirmDialog';

// Serviço para comunicação com o backend referente a categorias
import { categoriaService } from '../api/categoriaService';

// Tipos TypeScript para tipar dados e requisições
import { Categoria } from '../types';

// Biblioteca de toasts para feedback ao usuário
import { toast } from 'react-toastify';

// Hook para ordenação de tabelas
import { useTableSort } from '../hooks/useTableSort';

// Estilos específicos desta página
import '../styles/shared.css';
import '../styles/forms.css';
import './Categorias.css';

// Página de gerenciamento de categorias
export const Categorias: React.FC = () => {
  // Lista de categorias exibidas na tabela
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  // Controle de carregamento global da página
  const [loading, setLoading] = useState(true);
  // Controle de exibição do modal de criação/edição
  const [showModal, setShowModal] = useState(false);
  // ID da categoria em edição (null se for criação)
  const [editingId, setEditingId] = useState<number | null>(null);
  // Controle de envio para desabilitar inputs/botões enquanto salva
  const [submitting, setSubmitting] = useState(false);
  
  // React Hook Form setup
  const { register, handleSubmit: handleFormSubmit, formState: { errors }, reset, setValue } = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nome: '',
    },
  });
  
  // Estado do diálogo de confirmação para deleção
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

  // Prepara ordenação da tabela de categorias
  const { sortedData, requestSort, getSortIndicator, sortConfig } = useTableSort(categorias);

  // Carrega a lista de categorias quando a página monta
  useEffect(() => {
    loadCategorias();
  }, []);

  // Busca todas as categorias no backend
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

  // Abre o modal para criar/editar categoria
  const handleOpenModal = (categoria?: Categoria) => {
    if (categoria) {
      setEditingId(categoria.id);
      setValue('nome', categoria.nome);
    } else {
      setEditingId(null);
      reset({ nome: '' });
    }
    setShowModal(true);
  };

  // Fecha o modal e reseta o formulário
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    reset({ nome: '' });
  };

  // Salva a categoria (cria ou atualiza)
  const handleSubmit = async (data: CategoriaFormData) => {
    setSubmitting(true);

    try {
      if (editingId) {
        await categoriaService.update(editingId, data);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await categoriaService.create(data);
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

  // Abre diálogo de confirmação e, se confirmado, deleta a categoria
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

  // Exibe spinner enquanto carrega
  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Container principal da página */}
      <div className="page-container">
        {/* Cabeçalho com título e botão para criar nova categoria */}
        <div className="page-header">
          <h1>Categorias</h1>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            + Nova Categoria
          </button>
        </div>

        {/* Card contendo a tabela de categorias ou uma mensagem de vazio */}
        <div className="card">
          {categorias.length === 0 ? (
            <p className="empty-message">Nenhuma categoria cadastrada.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    {/* Cabeçalho ordenável por ID */}
                    <th 
                      className={`sortable${sortConfig.key === 'id' ? ' sorted' : ''}`}
                      onClick={() => requestSort('id')}
                    >
                      ID{getSortIndicator('id')}
                    </th>
                    {/* Cabeçalho ordenável por Nome */}
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
                        {/* Botão ícone para abrir modal no modo edição */}
                        <button
                          className="btn-icon btn-icon-edit"
                          onClick={() => handleOpenModal(categoria)}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        {/* Botão ícone para deletar após confirmação */}
                        <button
                          className="btn-icon btn-icon-delete"
                          onClick={() => handleDelete(categoria.id, categoria.nome)}
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

        {/* Modal de criação/edição de categoria */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content modern-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h2>
                <button className="btn-close" onClick={handleCloseModal}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleFormSubmit(handleSubmit)} className="modern-form">
                  <div className="form-field">
                    <label htmlFor="nome" className="form-label form-label-required">
                      Nome da Categoria
                    </label>
                    <input
                      type="text"
                      id="nome"
                      className={`form-input ${errors.nome ? 'form-input-error' : ''}`}
                      placeholder="Ex: Analgésicos, Antibióticos..."
                      disabled={submitting}
                      {...register('nome')}
                    />
                    {errors.nome && (
                      <span className="form-error">{errors.nome.message}</span>
                    )}
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

        {/* Diálogo de confirmação para deleção */}
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
