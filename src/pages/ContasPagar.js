import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Select, MenuItem, FormControl, InputLabel, Checkbox, Chip, Grid
} from '@mui/material';
import { Add, Edit, Delete, FilterList, Clear, Payment } from '@mui/icons-material';
import { payablesService, supplierService, gasStationService } from '../services/mockData';
import CurrencyInput from '../components/common/CurrencyInput';

export default function ContasPagar() {
  const [payables, setPayables] = useState([]);
  const [filteredPayables, setFilteredPayables] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [gasStations, setGasStations] = useState([]);
  const [open, setOpen] = useState(false);
  const [partialPaymentOpen, setPartialPaymentOpen] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState(null);
  const [partialAmount, setPartialAmount] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    categoria: 'Manutenção',
    fornecedorId: '',
    valor: '',
    dataLancamento: '',
    dataVencimento: '',
    dataPagamento: '',
    numeroDocumento: '',
    origem: 'Manual',
    referencia: '',
    observacao: '',
    pago: false,
  });

  // Estados dos filtros
  const [filters, setFilters] = useState({
    dataInicial: '',
    dataFinal: '',
    fornecedorId: '',
    categoria: '',
  });

  const categorias = [
    'Manutenção',
    'Pneus',
    'Investimento',
    'Empréstimo',
    'Financiamento',
    'Troca de Óleo',
    'Abastecimento',
    'Salário'
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payables, filters]);

  const loadData = () => {
    const allPayables = payablesService.getAll();
    setPayables(allPayables);
    setSuppliers(supplierService.getAll());
    setGasStations(gasStationService.getAll());
  };

  const applyFilters = () => {
    let filtered = [...payables];

    if (filters.dataInicial) {
      filtered = filtered.filter(item => 
        item.dataVencimento >= filters.dataInicial
      );
    }

    if (filters.dataFinal) {
      filtered = filtered.filter(item => 
        item.dataVencimento <= filters.dataFinal
      );
    }

    if (filters.fornecedorId) {
      filtered = filtered.filter(item => 
        item.fornecedorId === filters.fornecedorId
      );
    }

    if (filters.categoria) {
      filtered = filtered.filter(item => 
        item.categoria === filters.categoria
      );
    }

    setFilteredPayables(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      dataInicial: '',
      dataFinal: '',
      fornecedorId: '',
      categoria: '',
    });
  };

  const handleOpen = (item = null) => {
    if (item) {
      setFormData(item);
      setEditingId(item.id);
    } else {
      setFormData({
        categoria: 'Manutenção',
        fornecedorId: '',
        valor: '',
        dataLancamento: '',
        dataVencimento: '',
        dataPagamento: '',
        numeroParcelas: 1,
        numeroDocumento: '',
        origem: 'Manual',
        referencia: '',
        observacao: '',
        pago: false,
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
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = () => {
    if (editingId) {
      payablesService.update(editingId, formData);
    } else {
      payablesService.create(formData);
    }
    loadData();
    handleClose();
  };

  const handleDelete = (id) => {
    if (window.confirm('Excluir este lançamento?')) {
      payablesService.delete(id);
      loadData();
    }
  };

  // Função para abrir diálogo de pagamento parcial
  const handlePartialPaymentOpen = (payable) => {
    setSelectedPayable(payable);
    setPartialAmount('');
    setPartialPaymentOpen(true);
  };

  const handlePartialPaymentClose = () => {
    setPartialPaymentOpen(false);
    setSelectedPayable(null);
    setPartialAmount('');
  };

  // Processar pagamento parcial
  const handlePartialPaymentSubmit = () => {
    if (!selectedPayable || !partialAmount) {
      alert('Informe o valor do pagamento');
      return;
    }

    const valorPago = parseFloat(partialAmount);
    const valorTotal = parseFloat(selectedPayable.valor);

    if (valorPago <= 0 || valorPago >= valorTotal) {
      alert('O valor do pagamento parcial deve ser maior que zero e menor que o valor total');
      return;
    }

    const valorRestante = valorTotal - valorPago;
    const hoje = new Date().toISOString().split('T')[0];

    // Atualizar conta original como paga parcialmente
    payablesService.update(selectedPayable.id, {
      ...selectedPayable,
      valor: valorPago.toString(),
      dataPagamento: hoje,
      pago: true,
      observacao: `${selectedPayable.observacao || ''} [Pagamento Parcial - Valor Original: R$ ${valorTotal.toFixed(2)}]`.trim(),
    });

    // Criar nova conta com o saldo restante
    payablesService.create({
      categoria: selectedPayable.categoria,
      fornecedorId: selectedPayable.fornecedorId,
      valor: valorRestante.toString(),
      dataLancamento: hoje,
      dataVencimento: selectedPayable.dataVencimento,
      dataPagamento: '',
      numeroDocumento: selectedPayable.numeroDocumento,
      origem: 'Saldo de Pagamento Parcial',
      referencia: selectedPayable.id,
      observacao: `Saldo restante da conta original (Ref: #${selectedPayable.id})`,
      pago: false,
    });

    loadData();
    handlePartialPaymentClose();
  };

  const getFornecedorName = (fornecedorId) => {
    if (!fornecedorId) return '-';
    
    if (typeof fornecedorId === 'string' && fornecedorId.includes('-')) {
      const [type, id] = fornecedorId.split('-');
      const numericId = parseInt(id);
      
      if (type === 'supplier') {
        const supplier = suppliers.find(s => s.id === numericId);
        return supplier ? supplier.nome : '-';
      } else if (type === 'station') {
        const station = gasStations.find(g => g.id === numericId);
        return station ? station.nome : '-';
      }
    }
    
    const numericId = typeof fornecedorId === 'number' ? fornecedorId : parseInt(fornecedorId);
    
    const supplier = suppliers.find(s => s.id === numericId);
    if (supplier) return supplier.nome;
    
    const station = gasStations.find(g => g.id === numericId);
    if (station) return station.nome;
    
    return '-';
  };

  const getCategoriaColor = (categoria) => {
    const colors = {
      'Manutenção': 'primary',
      'Pneus': 'secondary',
      'Investimento': 'success',
      'Empréstimo': 'warning',
      'Financiamento': 'warning',
      'Troca de Óleo': 'info',
      'Abastecimento': 'error',
      'Salário': 'default'
    };
    return colors[categoria] || 'default';
  };

  const allFornecedores = [
    ...suppliers.map(s => ({ ...s, uniqueId: `supplier-${s.id}` })),
    ...gasStations.map(g => ({ ...g, uniqueId: `station-${g.id}` }))
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Contas a Pagar</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Novo Lançamento Manual
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
          <Grid item xs={12} sm={6} md={2.5}>
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
              <InputLabel>Fornecedor</InputLabel>
              <Select
                name="fornecedorId"
                value={filters.fornecedorId}
                onChange={handleFilterChange}
                label="Fornecedor"
              >
                <MenuItem value="">Todos</MenuItem>
                {allFornecedores.map((fornecedor) => (
                  <MenuItem key={fornecedor.uniqueId} value={fornecedor.uniqueId}>
                    {fornecedor.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Categoria</InputLabel>
              <Select
                name="categoria"
                value={filters.categoria}
                onChange={handleFilterChange}
                label="Categoria"
              >
                <MenuItem value="">Todas</MenuItem>
                {categorias.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
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
            Exibindo {filteredPayables.length} de {payables.length} registros
          </Typography>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Categoria</TableCell>
              <TableCell>Fornecedor</TableCell>
              <TableCell>Valor (R$)</TableCell>
              <TableCell>Data Lançamento</TableCell>
              <TableCell>Data Vencimento</TableCell>
              <TableCell>Data Pagamento</TableCell>
              <TableCell>Pago?</TableCell>
              <TableCell>Origem</TableCell>
              <TableCell>Observação</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayables.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Chip 
                    label={item.categoria} 
                    color={getCategoriaColor(item.categoria)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>{getFornecedorName(item.fornecedorId)}</TableCell>
                <TableCell>
                  {parseFloat(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>{item.dataLancamento}</TableCell>
                <TableCell>{item.dataVencimento}</TableCell>
                <TableCell>{item.dataPagamento || '-'}</TableCell>
                <TableCell>
                  <Checkbox checked={item.pago} disabled />
                </TableCell>
                <TableCell>{item.origem}</TableCell>
                <TableCell>{item.observacao}</TableCell>
                <TableCell align="right">
                  {!item.pago && (
                    <IconButton 
                      color="success" 
                      onClick={() => handlePartialPaymentOpen(item)}
                      title="Pagamento Parcial"
                    >
                      <Payment />
                    </IconButton>
                  )}
                  <IconButton color="primary" onClick={() => handleOpen(item)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(item.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar Conta a Pagar' : 'Novo Lançamento'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                label="Categoria"
              >
                {categorias.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Fornecedor</InputLabel>
              <Select
                name="fornecedorId"
                value={formData.fornecedorId}
                onChange={handleChange}
                label="Fornecedor"
              >
                {allFornecedores.map((fornecedor) => (
                  <MenuItem key={fornecedor.uniqueId} value={fornecedor.uniqueId}>
                    {fornecedor.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <CurrencyInput
              label="Valor"
              name="valor"
              value={formData.valor}
              onChange={handleChange}
              fullWidth
            />

            <TextField 
              label="Quantidade de Parcelas" 
              name="numeroParcelas" 
              value={formData.numeroParcelas} 
              onChange={handleChange} fullWidth 
            />

            <CurrencyInput
              label="Valor da Parcela"
              name="valorParcela"
              value={formData.valor}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Data Lançamento"
              name="dataLancamento"
              type="date"
              value={formData.dataLancamento}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Data Vencimento"
              name="dataVencimento"
              type="date"
              value={formData.dataVencimento}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField 
              label="Número do Documento" 
              name="numeroDocumento" 
              value={formData.numeroDocumento} 
              onChange={handleChange} fullWidth 
            />

            <TextField
              label="Data Pagamento"
              name="dataPagamento"
              type="date"
              value={formData.dataPagamento}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Observação"
              name="observacao"
              value={formData.observacao}
              onChange={handleChange}
              multiline
              rows={2}
              fullWidth
            />

            <FormControl>
              <Box display="flex" alignItems="center">
                <Checkbox
                  name="pago"
                  checked={formData.pago}
                  onChange={handleChange}
                />
                <Typography>Pago</Typography>
              </Box>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Pagamento Parcial */}
      <Dialog open={partialPaymentOpen} onClose={handlePartialPaymentClose} maxWidth="sm" fullWidth>
        <DialogTitle>Pagamento Parcial</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {selectedPayable && (
              <>
                <Typography variant="body1">
                  <strong>Valor Total:</strong> R$ {parseFloat(selectedPayable.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Informe o valor que está sendo pago. O saldo restante será lançado como uma nova conta em aberto.
                </Typography>
                <CurrencyInput
                  label="Valor do Pagamento"
                  name="partialAmount"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  fullWidth
                  autoFocus
                />
                {partialAmount && parseFloat(partialAmount) > 0 && parseFloat(partialAmount) < parseFloat(selectedPayable.valor) && (
                  <Typography variant="body2" color="primary">
                    Saldo restante: R$ {(parseFloat(selectedPayable.valor) - parseFloat(partialAmount)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePartialPaymentClose}>Cancelar</Button>
          <Button onClick={handlePartialPaymentSubmit} variant="contained" color="success">
            Confirmar Pagamento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
