// Importa React e hooks
import React, { useEffect, useState } from 'react';
// Importa ícones para botões de ação
import { FaEdit, FaTrash } from 'react-icons/fa';
// Importa React Hook Form e resolver Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clienteSchema, type ClienteFormData } from '../schemas/formSchemas';

// Layout e componentes compartilhados
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { ConfirmDialog } from '../components/ConfirmDialog';

// Serviços e tipos
import { clienteService } from '../api/clienteService';
import { Cliente } from '../types';

// Toasts e helpers de formatação/validação
import { toast } from 'react-toastify';
import { calculateAge, isMaiorDeIdade } from '../utils/formatters';

// Hook de ordenação de tabela
import { useTableSort } from '../hooks/useTableSort';

// Estilos compartilhados e específicos
import '../styles/forms.css';
import '../pages/Categorias.css';
import './Clientes.css';

// Página de gerenciamento de clientes
export const Clientes: React.FC = () => {
  // Lista de clientes exibidos
  const [clientes, setClientes] = useState<Cliente[]>([]);
  // Estado global de carregamento
  const [loading, setLoading] = useState(true);
  // Controle do modal (criação/edição)
  const [showModal, setShowModal] = useState(false);
  // ID do cliente em edição
  const [editingId, setEditingId] = useState<number | null>(null);
  // Controle de envio de formulário
  const [submitting, setSubmitting] = useState(false);
  // Campo de busca na tabela
  const [searchTerm, setSearchTerm] = useState('');
  // Estado do diálogo de confirmação
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

  // React Hook Form setup
  const { register, handleSubmit: handleFormSubmit, formState: { errors }, reset, watch } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    mode: 'onSubmit',
    defaultValues: {
      nomeCompleto: '',
      cpf: '',
      email: '',
      dataNascimento: '',
      nomeResponsavel: '',
    },
  });

  // Monitora data de nascimento para validar maioridade
  const dataNascimento = watch('dataNascimento');
  const menorDeIdade = dataNascimento ? !isMaiorDeIdade(dataNascimento) : false;

  // Carrega clientes ao montar
  useEffect(() => {
    loadClientes();
  }, []);

  // Busca lista de clientes no backend
  const loadClientes = async () => {
    try {
      setLoading(true);
      const data = await clienteService.getAll();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  // Abre modal para criar/editar um cliente
  const handleOpenModal = (cliente?: Cliente) => {
    if (cliente) {
      setEditingId(cliente.id);
      reset({
        nomeCompleto: cliente.nomeCompleto,
        cpf: cliente.cpf,
        email: cliente.email,
        dataNascimento: cliente.dataNascimento,
        nomeResponsavel: cliente.nomeResponsavel || '',
      });
    } else {
      setEditingId(null);
      reset({
        nomeCompleto: '',
        cpf: '',
        email: '',
        dataNascimento: '',
        nomeResponsavel: '',
      });
    }
    setShowModal(true);
  };

  // Fecha modal e reseta os dados
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    reset({
      nomeCompleto: '',
      cpf: '',
      email: '',
      dataNascimento: '',
      nomeResponsavel: '',
    });
  };

  // Cria ou atualiza o cliente
  const handleSubmit = async (data: ClienteFormData) => {
    setSubmitting(true);

    try {
      // Prepara dados para o backend (converte string vazia em null para nomeResponsavel)
      const requestData = {
        ...data,
        nomeResponsavel: data.nomeResponsavel?.trim() || null,
      };

      if (editingId) {
        await clienteService.update(editingId, requestData);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        const response = await clienteService.create(requestData);
        toast.success(response.message || 'Cliente criado com sucesso!');
        if (menorDeIdade) {
          toast.info('Cliente menor de idade não pode realizar compras. Este cadastro foi criado com um responsável para consulta.');
        }
      }
      handleCloseModal();
      loadClientes();
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      const message = error.response?.data?.message || 'Erro ao salvar cliente';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Abre confirmação e deleta o cliente caso confirmado
  const handleDelete = async (id: number, nome: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirmar Exclusão',
      message: `Deseja realmente deletar o cliente "${nome}"?`,
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          await clienteService.delete(id);
          toast.success('Cliente deletado com sucesso!');
          loadClientes();
        } catch (error: any) {
          console.error('Erro ao deletar cliente:', error);
          const message = error.response?.data?.message || 'Erro ao deletar cliente';
          toast.error(message);
        }
      },
    });
  };

  // Filtra clientes por nome, CPF ou email conforme a busca
  const filteredClientes = clientes.filter(
    (c) =>
      c.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cpf.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepara ordenação com base na lista filtrada
  const { sortedData, requestSort, getSortIndicator, sortConfig } = useTableSort(filteredClientes);

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
      {/* Container principal */}
      <div className="page-container">
        {/* Cabeçalho com botão de novo cliente */}
        <div className="page-header">
          <h1>Clientes</h1>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            + Novo Cliente
          </button>
        </div>

        {/* Card com campo de busca */}
        <div className="card filters-card">
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Tabela de clientes */}
        <div className="card">
          {filteredClientes.length === 0 ? (
            <p className="empty-message">Nenhum cliente encontrado.</p>
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
                      className={`sortable${sortConfig.key === 'nomeCompleto' ? ' sorted' : ''}`}
                      onClick={() => requestSort('nomeCompleto')}
                    >
                      Nome Completo{getSortIndicator('nomeCompleto')}
                    </th>
                    <th 
                      className={`sortable${sortConfig.key === 'cpf' ? ' sorted' : ''}`}
                      onClick={() => requestSort('cpf')}
                    >
                      CPF{getSortIndicator('cpf')}
                    </th>
                    <th 
                      className={`sortable${sortConfig.key === 'email' ? ' sorted' : ''}`}
                      onClick={() => requestSort('email')}
                    >
                      Email{getSortIndicator('email')}
                    </th>
                    <th 
                      className={`sortable${sortConfig.key === 'dataNascimento' ? ' sorted' : ''}`}
                      onClick={() => requestSort('dataNascimento')}
                    >
                      Idade{getSortIndicator('dataNascimento')}
                    </th>
                    <th 
                      className={`sortable${sortConfig.key === 'nomeResponsavel' ? ' sorted' : ''}`}
                      onClick={() => requestSort('nomeResponsavel')}
                    >
                      Responsável{getSortIndicator('nomeResponsavel')}
                    </th>
                    <th className="text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((cliente) => {
                    const idade = calculateAge(cliente.dataNascimento);
                    const menor = idade < 18;
                    return (
                      <tr key={cliente.id}>
                        <td>{cliente.id}</td>
                        <td>
                          {cliente.nomeCompleto}
                          {menor && <span className="badge badge-warning ml-2">Menor</span>}
                        </td>
                        <td>{cliente.cpf}</td>
                        <td>{cliente.email}</td>
                        <td>{idade} anos</td>
                        <td>{cliente.nomeResponsavel || '-'}</td>
                        <td className="text-center">
                          <button 
                            className="btn-icon btn-icon-edit" 
                            onClick={() => handleOpenModal(cliente)}
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="btn-icon btn-icon-delete" 
                            onClick={() => handleDelete(cliente.id, cliente.nomeCompleto)}
                            title="Deletar"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de criação/edição de cliente */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content modern-modal modern-modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                <button className="btn-close" onClick={handleCloseModal}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleFormSubmit(handleSubmit)} className="modern-form">
                  <div className="form-field form-grid-full">
                    <label htmlFor="nomeCompleto" className="form-label form-label-required">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      id="nomeCompleto"
                      className={`form-input ${errors.nomeCompleto ? 'form-input-error' : ''}`}
                      placeholder="Ex: João da Silva"
                      disabled={submitting}
                      {...register('nomeCompleto')}
                    />
                    {errors.nomeCompleto && (
                      <span className="form-error">{errors.nomeCompleto.message}</span>
                    )}
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label htmlFor="cpf" className="form-label form-label-required">
                        CPF
                      </label>
                      <input
                        type="text"
                        id="cpf"
                        className={`form-input ${errors.cpf ? 'form-input-error' : ''}`}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        disabled={submitting}
                        {...register('cpf')}
                      />
                      {errors.cpf && (
                        <span className="form-error">{errors.cpf.message}</span>
                      )}
                    </div>

                    <div className="form-field">
                      <label htmlFor="dataNascimento" className="form-label form-label-required">
                        Data de Nascimento
                      </label>
                      <input
                        type="date"
                        id="dataNascimento"
                        className={`form-input ${errors.dataNascimento ? 'form-input-error' : ''}`}
                        disabled={submitting}
                        {...register('dataNascimento')}
                      />
                      {errors.dataNascimento && (
                        <span className="form-error">{errors.dataNascimento.message}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-field form-grid-full">
                    <label htmlFor="email" className="form-label form-label-required">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                      placeholder="exemplo@email.com"
                      disabled={submitting}
                      {...register('email')}
                    />
                    {errors.email && (
                      <span className="form-error">{errors.email.message}</span>
                    )}
                  </div>

                  <div className="form-field form-grid-full">
                    <label htmlFor="nomeResponsavel" className={`form-label ${menorDeIdade ? 'form-label-required' : ''}`}>
                      Nome do Responsável Legal
                    </label>
                    <input
                      type="text"
                      id="nomeResponsavel"
                      className={`form-input ${errors.nomeResponsavel ? 'form-input-error' : ''}`}
                      placeholder="Ex: Maria da Silva"
                      disabled={submitting}
                      {...register('nomeResponsavel')}
                    />
                    {errors.nomeResponsavel && (
                      <span className="form-error">{errors.nomeResponsavel.message}</span>
                    )}
                    {menorDeIdade && (
                      <small className="text-warning" style={{ display: 'block', marginTop: '0.5rem', color: '#f59e0b' }}>
                        ⚠️ Este cliente é menor de 18 anos e NÃO poderá realizar compras. O responsável é obrigatório.
                      </small>
                    )}
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-form-secondary" onClick={handleCloseModal} disabled={submitting}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-form-primary" disabled={submitting}>
                      {submitting ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Diálogo de confirmação de deleção */}
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
