import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { clienteService } from '../api/clienteService';
import { Cliente, ClienteRequest } from '../types';
import { toast } from 'react-toastify';
import { maskCPF, isValidCPF, calculateAge, isMaiorDeIdade, isValidEmail } from '../utils/formatters';
import { useTableSort } from '../hooks/useTableSort';
import '../pages/Categorias.css';
import './Clientes.css';

export const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const [formData, setFormData] = useState<ClienteRequest>({
    nomeCompleto: '',
    cpf: '',
    email: '',
    dataNascimento: '',
    nomeResponsavel: null,
  });

  useEffect(() => {
    loadClientes();
  }, []);

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

  const handleOpenModal = (cliente?: Cliente) => {
    if (cliente) {
      setEditingId(cliente.id);
      setFormData({
        nomeCompleto: cliente.nomeCompleto,
        cpf: cliente.cpf,
        email: cliente.email,
        dataNascimento: cliente.dataNascimento,
        nomeResponsavel: cliente.nomeResponsavel || null,
      });
    } else {
      setEditingId(null);
      setFormData({
        nomeCompleto: '',
        cpf: '',
        email: '',
        dataNascimento: '',
        nomeResponsavel: null,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      nomeCompleto: '',
      cpf: '',
      email: '',
      dataNascimento: '',
      nomeResponsavel: null,
    });
  };

  const handleCPFChange = (value: string) => {
    const masked = maskCPF(value);
    setFormData({ ...formData, cpf: masked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.nomeCompleto.trim()) {
      toast.error('O nome completo é obrigatório');
      return;
    }

    if (!formData.cpf) {
      toast.error('O CPF é obrigatório');
      return;
    }

    if (!isValidCPF(formData.cpf)) {
      toast.error('CPF inválido');
      return;
    }

    if (!formData.email) {
      toast.error('O email é obrigatório');
      return;
    }

    if (!isValidEmail(formData.email)) {
      toast.error('Email inválido');
      return;
    }

    if (!formData.dataNascimento) {
      toast.error('A data de nascimento é obrigatória');
      return;
    }

    const menorDeIdade = !isMaiorDeIdade(formData.dataNascimento);

    if (menorDeIdade && !formData.nomeResponsavel?.trim()) {
      toast.error('Cliente menor de 18 anos deve ter um responsável legal cadastrado');
      return;
    }

    setSubmitting(true);

    try {
      if (editingId) {
        await clienteService.update(editingId, formData);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        const response = await clienteService.create(formData);
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

  const filteredClientes = clientes.filter(
    (c) =>
      c.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cpf.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { sortedData, requestSort, getSortIndicator, sortConfig } = useTableSort(filteredClientes);

  const menorDeIdade = formData.dataNascimento ? !isMaiorDeIdade(formData.dataNascimento) : false;

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
          <h1>Clientes</h1>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            + Novo Cliente
          </button>
        </div>

        <div className="card filters-card">
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="card">
          {filteredClientes.length === 0 ? (
            <p className="empty-message">Nenhum cliente encontrado.</p>
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
                          <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(cliente)}>
                            Editar
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cliente.id, cliente.nomeCompleto)}>
                            Deletar
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

        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                <button className="btn-close" onClick={handleCloseModal}>
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nomeCompleto">Nome Completo *</label>
                  <input
                    type="text"
                    id="nomeCompleto"
                    value={formData.nomeCompleto}
                    onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                    placeholder="Ex: João da Silva"
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cpf">CPF *</label>
                    <input
                      type="text"
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => handleCPFChange(e.target.value)}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dataNascimento">Data de Nascimento *</label>
                    <input
                      type="date"
                      id="dataNascimento"
                      value={formData.dataNascimento}
                      onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="exemplo@email.com"
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nomeResponsavel">
                    Nome do Responsável Legal {menorDeIdade && <span className="text-danger">*</span>}
                  </label>
                  <input
                    type="text"
                    id="nomeResponsavel"
                    value={formData.nomeResponsavel || ''}
                    onChange={(e) => setFormData({ ...formData, nomeResponsavel: e.target.value || null })}
                    placeholder="Ex: Maria da Silva"
                    disabled={submitting}
                    required={menorDeIdade}
                  />
                  {menorDeIdade && (
                    <small className="text-warning">
                      ⚠️ Este cliente é menor de 18 anos e NÃO poderá realizar compras. O responsável é obrigatório.
                    </small>
                  )}
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
