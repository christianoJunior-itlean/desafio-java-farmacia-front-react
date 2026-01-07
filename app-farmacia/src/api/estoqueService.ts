import api from '../config/axios';
import { Estoque, EntradaEstoqueRequest, SaidaEstoqueRequest, EstoqueResponse } from '../types';

export const estoqueService = {
  // Retorna quantidade total em estoque (objeto único)
  getByMedicamento: async (medicamentoId: number): Promise<Estoque> => {
    const response = await api.get<Estoque>(`/estoque/${medicamentoId}`);
    return response.data;
  },

  // Retorna os lotes separadamente (array)
  getLotesByMedicamento: async (medicamentoId: number): Promise<Estoque[]> => {
    const response = await api.get<Estoque[]>(`/estoque/medicamento/${medicamentoId}`);
    return response.data;
  },

  registrarEntrada: async (data: EntradaEstoqueRequest): Promise<EstoqueResponse> => {
    const response = await api.post<EstoqueResponse>('/estoque/entrada', data);
    return response.data;
  },

  registrarSaida: async (data: SaidaEstoqueRequest): Promise<EstoqueResponse> => {
    const response = await api.post<EstoqueResponse>('/estoque/saida', data);
    return response.data;
  },
};
