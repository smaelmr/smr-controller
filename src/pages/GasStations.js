import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { gasStationService } from '../services/services';
import Notification from '../components/common/Notification';
import { useLoading } from '../services/helpers/useLoading';
import { handleError } from '../services/helpers/handleError';

export default function GasStations() {
  const [stations, setStations] = useState([]);
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

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    await withLoading(async () => {
      try {
        const data = await gasStationService.getAll();
        // Garante que data seja sempre um array
        const arrayData = Array.isArray(data) ? data : [];
        // Garante que todos os objetos tenham todas as propriedades necessárias
        const normalizedData = arrayData.map(station => ({
          id: station?.id,
          name: station?.name || '',
          document: station?.document || '',
          cep: station?.cep || '',
          street: station?.street || '',
          number: station?.number || '',
          neighborhood: station?.neighborhood || '',
          city: station?.city || '',
          state: station?.state || '',
          contact: station?.contact || ''
        }));
        setStations(normalizedData);
      } catch (err) {
        handleError(err, setError);
        showNotification(err.message || 'Erro ao carregar postos', 'error');
      }
    });
  };

  const handleOpen = (station = null) => {
    if (station) {
      setFormData(station); setEditingId(station.id);
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
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || ''
        }));
      }
    } catch (error) {
      showNotification('Erro ao buscar CEP', 'error');
    }
  };

  const handleSubmit = async () => {
    try {
      await withLoading(async () => {
        if (editingId) {
          await gasStationService.update(editingId, formData);
          showNotification('Posto atualizado com sucesso!');
        } else {
          await gasStationService.create(formData);
          showNotification('Posto cadastrado com sucesso!');
        }
        await loadData();
        handleClose();
      })();
    } catch (err) {
      handleError(err, setError);
      showNotification(err.message || 'Erro ao salvar posto', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este posto?')) return;
    
    try {
      await withLoading(async () => {
        await gasStationService.delete(id);
        showNotification('Posto excluído com sucesso!');
        await loadData();
      })();
    } catch (err) {
      handleError(err, setError);
      showNotification(err.message || 'Erro ao excluir posto', 'error');
    }
  };

  const formatCityState = (city, state) => {
    if (!city && !state) return '-';
    if (!city) return state || '-';
    if (!state) return city;
    return `${city}/${state}`;
  };

  const formatDocument = (doc) => {
    if (!doc) return '-';
    // Remove caracteres não numéricos
    const numbers = doc.replace(/\D/g, '');
    // Formata CNPJ: 00.000.000/0000-00
    if (numbers.length === 14) {
      return numbers.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5'
      );
    }
    return doc;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Postos de Combustível</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Novo Posto
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>CNPJ</TableCell>
              <TableCell>Cidade</TableCell>
              <TableCell>Contato</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stations.map(station => (
              <TableRow key={station.id}>
                <TableCell>{station.name || '-'}</TableCell>
                <TableCell>{formatDocument(station.document)}</TableCell>
                <TableCell>{formatCityState(station.city, station.state)}</TableCell>
                <TableCell>{station.contact || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpen(station)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(station.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar Posto' : 'Novo Posto'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField label="Nome" name="name" value={formData.name} onChange={handleChange} fullWidth />
            <TextField label="CNPJ" name="document" value={formData.document} onChange={handleChange} fullWidth />
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

      <Notification
        open={notifOpen}
        message={notifMessage}
        severity={notifSeverity}
        onClose={() => setNotifOpen(false)}
      />
    </Box>
  );
}
