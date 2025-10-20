import React, { useState } from 'react';

//helper para tratamento de erros centralizado
export function handleError(error, setError) {
  let message = 'Erro inesperado.';

  if (error.response && error.response.data && error.response.data.message) {
    message = error.response.data.message;
  } else if (error.message) {
    message = error.message;
  }

  setError(message);
  console.error('Erro capturado:', error);
}