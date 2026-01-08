// Importa a instância do Axios já configurada (baseURL, interceptors, etc.)
import api from '../config/axios';
// Importa os tipos das respostas para garantir tipagem forte nas chamadas
import { AlertaEstoqueBaixo, AlertaValidadeProxima } from '../types';

// Serviço responsável por centralizar as chamadas de alertas ao backend
// Cada método retorna uma Promise com dados tipados para evitar erros em tempo de compilação
export const alertaService = {
  // Busca os medicamentos com estoque baixo
  // Retorna: Promise<Array<AlertaEstoqueBaixo>>
  // Observação: tipamos o GET com <AlertaEstoqueBaixo[]> para o Axios validar o formato
  getEstoqueBaixo: async (): Promise<AlertaEstoqueBaixo[]> => {
    // Chama o endpoint GET /alertas/estoque-baixo
    const response = await api.get<AlertaEstoqueBaixo[]>('/alertas/estoque-baixo');
    // O Axios retorna um objeto com várias infos; usamos apenas o corpo (data)
    return response.data;
  },

  // Busca lotes com validade próxima do vencimento
  // Retorna: Promise<Array<AlertaValidadeProxima>>
  getValidadeProxima: async (): Promise<AlertaValidadeProxima[]> => {
    // Chama o endpoint GET /alertas/validade-proxima
    const response = await api.get<AlertaValidadeProxima[]>('/alertas/validade-proxima');
    // Retorna somente os dados já tipados
    return response.data;
  },
};
