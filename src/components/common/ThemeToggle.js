import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Tooltip title={isDarkMode ? "Mudar para tema claro" : "Mudar para tema escuro"}>
      <IconButton color="inherit" onClick={toggleTheme}>
        {isDarkMode ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
}