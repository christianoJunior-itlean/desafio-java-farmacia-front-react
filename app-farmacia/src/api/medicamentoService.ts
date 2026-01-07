import api from '../config/axios';
import { Medicamento, MedicamentoRequest, AlterarStatusRequest, MessageResponse } from '../types';

export const medicamentoService = {
  getAll: async (): Promise<Medicamento[]> => {
    const response = await api.get<Medicamento[]>('/medicamentos');
    return response.data;
  },

  getById: async (id: number): Promise<Medicamento> => {
    const response = await api.get<Medicamento>(`/medicamentos/${id}`);
    return response.data;
  },

  getByCategoria: async (categoriaId: number): Promise<Medicamento[]> => {
    const response = await api.get<Medicamento[]>(`/medicamentos/categoria/${categoriaId}`);
    return response.data;
  },

  create: async (data: MedicamentoRequest): Promise<Medicamento> => {
    const response = await api.post<Medicamento>('/medicamentos', data);
    return response.data;
  },

  update: async (id: number, data: MedicamentoRequest): Promise<Medicamento> => {
    const response = await api.put<Medicamento>(`/medicamentos/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: number, data: AlterarStatusRequest): Promise<Medicamento> => {
    const response = await api.patch<Medicamento>(`/medicamentos/${id}/status`, data);
    return response.data;
  },

  delete: async (id: number): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/medicamentos/${id}`);
    return response.data;
  },
};
