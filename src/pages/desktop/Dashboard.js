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
import { tripService, fuelingService, vehicleService } from '../../services/services';

function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState({
    totalFretes: 0,
    totalAbastecimento: 0,
    mediaConsumoGeral: 0,
    consumoPorVeiculo: [],
  });

  useEffect(() => {
    // Carregar veículos
    (async () => {
      try {
        const vehiclesData = await vehicleService.getAll();
        setVehicles(vehiclesData || []);
      } catch (error) {
        console.error('Erro ao carregar veículos:', error);
      }
    })();
  }, []);

  useEffect(() => {
    // Função assíncrona auto-executável para carregar os dados
    (async () => {
      try {
        await calculateStats();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear, selectedVehicle]);

  const calculateStats = async () => {
    try {
      // Buscar dados de forma assíncrona
      const results = await Promise.all([
        tripService.getByMonthYear(selectedMonth, selectedYear),
        fuelingService.getByMonthYear(selectedMonth, selectedYear),
        fuelingService.getConsumoByMonthYear(selectedMonth, selectedYear)
      ]);

      // Garantir que os dados são arrays
      let tripsArray = Array.isArray(results[0]) ? results[0] : [];
      let fuelingsArray = Array.isArray(results[1]) ? results[1] : [];
      let consumoArray = Array.isArray(results[2]) ? results[2] : [];

      // Aplicar filtro de veículo se selecionado
      if (selectedVehicle) {
        tripsArray = tripsArray.filter(trip => trip.veiculoId === selectedVehicle);
        fuelingsArray = fuelingsArray.filter(fuel => fuel.veiculoId === selectedVehicle);
        consumoArray = consumoArray.filter(consumo => consumo.veiculoId === selectedVehicle);
      }

      // Calcular totais
      const totalFretes = tripsArray.reduce((sum, trip) => sum + parseFloat(trip.valorFrete || 0), 0);
      const totalAbastecimento = fuelingsArray.reduce((sum, fuel) => sum + parseFloat(fuel.valorDiesel || 0), 0);

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
    <Card sx={{ 
      width: '100%',
      minWidth: 350,
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        p: 2,
        '&:last-child': { pb: 2 }
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography color="textSecondary" gutterBottom variant="body2" noWrap>
              {title}
            </Typography>
            <Typography 
              variant="h5" 
              component="div" 
              color={color} 
              sx={{ 
                wordBreak: 'break-word',
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box sx={{ color, opacity: 0.7, ml: 2, flexShrink: 0 }}>
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

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Veículo</InputLabel>
          <Select
            value={selectedVehicle}
            label="Veículo"
            onChange={(e) => setSelectedVehicle(e.target.value)}
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

      <Grid container spacing={2} sx={{ width: '100%', m: 0 }}>
        <Grid item xs={12} sm={6} lg={3} sx={{ display: 'flex' }}>
          <StatCard
            title="Total de Fretes"
            value={`R$ ${stats.totalFretes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<AttachMoney sx={{ fontSize: 40 }} />}
            color="success.main"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3} sx={{ display: 'flex' }}>
          <StatCard
            title="Total Abastecimentos"
            value={`R$ ${stats.totalAbastecimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<LocalGasStation sx={{ fontSize: 40 }} />}
            color="error.main"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3} sx={{ display: 'flex' }}>
          <StatCard
            title="Média Consumo Geral"
            value={`${stats.mediaConsumoGeral} km/l`}
            icon={<Speed sx={{ fontSize: 40 }} />}
            color="primary.main"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3} sx={{ display: 'flex' }}>
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