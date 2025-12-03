import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import GasStations from './pages/GasStations';
import Suppliers from './pages/Suppliers';
import Drivers from './pages/Drivers';
import Clients from './pages/Clients';
import Trips from './pages/Trips';
import Fuelings from './pages/Fuelings';
import Financeiro from './pages/Financeiro';
import { useTheme } from './contexts/ThemeContext';

// Função que cria o tema baseado no modo (claro/escuro)
const createAppTheme = (isDarkMode) => createTheme({
  palette: {
    mode: isDarkMode ? 'dark' : 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: isDarkMode ? '#303030' : '#f5f5f5',
      paper: isDarkMode ? '#424242' : '#ffffff',
    },
  },
  components: {
    MuiTable: {
      defaultProps: {
        size: 'small'
      },
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            padding: '4px 8px'
          }
        }
      }
    }
  }
});

function AppContent() {
  const { isDarkMode } = useTheme();
  const theme = createAppTheme(isDarkMode);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="gas-stations" element={<GasStations />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="clients" element={<Clients />} />
            <Route path="trips" element={<Trips />} />
            <Route path="fuelings" element={<Fuelings />} />
            <Route path="financeiro/:tipo" element={<Financeiro />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
