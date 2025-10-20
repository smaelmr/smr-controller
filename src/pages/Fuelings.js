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
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { fuelingService, vehicleService, gasStationService, payableService } from '../services/services';
import Notification from '../components/common/Notification';
import { useLoading } from '../services/helpers/useLoading';
import { handleError } from '../services/helpers/handleError';

function Fuelings() {
  const [fuelings, setFuelings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [gasStations, setGasStations] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSeverity, setNotifSeverity] = useState('success');
  const [loading, withLoading] = useLoading();

  const showNotification = (message, severity = 'success') => {
    setNotifMessage(message);
    setNotifSeverity(severity);
    setNotifOpen(true);
  };

  const [formData, setFormData] = useState({
    valorTotal: '',
    litros: '',
    veiculoId: '',
    postoId: '',
    quilometragem: '',
    data: '',
    tipoCombustivel: 'Diesel',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await withLoading(async () => {
      try {
        const [fuels, vehs, stations] = await Promise.all([
          fuelingService.getAll(),
          vehicleService.getAll(),
          gasStationService.getAll()
        ]);
        setFuelings(fuels);
        setVehicles(vehs);
        setGasStations(stations);
      } catch (err) {
        handleError(err, setError);
        showNotification(err.message || 'Erro ao carregar dados', 'error');
      }
    });
  };

  const handleOpen = (fueling = null) => {
    if (fueling) {
      setFormData(fueling);
      setEditingId(fueling.id);
    } else {
      setFormData({
        valorTotal: '',
        litros: '',
        veiculoId: '',
        postoId: '',
        quilometragem: '',
        data: '',
        tipoCombustivel: 'Diesel',
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
    withLoading(async () => {
      try {
        if (editingId) {
          await fuelingService.update(editingId, formData);
          showNotification('Abastecimento atualizado com sucesso!');
        } else {
          const newFueling = await fuelingService.create(formData);

          // Criar automaticamente uma conta a pagar para o abastecimento
          await payableService.create({
            categoria: 'Abastecimento',
            fornecedorId: `station-${formData.postoId}`,  // Usar formato com prefixo
            valor: formData.valorTotal,
            dataLancamento: formData.data,
            dataVencimento: formData.data,
            dataPagamento: '',
            origem: 'Abastecimento',
            referencia: newFueling.id,
            observacao: `${formData.tipoCombustivel} - ${formData.litros}L`,
            pago: false,
          });
          showNotification('Abastecimento cadastrado com sucesso!');
        }
        await loadData();
        handleClose();
      } catch (err) {
        handleError(err, setError);
        showNotification(err.message || 'Erro ao salvar abastecimento', 'error');
      }
    })();
  };

  const handleDelete = (id) => {
    if (!window.confirm('Deseja realmente excluir este abastecimento?')) return;
    
    withLoading(async () => {
      try {
        await fuelingService.delete(id);
        showNotification('Abastecimento excluído com sucesso!');
        await loadData();
      } catch (err) {
        handleError(err, setError);
        showNotification(err.message || 'Erro ao excluir abastecimento', 'error');
      }
    })();
  };

  const getVehicleName = (id) => {
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? `${vehicle.marca} ${vehicle.modelo} - ${vehicle.placa}` : '-';
  };

  const getStationName = (id) => {
    const station = gasStations.find(s => s.id === id);
    return station ? station.nome : '-';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Abastecimentos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Novo Abastecimento
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Veículo</TableCell>
              <TableCell>Posto</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Litros</TableCell>
              <TableCell>Valor Total</TableCell>
              <TableCell>KM</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fuelings.map((fueling) => (
              <TableRow key={fueling.id}>
                <TableCell>{new Date(fueling.data).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{getVehicleName(fueling.veiculoId)}</TableCell>
                <TableCell>{getStationName(fueling.postoId)}</TableCell>
                <TableCell>{fueling.tipoCombustivel}</TableCell>
                <TableCell>{fueling.litros}L</TableCell>
                <TableCell>R$ {parseFloat(fueling.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>{fueling.quilometragem}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpen(fueling)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(fueling.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar Abastecimento' : 'Novo Abastecimento'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Data"
              name="data"
              type="date"
              value={formData.data}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
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
                    {vehicle.marca} {vehicle.modelo} - {vehicle.placa}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Posto</InputLabel>
              <Select
                name="postoId"
                value={formData.postoId}
                onChange={handleChange}
                label="Posto"
              >
                {gasStations.map((station) => (
                  <MenuItem key={station.id} value={station.id}>
                    {station.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Tipo de Combustível</InputLabel>
              <Select
                name="tipoCombustivel"
                value={formData.tipoCombustivel}
                onChange={handleChange}
                label="Tipo de Combustível"
              >
                <MenuItem value="Diesel_S500">Diesel S500</MenuItem>
                <MenuItem value="Diesel_S10">Diesel S10</MenuItem>
                <MenuItem value="Arla">Arla</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Quantidade de Litros"
              name="litros"
              type="number"
              value={formData.litros}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Valor Total"
              name="valorTotal"
              type="number"
              value={formData.valorTotal}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Quilometragem"
              name="quilometragem"
              type="number"
              value={formData.quilometragem}
              onChange={handleChange}
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

      <Notification
        open={notifOpen}
        message={notifMessage}
        severity={notifSeverity}
        onClose={() => setNotifOpen(false)}
      />
    </Box>
  );
}

export default Fuelings;
