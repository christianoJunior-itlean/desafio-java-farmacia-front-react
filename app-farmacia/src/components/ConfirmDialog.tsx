// Importa a biblioteca React para usar componentes e hooks
import React from 'react';

// Importa o arquivo CSS que contém os estilos específicos deste diálogo
import './ConfirmDialog.css';

// Define a interface TypeScript que descreve todas as propriedades (props) que este componente pode receber
interface ConfirmDialogProps {
  // isOpen: controla se o diálogo está visível (true) ou oculto (false)
  isOpen: boolean;
  
  // title: texto que aparece no cabeçalho do diálogo
  title: string;
  
  // message: texto principal que será exibido na área de corpo do diálogo
  message: string;
  
  // onConfirm: função que será executada quando o usuário clica em "Confirmar"
  onConfirm: () => void;
  
  // onCancel: função que será executada quando o usuário clica em "Cancelar"
  onCancel: () => void;
  
  // confirmText: texto do botão de confirmação (opcional, tem valor padrão 'Confirmar')
  // O símbolo ? significa que é opcional
  confirmText?: string;
  
  // cancelText: texto do botão de cancelamento (opcional, tem valor padrão 'Cancelar')
  cancelText?: string;
  
  // isDangerous: boolean que indica se esta é uma ação perigosa (para estilizar o botão em vermelho)
  // Útil para ações como deletar dados
  isDangerous?: boolean;
}

// Define e exporta o componente ConfirmDialog como um Functional Component do React
// Que recebe as props definidas em ConfirmDialogProps
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  // Desestrutura as props recebidas para facilitar o acesso
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  // Define valores padrão para props opcionais (se não forem fornecidas)
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDangerous = false,
}) => {
  // Se isOpen for false, não renderiza nada (o diálogo fica invisível)
  if (!isOpen) return null;

  // Renderiza a estrutura do diálogo de confirmação
  return (
    // Overlay: camada semitransparente que cobre toda a tela
    // onClick={onCancel}: permite fechar o diálogo clicando fora dele
    <div className="confirm-overlay" onClick={onCancel}>
      {/* Dialog: caixa central que contém o conteúdo */}
      {/* onClick={(e) => e.stopPropagation()}: impede que cliques dentro do diálogo fechem ele */}
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header: área superior com o título do diálogo */}
        <div className="confirm-header">
          {/* Renderiza o título passado como prop */}
          <h3>{title}</h3>
        </div>
        
        {/* Body: área principal que contém a mensagem */}
        <div className="confirm-body">
          {/* Renderiza a mensagem passada como prop */}
          <p>{message}</p>
        </div>
        
        {/* Footer: área inferior com os botões de ação */}
        <div className="confirm-footer">
          {/* Botão de Cancelamento */}
          <button className="btn btn-secondary" onClick={onCancel}>
            {/* Renderiza o texto do botão cancelar (valor padrão ou passado como prop) */}
            {cancelText}
          </button>
          
          {/* Botão de Confirmação */}
          {/* A classe CSS muda baseada em isDangerous: se for true usa 'btn-danger' (vermelho), senão usa 'btn-primary' (azul) */}
          <button 
            className={`btn ${isDangerous ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {/* Renderiza o texto do botão confirmar (valor padrão ou passado como prop) */}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
