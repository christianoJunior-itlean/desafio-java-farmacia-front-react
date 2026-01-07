import api from '../config/axios';
import { Cliente, ClienteRequest, ClienteCreateResponse, MessageResponse } from '../types';

export const clienteService = {
  getAll: async (): Promise<Cliente[]> => {
    const response = await api.get<Cliente[]>('/clientes');
    return response.data;
  },

  getById: async (id: number): Promise<Cliente> => {
    const response = await api.get<Cliente>(`/clientes/${id}`);
    return response.data;
  },

  create: async (data: ClienteRequest): Promise<ClienteCreateResponse> => {
    const response = await api.post<ClienteCreateResponse>('/clientes', data);
    return response.data;
  },

  update: async (id: number, data: ClienteRequest): Promise<Cliente> => {
    const response = await api.put<Cliente>(`/clientes/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/clientes/${id}`);
    return response.data;
  },
};
