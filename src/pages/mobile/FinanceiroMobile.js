import React from 'react';
import {
  Box, Card, CardContent, IconButton, Typography, Chip, Fab, Dialog, DialogActions, 
  DialogContent, DialogTitle, TextField, Button, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Add, Edit, Delete, Payment, FilterList } from '@mui/icons-material';
import CurrencyInput from '../../components/common/CurrencyInput';
import { formatDateBR } from '../../services/helpers/dateUtils';

export default function FinanceiroMobile({
  isPagar,
  filteredFinance,
  categorias,
  allFornecedores,
  paymentMethods,
  filters,
  formData,
  open,
  paymentOpen,
  selectedFinance,
  paymentAmount,
  paymentDate,
  selectedPaymentMethod,
  editingId,
  handleFilterChange,
  clearFilters,
  handleOpen,
  handleClose,
  handleChange,
  handleSubmit,
  handleDelete,
  handlePaymentOpen,
  handlePaymentClose,
  handlePaymentSubmit,
  setPaymentAmount,
  setPaymentDate,
  setSelectedPaymentMethod,
  getCategoriaName,
  getPessoaName,
}) {
  const [filterOpen, setFilterOpen] = React.useState(false);

  return (
    <Box sx={{ pb: 10 }}>
      {/* Header */}
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000, 
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        p: 2,
        mb: 2
      }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          {isPagar ? 'Contas a Pagar' : 'Contas a Receber'}
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="textSecondary">
            {filteredFinance.length} registros
          </Typography>
          <IconButton 
            color="primary" 
            onClick={() => setFilterOpen(true)}
            size="small"
          >
            <FilterList />
          </IconButton>
        </Box>
      </Box>

      {/* Lista de Cards */}
      <Box sx={{ px: 2 }}>
        {filteredFinance.map((item) => (
          <Card key={item.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Box>
                  <Chip 
                    label={getCategoriaName(item.categoriaId)}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    {getPessoaName(item.pessoaId)}
                  </Typography>
                </Box>
                <Typography variant="h6" color="primary">
                  R$ {parseFloat(item.valorParcela).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="textSecondary" display="block">
                  Parcela: {item.numeroParcela}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  Vencimento: {formatDateBR(item.dataVencimento)}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  Pagamento: {formatDateBR(item.dataRealizacao)}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                {!item.dataRealizacao && (
                  <IconButton 
                    color="success" 
                    size="small"
                    onClick={() => handlePaymentOpen(item)}
                  >
                    <Payment />
                  </IconButton>
                )}
                <IconButton 
                  color="primary" 
                  size="small"
                  onClick={() => handleOpen(item)}
                  disabled={!!item.dataRealizacao}
                >
                  <Edit />
                </IconButton>
                <IconButton 
                  color="error" 
                  size="small"
                  onClick={() => handleDelete(item.id)}
                  disabled={!!item.dataRealizacao}
                >
                  <Delete />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Botão Flutuante para Adicionar */}
      <Fab 
        color="primary" 
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpen()}
      >
        <Add />
      </Fab>

      {/* Dialog de Filtros */}
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} fullScreen>
        <DialogTitle>Filtros</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Data Inicial"
              name="dataInicial"
              type="date"
              value={filters.dataInicial}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Data Final"
              name="dataFinal"
              type="date"
              value={filters.dataFinal}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <FormControl fullWidth>
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
            <FormControl fullWidth>
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
            <FormControl fullWidth>
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
                <MenuItem value={isPagar ? 'PAGO' : 'RECEBIDO'}>
                  {isPagar ? 'Pago' : 'Recebido'}
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={clearFilters}>Limpar</Button>
          <Button onClick={() => setFilterOpen(false)} variant="contained">
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={open} onClose={handleClose} fullScreen>
        <DialogTitle>
          {editingId ? `Editar Conta a ${isPagar ? 'Pagar' : 'Receber'}` : 'Novo Lançamento'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                name="categoriaId"
                value={formData.categoriaId || ''}
                onChange={handleChange}
                label="Categoria"
              >
                <MenuItem value="">
                  <em>Selecione...</em>
                </MenuItem>
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
                value={formData.pessoaId || ''}
                onChange={handleChange}
                label={isPagar ? 'Fornecedor' : 'Cliente'}
              >
                <MenuItem value="">
                  <em>Selecione...</em>
                </MenuItem>
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
              onChange={handleChange} 
              fullWidth 
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
              rows={3}
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
      <Dialog open={paymentOpen} onClose={handlePaymentClose} fullScreen>
        <DialogTitle>
          {isPagar ? 'Realizar Pagamento' : 'Realizar Recebimento'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {selectedFinance && (
              <>
                <Typography variant="h6" color="primary" gutterBottom>
                  R$ {parseFloat(selectedFinance.valorParcela).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Informe o valor, a data e a forma de pagamento.
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
                    <strong>Atenção:</strong> Valor menor que o total. Será perguntado se deseja lançar a diferença.
                  </Typography>
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePaymentClose}>Cancelar</Button>
          <Button onClick={handlePaymentSubmit} variant="contained" color="success">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
