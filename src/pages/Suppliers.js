import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { supplierService } from '../services/services';
import Notification from '../components/common/Notification';
import { useLoading } from '../services/helpers/useLoading';
import { handleError } from '../services/helpers/handleError';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
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
        const data = await supplierService.getAll();
        // Garante que data seja sempre um array
        const arrayData = Array.isArray(data) ? data : [];
        // Garante que todos os objetos tenham todas as propriedades necessárias
        const normalizedData = arrayData.map(supplier => ({
          id: supplier?.id,
          name: supplier?.name || '',
          document: supplier?.document || '',
          cep: supplier?.cep || '',
          street: supplier?.street || '',
          number: supplier?.number || '',
          neighborhood: supplier?.neighborhood || '',
          city: supplier?.city || '',
          state: supplier?.state || '',
          contact: supplier?.contact || ''
        }));
        setSuppliers(normalizedData);
      } catch (err) {
        handleError(err, setError);
        showNotification(err.message || 'Erro ao carregar os fornecedores', 'error');
      }
    });
  };

  const handleOpen = (supplier = null) => {
    if (supplier) {
      setFormData(supplier); setEditingId(supplier.id);
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
          await supplierService.update(editingId, formData);
          showNotification('Forncedor atualizado com sucesso!');
        } else {
          await supplierService.create(formData);
          showNotification('Fornecedor cadastrado com sucesso!');
        }
        await loadData();
        handleClose();
      })();
    } catch (err) {
      handleError(err, setError);
      showNotification(err.message || 'Erro ao salvar fornecedor', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este forncedor?')) return;
    
    try {
      await withLoading(async () => {
        await supplierService.delete(id);
        showNotification('Fornecedor excluído com sucesso!');
        await loadData();
      })();
    } catch (err) {
      handleError(err, setError);
      showNotification(err.message || 'Erro ao excluir fornecedor', 'error');
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
            {suppliers.map(supplier => (
              <TableRow key={supplier.id}>
                <TableCell>{supplier.name || '-'}</TableCell>
                <TableCell>{formatDocument(supplier.document)}</TableCell>
                <TableCell>{formatCityState(supplier.city, supplier.state)}</TableCell>
                <TableCell>{supplier.contact || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpen(supplier)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(supplier.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar Forncedor' : 'Novo Forncedor'}</DialogTitle>
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
