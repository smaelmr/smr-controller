import React, { useState, useEffect } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { tripService, fuelingService, vehicleService } from '../services/services';
import Dashboard from './desktop/Dashboard';
import DashboardMobile from './mobile/DashboardMobile';

export default function DashboardWrapper() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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
      const results = await Promise.all([
        tripService.getByMonthYear(selectedMonth, selectedYear),
        fuelingService.getByMonthYear(selectedMonth, selectedYear),
        fuelingService.getConsumoByMonthYear(selectedMonth, selectedYear)
      ]);

      let tripsArray = Array.isArray(results[0]) ? results[0] : [];
      let fuelingsArray = Array.isArray(results[1]) ? results[1] : [];
      let consumoArray = Array.isArray(results[2]) ? results[2] : [];

      // Aplicar filtro de veículo se selecionado
      if (selectedVehicle) {
        tripsArray = tripsArray.filter(trip => trip.veiculoId === selectedVehicle);
        fuelingsArray = fuelingsArray.filter(fuel => fuel.veiculoId === selectedVehicle);
        consumoArray = consumoArray.filter(consumo => consumo.veiculoId === selectedVehicle);
      }

      const totalFretes = tripsArray.reduce((sum, trip) => sum + parseFloat(trip.valorFrete || 0), 0);
      const totalAbastecimento = fuelingsArray.reduce((sum, fuel) => sum + parseFloat(fuel.valorTotal || 0), 0);

      const consumoPorVeiculo = consumoArray.map(consumo => ({
        veiculo: `${consumo.placa}`,
        mediaConsumo: parseFloat(consumo.mediaConsumo.toFixed(2)),
        totalKm: consumo.totalKm,
        totalLitros: parseFloat(consumo.totalLitros.toFixed(2)),
        qtdAbastecimentos: consumo.qtdAbastecimentos
      })).filter(item => item.mediaConsumo > 0);

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

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleVehicleChange = (e) => {
    setSelectedVehicle(e.target.value);
  };

  if (isMobile) {
    return (
      <DashboardMobile
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        selectedVehicle={selectedVehicle}
        vehicles={vehicles}
        stats={stats}
        handleMonthChange={handleMonthChange}
        handleYearChange={handleYearChange}
        handleVehicleChange={handleVehicleChange}
      />
    );
  }

  return <Dashboard />;
}
