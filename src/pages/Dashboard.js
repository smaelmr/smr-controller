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
import { tripService, fuelingService, vehicleService } from '../services/mockData';

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
    calculateStats();
  }, [selectedMonth, selectedYear]);

  const calculateStats = () => {
    const trips = tripService.getAll();
    const fuelings = fuelingService.getAll();
    const vehicles = vehicleService.getAll();

    // Filter by selected month/year
    const filteredTrips = trips.filter((trip) => {
      const date = new Date(trip.dataColeta);
      return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
    });

    const filteredFuelings = fuelings.filter((fueling) => {
      const date = new Date(fueling.data);
      return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
    });

    // Calculate totals
    const totalFretes = filteredTrips.reduce((sum, trip) => sum + parseFloat(trip.valorFrete || 0), 0);
    const totalAbastecimento = filteredFuelings.reduce((sum, fuel) => sum + parseFloat(fuel.valorTotal || 0), 0);

    // Calculate consumption per vehicle
    const consumoPorVeiculo = vehicles.map((vehicle) => {
      const vehicleFuelings = filteredFuelings.filter(f => f.veiculoId === vehicle.id);
      
      if (vehicleFuelings.length < 2) return null;

      vehicleFuelings.sort((a, b) => a.quilometragem - b.quilometragem);
      
      const totalKm = vehicleFuelings[vehicleFuelings.length - 1].quilometragem - vehicleFuelings[0].quilometragem;
      const totalLitros = vehicleFuelings.reduce((sum, f) => sum + parseFloat(f.litros || 0), 0);
      
      const mediaConsumo = totalKm > 0 ? (totalKm / totalLitros).toFixed(2) : 0;

      return {
        veiculo: `${vehicle.marca} ${vehicle.modelo} - ${vehicle.placa}`,
        mediaConsumo: parseFloat(mediaConsumo),
      };
    }).filter(Boolean);

    const mediaConsumoGeral = consumoPorVeiculo.length > 0
      ? (consumoPorVeiculo.reduce((sum, v) => sum + v.mediaConsumo, 0) / consumoPorVeiculo.length).toFixed(2)
      : 0;

    setStats({
      totalFretes,
      totalAbastecimento,
      mediaConsumoGeral,
      consumoPorVeiculo,
    });
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h5" component="div" color={color}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color, opacity: 0.7 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
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

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total de Fretes"
            value={`R$ ${stats.totalFretes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<AttachMoney sx={{ fontSize: 40 }} />}
            color="success.main"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Abastecimentos"
            value={`R$ ${stats.totalAbastecimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<LocalGasStation sx={{ fontSize: 40 }} />}
            color="error.main"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Média Consumo Geral"
            value={`${stats.mediaConsumoGeral} km/l`}
            icon={<Speed sx={{ fontSize: 40 }} />}
            color="primary.main"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                      <strong>{item.veiculo}</strong>: {item.mediaConsumo} km/l
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
