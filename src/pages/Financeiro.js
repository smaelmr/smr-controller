import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Select, MenuItem, FormControl, InputLabel, Checkbox, Chip, Grid
} from '@mui/material';
import { Add, Edit, Delete, FilterList, Clear, Payment } from '@mui/icons-material';
import { financeService, supplierService, gasStationService, clientService, categoryService } from '../services/services';
import CurrencyInput from '../components/common/CurrencyInput';

export default function ContasPagar() {
  const { tipo } = useParams(); // 'pagar' ou 'receber'
  const isPagar = tipo === 'pagar';
  const [finance, setFinance] = useState([]);
  const [filteredFinance, setFilteredFinance] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [gasStations, setGasStations] = useState([]);
  const [clients, setClients] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [open, setOpen] = useState(false);
  const [partialPaymentOpen, setPartialPaymentOpen] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState(null);
  const [partialAmount, setPartialAmount] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    categoriaId: '',
    fornecedorId: '',
    valor: '',
    dataLancamento: '',
    dataVencimento: '',
    dataPagamento: '',
    numeroDocumento: '',
    origem: 'Manual',
    origemId: null,
    referencia: '',
    observacao: '',
    pago: false,
    numeroParcelas: 1,
    valorParcela: '',
  });

  // Estados dos filtros
  const [filters, setFilters] = useState({
    dataInicial: '',
    dataFinal: '',
    fornecedorId: '',
    categoria: '',
  });

  useEffect(() => {
    loadData();
  }, [tipo]);

  useEffect(() => {
    applyFilters();
  }, [finance, filters]);

  const loadData = async () => {
    try {
      // Obter mês e ano atual
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // getMonth() retorna 0-11
      const currentYear = now.getFullYear();
      
      const categoriasData = await categoryService.getAll();
      const allCategorias = Array.isArray(categoriasData) ? categoriasData : categoriasData.data || [];
      
      // Filtrar categorias por tipo: D para pagar, R para receber
      const categoriasFiltradas = allCategorias.filter(cat => 
        cat.type === (isPagar ? 'D' : 'R')
      );
      
      if (isPagar) {
        // Contas a Pagar: carregar Fornecedores e Postos
        const [financeData, suppliersData, gasStationsData] = await Promise.all([
          financeService.getPayments(currentMonth, currentYear),
          supplierService.getAll(),
          gasStationService.getAll(),
        ]);
        setFinance(Array.isArray(financeData) ? financeData : financeData.data || []);
        setSuppliers(Array.isArray(suppliersData) ? suppliersData : suppliersData.data || []);
        setGasStations(Array.isArray(gasStationsData) ? gasStationsData : gasStationsData.data || []);
        setClients([]);
      } else {
        // Contas a Receber: carregar Clientes
        const [receivablesData, clientsData] = await Promise.all([
          financeService.getReceipts(currentMonth, currentYear),
          clientService.getAll(),
        ]);
        setFinance(Array.isArray(receivablesData) ? receivablesData : receivablesData.data || []);
        setClients(Array.isArray(clientsData) ? clientsData : clientsData.data || []);
        setSuppliers([]);
        setGasStations([]);
      }
      console.log('Categorias carregadas:', categoriasFiltradas);
      setCategorias(categoriasFiltradas);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...finance];

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
        item.categoriaId === filters.categoria
      );
    }

    setFilteredFinance(filtered);
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
        categoriaId: '',
        fornecedorId: '',
        valor: '',
        dataLancamento: '',
        dataVencimento: '',
        dataPagamento: '',
        numeroParcelas: 1,
        numeroDocumento: '',
        origem: 'Manual',
        origemId: null,
        referencia: '',
        observacao: '',
        pago: false,
        valorParcela: '',
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
    const newValue = type === 'checkbox' ? checked : value;
    const updatedFormData = { ...formData, [name]: newValue };
    
    // Limpar origemId quando origem for Manual
    if (name === 'origem' && newValue === 'Manual') {
      updatedFormData.origemId = null;
    }
    
    // Calcular valor da parcela automaticamente
    if (name === 'valor' || name === 'numeroParcelas') {
      const valor = name === 'valor' ? parseFloat(newValue) || 0 : parseFloat(formData.valor) || 0;
      const parcelas = name === 'numeroParcelas' ? parseInt(newValue) || 1 : parseInt(formData.numeroParcelas) || 1;
      
      if (valor > 0 && parcelas > 0) {
        updatedFormData.valorParcela = (valor / parcelas).toFixed(2);
      } else {
        updatedFormData.valorParcela = '';
      }
    }
    
    setFormData(updatedFormData);
  };

  const handleSubmit = async () => {
    try {
      const service = isPagar ? payableService : receivableService;
      // Preparar dados para envio
      const dataToSend = {
        ...formData,
        origemId: formData.origem === 'Manual' ? null : formData.origemId,
      };
      
      if (editingId) {
        await service.update(editingId, dataToSend);
      } else {
        await service.create(dataToSend);
      }
      loadData();
      handleClose();
    } catch (error) {
      console.error(`Erro ao salvar conta a ${isPagar ? 'pagar' : 'receber'}:`, error);
      alert(`Erro ao salvar conta a ${isPagar ? 'pagar' : 'receber'}. Verifique os dados e tente novamente.`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Excluir este lançamento?')) {
      try {
        const service = isPagar ? payableService : receivableService;
        await service.delete(id);
        loadData();
      } catch (error) {
        console.error(`Erro ao excluir conta a ${isPagar ? 'pagar' : 'receber'}:`, error);
        alert(`Erro ao excluir conta a ${isPagar ? 'pagar' : 'receber'}.`);
      }
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
  const handlePartialPaymentSubmit = async () => {
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

    try {
      const service = isPagar ? payableService : receivableService;
      // Atualizar conta original como paga parcialmente
      await service.update(selectedPayable.id, {
        ...selectedPayable,
        valor: valorPago.toString(),
        dataPagamento: hoje,
        pago: true,
        observacao: `${selectedPayable.observacao || ''} [Pagamento Parcial - Valor Original: R$ ${valorTotal.toFixed(2)}]`.trim(),
      });

      // Criar nova conta com o saldo restante
      await service.create({
        categoriaId: selectedPayable.categoriaId,
        fornecedorId: selectedPayable.fornecedorId,
        valor: valorRestante.toString(),
        dataLancamento: hoje,
        dataVencimento: selectedPayable.dataVencimento,
        dataPagamento: '',
        numeroDocumento: selectedPayable.numeroDocumento,
        origem: 'Saldo de Pagamento Parcial',
        origemId: selectedPayable.id,
        referencia: selectedPayable.id,
        observacao: `Saldo restante da conta original (Ref: #${selectedPayable.id})`,
        pago: false,
      });

      loadData();
      handlePartialPaymentClose();
    } catch (error) {
      console.error('Erro ao processar pagamento parcial:', error);
      alert('Erro ao processar pagamento parcial.');
    }
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
      } else if (type === 'client') {
        const client = clients.find(c => c.id === numericId);
        return client ? client.nome : '-';
      }
    }
    
    const numericId = typeof fornecedorId === 'number' ? fornecedorId : parseInt(fornecedorId);
    
    // Tentar encontrar em fornecedores/postos (contas a pagar)
    const supplier = suppliers.find(s => s.id === numericId);
    if (supplier) return supplier.nome;
    
    const station = gasStations.find(g => g.id === numericId);
    if (station) return station.nome;
    
    // Tentar encontrar em clientes (contas a receber)
    const client = clients.find(c => c.id === numericId);
    if (client) return client.nome;
    
    return '-';
  };

  const getCategoriaName = (categoriaId) => {
    if (!categoriaId) return '-';
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.name : '-';
  };

  const getCategoriaColor = (categoriaId) => {
    if (!categoriaId) return 'default';
    const categoria = categorias.find(c => c.id === categoriaId);
    if (!categoria) return 'default';
    
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
    return colors[categoria.nome] || 'default';
  };

  const allFornecedores = isPagar ? [
    ...suppliers.map(s => ({ ...s, uniqueId: `supplier-${s.id}` })),
    ...gasStations.map(g => ({ ...g, uniqueId: `station-${g.id}` }))
  ] : [
    ...clients.map(c => ({ ...c, uniqueId: `client-${c.id}` }))
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{isPagar ? 'Contas a Pagar' : 'Contas a Receber'}</Typography>
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
              <InputLabel>{isPagar ? 'Fornecedor' : 'Cliente'}</InputLabel>
              <Select
                name="fornecedorId"
                value={filters.fornecedorId}
                onChange={handleFilterChange}
                label={isPagar ? 'Fornecedor' : 'Cliente'}
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
            Exibindo {filteredFinance.length} de {finance.length} registros
          </Typography>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Categoria</TableCell>
              <TableCell>{isPagar ? 'Fornecedor' : 'Cliente'}</TableCell>
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
            {filteredFinance.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Chip 
                    label={getCategoriaName(item.categoriaId)} 
                    color={getCategoriaColor(item.categoriaId)} 
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
        <DialogTitle>{editingId ? `Editar Conta a ${isPagar ? 'Pagar' : 'Receber'}` : 'Novo Lançamento'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                name="categoriaId"
                value={formData.categoriaId}
                onChange={handleChange}
                label="Categoria"
              >
                {categorias.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{isPagar ? 'Fornecedor' : 'Cliente'}</InputLabel>
              <Select
                name="fornecedorId"
                value={formData.fornecedorId}
                onChange={handleChange}
                label={isPagar ? 'Fornecedor' : 'Cliente'}
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

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                label="Quantidade de Parcelas" 
                name="numeroParcelas" 
                type="number"
                value={formData.numeroParcelas} 
                onChange={handleChange} 
                fullWidth
                inputProps={{ min: 1 }}
              />

              <CurrencyInput
                label="Valor da Parcela"
                name="valorParcela"
                value={formData.valorParcela}
                onChange={handleChange}
                fullWidth
                disabled
              />
            </Box>

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
              label="Origem"
              name="origem"
              value={formData.origem}
              onChange={handleChange}
              fullWidth
            />

            {formData.origem !== 'Manual' && (
              <TextField
                label="ID da Origem"
                name="origemId"
                type="number"
                value={formData.origemId || ''}
                onChange={handleChange}
                fullWidth
                helperText="Obrigatório quando a origem não é Manual"
              />
            )}

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
