import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { supplierService } from '../services/mockData';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nome: '', servico: '', localizacao: '', contato: '' });

  useEffect(() => { setSuppliers(supplierService.getAll()); }, []);

  const handleOpen = (supplier = null) => {
    if (supplier) {
      setFormData(supplier); setEditingId(supplier.id);
    } else {
      setFormData({ nome: '', servico: '', localizacao: '', contato: '' }); setEditingId(null);
    }
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditingId(null); };

  const handleChange = e => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleSubmit = () => {
    editingId
      ? supplierService.update(editingId, formData)
      : supplierService.create(formData);
    setSuppliers(supplierService.getAll());
    handleClose();
  };

  const handleDelete = id => {
    if (window.confirm('Excluir este fornecedor/oficina?')) {
      supplierService.delete(id);
      setSuppliers(supplierService.getAll());
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Fornecedores/Oficinas</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Novo
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Serviço Oferecido</TableCell>
              <TableCell>Localização</TableCell>
              <TableCell>Contato</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map(supplier => (
              <TableRow key={supplier.id}>
                <TableCell>{supplier.nome}</TableCell>
                <TableCell>{supplier.servico}</TableCell>
                <TableCell>{supplier.localizacao}</TableCell>
                <TableCell>{supplier.contato}</TableCell>
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
        <DialogTitle>{editingId ? 'Editar' : 'Novo Fornecedor/Oficina'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField label="Nome" name="nome" value={formData.nome} onChange={handleChange} fullWidth />
            <TextField label="Serviço Oferecido" name="servico" value={formData.servico} onChange={handleChange} fullWidth />
            <TextField label="Localização" name="localizacao" value={formData.localizacao} onChange={handleChange} fullWidth />
            <TextField label="Contato" name="contato" value={formData.contato} onChange={handleChange} fullWidth />
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
