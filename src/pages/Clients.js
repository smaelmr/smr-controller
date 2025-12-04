import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { clientService } from '../services/services';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    cep: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    contact: ''
  });

    useEffect(() => {
      loadClients();
    }, []);

  const loadClients = async () => {
    try {
      const data = await clientService.getAll();
      
      // Garante que data seja sempre um array
      let arrayData = [];
      if (Array.isArray(data)) {
        arrayData = data;
      } else if (data?.data && Array.isArray(data.data)) {
        arrayData = data.data;
      }

      // Normaliza os dados
      const normalizedData = arrayData.map(client => ({
        id: client?.id,
        name: client?.name || '',
        document: client?.document || '',
        cep: client?.cep || '',
        street: client?.street || '',
        number: client?.number || '',
        neighborhood: client?.neighborhood || '',
        city: client?.city || '',
        state: client?.state || '',
        contact: client?.contact || ''
      }));
      
      setClients(normalizedData);
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
      setClients([]);
    }
  };

  const handleOpen = (client = null) => {
    if (client) {
      setFormData(client); setEditingId(client.id);
    } else {
      setFormData({
        name: '',
        document: '',
        cep: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        contact: ''
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
          street: data.street || '',
          neighborhood: data.neighborhood || '',
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
      if (editingId) {
        await clientService.update(editingId, formData);
      } else {
        await clientService.create(formData);
      }
      await loadClients(); // Usa a função loadClients que já tem tratamento de erro
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este cliente?')) return;
    
    try {
      await clientService.delete(id);
      await loadClients(); // Usa a função loadClients que já tem tratamento de erro
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Clientes</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Novo Cliente
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome/Razão Social</TableCell>
              <TableCell>CNPJ/CPF</TableCell>
              <TableCell>Endereço</TableCell>
              <TableCell>Contato</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map(client => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.document}</TableCell>
                <TableCell>
                  {client.street}, {client.number} - {client.neighborhood}, {client.city}/{client.state}
                </TableCell>
                <TableCell>{client.contact}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpen(client)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(client.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField label="Nome/Razão Social" name="name" value={formData.name} onChange={handleChange} fullWidth />
            <TextField label="CNPJ/CPF" name="document" value={formData.document} onChange={handleChange} fullWidth />
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
            <TextField label="Contato" name="contact" value={formData.contact} onChange={handleChange} fullWidth />
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
