import React from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';

export default function DateInputNative({
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
  const inputRef = React.useRef(null);
  const [displayValue, setDisplayValue] = React.useState('');

  React.useEffect(() => {
    if (value) {
      const [year, month, day] = value.split('-');
      if (day && month && year) setDisplayValue(`${day}/${month}/${year}`);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleInputChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').substring(0, 8);
    
    let formatted = cleaned.substring(0, 2);
    if (cleaned.length >= 3) formatted += '/' + cleaned.substring(2, 4);
    if (cleaned.length >= 5) formatted += '/' + cleaned.substring(4, 8);
    
    setDisplayValue(formatted);
    
    if (cleaned.length === 8) {
      const day = cleaned.substring(0, 2);
      const month = cleaned.substring(2, 4);
      const year = cleaned.substring(4, 8);
      
      if (parseInt(day) <= 31 && parseInt(month) <= 12) {
        onChange({ target: { name, value: `${year}-${month}-${day}` } });
        return;
      }
    }
    onChange({ target: { name, value: '' } });
  };

  const handleNativeChange = (e) => {
    onChange({ target: { name, value: e.target.value } });
  };

  return (
    <div style={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      <TextField
        label={label}
        name={name}
        value={displayValue}
        onChange={handleInputChange}
        placeholder="dd/MM/yyyy"
        fullWidth={fullWidth}
        size={size}
        sx={sx}
        disabled={disabled}
        inputProps={{ maxLength: 10 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => inputRef.current?.showPicker()}
                edge="end"
                disabled={disabled}
              >
                <CalendarToday />
              </IconButton>
            </InputAdornment>
          ),
        }}
        {...props}
      />
      <input
        ref={inputRef}
        type="date"
        value={value || ''}
        onChange={handleNativeChange}
        disabled={disabled}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
      />
    </div>
  );
}
