import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { alertaService } from '../api/alertaService';
import { AlertaEstoqueBaixo, AlertaValidadeProxima } from '../types';
import { toast } from 'react-toastify';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useTableSort } from '../hooks/useTableSort';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [alertasEstoque, setAlertasEstoque] = useState<AlertaEstoqueBaixo[]>([]);
  const [alertasValidade, setAlertasValidade] = useState<AlertaValidadeProxima[]>([]);
  const [loading, setLoading] = useState(true);

  // Preparar dados para os hooks (sempre executar)
  const alertasVencidos = alertasValidade.filter((a) => a.diasParaVencer < 0);
  const alertasProximos = alertasValidade.filter((a) => a.diasParaVencer >= 0);

  // Hooks para ordenação das três tabelas - SEMPRE na mesma ordem
  const { sortedData: sortedEstoque, requestSort: requestSortEstoque, getSortIndicator: getSortIndicatorEstoque } = useTableSort(alertasEstoque);
  const { sortedData: sortedVencidos, requestSort: requestSortVencidos, getSortIndicator: getSortIndicatorVencidos } = useTableSort(alertasVencidos);
  const { sortedData: sortedProximos, requestSort: requestSortProximos, getSortIndicator: getSortIndicatorProximos } = useTableSort(alertasProximos);

  useEffect(() => {
    loadAlertas();
  }, []);

  const loadAlertas = async () => {
    try {
      setLoading(true);
      const [estoque, validade] = await Promise.all([
        alertaService.getEstoqueBaixo(),
        alertaService.getValidadeProxima(),
      ]);
      setAlertasEstoque(estoque);
      setAlertasValidade(validade);
    } catch (error: any) {
      console.error('Erro ao carregar alertas:', error);
      toast.error('Erro ao carregar alertas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard">
        <h1>Dashboard</h1>

        <div className="dashboard-cards">
          <div className="card card-warning">
            <h3>Estoque Baixo</h3>
            <p className="card-number">{alertasEstoque.length}</p>
            <p className="card-description">Medicamentos com estoque abaixo de 10 unidades</p>
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

        <div className="dashboard-sections">
          {alertasEstoque.length > 0 && (
            <div className="section">
              <h2>Alertas de Estoque Baixo</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => requestSortEstoque('medicamentoNome')}>
                        Medicamento {getSortIndicatorEstoque('medicamentoNome')}
                      </th>
                      <th className="sortable" onClick={() => requestSortEstoque('quantidadeAtual')}>
                        Quantidade Atual {getSortIndicatorEstoque('quantidadeAtual')}
                      </th>
                      <th className="sortable" onClick={() => requestSortEstoque('limiteBaixo')}>
                        Limite {getSortIndicatorEstoque('limiteBaixo')}
                      </th>
                      <th className="sortable" onClick={() => requestSortEstoque('preco')}>
                        Preço {getSortIndicatorEstoque('preco')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedEstoque.map((alerta) => (
                      <tr key={alerta.medicamentoId}>
                        <td>{alerta.medicamentoNome}</td>
                        <td className="text-danger">{alerta.quantidadeAtual}</td>
                        <td>{alerta.limiteBaixo}</td>
                        <td>{formatCurrency(alerta.preco)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {alertasVencidos.length > 0 && (
            <div className="section">
              <h2>Medicamentos Vencidos</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
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
                    </tr>
                  </thead>
                  <tbody>
                    {sortedVencidos.map((alerta, index) => (
                      <tr key={index} className="row-danger">
                        <td>{alerta.medicamentoNome}</td>
                        <td>{alerta.quantidade}</td>
                        <td>{formatDate(alerta.dataVencimento)}</td>
                        <td className="text-danger">{Math.abs(alerta.diasParaVencer)} dias atrás</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {alertasProximos.length > 0 && (
            <div className="section">
              <h2>Validade Próxima (30 dias)</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
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
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProximos.map((alerta, index) => (
                      <tr key={index} className={alerta.diasParaVencer <= 7 ? 'row-warning' : ''}>
                        <td>{alerta.medicamentoNome}</td>
                        <td>{alerta.quantidade}</td>
                        <td>{formatDate(alerta.dataVencimento)}</td>
                        <td className={alerta.diasParaVencer <= 7 ? 'text-warning' : ''}>
                          {alerta.diasParaVencer} dias
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {alertasEstoque.length === 0 && alertasValidade.length === 0 && (
            <div className="no-alerts">
              <p>✅ Nenhum alerta no momento. Tudo sob controle!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
