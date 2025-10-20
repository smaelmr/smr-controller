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
} from '@mui/material';
import { Add, Edit, Delete, FilterList, Clear } from '@mui/icons-material';
import { tripService, clientService, driverService, vehicleService, receivablesService } from '../services/mockData';
import DateInputNative from '../components/common/DateInputNative';
import CurrencyInput from '../components/common/CurrencyInput';

function Trips() {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [clients, setClients] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    valorFrete: '',
    origem: '',
    destino: '',
    clienteId: '',
    motoristaId: '',
    veiculoId: '',
    agenciamento: '',
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
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trips, filters]);

  const loadData = () => {
    const allTrips = tripService.getAll();
    setTrips(allTrips);
    setClients(clientService.getAll());
    setDrivers(driverService.getAll());
    setVehicles(vehicleService.getAll());
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
      setFormData(trip);
      setEditingId(trip.id);
    } else {
      setFormData({
        valorFrete: '',
        origem: '',
        destino: '',
        clienteId: '',
        motoristaId: '',
        veiculoId: '',
        agenciamento: '',
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

  const handleSubmit = () => {
    if (editingId) {
      tripService.update(editingId, formData);
    } else {
      const newTrip = tripService.create(formData);
      
      // Criar automaticamente uma conta a receber quando criar nova viagem
      receivablesService.create({
        clienteId: formData.clienteId,
        valor: formData.valorFrete,
        dataLancamento: formData.dataColeta,
        dataRecebimento: '',
        origem: 'Viagem',
        referencia: newTrip.id,
        observacao: formData.observacao || '',
        recebido: false,
      });
    }
    loadData();
    handleClose();
  };

  const handleDelete = (id) => {
    if (window.confirm('Deseja realmente excluir esta viagem?')) {
      tripService.delete(id);
      loadData();
    }
  };

  const getClientName = (id) => {
    const client = clients.find(c => c.id === id);
    return client ? client.nomeRazao : '-';
  };

  const getDriverName = (id) => {
    const driver = drivers.find(d => d.id === id);
    return driver ? driver.nome : '-';
  };

  const getVehiclePlaca = (id) => {
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? vehicle.placa : '-';
  };

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
                    {client.nomeRazao}
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
                    {driver.nome}
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
                <TableCell>{trip.origem}</TableCell>
                <TableCell>{trip.destino}</TableCell>
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
            <CurrencyInput
              label="Valor do Frete"
              name="valorFrete"
              value={formData.valorFrete}
              onChange={handleChange}
              fullWidth
            />

            <CurrencyInput
              label="Agenciamento"
              name="agenciamento"
              value={formData.agenciamento}
              onChange={handleChange}
              fullWidth
            />
            
            <TextField
              label="Origem"
              name="origem"
              value={formData.origem}
              onChange={handleChange}
              fullWidth
            />
            
            <TextField
              label="Destino"
              name="destino"
              value={formData.destino}
              onChange={handleChange}
              fullWidth
            />
            
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
                    {client.nomeRazao}
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
                    {driver.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
