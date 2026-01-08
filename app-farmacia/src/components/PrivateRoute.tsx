// Importa a biblioteca React para usar componentes e hooks
import React from 'react';

// Importa o componente Navigate do React Router para redirecionar usuários para outras rotas
import { Navigate } from 'react-router-dom';

// Importa o hook customizado useAuth do contexto de autenticação
// Este hook fornece informações sobre o status de autenticação do usuário
import { useAuth } from '../contexts/AuthContext';

// Define a interface TypeScript para as props que este componente recebe
interface PrivateRouteProps {
  // 'children' é o conteúdo JSX que será renderizado se o usuário estiver autenticado
  // React.ReactElement significa que ele aceita qualquer elemento React como filho
  children: React.ReactElement;
}

// Define e exporta o componente PrivateRoute como um componente funcional do React
// React.FC<PrivateRouteProps> significa que é um Functional Component que recebe PrivateRouteProps
export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // Desestrutura o hook useAuth para obter duas informações:
  // - isAuthenticated: boolean que indica se o usuário está logado
  // - loading: boolean que indica se o sistema ainda está verificando o status de autenticação
  const { isAuthenticated, loading } = useAuth();

  // Verifica se o sistema está carregando (verificando autenticação)
  // Enquanto loading for true, exibe uma mensagem de carregamento
  if (loading) {
    return <div>Carregando...</div>;
  }

  // Renderiza o conteúdo com base na autenticação:
  // - Se isAuthenticated for true: renderiza o conteúdo (children) passado como prop
  // - Se isAuthenticated for false: redireciona para a página de login usando Navigate
  return isAuthenticated ? children : <Navigate to="/login" />;
};
