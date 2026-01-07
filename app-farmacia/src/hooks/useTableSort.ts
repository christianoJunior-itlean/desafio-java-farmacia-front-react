import { useState, useMemo } from 'react';

type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: string | null;
  direction: SortDirection;
}

export function useTableSort<T>(data: T[], initialSortKey?: string) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: initialSortKey || null,
    direction: null,
  });

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return data;
    }

    const sortableData = [...data];
    sortableData.sort((a: any, b: any) => {
      // Suporte para propriedades aninhadas (ex: categoria.nome, cliente.nomeCompleto)
      const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
      };

      const aValue = getNestedValue(a, sortConfig.key!);
      const bValue = getNestedValue(b, sortConfig.key!);

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Numeric comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // String comparison (case insensitive)
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aStr > bStr) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sortableData;
  }, [data, sortConfig]);

  const requestSort = (key: string) => {
    let direction: SortDirection = 'asc';

    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }

    setSortConfig({ key: direction ? key : null, direction });
  };

  const getSortIndicator = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return null;
    }

    if (sortConfig.direction === 'asc') {
      return ' ▲';
    } else if (sortConfig.direction === 'desc') {
      return ' ▼';
    }
    return null;
  };

  return { sortedData, requestSort, getSortIndicator, sortConfig };
}
