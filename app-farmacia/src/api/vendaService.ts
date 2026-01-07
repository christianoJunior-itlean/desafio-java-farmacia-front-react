import api from '../config/axios';
import { Venda, VendaRequest } from '../types';

export const vendaService = {
  getAll: async (): Promise<Venda[]> => {
    const response = await api.get<Venda[]>('/vendas');
    return response.data;
  },

  getById: async (id: number): Promise<Venda> => {
    const response = await api.get<Venda>(`/vendas/${id}`);
    return response.data;
  },

  getByCliente: async (clienteId: number): Promise<Venda[]> => {
    const response = await api.get<Venda[]>(`/vendas/cliente/${clienteId}`);
    return response.data;
  },

  create: async (data: VendaRequest): Promise<Venda> => {
    const response = await api.post<Venda>('/vendas', data);
    return response.data;
  },
};
