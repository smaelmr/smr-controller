import React, { useState } from 'react';

//helper para loading
export function useLoading() {
  const [loading, setLoading] = useState(false);

  // Função para envolver chamadas async e controlar loading
  const withLoading = async (asyncFunc) => {
    setLoading(true);
    try {
      await asyncFunc();
    } finally {
      setLoading(false);
    }
  };

  return [loading, withLoading];
}