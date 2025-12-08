import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMediaQuery, useTheme } from '@mui/material';
import { financeService, supplierService, gasStationService, clientService, categoryService, paymentMethodService } from '../services/services';
import { formatToISO } from '../services/helpers/dateUtils';
import ContasPagar from './Financeiro';
import FinanceiroMobile from './FinanceiroMobile';

export default function FinanceiroWrapper() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { tipo } = useParams();
  const isPagar = tipo === 'pagar';

  // Estados compartilhados
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
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      const categoriasData = await categoryService.getAll();
      const allCategorias = Array.isArray(categoriasData) ? categoriasData : categoriasData.data || [];
      
      const paymentMethodsData = await paymentMethodService.getAll();
      const allPaymentMethods = Array.isArray(paymentMethodsData) ? paymentMethodsData : paymentMethodsData.data || [];
      setPaymentMethods(allPaymentMethods);
      
      const categoriasFiltradas = allCategorias.filter(cat => 
        cat.type === (isPagar ? 'D' : 'R')
      );
      
      if (isPagar) {
        const [financeData, suppliersData, gasStationsData] = await Promise.all([
          financeService.getPayments(currentMonth, currentYear),
          supplierService.getAll(),
          gasStationService.getAll(),
        ]);

        setFinance(financeData || []);
        setSuppliers(Array.isArray(suppliersData) ? suppliersData : suppliersData.data || []);
        setGasStations(Array.isArray(gasStationsData) ? gasStationsData : gasStationsData.data || []);
        setClients([]);
      } else {
        const [financeData, clientsData] = await Promise.all([
          financeService.getReceipts(currentMonth, currentYear),
          clientService.getAll(),
        ]);

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
        new Date(item.dataVencimento) >= new Date(filters.dataInicial)
      );
    }

    if (filters.dataFinal) {
      filtered = filtered.filter(item => 
        new Date(item.dataVencimento) <= new Date(filters.dataFinal)
      );
    }

    if (filters.fornecedorId) {
      filtered = filtered.filter(item => item.pessoaId === filters.fornecedorId);
    }

    if (filters.categoriaId) {
      filtered = filtered.filter(item => item.categoriaId === filters.categoriaId);
    }

    if (filters.status) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter(item => {
        const vencimento = new Date(item.dataVencimento);
        vencimento.setHours(0, 0, 0, 0);

        if (filters.status === 'EM_ABERTO') {
          return !item.dataRealizacao && vencimento >= today;
        } else if (filters.status === 'EM_ATRASO') {
          return !item.dataRealizacao && vencimento < today;
        } else if (filters.status === 'PAGO' || filters.status === 'RECEBIDO') {
          return !!item.dataRealizacao;
        }
        return true;
      });
    }

    setFilteredFinance(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      dataInicial: '',
      dataFinal: '',
      fornecedorId: '',
      categoriaId: '',
      status: '',
    });
  };

  const handleOpen = (finance = null) => {
    if (finance) {
      setEditingId(finance.id);
      
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setFormData({
        categoriaId: finance.categoriaId || 0,
        pessoaId: finance.pessoaId || 0,
        valor: finance.valor || '',
        dataCompetencia: formatDate(finance.dataCompetencia),
        dataVencimento: formatDate(finance.dataVencimento),
        dataRealizacao: formatDate(finance.dataRealizacao),
        numeroDocumento: finance.numeroDocumento || '',
        origem: finance.origem || 'Manual',
        origemId: finance.origemId || null,
        observacao: finance.observacao || '',
        totalParcelas: finance.totalParcelas || 1,
        valorParcela: finance.valorParcela || '',
        lancarDiferenca: false,
      });
    } else {
      setEditingId(null);
      setFormData({
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
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'valor' || name === 'totalParcelas') {
      const valor = name === 'valor' ? parseFloat(value) || 0 : parseFloat(formData.valor) || 0;
      const parcelas = name === 'totalParcelas' ? parseInt(value) || 1 : parseInt(formData.totalParcelas) || 1;
      const valorParcela = parcelas > 0 ? (valor / parcelas).toFixed(2) : '0.00';
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        valorParcela: valorParcela
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      const dataToSubmit = {
        ...formData,
        categoriaId: parseInt(formData.categoriaId),
        pessoaId: parseInt(formData.pessoaId),
        valor: parseFloat(formData.valor),
        dataCompetencia: formatToISO(formData.dataCompetencia),
        dataVencimento: formatToISO(formData.dataVencimento),
        dataRealizacao: formData.dataRealizacao ? formatToISO(formData.dataRealizacao) : null,
        numeroDocumento: formData.numeroDocumento || null,
        origemId: formData.origem === 'Manual' ? null : formData.origemId,
        totalParcelas: parseInt(formData.totalParcelas),
        valorParcela: parseFloat(formData.valorParcela),
      };

      if (editingId) {
        if (isPagar) {
          await financeService.updatePayment(editingId, dataToSubmit);
        } else {
          await financeService.updateReceipt(editingId, dataToSubmit);
        }
      } else {
        if (isPagar) {
          await financeService.createPayment(dataToSubmit);
        } else {
          await financeService.createReceipt(dataToSubmit);
        }
      }

      loadData();
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar o lançamento.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      try {
        if (isPagar) {
          await financeService.deletePayment(id);
        } else {
          await financeService.deleteReceipt(id);
        }
        loadData();
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir o lançamento.');
      }
    }
  };

  const handlePaymentOpen = (finance) => {
    setSelectedFinance(finance);
    setPaymentAmount(finance.valorParcela);
    setPaymentDate(new Date().toISOString().split('T')[0]);
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

  const handlePaymentSubmit = async () => {
    try {
      if (!selectedPaymentMethod) {
        alert('Selecione uma forma de pagamento');
        return;
      }

      const valorPago = parseFloat(paymentAmount);
      const valorOriginal = parseFloat(selectedFinance.valorParcela);

      if (valorPago <= 0) {
        alert('O valor deve ser maior que zero');
        return;
      }

      const dataToUpdate = {
        ...selectedFinance,
        dataRealizacao: formatToISO(paymentDate),
        valorPago: valorPago,
        formaPagamentoId: parseInt(selectedPaymentMethod),
      };

      if (isPagar) {
        await financeService.updatePayment(selectedFinance.id, dataToUpdate);
      } else {
        await financeService.updateReceipt(selectedFinance.id, dataToUpdate);
      }

      if (valorPago < valorOriginal) {
        const lancaDiferenca = window.confirm(
          `O valor pago (R$ ${valorPago.toFixed(2)}) é menor que o valor total (R$ ${valorOriginal.toFixed(2)}).\n\nDeseja lançar a diferença de R$ ${(valorOriginal - valorPago).toFixed(2)} como um novo lançamento?`
        );

        if (lancaDiferenca) {
          const novoLancamento = {
            categoriaId: selectedFinance.categoriaId,
            pessoaId: selectedFinance.pessoaId,
            valor: valorOriginal - valorPago,
            valorParcela: valorOriginal - valorPago,
            totalParcelas: 1,
            numeroParcela: 1,
            dataCompetencia: selectedFinance.dataCompetencia,
            dataVencimento: selectedFinance.dataVencimento,
            numeroDocumento: selectedFinance.numeroDocumento,
            origem: 'Manual',
            origemId: null,
            observacao: `Diferença do lançamento ${selectedFinance.numeroDocumento || selectedFinance.id}`,
          };

          if (isPagar) {
            await financeService.createPayment(novoLancamento);
          } else {
            await financeService.createReceipt(novoLancamento);
          }
        }
      }

      loadData();
      handlePaymentClose();
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      alert('Erro ao processar o pagamento.');
    }
  };

  const getCategoriaName = (id) => {
    const categoria = categorias.find(c => c.id === id);
    return categoria ? categoria.name : '-';
  };

  const getFornecedorName = (id) => {
    const allFornecedores = [...suppliers, ...gasStations, ...clients];
    const fornecedor = allFornecedores.find(f => f.uniqueId === id);
    return fornecedor ? fornecedor.name : '-';
  };

  const allFornecedores = [...suppliers, ...gasStations, ...clients];

  if (isMobile) {
    return (
      <FinanceiroMobile
        isPagar={isPagar}
        filteredFinance={filteredFinance}
        categorias={categorias}
        allFornecedores={allFornecedores}
        paymentMethods={paymentMethods}
        filters={filters}
        formData={formData}
        open={open}
        paymentOpen={paymentOpen}
        selectedFinance={selectedFinance}
        paymentAmount={paymentAmount}
        paymentDate={paymentDate}
        selectedPaymentMethod={selectedPaymentMethod}
        editingId={editingId}
        handleFilterChange={handleFilterChange}
        clearFilters={clearFilters}
        handleOpen={handleOpen}
        handleClose={handleClose}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleDelete={handleDelete}
        handlePaymentOpen={handlePaymentOpen}
        handlePaymentClose={handlePaymentClose}
        handlePaymentSubmit={handlePaymentSubmit}
        setPaymentAmount={setPaymentAmount}
        setPaymentDate={setPaymentDate}
        setSelectedPaymentMethod={setSelectedPaymentMethod}
        getCategoriaName={getCategoriaName}
        getFornecedorName={getFornecedorName}
      />
    );
  }

  return <ContasPagar />;
}
