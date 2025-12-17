import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Paper,
} from '@mui/material';
import {
  AttachMoney,
  LocalGasStation,
  Speed,
  TrendingUp,
  DirectionsCar,
  Percent,
} from '@mui/icons-material';

export default function DashboardMobile({
  selectedMonth,
  selectedYear,
  selectedVehicle,
  vehicles,
  stats,
  handleMonthChange,
  handleYearChange,
  handleVehicleChange,
}) {
  const StatCardMobile = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          <Box sx={{ color, mr: 2 }}>
            {icon}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="caption" color="textSecondary" display="block">
              {title}
            </Typography>
            <Typography variant="h5" color={color} sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const lucro = stats.totalFretes - stats.totalAbastecimento;

  return (
    <Box sx={{ pb: 2 }}>
      {/* Header */}
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000, 
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        p: 2,
        mb: 2
      }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Dashboard
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Mês</InputLabel>
            <Select
              value={selectedMonth}
              label="Mês"
              onChange={handleMonthChange}
            >
              {[...Array(12)].map((_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {new Date(2025, i).toLocaleString('pt-BR', { month: 'long' })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Ano</InputLabel>
            <Select
              value={selectedYear}
              label="Ano"
              onChange={handleYearChange}
            >
              {[2023, 2024, 2025, 2026].map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <FormControl fullWidth size="small">
          <InputLabel>Veículo</InputLabel>
          <Select
            value={selectedVehicle}
            label="Veículo"
            onChange={handleVehicleChange}
          >
            <MenuItem value="">Todos os Veículos</MenuItem>
            {vehicles.map((vehicle) => (
              <MenuItem key={vehicle.id} value={vehicle.id}>
                {vehicle.placa}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Cards de Estatísticas */}
      <Box sx={{ px: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
          Resumo Financeiro
        </Typography>

        <StatCardMobile
          title="Total de Fretes"
          value={`R$ ${stats.totalFretes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<AttachMoney sx={{ fontSize: 32 }} />}
          color="success.main"
        />

        <StatCardMobile
          title="Total Abastecimentos"
          value={`R$ ${stats.totalAbastecimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<LocalGasStation sx={{ fontSize: 32 }} />}
          color="error.main"
        />

        <StatCardMobile
          title="Comissão (13%)"
          value={`R$ ${(stats.totalFretes * 0.13).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<Percent sx={{ fontSize: 32 }} />}
          color="warning.main"
        />

        <StatCardMobile
          title="Sobra Estimado"
          value={`R$ ${lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp sx={{ fontSize: 32 }} />}
          color={lucro >= 0 ? 'info.main' : 'error.main'}
          subtitle={lucro >= 0 ? 'Resultado positivo' : 'Resultado negativo'}
        />

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
          Consumo
        </Typography>

        <StatCardMobile
          title="Média Consumo Geral"
          value={`${stats.mediaConsumoGeral} km/l`}
          icon={<Speed sx={{ fontSize: 32 }} />}
          color="primary.main"
          subtitle={`${stats.consumoPorVeiculo.length} veículo(s) no período`}
        />

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
          Consumo por Veículo
        </Typography>

        {stats.consumoPorVeiculo.length > 0 ? (
          stats.consumoPorVeiculo.map((item, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box sx={{ color: 'primary.main', mr: 2 }}>
                    <DirectionsCar sx={{ fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {item.veiculo}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {item.qtdAbastecimentos} abastecimento(s)
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      Média de Consumo
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {item.mediaConsumo} km/l
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      Total Quilômetros
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {item.totalKm.toLocaleString('pt-BR')} km
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      Total Litros
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {item.totalLitros.toLocaleString('pt-BR')} L
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Dados insuficientes para calcular consumo
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
