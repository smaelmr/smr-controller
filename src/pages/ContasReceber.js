import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Select, MenuItem,
  FormControl, InputLabel, Checkbox, Grid
} from '@mui/material';
import { Add, Edit, Delete, Visibility, Payment, FilterList, Clear } from '@mui/icons-material';
import { receivableService, clientService } from '../services/services';
import CurrencyInput from '../components/common/CurrencyInput';
import Notification from '../components/common/Notification';
import { useLoading } from '../services/helpers/useLoading';
import { handleError } from '../services/helpers/handleError'

export default function ContasReceber() {
  const [receivables, setReceivables] = useState([]);
  const [filteredReceivables, setFilteredReceivables] = useState([]);
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState(null);
  const [quitAmount, setQuitAmount] = useState('');
  const [quitDate, setQuitDate] = useState('');

  const [formData, setFormData] = useState({
    clienteId: '',
    valor: '',
    numeroDocumento: '',
    dataLancamento: '',
    dataVencimento: '',
    dataRecebimento: '',
    origem: 'Manual',
    referencia: '',
    observacao: '',
    recebido: false,
  });

  const [filters, setFilters] = useState({
    dataInicial: '',
    dataFinal: '',
    clienteId: '',
    numeroDocumento: '',
    recebido: '',
  });

  const [editingId, setEditingId] = useState(null);

    // Helpers
  const [loading, withLoading] = useLoading();
  const [error, setError] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSeverity, setNotifSeverity] = useState('success');

  const showNotification = (message, severity = 'success') => {
    setNotifMessage(message);
    setNotifSeverity(severity);
    setNotifOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      await withLoading(async () => {
        try {
          const [rec, cli] = await Promise.all([
            receivableService.getAll(),
            clientService.getAll(),
          ]);
          setReceivables(rec);
          setClients(cli);
        } catch (err) {
          handleError(err, setError);
          showNotification(err.message || 'Erro ao carregar dados', 'error');
        }
      });
    };
    fetchData();
  }, []);


  useEffect(() => {
    applyFilters();
  }, [receivables, filters]);


  const applyFilters = () => {
    let filtered = [...receivables];
    if (filters.dataInicial) filtered = filtered.filter(i => i.dataLancamento >= filters.dataInicial);
    if (filters.dataFinal) filtered = filtered.filter(i => i.dataLancamento <= filters.dataFinal);
    if (filters.clienteId) filtered = filtered.filter(i => i.clienteId === parseInt(filters.clienteId));
    if (filters.numeroDocumento) filtered = filtered.filter(i =>
      i.numeroDocumento?.toLowerCase().includes(filters.numeroDocumento.toLowerCase())
    );
    if (filters.recebido !== '') filtered = filtered.filter(i => i.recebido === (filters.recebido === 'true'));
    setFilteredReceivables(filtered);
  };

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const clearFilters = () => setFilters({ dataInicial:'', dataFinal:'', clienteId:'', numeroDocumento:'', recebido:'' });

  const handleOpen = (item = null) => {
    if (item) {
      setFormData(item);
      setEditingId(item.id);
    } else {
      setFormData({
        clienteId: '', valor: '', numeroDocumento: '', dataLancamento: '', dataVencimento: '', dataRecebimento: '', origem: 'Manual', referencia: '', observacao: '', recebido: false
      });
      setEditingId(null);
    }
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditingId(null); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = () => {
    withLoading(async () => {
      try {
        if (editingId) {
          await receivableService.update(editingId, formData);
          showNotification('Lançamento atualizado com sucesso!');
        } else {
          await receivableService.create(formData);
          showNotification('Lançamento criado com sucesso!');
        }
        const rec = await receivableService.getAll();
        setReceivables(rec);
        handleClose();
      } catch (err) {
        handleError(err, setError);
        showNotification(err.message || 'Erro ao salvar lançamento', 'error');
      }
    })();
  };

  const handleDelete = (id) => {
    if (!window.confirm('Excluir este lançamento?')) return;
    withLoading(async () => {
      try {
        await receivableService.delete(id);
        showNotification('Lançamento excluído com sucesso!');
        const rec = await receivableService.getAll();
        setReceivables(rec);
      } catch (err) {
        handleError(err, setError);
        showNotification(err.message || 'Erro ao excluir', 'error');
      }
    })();
  };

  const handleViewOpen = (item) => { setSelectedReceivable(item); setViewOpen(true); };
  const handleViewClose = () => { setViewOpen(false); setSelectedReceivable(null); };

  const handleQuitOpen = (item) => {
    setSelectedReceivable(item);
    setQuitAmount('');
    setQuitDate('');
    setQuitOpen(true);
  };
  const handleQuitClose = () => { setQuitOpen(false); setSelectedReceivable(null); };

  const handleQuitSubmit = () => {
    if (!selectedReceivable || !quitAmount || !quitDate) {
      showNotification('Informe valor e data do recebimento para quitar.', 'warning');
      return;
    }
    const valorRecebido = parseFloat(quitAmount);
    const valorTotal = parseFloat(selectedReceivable.valor);
    if (valorRecebido <= 0 || valorRecebido > valorTotal) {
      showNotification('Valor inválido para o recebimento.', 'warning');
      return;
    }

    withLoading(async () => {
      try {
        if (valorRecebido === valorTotal) {
          // Quitação total
          await receivableService.update(selectedReceivable.id, {
            ...selectedReceivable,
            valor: valorRecebido.toString(),
            dataRecebimento: quitDate,
            recebido: true,
            observacao: `${selectedReceivable.observacao || ''} [Quitado em ${quitDate}]`.trim(),
          });
        } else {
          // Quitação parcial com saldo remanescente
          const saldo = valorTotal - valorRecebido;
          await receivableService.update(selectedReceivable.id, {
            ...selectedReceivable,
            valor: valorRecebido.toString(),
            dataRecebimento: quitDate,
            recebido: true,
            observacao: `${selectedReceivable.observacao || ''} [Quitado parcialmente em ${quitDate}]`.trim(),
          });
          await receivableService.create({
            clienteId: selectedReceivable.clienteId,
            valor: saldo.toString(),
            numeroDocumento: selectedReceivable.numeroDocumento,
            dataLancamento: selectedReceivable.dataLancamento,
            dataVencimento: selectedReceivable.dataVencimento,
            origem: 'Saldo restante',
            referencia: selectedReceivable.id,
            observacao: `Saldo restante (Ref: #${selectedReceivable.id})`,
            recebido: false,
          });
        }
        const rec = await receivableService.getAll();
        setReceivables(rec);
        showNotification('Quitação realizada com sucesso!');
        handleQuitClose();
      } catch (err) {
        handleError(err, setError);
        showNotification(err.message || 'Erro na quitação', 'error');
      }
    })();
  };

  const getClientName = (id) => {
    const client = clients.find(c => c.id === id);
    return client ? client.nomeRazao : '-';
  };

  return (
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Contas a Receber</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Novo Lançamento
        </Button>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <FilterList sx={{ mr: 1 }} />
          <Typography variant="h6">Filtros</Typography>
        </Box>
        <Grid container spacing={2}>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Data Inicial"
              name="dataInicial"
              type="date"
              value={filters.dataInicial}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Data Final"
              name="dataFinal"
              type="date"
              value={filters.dataFinal}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
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
                {clients.map(client => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.nomeRazao}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Número do Documento"
              name="numeroDocumento"
              value={filters.numeroDocumento}
              onChange={handleFilterChange}
              fullWidth
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                name="recebido"
                value={filters.recebido}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Recebido</MenuItem>
                <MenuItem value="false">Pendente</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={1}>
            <Button
              onClick={clearFilters}
              variant="outlined"
              startIcon={<Clear />}
              fullWidth
              sx={{ minWidth: 120 }}
            >
              Limpar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabela */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Nº Documento</TableCell>
              <TableCell>Valor (R$)</TableCell>
              <TableCell>Data Lançamento</TableCell>
              <TableCell>Data Vencimento</TableCell>
              <TableCell>Data Recebimento</TableCell>
              <TableCell>Recebido?</TableCell>
              <TableCell>Origem</TableCell>
              <TableCell>Observação</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReceivables.map(item => (
              <TableRow key={item.id} hover>
                <TableCell>{getClientName(item.clienteId)}</TableCell>
                <TableCell>{item.numeroDocumento || '-'}</TableCell>
                <TableCell>R$ {parseFloat(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>{item.dataLancamento || '-'}</TableCell>
                <TableCell>{item.dataVencimento || '-'}</TableCell>
                <TableCell>{item.dataRecebimento || '-'}</TableCell>
                <TableCell>
                  <Checkbox checked={item.recebido} disabled />
                </TableCell>
                <TableCell>{item.origem}</TableCell>
                <TableCell>{item.observacao || '-'}</TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                  <IconButton color="info" onClick={() => handleViewOpen(item)} title="Visualizar">
                    <Visibility />
                  </IconButton>
                  {!item.recebido && (
                    <>
                      <IconButton color="success" onClick={() => handleQuitOpen(item)} title="Quitar">
                        <Payment />
                      </IconButton>
                      <IconButton color="primary" onClick={() => handleOpen(item)} title="Editar">
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(item.id)} title="Excluir">
                        <Delete />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>


      {/* Modal Cadastro/Edição */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Cliente</InputLabel>
              <Select name="clienteId" value={formData.clienteId} onChange={handleChange} label="Cliente">
                {clients.map(client => (
                  <MenuItem key={client.id} value={client.id}>{client.nomeRazao}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <CurrencyInput label="Valor" name="valor" value={formData.valor} onChange={handleChange} fullWidth />

            <TextField
              label="Número do Documento"
              name="numeroDocumento"
              value={formData.numeroDocumento}
              onChange={handleChange}
              fullWidth
              size="small"
            />

            <TextField
              label="Data de Lançamento"
              name="dataLancamento"
              type="date"
              value={formData.dataLancamento}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />

            <TextField
              label="Data de Vencimento"
              name="dataVencimento"
              type="date"
              value={formData.dataVencimento}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />

            {/* Data de Recebimento omitida na criação/edição */}

            <TextField
              label="Observação"
              name="observacao"
              value={formData.observacao}
              onChange={handleChange}
              multiline rows={3}
              fullWidth
              size="small"
            />

            <FormControl>
              <Box display="flex" alignItems="center">
                <Checkbox name="recebido" checked={formData.recebido} onChange={handleChange} />
                <Typography>Recebido</Typography>
              </Box>
            </FormControl>

          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Detalhes */}
      <Dialog open={viewOpen} onClose={handleViewClose} maxWidth="sm" fullWidth>
        <DialogTitle>Detalhes do Lançamento</DialogTitle>
        <DialogContent dividers>
          {selectedReceivable && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
              <Typography><strong>Cliente:</strong> {getClientName(selectedReceivable.clienteId)}</Typography>
              <Typography><strong>Número do Documento:</strong> {selectedReceivable.numeroDocumento || '-'}</Typography>
              <Typography><strong>Valor:</strong> R$ {parseFloat(selectedReceivable.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Typography>
              <Typography><strong>Data de Lançamento:</strong> {selectedReceivable.dataLancamento || '-'}</Typography>
              <Typography><strong>Data de Vencimento:</strong> {selectedReceivable.dataVencimento || '-'}</Typography>
              <Typography><strong>Data de Recebimento:</strong> {selectedReceivable.dataRecebimento || '-'}</Typography>
              <Typography><strong>Status:</strong> {selectedReceivable.recebido ? 'Recebido' : 'Pendente'}</Typography>
              <Typography><strong>Origem:</strong> {selectedReceivable.origem}</Typography>
              <Typography><strong>Observação:</strong> {selectedReceivable.observacao || '-'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewClose} variant="contained">Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Quitação */}
      <Dialog open={quitOpen} onClose={handleQuitClose} maxWidth="sm" fullWidth>
        <DialogTitle>Quitar Conta</DialogTitle>
        <DialogContent>
          {selectedReceivable && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography><strong>Valor Total:</strong> R$ {parseFloat(selectedReceivable.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Typography>
              <CurrencyInput label="Valor Recebido" value={quitAmount} onChange={e => setQuitAmount(e.target.value)} fullWidth />
              <TextField label="Data Recebimento" type="date" value={quitDate} onChange={e => setQuitDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth size="small" />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleQuitClose}>Cancelar</Button>
          <Button onClick={handleQuitSubmit} variant="contained" color="success">Confirmar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
