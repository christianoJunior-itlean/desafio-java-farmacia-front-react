import api from '../config/axios';
import { Categoria, CategoriaRequest, MessageResponse } from '../types';

export const categoriaService = {
  getAll: async (): Promise<Categoria[]> => {
    const response = await api.get<Categoria[]>('/categorias');
    return response.data;
  },

  getById: async (id: number): Promise<Categoria> => {
    const response = await api.get<Categoria>(`/categorias/${id}`);
    return response.data;
  },

  create: async (data: CategoriaRequest): Promise<Categoria> => {
    const response = await api.post<Categoria>('/categorias', data);
    return response.data;
  },

  update: async (id: number, data: CategoriaRequest): Promise<Categoria> => {
    const response = await api.put<Categoria>(`/categorias/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/categorias/${id}`);
    return response.data;
  },
};
