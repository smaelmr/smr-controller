import React from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Select, MenuItem, FormControl, InputLabel, Chip, Grid, Card, CardContent
} from '@mui/material';
import { Add, Edit, Delete, FilterList, Clear, Payment } from '@mui/icons-material';
import CurrencyInput from '../../components/common/CurrencyInput';
import { formatToISO, formatDateBR } from '../../services/helpers/dateUtils';

export default function ContasPagar({
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
  calculateTotals,
}) {
  const totals = calculateTotals();

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
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Mês</InputLabel>
              <Select
                name="mes"
                value={filters.mes}
                onChange={handleFilterChange}
                label="Mês"
              >
                {[...Array(12)].map((_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString('pt-BR', { month: 'long' })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Ano</InputLabel>
              <Select
                name="ano"
                value={filters.ano}
                onChange={handleFilterChange}
                label="Ano"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Categoria</InputLabel>
              <Select
                name="categoriaId"
                value={filters.categoriaId}
                onChange={handleFilterChange}
                label="Categoria"
              >
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
                <MenuItem value="A_VENCER">A Vencer</MenuItem>
                <MenuItem value="EM_ATRASO">Em Atraso</MenuItem>
                <MenuItem value="PAGO">{isPagar ? 'Pago' : 'Recebido'}</MenuItem>
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
            Exibindo {filteredFinance.length} registros
          </Typography>
        </Box>
      </Paper>

      {/* Totalização */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Total A Vencer
              </Typography>
              <Typography variant="h5" color="primary">
                R$ {totals.totalAVencer.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Total Em Atraso
              </Typography>
              <Typography variant="h5" color="error">
                R$ {totals.totalEmAtraso.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Total {isPagar ? 'Pago' : 'Recebido'}
              </Typography>
              <Typography variant="h5" color="success.main">
                R$ {totals.totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
              <TableCell>Valor Pago</TableCell>
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
                <TableCell>
                  {item.valorPago ? parseFloat(item.valorPago).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                </TableCell>
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
                  <MenuItem key={pessoa.pessoaId} value={pessoa.pessoaId}>
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
