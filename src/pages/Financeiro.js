import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Select, MenuItem, FormControl, InputLabel, Checkbox, Chip, Grid
} from '@mui/material';
import { Add, Edit, Delete, FilterList, Clear, Payment } from '@mui/icons-material';
import { financeService, supplierService, gasStationService, clientService, categoryService, paymentMethodService } from '../services/services';
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
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [open, setOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedFinance, setSelectedFinance] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    categoriaId: '',
    pessoaId: '',
    valor: '',
    dataCompetencia: '',
    dataVencimento: '',
    dataRealizacao: '',
    numeroDocumento: '',
    origem: 'Manual',
    origemId: null,
    observacao: '',
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
      
      const paymentMethodsData = await paymentMethodService.getAll();
      const allPaymentMethods = Array.isArray(paymentMethodsData) ? paymentMethodsData : paymentMethodsData.data || [];
      setPaymentMethods(allPaymentMethods);
      
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

        console.log('Dados de finance:', financeData);

        setFinance(financeData || []);
        setSuppliers(Array.isArray(suppliersData) ? suppliersData : suppliersData.data || []);
        setGasStations(Array.isArray(gasStationsData) ? gasStationsData : gasStationsData.data || []);
        setClients([]);
      } else {
        // Contas a Receber: carregar Clientes
        const [financeData, clientsData] = await Promise.all([
          financeService.getReceipts(currentMonth, currentYear),
          clientService.getAll(),
        ]);
        setFinance(financeData || []);
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

    if (filters.pessoaId) {
      filtered = filtered.filter(item => 
        item.pessoaId === filters.pessoaId
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
        pessoaId: '',
        valor: '',
        dataCompetencia: '',
        dataVencimento: '',
        dataRealizacao: '',
        numeroParcelas: 1,
        numeroDocumento: '',
        origem: 'Manual',
        origemId: null,
        observacao: '',
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
      // Preparar dados para envio
      const dataToSend = {
        ...formData,
        origemId: formData.origem === 'Manual' ? null : formData.origemId,
      };
      
      if (editingId) {
        await financeService.update(editingId, dataToSend);
      } else {
        await financeService.create(dataToSend);
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
        await financeService.delete(id);
        loadData();
      } catch (error) {
        console.error(`Erro ao excluir conta a ${isPagar ? 'pagar' : 'receber'}:`, error);
        alert(`Erro ao excluir conta a ${isPagar ? 'pagar' : 'receber'}.`);
      }
    }
  };

  // Função para abrir diálogo de pagamento
  const handlePaymentOpen = (finance) => {
    setSelectedFinance(finance);
    setPaymentAmount(finance.valor); // Inicializa com o valor total
    setPaymentDate(new Date().toISOString().split('T')[0]); // Data atual
    setSelectedPaymentMethod('');
    setPaymentOpen(true);
  };

  const handlePaymentClose = () => {
    setPaymentOpen(false);
    setSelectedFinance(null);
    setPaymentAmount('');
    setPaymentDate('');
    setSelectedPaymentMethod('');
  };

  // Processar pagamento
  const handlePaymentSubmit = async () => {
    if (!selectedFinance || !paymentAmount) {
      alert('Informe o valor do pagamento');
      return;
    }

    if (!selectedPaymentMethod) {
      alert('Selecione a forma de pagamento');
      return;
    }

    if (!paymentDate) {
      alert('Informe a data de realização do pagamento');
      return;
    }

    const valorPago = parseFloat(paymentAmount);
    const valorTotal = parseFloat(selectedFinance.valor);

    if (valorPago <= 0) {
      alert('O valor do pagamento deve ser maior que zero');
      return;
    }

    try {
      if (valorPago === valorTotal) {
        // Pagamento total
        await financeService.update(selectedFinance.id, {
          ...selectedFinance,
          dataRealizacao: paymentDate,
          formaPagamentoId: selectedPaymentMethod,
        });
        
        loadData();
        handlePaymentClose();
      } else if (valorPago < valorTotal) {
        // Pagamento parcial - perguntar se quer lançar diferença
        const lancarDiferenca = window.confirm(
          `O valor pago (R$ ${valorPago.toFixed(2)}) é menor que o valor total (R$ ${valorTotal.toFixed(2)}).\n\n` +
          `Deseja lançar a diferença de R$ ${(valorTotal - valorPago).toFixed(2)} como um novo lançamento?`
        );

        // Atualizar conta original com valor pago
        await financeService.update(selectedFinance.id, {
          ...selectedFinance,
          valor: valorPago.toString(),
          dataRealizacao: paymentDate,
          formaPagamentoId: selectedPaymentMethod,
          observacao: `${selectedFinance.observacao || ''} [Pagamento Parcial - Valor Original: R$ ${valorTotal.toFixed(2)}]`.trim(),
        });

        if (lancarDiferenca) {
          // Criar nova conta com o saldo restante
          const valorRestante = valorTotal - valorPago;
          await financeService.create({
            categoriaId: selectedFinance.categoriaId,
            pessoaId: selectedFinance.pessoaId,
            valor: valorRestante.toString(),
            dataCompetencia: paymentDate,
            dataVencimento: selectedFinance.dataVencimento,
            dataRealizacao: null,
            numeroDocumento: selectedFinance.numeroDocumento,
            origem: 'Manual',
            origemId: selectedFinance.id,
            observacao: `Saldo restante da conta original (Ref: #${selectedFinance.id})`,
            numeroParcela: selectedFinance.numeroParcela,
          });
        }

        loadData();
        handlePaymentClose();
      } else {
        // Valor pago maior que o total
        alert('O valor do pagamento não pode ser maior que o valor total da conta');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      alert('Erro ao processar pagamento.');
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
                <TableCell>{item.dataCompetencia}</TableCell>
                <TableCell>{item.dataVencimento}</TableCell>
                <TableCell>{item.dataRealizacao || '-'}</TableCell>
                <TableCell>
                  <Checkbox checked={item.pago} disabled />
                </TableCell>
                <TableCell>{item.origem}</TableCell>
                <TableCell>{item.observacao}</TableCell>
                <TableCell align="right">
                  {!item.dataRealizacao && (
                    <IconButton 
                      color="success" 
                      onClick={() => handlePaymentOpen(item)}
                      title="Realizar Pagamento"
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
              label="Data Competência"
              name="dataCompetencia"
              type="date"
              value={formData.dataCompetencia}
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
              name="dataRealizacao"
              type="date"
              value={formData.dataRealizacao}
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Pagamento */}
      <Dialog open={paymentOpen} onClose={handlePaymentClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isPagar ? 'Realizar Pagamento' : 'Realizar Recebimento'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {selectedFinance && (
              <>
                <Typography variant="body1">
                  <strong>Valor Total:</strong> R$ {parseFloat(selectedFinance.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Informe o valor, a data e a forma de pagamento. Se o valor for menor que o total, você poderá escolher lançar a diferença.
                </Typography>
                <CurrencyInput
                  label="Valor do Pagamento"
                  name="paymentAmount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  fullWidth
                  autoFocus
                />
                <TextField
                  label="Data de Realização"
                  name="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Forma de Pagamento</InputLabel>
                  <Select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    label="Forma de Pagamento"
                  >
                    {paymentMethods.map((method) => (
                      <MenuItem key={method.id} value={method.id}>
                        {method.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {paymentAmount && parseFloat(paymentAmount) > 0 && parseFloat(paymentAmount) < parseFloat(selectedFinance.valor) && (
                  <Typography variant="body2" color="warning.main">
                    <strong>Atenção:</strong> O valor informado é menor que o total. Você será perguntado se deseja lançar a diferença de R$ {(parseFloat(selectedFinance.valor) - parseFloat(paymentAmount)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} como um novo lançamento.
                  </Typography>
                )}
                {paymentAmount && parseFloat(paymentAmount) > parseFloat(selectedFinance.valor) && (
                  <Typography variant="body2" color="error">
                    <strong>Erro:</strong> O valor do pagamento não pode ser maior que o valor total.
                  </Typography>
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePaymentClose}>Cancelar</Button>
          <Button onClick={handlePaymentSubmit} variant="contained" color="success">
            Confirmar {isPagar ? 'Pagamento' : 'Recebimento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
