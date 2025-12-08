import React from 'react';
import {
  Box, Card, CardContent, IconButton, Typography, Chip, Fab, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField, Button, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Add, Edit, Delete, FilterList, LocalShipping } from '@mui/icons-material';
import CurrencyInput from '../../components/common/CurrencyInput';
import DateInputNative from '../../components/common/DateInputNative';

export default function TripsMobile({
  filteredTrips,
  clients,
  drivers,
  vehicles,
  cities,
  filters,
  formData,
  open,
  editingId,
  handleFilterChange,
  clearFilters,
  handleOpen,
  handleClose,
  handleChange,
  handleSubmit,
  handleDelete,
  getClientName,
  getDriverName,
  getVehiclePlaca,
  getCityName,
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
          Viagens
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="textSecondary">
            {filteredTrips.length} registros
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
        {filteredTrips.map((trip) => (
          <Card key={trip.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <LocalShipping sx={{ color: 'primary.main', mr: 2, fontSize: 32 }} />
                <Box flexGrow={1}>
                  <Typography variant="h6" color="primary">
                    R$ {parseFloat(trip.valorFrete || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {getClientName(trip.clienteId)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {getCityName(trip.origemId)} → {getCityName(trip.destinoId)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="textSecondary">Veículo:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {getVehiclePlaca(trip.veiculoId)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="textSecondary">Motorista:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {getDriverName(trip.motoristaId)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="textSecondary">Coleta:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {trip.dataColeta ? new Date(trip.dataColeta).toLocaleDateString('pt-BR') : '-'}
                  </Typography>
                </Box>
                {trip.numeroDocumento && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="textSecondary">Doc:</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      {trip.numeroDocumento}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box display="flex" justifyContent="flex-end" gap={1}>
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => handleOpen(trip)}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleDelete(trip.id)}
                >
                  <Delete />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Botão Flutuante */}
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
            <DateInputNative
              label="Data Inicial"
              name="dataInicial"
              value={filters.dataInicial}
              onChange={handleFilterChange}
              fullWidth
            />
            <DateInputNative
              label="Data Final"
              name="dataFinal"
              value={filters.dataFinal}
              onChange={handleFilterChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Cliente</InputLabel>
              <Select
                name="clienteId"
                value={filters.clienteId}
                onChange={handleFilterChange}
                label="Cliente"
              >
                <MenuItem value="">Todos</MenuItem>
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Motorista</InputLabel>
              <Select
                name="motoristaId"
                value={filters.motoristaId}
                onChange={handleFilterChange}
                label="Motorista"
              >
                <MenuItem value="">Todos</MenuItem>
                {drivers.map((driver) => (
                  <MenuItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </MenuItem>
                ))}
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
          {editingId ? 'Editar Viagem' : 'Nova Viagem'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {/* Linha 1: Valor Frete, Data Coleta, Data Entrega */}
            <CurrencyInput
              label="Valor do Frete"
              name="valorFrete"
              value={formData.valorFrete}
              onChange={handleChange}
              fullWidth
            />
            <DateInputNative
              label="Data de Coleta"
              name="dataColeta"
              value={formData.dataColeta}
              onChange={handleChange}
              fullWidth
            />
            <DateInputNative
              label="Data de Entrega"
              name="dataEntrega"
              value={formData.dataEntrega}
              onChange={handleChange}
              fullWidth
            />

            {/* Origem e Destino */}
            <FormControl fullWidth>
              <InputLabel>Origem</InputLabel>
              <Select
                name="origemId"
                value={formData.origemId || ''}
                onChange={handleChange}
                label="Origem"
              >
                <MenuItem value="">
                  <em>Selecione...</em>
                </MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city.id} value={city.id}>
                    {city.name}/{city.state}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Destino</InputLabel>
              <Select
                name="destinoId"
                value={formData.destinoId || ''}
                onChange={handleChange}
                label="Destino"
              >
                <MenuItem value="">
                  <em>Selecione...</em>
                </MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city.id} value={city.id}>
                    {city.name}/{city.state}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Agenciamento, Pedágio, Documento */}
            <CurrencyInput
              label="Agenciamento"
              name="valorAgenciamento"
              value={formData.valorAgenciamento}
              onChange={handleChange}
              fullWidth
            />
            <CurrencyInput
              label="Valor Pedágio"
              name="valorPedagio"
              value={formData.valorPedagio}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Número do Documento"
              name="numeroDocumento"
              value={formData.numeroDocumento}
              onChange={handleChange}
              fullWidth
            />

            {/* Veículo e Motorista */}
            <FormControl fullWidth>
              <InputLabel>Veículo</InputLabel>
              <Select
                name="veiculoId"
                value={formData.veiculoId || ''}
                onChange={handleChange}
                label="Veículo"
              >
                <MenuItem value="">
                  <em>Selecione...</em>
                </MenuItem>
                {vehicles.map((vehicle) => (
                  <MenuItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.placa} - {vehicle.marca} {vehicle.modelo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Motorista</InputLabel>
              <Select
                name="motoristaId"
                value={formData.motoristaId || ''}
                onChange={handleChange}
                label="Motorista"
              >
                <MenuItem value="">
                  <em>Selecione...</em>
                </MenuItem>
                {drivers.map((driver) => (
                  <MenuItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Cliente */}
            <FormControl fullWidth>
              <InputLabel>Cliente</InputLabel>
              <Select
                name="clienteId"
                value={formData.clienteId || ''}
                onChange={handleChange}
                label="Cliente"
              >
                <MenuItem value="">
                  <em>Selecione...</em>
                </MenuItem>
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Observação */}
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
    </Box>
  );
}
