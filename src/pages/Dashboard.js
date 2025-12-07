import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  AttachMoney,
  LocalGasStation,
  Speed,
  TrendingUp,
} from '@mui/icons-material';
import { tripService, fuelingService, vehicleService } from '../services/services';

function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({
    totalFretes: 0,
    totalAbastecimento: 0,
    mediaConsumoGeral: 0,
    consumoPorVeiculo: [],
  });

  useEffect(() => {
    // Função assíncrona auto-executável para carregar os dados
    (async () => {
      try {
        await calculateStats();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    })();
  }, [selectedMonth, selectedYear]);

  const calculateStats = async () => {
    try {
      // Buscar dados de forma assíncrona
      const results = await Promise.all([
        tripService.getByMonthYear(selectedMonth, selectedYear),
        fuelingService.getByMonthYear(selectedMonth, selectedYear),
        fuelingService.getConsumoByMonthYear(selectedMonth, selectedYear)
      ]);

      // Garantir que os dados são arrays
      const tripsArray = Array.isArray(results[0]) ? results[0] : [];
      const fuelingsArray = Array.isArray(results[1]) ? results[1] : [];
      const consumoArray = Array.isArray(results[2]) ? results[2] : [];

      // Calcular totais
      const totalFretes = tripsArray.reduce((sum, trip) => sum + parseFloat(trip.valorFrete || 0), 0);
      const totalAbastecimento = fuelingsArray.reduce((sum, fuel) => sum + parseFloat(fuel.valorTotal || 0), 0);

      // Formatar dados de consumo por veículo
      const consumoPorVeiculo = consumoArray.map(consumo => ({
        veiculo: `${consumo.placa}`,
        mediaConsumo: parseFloat(consumo.mediaConsumo.toFixed(2)),
        totalKm: consumo.totalKm,
        totalLitros: parseFloat(consumo.totalLitros.toFixed(2)),
        qtdAbastecimentos: consumo.qtdAbastecimentos
      })).filter(item => item.mediaConsumo > 0);

      // Calcular média geral de consumo
      const mediaConsumoGeral = consumoPorVeiculo.length > 0
        ? (consumoPorVeiculo.reduce((sum, v) => sum + v.mediaConsumo, 0) / consumoPorVeiculo.length).toFixed(2)
        : 0;

      setStats({
        totalFretes,
        totalAbastecimento,
        mediaConsumoGeral,
        consumoPorVeiculo,
      });
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      setStats({
        totalFretes: 0,
        totalAbastecimento: 0,
        mediaConsumoGeral: 0,
        consumoPorVeiculo: [],
      });
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box sx={{ flexGrow: 1 }}>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h5" component="div" color={color} sx={{ wordBreak: 'break-word' }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color, opacity: 0.7, ml: 2 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Mês</InputLabel>
          <Select
            value={selectedMonth}
            label="Mês"
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {[...Array(12)].map((_, i) => (
              <MenuItem key={i + 1} value={i + 1}>
                {new Date(2025, i).toLocaleString('pt-BR', { month: 'long' })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Ano</InputLabel>
          <Select
            value={selectedYear}
            label="Ano"
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {[2023, 2024, 2025, 2026].map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="Total de Fretes"
            value={`R$ ${stats.totalFretes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<AttachMoney sx={{ fontSize: 40 }} />}
            color="success.main"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="Total Abastecimentos"
            value={`R$ ${stats.totalAbastecimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<LocalGasStation sx={{ fontSize: 40 }} />}
            color="error.main"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="Média Consumo Geral"
            value={`${stats.mediaConsumoGeral} km/l`}
            icon={<Speed sx={{ fontSize: 40 }} />}
            color="primary.main"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="Lucro Estimado"
            value={`R$ ${(stats.totalFretes - stats.totalAbastecimento).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            color="info.main"
          />
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Consumo por Veículo
              </Typography>
                {stats.consumoPorVeiculo.length > 0 ? (
                stats.consumoPorVeiculo.map((item, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="body1">
                      <strong>{item.veiculo}</strong>
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Média: {item.mediaConsumo} km/l | 
                      Total Km: {item.totalKm.toLocaleString('pt-BR')} | 
                      Total Litros: {item.totalLitros.toLocaleString('pt-BR')} | 
                      Abastecimentos: {item.qtdAbastecimentos}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Dados insuficientes para calcular consumo
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;