// Importa a biblioteca React para usar componentes
import React from 'react';

// Importa o arquivo CSS que contém os estilos de animação do spinner (rodinha de carregamento)
import './Loading.css';

// Define e exporta o componente Loading como um Functional Component
// Este é um componente simples que exibe um indicador de carregamento
// React.FC sem parâmetros significa que não recebe props
export const Loading: React.FC = () => {
  // Renderiza a estrutura visual de carregamento
  return (
    // Container principal que centra o elemento de carregamento na tela
    <div className="loading-container">
      {/* Spinner: elemento que será animado com CSS para mostrar uma rodinha girando */}
      <div className="spinner"></div>
      {/* Texto informando ao usuário que está carregando */}
      <p>Carregando...</p>
    </div>
  );
};
