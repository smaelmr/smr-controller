import React from 'react';
import {
  Box, Card, CardContent, IconButton, Typography, Chip, Fab, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  FormControlLabel, Checkbox
} from '@mui/material';
import { Add, Edit, Delete, FilterList, LocalGasStation } from '@mui/icons-material';
import CurrencyInput from '../../components/common/CurrencyInput';

export default function FuelingsMobile({
  fuelings,
  vehicles,
  gasStations,
  filterMonth,
  filterYear,
  filterVehicle,
  filterPosto,
  yearOptions,
  formData,
  open,
  editingId,
  handleFilterMonthChange,
  handleFilterYearChange,
  handleFilterVehicleChange,
  handleFilterPostoChange,
  handleOpen,
  handleClose,
  handleChange,
  handleCheckboxChange,
  handleSubmit,
  handleDelete,
  getVehiclePlaca,
  getGasStationName,
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
          Abastecimentos
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="textSecondary">
            {fuelings.length} registros
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
        {fuelings.map((fueling) => (
          <Card key={fueling.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <LocalGasStation sx={{ color: 'error.main', mr: 2, fontSize: 32 }} />
                <Box flexGrow={1}>
                  <Typography variant="h6" color="primary">
                    R$ {parseFloat(fueling.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {getGasStationName(fueling.postoId)}
                  </Typography>
                </Box>
                {fueling.cheio && (
                  <Chip label="CHEIO" size="small" color="success" />
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="textSecondary">Veículo:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {getVehiclePlaca(fueling.veiculoId)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="textSecondary">Litros:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {parseFloat(fueling.litros || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} L
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="textSecondary">KM:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {parseFloat(fueling.km || 0).toLocaleString('pt-BR')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="textSecondary">Combustível:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {fueling.tipoCombustivel}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="textSecondary">Data:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    {fueling.dataAbastecimento ? new Date(fueling.dataAbastecimento).toLocaleDateString('pt-BR') : '-'}
                  </Typography>
                </Box>
                {fueling.numeroDocumento && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="textSecondary">Doc:</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      {fueling.numeroDocumento}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box display="flex" justifyContent="flex-end" gap={1}>
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => handleOpen(fueling)}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleDelete(fueling.id)}
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
            <FormControl fullWidth>
              <InputLabel>Mês</InputLabel>
              <Select
                value={filterMonth}
                label="Mês"
                onChange={handleFilterMonthChange}
              >
                {[...Array(12)].map((_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>
                    {new Date(2025, i).toLocaleString('pt-BR', { month: 'long' })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Ano</InputLabel>
              <Select
                value={filterYear}
                label="Ano"
                onChange={handleFilterYearChange}
              >
                {yearOptions.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Veículo</InputLabel>
              <Select
                value={filterVehicle}
                label="Veículo"
                onChange={handleFilterVehicleChange}
              >
                <MenuItem value="">Todos</MenuItem>
                {vehicles.map((vehicle) => (
                  <MenuItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.placa}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Posto</InputLabel>
              <Select
                value={filterPosto}
                label="Posto"
                onChange={handleFilterPostoChange}
              >
                <MenuItem value="">Todos</MenuItem>
                {gasStations.map((posto) => (
                  <MenuItem key={posto.id} value={posto.id}>
                    {posto.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterOpen(false)} variant="contained">
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={open} onClose={handleClose} fullScreen>
        <DialogTitle>
          {editingId ? 'Editar Abastecimento' : 'Novo Abastecimento'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
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
              <InputLabel>Posto</InputLabel>
              <Select
                name="postoId"
                value={formData.postoId || ''}
                onChange={handleChange}
                label="Posto"
              >
                <MenuItem value="">
                  <em>Selecione...</em>
                </MenuItem>
                {gasStations.map((posto) => (
                  <MenuItem key={posto.id} value={posto.id}>
                    {posto.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <CurrencyInput
              label="Valor Total"
              name="valorTotal"
              value={formData.valorTotal}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Litros"
              name="litros"
              type="number"
              value={formData.litros}
              onChange={handleChange}
              fullWidth
              inputProps={{ step: '0.01' }}
            />

            <TextField
              label="KM"
              name="km"
              type="number"
              value={formData.km}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Data do Abastecimento"
              name="dataAbastecimento"
              type="date"
              value={formData.dataAbastecimento}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Hora do Abastecimento"
              name="horaAbastecimento"
              type="time"
              value={formData.horaAbastecimento}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Tipo de Combustível</InputLabel>
              <Select
                name="tipoCombustivel"
                value={formData.tipoCombustivel}
                onChange={handleChange}
                label="Tipo de Combustível"
              >
                <MenuItem value="Diesel_S500">Diesel S500</MenuItem>
                <MenuItem value="Diesel_S10">Diesel S10</MenuItem>
                <MenuItem value="Arla">Arla</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Número do Documento"
              name="numeroDocumento"
              value={formData.numeroDocumento}
              onChange={handleChange}
              fullWidth
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.cheio}
                  onChange={handleCheckboxChange}
                  name="cheio"
                />
              }
              label="Tanque Cheio"
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
