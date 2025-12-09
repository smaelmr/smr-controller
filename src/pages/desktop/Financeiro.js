import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Select, MenuItem, FormControl, InputLabel, Chip, Grid
} from '@mui/material';
import { Add, Edit, Delete, FilterList, Clear, Payment } from '@mui/icons-material';
import { financeService, supplierService, gasStationService, clientService, categoryService, paymentMethodService } from '../../services/services';
import CurrencyInput from '../../components/common/CurrencyInput';
import { formatToISO, formatDateBR } from '../../services/helpers/dateUtils';

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
    categoriaId: 0,
    pessoaId: 0,
    valor: '',
    dataCompetencia: '',
    dataVencimento: '',
    dataRealizacao: '',
    numeroDocumento: '',
    origem: 'Manual',
    origemId: null,
    observacao: '',
    totalParcelas: 1,
    valorParcela: '',
    lancarDiferenca: false,
  });

  // Estados dos filtros
  const [filters, setFilters] = useState({
    dataInicial: '',
    dataFinal: '',
    fornecedorId: '',
    categoriaId: '',
    status: '',
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        console.log('Dados de fornecedores:', suppliersData);

        console.log('Dados de postos:', gasStationsData);
        console.log('Dados de contas a pagar:', financeData);

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

        console.log('Dados de clientes:', clientsData);

        setFinance(financeData || []);
        setClients(Array.isArray(clientsData) ? clientsData : clientsData.data || []);
        setSuppliers([]);
        setGasStations([]);
      }
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

    if (filters.status) {
      filtered = filtered.filter(item => 
        item.status === filters.status
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
      status: '',
    });
  };

  const handleOpen = (item = null) => {
    if (item) {
      // Formatar datas para o formato YYYY-MM-DD esperado pelo input type="date"
      const formatDate = (date) => {
        if (!date) return '';
        // Se a data já está no formato correto, retorna
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
        // Se tem hora, pega apenas a parte da data
        if (date.includes('T')) return date.split('T')[0];
        // Tenta converter outros formatos (DD/MM/YYYY, etc)
        try {
          const dateObj = new Date(date);
          if (!isNaN(dateObj.getTime())) {
            return dateObj.toISOString().split('T')[0];
          }
        } catch (e) {
          console.error('Erro ao formatar data:', e);
        }
        return '';
      };

      setFormData({
        ...item,
        dataCompetencia: formatDate(item.dataCompetencia),
        dataVencimento: formatDate(item.dataVencimento),
        dataRealizacao: formatDate(item.dataRealizacao),
        valor: item.valorParcela,
        numeroParcela: item.numeroParcela || 1,
      });
      setEditingId(item.id);
    } else {
      setFormData({
        categoriaId: '',
        pessoaId: '',
        valor: '',
        dataCompetencia: '',
        dataVencimento: '',
        dataRealizacao: '',
        totalParcelas: 1,
        numeroParcela: 1,
        numeroDocumento: '',
        origem: 'Manual',
        origemId: null,
        observacao: '',
        valorParcela: '',
        lancarDiferenca: false,
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
    if (name === 'valor' || name === 'totalParcelas') {
      const valor = name === 'valor' ? parseFloat(newValue) || 0 : parseFloat(formData.valor) || 0;
      const parcelas = name === 'totalParcelas' ? parseInt(newValue) || 1 : parseInt(formData.totalParcelas) || 1;
      
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
        totalParcelas: parseInt(formData.totalParcelas || 1, 10),
        numeroParcela: parseInt(formData.numeroParcela || 1, 10),
        valor: parseFloat(formData.valor || 0),
        valorParcela: parseFloat(formData.valorParcela || 0),
        origemId: formData.origem === 'Manual' ? null : formData.origemId,
        dataCompetencia: formatToISO(formData.dataCompetencia),
        dataVencimento: formatToISO(formData.dataVencimento),
        dataRealizacao: formData.dataRealizacao ? formatToISO(formData.dataRealizacao) : null,
      };

      console.log('Dados a serem enviados:', dataToSend);
      
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
    setPaymentAmount(finance.valorParcela); // Inicializa com o valor total
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
    const valorTotal = parseFloat(selectedFinance.valorParcela);

    if (valorPago <= 0) {
      alert('O valor do pagamento deve ser maior que zero');
      return;
    }

    try {
       if (valorPago < valorTotal) {
        // Pagamento parcial - perguntar se quer lançar diferença
        const lancarDiferenca = window.confirm(
          `O valor pago (R$ ${valorPago.toFixed(2)}) é menor que o valor total (R$ ${valorTotal.toFixed(2)}).\n\n` +
          `Deseja lançar a diferença de R$ ${(valorTotal - valorPago).toFixed(2)} como um novo lançamento?`
        );

        // Atualizar conta original com valor pago
        await financeService.payment(selectedFinance.id, {
          ...selectedFinance,
          valorPago: valorPago,
          dataRealizacao: formatToISO(paymentDate),
          formaPagamentoId: selectedPaymentMethod,
          lancarDiferenca: lancarDiferenca,
          observacao: `${selectedFinance.observacao || ''} [Pagamento Parcial - Valor Original: R$ ${valorTotal.toFixed(2)}]`.trim(),
        });

      } else {
        // Pagamento total
        await financeService.payment(selectedFinance.id, {
          ...selectedFinance,
          valorPago: valorPago,
          dataRealizacao: formatToISO(paymentDate),
          formaPagamentoId: selectedPaymentMethod,
        });
      }

      loadData();
      handlePaymentClose();

    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      alert('Erro ao processar pagamento.');
    }
  };

  const getPessoaName = (pessoaId) => {
    if (!pessoaId) return '-';
    
    // Tentar encontrar em fornecedores/postos (contas a pagar)
    const supplier = suppliers.find(s => s.pessoaId === pessoaId);
    if (supplier) return supplier.name;
    
    const station = gasStations.find(g => g.pessoaId === pessoaId);
    if (station) return station.name;
    
    // Tentar encontrar em clientes (contas a receber)
    const client = clients.find(c => c.pessoaId === pessoaId);
    if (client) return client.name;
    
    return '-';
  };

  const getCategoriaName = (categoriaId) => {
    if (!categoriaId) return '-';
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.name : '-';
  };

  const allFornecedores = isPagar ? [
    ...suppliers.map(s => ({ ...s, uniqueId: s.pessoaId })),
    ...gasStations.map(g => ({ ...g, uniqueId: g.pessoaId }))
  ] : [
    ...clients.map(c => ({ ...c, uniqueId: c.pessoaId }))
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
                    {fornecedor.name}
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
                value={filters.categoriaId}
                onChange={handleFilterChange}
                label="Categoria"
              >
                <MenuItem value="">Todas</MenuItem>
                {categorias.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="EM_ABERTO">Em Aberto</MenuItem>
                <MenuItem value="EM_ATRASO">Em Atraso</MenuItem>
                <MenuItem value={isPagar ? 'PAGO' : 'RECEBIDO'}>{isPagar ? 'Pago' : 'Recebido'}</MenuItem>
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
              <TableCell>Parcela</TableCell>
              <TableCell>Data Competencia</TableCell>
              <TableCell>Data Vencimento</TableCell>
              <TableCell>Data Pagamento</TableCell>
              <TableCell>Origem</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFinance.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Chip 
                    label={getCategoriaName(item.categoriaId)}
                    size="small" 
                  />
                </TableCell>
                <TableCell>{getPessoaName(item.pessoaId)}</TableCell>
                <TableCell>
                  {parseFloat(item.valorParcela).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>{item.numeroParcela}</TableCell>
                <TableCell>{formatDateBR(item.dataCompetencia)}</TableCell>
                <TableCell>{formatDateBR(item.dataVencimento)}</TableCell>
                <TableCell>{formatDateBR(item.dataRealizacao)}</TableCell>
                <TableCell>{item.origem}</TableCell>
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
                  <IconButton 
                    color="primary" 
                    onClick={() => handleOpen(item)}
                    disabled={!!item.dataRealizacao}
                    title={item.dataRealizacao ? "Não é possível editar lançamento quitado" : "Editar"}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDelete(item.id)}
                    disabled={!!item.dataRealizacao}
                    title={item.dataRealizacao ? "Não é possível excluir lançamento quitado" : "Excluir"}
                  >
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
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{isPagar ? 'Fornecedor' : 'Cliente'}</InputLabel>
              <Select
                name="pessoaId"
                value={formData.pessoaId}
                onChange={handleChange}
                label={isPagar ? 'Fornecedor' : 'Cliente'}
              >
                {allFornecedores.map((pessoa) => (
                  <MenuItem key={pessoa.uniqueId} value={pessoa.uniqueId}>
                    {pessoa.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {!editingId && (
              <CurrencyInput
                label="Valor"
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                fullWidth
              />
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              {!editingId ? (
                <TextField 
                  label="Quantidade de Parcelas" 
                  name="totalParcelas" 
                  type="number"
                  value={formData.totalParcelas} 
                  onChange={handleChange} 
                  fullWidth
                  inputProps={{ min: 1 }}
                />
              ) : (
                <TextField 
                  label="Número da Parcela" 
                  name="numeroParcela" 
                  type="number"
                  value={formData.numeroParcela} 
                  onChange={handleChange} 
                  fullWidth
                  inputProps={{ min: 1 }}
                />
              )}

              <CurrencyInput
                label="Valor da Parcela"
                name="valorParcela"
                value={formData.valorParcela}
                onChange={handleChange}
                fullWidth
                disabled={!editingId}
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
                  <strong>Valor Total:</strong> R$ {parseFloat(selectedFinance.valorParcela).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                        {method.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {paymentAmount && parseFloat(paymentAmount) > 0 && parseFloat(paymentAmount) < parseFloat(selectedFinance.valorParcela) && (
                  <Typography variant="body2" color="warning.main">
                    <strong>Atenção:</strong> O valor informado é menor que o total. Você será perguntado se deseja lançar a diferença de R$ {(parseFloat(selectedFinance.valor) - parseFloat(paymentAmount)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} como um novo lançamento.
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
