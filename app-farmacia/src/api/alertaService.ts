import api from '../config/axios';
import { AlertaEstoqueBaixo, AlertaValidadeProxima } from '../types';

export const alertaService = {
  getEstoqueBaixo: async (): Promise<AlertaEstoqueBaixo[]> => {
    const response = await api.get<AlertaEstoqueBaixo[]>('/alertas/estoque-baixo');
    return response.data;
  },

  getValidadeProxima: async (): Promise<AlertaValidadeProxima[]> => {
    const response = await api.get<AlertaValidadeProxima[]>('/alertas/validade-proxima');
    return response.data;
  },
};
