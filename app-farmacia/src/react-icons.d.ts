// Declaração de tipos customizada para resolver incompatibilidade entre React 19 e react-icons
// React 19 mudou os tipos de retorno de componentes, causando conflitos com react-icons

declare module 'react-icons/fa' {
  import { ComponentType, SVGAttributes } from 'react';
  
  export const FaEdit: ComponentType<SVGAttributes<SVGElement>>;
  export const FaTrash: ComponentType<SVGAttributes<SVGElement>>;
  export const FaEye: ComponentType<SVGAttributes<SVGElement>>;
  export const FaToggleOn: ComponentType<SVGAttributes<SVGElement>>;
  export const FaToggleOff: ComponentType<SVGAttributes<SVGElement>>;
}
