import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add, Edit, Delete, FilterList, Clear } from '@mui/icons-material';
import { tripService, clientService, driverService, vehicleService, cityService } from '../services/services';
import DateInputNative from '../components/common/DateInputNative';
import CurrencyInput from '../components/common/CurrencyInput';
import TripsMobile from './mobile/TripsMobile';
import { formatToISO } from '../services/helpers/dateUtils';

function Trips() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [clients, setClients] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [cities, setCities] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    valorFrete: '',
    origemId: '',
    destinoId: '',
    clienteId: '',
    motoristaId: '',
    veiculoId: '',
    valorAgenciamento: '',
    valorPedagio: '',
    numeroDocumento: '',
    dataColeta: '',
    dataEntrega: '',
    observacao: '',
  });

  // Estados dos filtros
  const [filters, setFilters] = useState({
    dataInicial: '',
    dataFinal: '',
    clienteId: '',
    motoristaId: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      await loadData();
    };
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trips, filters]);

  const loadData = async () => {
    try {
      const [tripsData, clientsData, driversData, vehiclesData, citiesData] = await Promise.all([
        tripService.getAll(),
        clientService.getAll(),
        driverService.getAll(),
        vehicleService.getAll(),
        cityService.getAll()
      ]);

      setTrips(Array.isArray(tripsData) ? tripsData : []);
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setDrivers(Array.isArray(driversData) ? driversData : []);
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      setCities(Array.isArray(citiesData) ? citiesData : []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Inicializar com arrays vazios em caso de erro
      setTrips([]);
      setClients([]);
      setDrivers([]);
      setVehicles([]);
      setCities([]);
    }
  };

  const applyFilters = () => {
    let filtered = [...trips];

    // Filtro por período de coleta
    if (filters.dataInicial) {
      filtered = filtered.filter(item => 
        item.dataColeta >= filters.dataInicial
      );
    }

    if (filters.dataFinal) {
      filtered = filtered.filter(item => 
        item.dataColeta <= filters.dataFinal
      );
    }

    // Filtro por cliente
    if (filters.clienteId) {
      filtered = filtered.filter(item => 
        item.clienteId === parseInt(filters.clienteId)
      );
    }

    // Filtro por motorista
    if (filters.motoristaId) {
      filtered = filtered.filter(item => 
        item.motoristaId === parseInt(filters.motoristaId)
      );
    }

    setFilteredTrips(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      dataInicial: '',
      dataFinal: '',
      clienteId: '',
      motoristaId: '',
    });
  };

  const handleOpen = (trip = null) => {
    if (trip) {
      setEditingId(trip.id);

      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setFormData({
        ...trip,
        dataColeta: formatDate(trip.dataColeta),
        dataEntrega: formatDate(trip.dataEntrega),
      });
    } else {
      setFormData({
        valorFrete: '',
        origemId: '',
        destinoId: '',
        clienteId: '',
        motoristaId: '',
        veiculoId: '',
        valorAgenciamento: '',
        valorPedagio: '',
        numeroDocumento: '',
        dataColeta: '',
        dataEntrega: '',
        observacao: '',
      });
      setEditingId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const dataToSummit = { 
        ...formData,
        valorFrete: parseFloat(formData.valorFrete),
        valorAgenciamento: parseFloat(formData.valorAgenciamento),
        valorPedagio: parseFloat(formData.valorPedagio),
        dataColeta: formatToISO(formData.dataColeta),
        dataEntrega: formatToISO(formData.dataEntrega),
      };
     
      if (editingId) {
        await tripService.update(editingId, dataToSummit);
      } else {
        await tripService.create(dataToSummit);
      }
      await loadData();
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar viagem:', error);
      alert('Erro ao salvar a viagem.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir esta viagem?')) {
      try {
        await tripService.delete(id);
        await loadData();
      } catch (error) {
        console.error('Erro ao excluir viagem:', error);
        alert('Erro ao excluir a viagem.');
      }
    }
  };

  const getClientName = (id) => {
    const client = clients.find(c => c.id === id);
    return client ? client.name : '-';
  };

  const getDriverName = (id) => {
    const driver = drivers.find(d => d.id === id);
    return driver ? driver.name : '-';
  };

  const getVehiclePlaca = (id) => {
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? vehicle.placa : '-';
  };

  const getCityName = (id) => {
    const city = cities.find(c => c.id === id);
    return city ? city.name : '-';
  };

  if (isMobile) {
    return (
      <TripsMobile
        filteredTrips={filteredTrips}
        clients={clients}
        drivers={drivers}
        vehicles={vehicles}
        cities={cities}
        filters={filters}
        formData={formData}
        open={open}
        editingId={editingId}
        handleFilterChange={handleFilterChange}
        clearFilters={clearFilters}
        handleOpen={handleOpen}
        handleClose={handleClose}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleDelete={handleDelete}
        getClientName={getClientName}
        getDriverName={getDriverName}
        getVehiclePlaca={getVehiclePlaca}
        getCityName={getCityName}
      />
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Viagens</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Nova Viagem
        </Button>
      </Box>

      {/* Seção de Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <FilterList sx={{ mr: 1 }} />
          <Typography variant="h6">Filtros</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2.5}>
            <DateInputNative
              label="Data Inicial"
              name="dataInicial"
              value={filters.dataInicial}
              onChange={handleFilterChange}
              fullWidth
              size="small"
              sx={{ width: 180 }}  // Largura fixa em pixels
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <DateInputNative
              label="Data Final"
              name="dataFinal"
              value={filters.dataFinal}
              onChange={handleFilterChange}
              fullWidth
              size="small"
              sx={{ width: 180 }}  // Largura fixa em pixels
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Cliente</InputLabel>
              <Select
                name="clienteId"
                value={filters.clienteId}
                onChange={handleFilterChange}
                label="Cliente"
              >
                <MenuItem value="">Todos</MenuItem>
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Motorista</InputLabel>
              <Select
                name="motoristaId"
                value={filters.motoristaId}
                onChange={handleFilterChange}
                label="Motorista"
              >
                <MenuItem value="">Todos</MenuItem>
                {drivers.map((driver) => (
                  <MenuItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={clearFilters}
              fullWidth
              sx={{ minWidth: 120 }}
            >
              Limpar
            </Button>
          </Grid>
        </Grid>
        <Box mt={2}>
          <Typography variant="body2" color="textSecondary">
            Exibindo {filteredTrips.length} de {trips.length} registros
          </Typography>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Origem</TableCell>
              <TableCell>Destino</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Motorista</TableCell>
              <TableCell>Veículo</TableCell>
              <TableCell>Valor Frete</TableCell>
              <TableCell>Data Coleta</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTrips.map((trip) => (
              <TableRow key={trip.id}>
                <TableCell>{getCityName(trip.origemId)}</TableCell>
                <TableCell>{getCityName(trip.destinoId)}</TableCell>
                <TableCell>{getClientName(trip.clienteId)}</TableCell>
                <TableCell>{getDriverName(trip.motoristaId)}</TableCell>
                <TableCell>{getVehiclePlaca(trip.veiculoId)}</TableCell>
                <TableCell>R$ {parseFloat(trip.valorFrete || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>{trip.dataColeta ? new Date(trip.dataColeta).toLocaleDateString('pt-BR') : '-'}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpen(trip)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(trip.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Editar Viagem' : 'Nova Viagem'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {/* Linha 1: Valor do Frete, Data Coleta, Data Entrega */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <CurrencyInput
                label="Valor do Frete"
                name="valorFrete"
                value={formData.valorFrete}
                onChange={handleChange}
                fullWidth
              />
              <DateInputNative
                label="Data de Coleta"
                name="dataColeta"
                value={formData.dataColeta}
                onChange={handleChange}
                fullWidth
              />
              <DateInputNative
                label="Data de Entrega"
                name="dataEntrega"
                value={formData.dataEntrega}
                onChange={handleChange}
                fullWidth
              />
            </Box>

            {/* Linha 2: Origem e Destino */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Origem</InputLabel>
                <Select
                  name="origemId"
                  value={formData.origemId}
                  onChange={handleChange}
                  label="Origem"
                >
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={city.id}>
                      {city.name}/{city.state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Destino</InputLabel>
                <Select
                  name="destinoId"
                  value={formData.destinoId}
                  onChange={handleChange}
                  label="Destino"
                >
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={city.id}>
                      {city.name}/{city.state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Linha 3: Agenciamento e Pedágio */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <CurrencyInput
                label="Agenciamento"
                name="valorAgenciamento"
                value={formData.valorAgenciamento}
                onChange={handleChange}
                fullWidth
              />
              <CurrencyInput
                label="Valor Pedágio"
                name="valorPedagio"
                value={formData.valorPedagio}
                onChange={handleChange}
                fullWidth
              />
            </Box>

            {/* Linha 4: Veículo e Motorista */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Veículo</InputLabel>
                <Select
                  name="veiculoId"
                  value={formData.veiculoId}
                  onChange={handleChange}
                  label="Veículo"
                >
                  {vehicles.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.placa} - {vehicle.marca} {vehicle.modelo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Motorista</InputLabel>
                <Select
                  name="motoristaId"
                  value={formData.motoristaId}
                  onChange={handleChange}
                  label="Motorista"
                >
                  {drivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Linha 5: Cliente e Número do Documento */}
            <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Cliente</InputLabel>
              <Select
                name="clienteId"
                value={formData.clienteId}
                onChange={handleChange}
                label="Cliente"
              >
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
                label="Número do Documento"
                name="numeroDocumento"
                value={formData.numeroDocumento}
                onChange={handleChange}
                fullWidth
            />
            </Box>
            
            {/* Observação */}
            <TextField
              label="Observação"
              name="observacao"
              value={formData.observacao}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Trips;
