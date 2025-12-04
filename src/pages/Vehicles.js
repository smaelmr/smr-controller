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
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { vehicleService } from '../services/services';

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    ano: '',
    tipo: '',
    placa: '',
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getAll();
      
      // Trata diferentes formatos de resposta da API
      if (Array.isArray(data)) {
        setVehicles(data);
      } else if (data?.data && Array.isArray(data.data)) {
        setVehicles(data.data);
      } else {
        console.error('Formato inesperado:', data);
        setVehicles([]);
      }
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      setVehicles([]);
    }
  };

  const handleOpen = (vehicle = null) => {
    if (vehicle) {
      setFormData(vehicle);
      setEditingId(vehicle.id);
    } else {
      setFormData({ marca: '', modelo: '', ano: '', tipo: '', placa: '' });
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
      const dataToSend = {
      ...formData,
      ano: parseInt(formData.ano, 10) || 0, // Converte para inteiro
    };

      if (editingId) {
        await vehicleService.update(editingId, dataToSend);
      } else {
        await vehicleService.create(dataToSend);
      }
      await loadVehicles();
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      alert('Erro ao salvar veículo');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Deseja realmente excluir este veículo?')) {
      try {
        await vehicleService.delete(id);
        await loadVehicles();
      } catch (error) {
        console.error('Erro ao excluir veículo:', error);
        alert('Erro ao excluir veículo');
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Veículos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Novo Veículo
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Marca</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>Ano</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Placa</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(vehicles || []).map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>{vehicle.marca}</TableCell>
                <TableCell>{vehicle.modelo}</TableCell>
                <TableCell>{vehicle.ano}</TableCell>
                <TableCell>{vehicle.tipo}</TableCell>
                <TableCell>{vehicle.placa}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpen(vehicle)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(vehicle.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar Veículo' : 'Novo Veículo'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Marca"
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Modelo"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Ano"
              name="ano"
              type="number"
              value={formData.ano}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Placa"
              name="placa"
              value={formData.placa}
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
    </Box>
  );
}

export default Vehicles;
