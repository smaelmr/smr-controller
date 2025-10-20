import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { driverService } from '../services/services';
import { formatDatesToISO, formatDatesFromISO } from '../services/helpers/dateUtils';

// Campos que contêm datas neste componente
const DATE_FIELDS = ['cnhValidity'];

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    phoneNumber: '',
    cnhCategory: '',
    cnhValidity: '',
    cep: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    observations: ''
  });

  useEffect(() => { loadDrivers(); }, []);

  const loadDrivers = async () => {
    try {
      const data = await driverService.getAll();
      // Garante que data seja sempre um array
      let arrayData = [];
      if (Array.isArray(data)) {
        arrayData = data;
      } else if (data?.data && Array.isArray(data.data)) {
        arrayData = data.data;
      }

      // Normaliza os dados
      const normalizedData = arrayData.map(driver => {
        // Primeiro cria um objeto com valores padrão
        const normalizedDriver = {
          id: driver?.id,
          name: driver?.name || '',
          document: driver?.document || '',
          phoneNumber: driver?.phoneNumber || '',
          cnhCategory: driver?.cnhCategory || '',
          cnhValidity: driver?.cnhValidity || '',
          cep: driver?.cep || '',
          street: driver?.street || '',
          number: driver?.number || '',
          neighborhood: driver?.neighborhood || '',
          city: driver?.city || '',
          state: driver?.state || '',
          observations: driver?.observations || ''
        };
        
        // Depois formata as datas
        return formatDatesFromISO(normalizedDriver, DATE_FIELDS);
      });
      
      setDrivers(normalizedData);
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      setDrivers([]);
    }
  };

  const handleOpen = (driver = null) => {
    if (driver) {
      setFormData(driver); setEditingId(driver.id);
    } else {
      setFormData({
        name: '',
        document: '',
        phoneNumber: '',
        cnhCategory: '',
        cnhValidity: '',
        cep: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        observations: ''
      }); setEditingId(null);
    }
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditingId(null); };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Se o campo alterado for CEP e tiver 8 dígitos, buscar endereço
    if (name === 'cep' && value.length === 8) {
      fetchAddress(value);
    }
  };

  const fetchAddress = async (cep) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || ''
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      // Formata todas as datas para ISO
      const dataToSubmit = formatDatesToISO(formData, DATE_FIELDS);

      if (editingId) {
        await driverService.update(editingId, dataToSubmit);
      } else {
        await driverService.create(dataToSubmit);
      }
      await loadDrivers(); // Usa a função loadDrivers que já tem tratamento de erro
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar motorista:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este motorista?')) return;
    
    try {
      await driverService.delete(id);
      await loadDrivers(); // Usa a função loadDrivers que já tem tratamento de erro
    } catch (error) {
      console.error('Erro ao excluir motorista:', error);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Motoristas</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Novo Motorista
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>CNH Categoria</TableCell>
              <TableCell>CNH Validade</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {drivers.map(driver => (
              <TableRow key={driver.id}>
                <TableCell>{driver.name}</TableCell>
                <TableCell>{driver.document}</TableCell>
                <TableCell>{driver.phoneNumber}</TableCell>
                <TableCell>{driver.cnhCategory}</TableCell>
                <TableCell>{driver.cnhValidity}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpen(driver)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(driver.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar Motorista' : 'Novo Motorista'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField label="Nome" name="name" value={formData.name} onChange={handleChange} fullWidth />
            <TextField label="CPF" name="document" value={formData.document} onChange={handleChange} fullWidth />
            <TextField label="Telefone" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} fullWidth />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField label="Categoria CNH" name="cnhCategory" value={formData.cnhCategory} onChange={handleChange} fullWidth />
              <TextField
                label="Validade CNH"
                name="cnhValidity"
                type="date"
                value={formData.cnhValidity}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
            <TextField label="CEP" name="cep" value={formData.cep} onChange={handleChange} fullWidth />
            <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 2 }}>
              <TextField label="Logradouro" name="street" value={formData.street} onChange={handleChange} fullWidth />
              <TextField label="Número" name="number" value={formData.number} onChange={handleChange} fullWidth />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <TextField label="Bairro" name="neighborhood" value={formData.neighborhood} onChange={handleChange} fullWidth />
              <TextField label="Cidade" name="city" value={formData.city} onChange={handleChange} fullWidth />
              <TextField label="Estado" name="state" value={formData.state} onChange={handleChange} fullWidth />
            </Box>
            <TextField
              label="Observações"
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
