import React from 'react';
import { TextField } from '@mui/material';

/**
 * Componente de input para valores monetários em Real Brasileiro (R$)
 * Formato: R$ 1.234,56
 */
export default function CurrencyInput({
  label,
  name,
  value,
  onChange,
  fullWidth = true,
  size = 'medium',
  sx = {},
  disabled = false,
  ...props
}) {
  const [displayValue, setDisplayValue] = React.useState('');

  React.useEffect(() => {
    if (value) {
      const formatted = formatToCurrency(parseFloat(value));
      setDisplayValue(formatted);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const formatToCurrency = (num) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  };

  const handleInputChange = (e) => {
    let inputValue = e.target.value;
    
    // Remove tudo exceto números
    let cleaned = inputValue.replace(/\D/g, '');
    
    if (cleaned === '') {
      setDisplayValue('');
      onChange({ target: { name, value: '' } });
      return;
    }
    
    // Converte para número dividindo por 100 (centavos)
    const numValue = parseFloat(cleaned) / 100;
    
    // Formata para exibição
    const formatted = formatToCurrency(numValue);
    setDisplayValue(formatted);
    
    // Envia valor numérico para o pai
    onChange({ target: { name, value: numValue.toString() } });
  };

  return (
    <TextField
      label={label}
      name={name}
      value={displayValue}
      onChange={handleInputChange}
      placeholder="R$ 0,00"
      fullWidth={fullWidth}
      size={size}
      sx={sx}
      disabled={disabled}
      {...props}
    />
  );
}
