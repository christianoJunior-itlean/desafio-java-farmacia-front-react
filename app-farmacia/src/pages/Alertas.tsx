// Importa React e hooks para lidar com estado e efeitos
import React, { useEffect, useState } from 'react';

// Importa o layout padrão da aplicação
import { Layout } from '../components/Layout';

// Importa o componente de carregamento (spinner)
import { Loading } from '../components/Loading';

// Importa o serviço responsável por buscar alertas no backend
import { alertaService } from '../api/alertaService';

// Tipos TypeScript que descrevem a estrutura dos dados de alerta
import { AlertaEstoqueBaixo, AlertaValidadeProxima } from '../types';

// Biblioteca para exibir notificações (toasts) para o usuário
import { toast } from 'react-toastify';

// Funções utilitárias para formatar moeda e datas
import { formatCurrency, formatDate } from '../utils/formatters';

// Hook customizado para ordenar dados em tabelas
import { useTableSort } from '../hooks/useTableSort';

// Estilos compartilhados de páginas reutilizados aqui
import '../pages/Categorias.css';
import '../pages/Dashboard.css';

// Define e exporta a página de Alertas como um componente funcional
export const Alertas: React.FC = () => {
  // Estado que armazena alertas de estoque baixo
  const [alertasEstoque, setAlertasEstoque] = useState<AlertaEstoqueBaixo[]>([]);
  // Estado que armazena alertas de validade próxima/vencida
  const [alertasValidade, setAlertasValidade] = useState<AlertaValidadeProxima[]>([]);
  // Estado de carregamento para exibir spinner enquanto busca dados
  const [loading, setLoading] = useState(true);
  // Estado do filtro selecionado pelo usuário (todos, estoque, validade)
  const [filtro, setFiltro] = useState<'todos' | 'estoque' | 'validade'>('todos');

  // Preparar dados para os hooks (sempre executar)
  // Separa os alertas de validade entre vencidos e próximos do vencimento
  const alertasVencidos = alertasValidade.filter((a) => a.diasParaVencer < 0);
  const alertasProximos = alertasValidade.filter((a) => a.diasParaVencer >= 0);

  // Hooks para ordenação das três tabelas - SEMPRE na mesma ordem
  // Hooks de ordenação para cada tabela. Cada hook retorna:
  // - sortedData: dados ordenados conforme a coluna escolhida
  // - requestSort: função para alternar a ordenação de uma coluna
  // - getSortIndicator: indicador visual (↑/↓) da coluna ordenada
  const { sortedData: sortedEstoque, requestSort: requestSortEstoque, getSortIndicator: getSortIndicatorEstoque } = useTableSort(alertasEstoque);
  const { sortedData: sortedVencidos, requestSort: requestSortVencidos, getSortIndicator: getSortIndicatorVencidos } = useTableSort(alertasVencidos);
  const { sortedData: sortedProximos, requestSort: requestSortProximos, getSortIndicator: getSortIndicatorProximos } = useTableSort(alertasProximos);

  // Ao montar a página, carrega os alertas uma única vez
  useEffect(() => {
    loadAlertas();
  }, []);

  // Função que busca os alertas de estoque e validade em paralelo
  const loadAlertas = async () => {
    try {
      setLoading(true);
      // Executa as duas requisições em paralelo para maior performance
      const [estoque, validade] = await Promise.all([
        alertaService.getEstoqueBaixo(),
        alertaService.getValidadeProxima(),
      ]);
      // Atualiza estados com os dados recebidos
      setAlertasEstoque(estoque);
      setAlertasValidade(validade);
    } catch (error: any) {
      // Em caso de erro, loga no console e mostra um toast para o usuário
      console.error('Erro ao carregar alertas:', error);
      toast.error('Erro ao carregar alertas');
    } finally {
      // Desativa o estado de carregamento independentemente de sucesso ou erro
      setLoading(false);
    }
  };

  // Enquanto os dados estão sendo carregados, exibe o spinner dentro do layout
  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  // Booleans para controlar quais seções mostrar com base no filtro
  const mostrarEstoque = filtro === 'todos' || filtro === 'estoque';
  const mostrarValidade = filtro === 'todos' || filtro === 'validade';

  return (
    <Layout>
      {/* Container principal da página */}
      <div className="page-container">
        {/* Cabeçalho com título e botão de atualização */}
        <div className="page-header">
          <h1>Alertas do Sistema</h1>
          <button className="btn btn-secondary" onClick={loadAlertas}>
            🔄 Atualizar
          </button>
        </div>

        {/* Cartão com filtros de exibição */}
        <div className="card">
          <div className="filters">
            <div className="filter-group">
              <label>Filtrar por: </label>
              <select className="form-control" value={filtro} onChange={(e) => setFiltro(e.target.value as any)}>
                <option value="todos">Todos os Alertas</option>
                <option value="estoque">Estoque Baixo</option>
                <option value="validade">Validade Próxima</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cards de resumo com contadores por tipo de alerta */}
        <div className="dashboard-cards">
          <div className="card card-warning">
            <h3>Estoque Baixo</h3>
            <p className="card-number">{alertasEstoque.length}</p>
            <p className="card-description">Medicamentos com menos de 10 unidades</p>
          </div>

          <div className="card card-danger">
            <h3>Medicamentos Vencidos</h3>
            <p className="card-number">{alertasVencidos.length}</p>
            <p className="card-description">Lotes que já venceram</p>
          </div>

          <div className="card card-info">
            <h3>Validade Próxima</h3>
            <p className="card-number">{alertasProximos.length}</p>
            <p className="card-description">Lotes que vencem em até 30 dias</p>
          </div>
        </div>

        {/* Tabela: Alertas de estoque baixo */}
        {mostrarEstoque && alertasEstoque.length > 0 && (
          <div className="card">
            <h2>Alertas de Estoque Baixo</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => requestSortEstoque('medicamentoId')}>
                      ID {getSortIndicatorEstoque('medicamentoId')}
                    </th>
                    <th className="sortable" onClick={() => requestSortEstoque('medicamentoNome')}>
                      Medicamento {getSortIndicatorEstoque('medicamentoNome')}
                    </th>
                    <th className="sortable" onClick={() => requestSortEstoque('quantidadeAtual')}>
                      Quantidade Atual {getSortIndicatorEstoque('quantidadeAtual')}
                    </th>
                    <th className="sortable" onClick={() => requestSortEstoque('limiteBaixo')}>
                      Limite Mínimo {getSortIndicatorEstoque('limiteBaixo')}
                    </th>
                    <th className="sortable" onClick={() => requestSortEstoque('preco')}>
                      Preço Unitário {getSortIndicatorEstoque('preco')}
                    </th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEstoque.map((alerta) => (
                    <tr key={alerta.medicamentoId}>
                      <td>{alerta.medicamentoId}</td>
                      <td>{alerta.medicamentoNome}</td>
                      <td className="text-danger">{alerta.quantidadeAtual}</td>
                      <td>{alerta.limiteBaixo}</td>
                      <td>{formatCurrency(alerta.preco)}</td>
                      <td>
                        <span className="badge badge-warning">Estoque Baixo</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabela: Medicamentos vencidos */}
        {mostrarValidade && alertasVencidos.length > 0 && (
          <div className="card">
            <h2>⚠️ Medicamentos Vencidos</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => requestSortVencidos('medicamentoId')}>
                      ID {getSortIndicatorVencidos('medicamentoId')}
                    </th>
                    <th className="sortable" onClick={() => requestSortVencidos('medicamentoNome')}>
                      Medicamento {getSortIndicatorVencidos('medicamentoNome')}
                    </th>
                    <th className="sortable" onClick={() => requestSortVencidos('quantidade')}>
                      Quantidade {getSortIndicatorVencidos('quantidade')}
                    </th>
                    <th className="sortable" onClick={() => requestSortVencidos('dataVencimento')}>
                      Data de Vencimento {getSortIndicatorVencidos('dataVencimento')}
                    </th>
                    <th className="sortable" onClick={() => requestSortVencidos('diasParaVencer')}>
                      Dias Vencidos {getSortIndicatorVencidos('diasParaVencer')}
                    </th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedVencidos.map((alerta, index) => (
                    <tr key={index} className="row-danger">
                      <td>{alerta.medicamentoId}</td>
                      <td>{alerta.medicamentoNome}</td>
                      <td>{alerta.quantidade}</td>
                      <td>{formatDate(alerta.dataVencimento)}</td>
                      <td className="text-danger">{Math.abs(alerta.diasParaVencer)} dias atrás</td>
                      <td>
                        <span className="badge badge-danger">Vencido</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabela: Medicamentos com validade próxima (<= 30 dias) */}
        {mostrarValidade && alertasProximos.length > 0 && (
          <div className="card">
            <h2>📅 Validade Próxima (30 dias)</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => requestSortProximos('medicamentoId')}>
                      ID {getSortIndicatorProximos('medicamentoId')}
                    </th>
                    <th className="sortable" onClick={() => requestSortProximos('medicamentoNome')}>
                      Medicamento {getSortIndicatorProximos('medicamentoNome')}
                    </th>
                    <th className="sortable" onClick={() => requestSortProximos('quantidade')}>
                      Quantidade {getSortIndicatorProximos('quantidade')}
                    </th>
                    <th className="sortable" onClick={() => requestSortProximos('dataVencimento')}>
                      Data de Vencimento {getSortIndicatorProximos('dataVencimento')}
                    </th>
                    <th className="sortable" onClick={() => requestSortProximos('diasParaVencer')}>
                      Dias para Vencer {getSortIndicatorProximos('diasParaVencer')}
                    </th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProximos.map((alerta, index) => (
                    <tr key={index} className={alerta.diasParaVencer <= 7 ? 'row-warning' : ''}>
                      <td>{alerta.medicamentoId}</td>
                      <td>{alerta.medicamentoNome}</td>
                      <td>{alerta.quantidade}</td>
                      <td>{formatDate(alerta.dataVencimento)}</td>
                      <td className={alerta.diasParaVencer <= 7 ? 'text-warning' : ''}>{alerta.diasParaVencer} dias</td>
                      <td>
                        <span className={`badge ${alerta.diasParaVencer <= 7 ? 'badge-warning' : 'badge-info'}`}>
                          {alerta.diasParaVencer <= 7 ? 'Urgente' : 'Atenção'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mensagem amigável quando não há alertas */}
        {alertasEstoque.length === 0 && alertasValidade.length === 0 && (
          <div className="card">
            <div className="no-alerts">
              <p>✅ Nenhum alerta no momento. Tudo sob controle!</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
