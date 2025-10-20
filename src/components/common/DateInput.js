import React from 'react';
import { TextField } from '@mui/material';

/**
 * Componente de input de data reutilizável com formato brasileiro (dd/MM/yyyy)
 * @param {string} label - Label do campo
 * @param {string} name - Nome do campo
 * @param {string} value - Valor do campo (formato: yyyy-MM-dd)
 * @param {function} onChange - Função de callback quando o valor muda
 * @param {boolean} fullWidth - Se o campo deve ocupar toda a largura
 * @param {string} size - Tamanho do campo (small, medium)
 * @param {object} sx - Estilos personalizados
 * @param {object} ...props - Outras props do TextField
 */
export default function DateInput({
  label,
  name,
  value,
  onChange,
  fullWidth = true,
  size = 'medium',
  sx = {},
  ...props
}) {
  // Converter de yyyy-MM-dd para dd/MM/yyyy para exibição
  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  // Converter de dd/MM/yyyy para yyyy-MM-dd para armazenamento
  const formatDateForStorage = (displayDate) => {
    if (!displayDate) return '';
    const cleaned = displayDate.replace(/\D/g, '');
    
    if (cleaned.length !== 8) return '';
    
    const day = cleaned.substring(0, 2);
    const month = cleaned.substring(2, 4);
    const year = cleaned.substring(4, 8);
    
    return `${year}-${month}-${day}`;
  };

  const handleChange = (e) => {
    let inputValue = e.target.value;
    
    // Remover tudo que não é número
    inputValue = inputValue.replace(/\D/g, '');
    
    // Limitar a 8 dígitos
    if (inputValue.length > 8) {
      inputValue = inputValue.substring(0, 8);
    }
    
    // Formatar com barras automaticamente
    let formatted = '';
    if (inputValue.length >= 1) {
      formatted = inputValue.substring(0, 2);
    }
    if (inputValue.length >= 3) {
      formatted += '/' + inputValue.substring(2, 4);
    }
    if (inputValue.length >= 5) {
      formatted += '/' + inputValue.substring(4, 8);
    }
    
    // Criar evento sintético com o valor no formato yyyy-MM-dd
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: name,
        value: formatDateForStorage(formatted),
      },
    };
    
    onChange(syntheticEvent);
  };

  return (
    <TextField
      label={label}
      name={name}
      value={value ? formatDateForDisplay(value) : ''}
      onChange={handleChange}
      placeholder="dd/MM/yyyy"
      fullWidth={fullWidth}
      size={size}
      sx={sx}
      inputProps={{
        maxLength: 10,
      }}
      {...props}
    />
  );
}
