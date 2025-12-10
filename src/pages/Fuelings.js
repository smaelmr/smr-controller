import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add, Edit, Delete, FilterList } from '@mui/icons-material';
import { fuelingService, vehicleService, gasStationService, financeService } from '../services/services';
import Notification from '../components/common/Notification';
import { useLoading } from '../services/helpers/useLoading';
import { handleError } from '../services/helpers/handleError';
import CurrencyInput from '../components/common/CurrencyInput';
import FuelingsMobile from './mobile/FuelingsMobile';


function Fuelings() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [fuelings, setFuelings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [gasStations, setGasStations] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSeverity, setNotifSeverity] = useState('success');
  const [loading, withLoading] = useLoading();


  // Filters: month (1-12), year, vehicle id, posto id
  const now = new Date();
  const defaultMonth = now.getMonth() + 1;
  const defaultYear = now.getFullYear();
  const [filterMonth, setFilterMonth] = useState(defaultMonth);
  const [filterYear, setFilterYear] = useState(defaultYear);
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterPosto, setFilterPosto] = useState('');
  const yearOptions = Array.from({ length: 5 }).map((_, i) => defaultYear - 2 + i);


  const showNotification = (message, severity = 'success') => {
    setNotifMessage(message);
    setNotifSeverity(severity);
    setNotifOpen(true);
  };


  const [formData, setFormData] = useState({
    valorDiesel: '',
    litros: '',
    veiculoId: '',
    postoId: '',
    km: '',
    dataAbastecimento: '',
    horaAbastecimento: '',
    tipoCombustivel: 'Diesel',
    numeroDocumento: '',
    cheio: false,
    valorArla: '',
    valorDiversos: '',
  });


  useEffect(() => {
    loadData();
  }, []);


  // Função para extrair data e hora sem conversão de timezone
  const extractDateAndTime = (isoString) => {
    if (!isoString) return { date: '', time: '' };
    
    try {
      // Remove o 'Z' ou offset de timezone e trata como horário local
      const cleanDate = isoString.replace('Z', '').split('+')[0].split('-').slice(0, 3).join('-');
      const parts = isoString.replace('Z', '').split('T');
      
      if (parts.length === 2) {
        const datePart = parts[0]; // YYYY-MM-DD
        const timePart = parts[1].split('.')[0].substring(0, 5); // HH:MM
        
        return { date: datePart, time: timePart };
      }
      
      return { date: parts[0], time: '' };
    } catch (error) {
      console.error('Erro ao extrair data e hora:', error);
      return { date: '', time: '' };
    }
  };

  // Função para formatar data/hora para exibição sem conversão de timezone
  const formatLocalDateTime = (isoString) => {
    if (!isoString) return '-';
    
    try {
      // Extrai as partes sem fazer conversão de timezone
      const parts = isoString.replace('Z', '').split('T');
      if (parts.length === 2) {
        const [year, month, day] = parts[0].split('-');
        const [hour, minute] = parts[1].split(':');
        
        return `${day}/${month}/${year} ${hour}:${minute}`;
      }
      
      return '-';
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '-';
    }
  };


  const loadData = async () => {
    await withLoading(async () => {
      try {
        const [fuels, vehs, stations] = await Promise.all([
          fuelingService.getAll(),
          vehicleService.getAll(),
          gasStationService.getAll()
        ]);
        
        // Mantém os dados como vieram da API
        const formattedFuels = Array.isArray(fuels) ? fuels : [];
          
        setFuelings(formattedFuels);
        setVehicles(vehs);
        setGasStations(stations);
      } catch (err) {
        handleError(err, setError);
        showNotification(err.message || 'Erro ao carregar dados', 'error');
      }
    });
  };


  const handleOpen = (fueling = null) => {
    if (fueling) {
      // Extrai data e hora sem conversão de timezone
      const { date, time } = extractDateAndTime(fueling.dataAbastecimento);
      
      setFormData({
        ...fueling,
        dataAbastecimento: date,
        horaAbastecimento: time,
      });
      setEditingId(fueling.id);
    } else {
      setFormData({
        valorDiesel: '',
        litros: '',
        veiculoId: '',
        postoId: '',
        km: '',
        dataAbastecimento: '',
        horaAbastecimento: '',
        tipoCombustivel: 'Diesel',
        numeroDocumento: '',
        cheio: false,
        valorArla: '',
        valorDiversos: '',
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };


  const handleSubmit = async () => {
      try {
        await withLoading(async () => {
          // Concatena data e hora no formato local (sem conversão de timezone)
          let dataHoraCompleta = formData.dataAbastecimento;
          if (formData.horaAbastecimento) {
            // Formato: YYYY-MM-DDTHH:MM:SS (sem Z ou offset)
            dataHoraCompleta = `${formData.dataAbastecimento}T${formData.horaAbastecimento}:00Z`;
          } else {
            dataHoraCompleta = `${formData.dataAbastecimento}T00:00:00Z`;
          }

          // Prepara os dados convertendo valores numéricos
          const dataToSubmit = {
            ...formData,
            valorDiesel: parseFloat(formData.valorDiesel || 0),
            litros: parseFloat(formData.litros || 0),
            km: parseInt(formData.km || 0, 10),
            dataAbastecimento: dataHoraCompleta, // Envia sem conversão UTC
            cheio: Boolean(formData.cheio),
            valorArla: parseFloat(formData.valorArla || 0),
            valorDiversos: parseFloat(formData.valorDiversos || 0),
          };

          // Remove o campo horaAbastecimento do objeto final
          delete dataToSubmit.horaAbastecimento;


          if (editingId) {
            await fuelingService.update(editingId, dataToSubmit);
            showNotification('Abastecimento atualizado com sucesso!');
          } else {
            const newFueling = await fuelingService.create(dataToSubmit);
            showNotification('Abastecimento cadastrado com sucesso!');
          }
          await loadData();
          handleClose();
        })();
      } catch (err) {
        handleError(err, setError);
        showNotification(err.message || 'Erro ao salvar abastecimento', 'error');
      }
  };


  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente excluir este abastecimento?')) return;
    
    try {
      withLoading(async () => {
        await fuelingService.delete(id);
        showNotification('Abastecimento excluído com sucesso!');
        await loadData();
      })();
    } catch (err) {
      handleError(err, setError);
      showNotification(err.message || 'Erro ao excluir abastecimento', 'error');
    }
  };


  const getVehicleName = (id) => {
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? `${vehicle.placa} - ${vehicle.modelo}` : '-';
  };


  const getStationName = (id) => {
    const station = gasStations.find(s => s.id === id);
    return station ? station.name : '-';
  };


  // Apply UI filters to the loaded fuelings and sort by date desc
  const displayedFuelings = (Array.isArray(fuelings) ? fuelings : []).filter((f) => {
    let ok = true;

    if (filterMonth || filterYear) {
      if (!f.dataAbastecimento) return false;
      
      // Extrai mês e ano sem conversão de timezone
      const dateParts = f.dataAbastecimento.split('T')[0].split('-');
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10);
      
      if (filterMonth) {
        ok = ok && (month === parseInt(filterMonth, 10));
      }
      
      if (filterYear) {
        ok = ok && (year === parseInt(filterYear, 10));
      }
    }

    if (filterVehicle) {
      ok = ok && (String(f.veiculoId) === String(filterVehicle));
    }

    if (filterPosto) {
      ok = ok && (String(f.postoId) === String(filterPosto));
    }

    return ok;
  }).sort((a, b) => {
    // Compara as strings ISO diretamente (não converte para Date)
    const ta = a && a.dataAbastecimento ? a.dataAbastecimento : '';
    const tb = b && b.dataAbastecimento ? b.dataAbastecimento : '';
    return tb.localeCompare(ta); // descending: newest first
  });

  const getVehiclePlaca = (id) => {
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? vehicle.placa : '-';
  };

  const getGasStationName = (id) => {
    const gasStation = gasStations.find(g => g.id === id);
    return gasStation ? gasStation.name : '-';
  };

  if (isMobile) {
    return (
      <FuelingsMobile
        fuelings={displayedFuelings}
        vehicles={vehicles}
        gasStations={gasStations}
        filterMonth={filterMonth}
        filterYear={filterYear}
        filterVehicle={filterVehicle}
        filterPosto={filterPosto}
        yearOptions={yearOptions}
        formData={formData}
        open={open}
        editingId={editingId}
        handleFilterMonthChange={(e) => setFilterMonth(e.target.value)}
        handleFilterYearChange={(e) => setFilterYear(e.target.value)}
        handleFilterVehicleChange={(e) => setFilterVehicle(e.target.value)}
        handleFilterPostoChange={(e) => setFilterPosto(e.target.value)}
        handleOpen={handleOpen}
        handleClose={handleClose}
        handleChange={handleChange}
        handleCheckboxChange={handleCheckboxChange}
        handleSubmit={handleSubmit}
        handleDelete={handleDelete}
        getVehiclePlaca={getVehiclePlaca}
        getGasStationName={getGasStationName}
      />
    );
  }


  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Abastecimentos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Novo Abastecimento
        </Button>
      </Box>

       {/* Seção de Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <FilterList sx={{ mr: 1 }} />
          <Typography variant="h6">Filtros</Typography>
        </Box>
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 140 }} size="small">
            <InputLabel>Mês</InputLabel>
            <Select
              value={filterMonth}
              label="Mês"
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {[...Array(12)].map((_, i) => (
                <MenuItem key={i + 1} value={i + 1}>{new Date(defaultYear, i).toLocaleString('pt-BR', { month: 'long' })}</MenuItem>
              ))}
            </Select>
          </FormControl>


          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Ano</InputLabel>
            <Select
              value={filterYear}
              label="Ano"
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {yearOptions.map(y => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>


          <FormControl sx={{ minWidth: 220 }} size="small">
            <InputLabel>Veículo</InputLabel>
            <Select
              value={filterVehicle}
              label="Veículo"
              onChange={(e) => setFilterVehicle(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {(Array.isArray(vehicles) ? vehicles : []).map(v => (
                <MenuItem key={v.id} value={v.id}>{v.placa} - {v.marca} {v.modelo}</MenuItem>
              ))}
            </Select>
          </FormControl>


          <FormControl sx={{ minWidth: 220 }} size="small">
            <InputLabel>Posto</InputLabel>
            <Select
              value={filterPosto}
              label="Posto"
              onChange={(e) => setFilterPosto(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {(Array.isArray(gasStations) ? gasStations : []).map(s => (
                <MenuItem key={s.id} value={s.id}>{s.name || s.nome}</MenuItem>
              ))}
            </Select>
          </FormControl>


          <Button onClick={() => { setFilterMonth(defaultMonth); setFilterYear(defaultYear); setFilterVehicle(''); setFilterPosto(''); }}>Limpar filtros</Button>
        </Box>

        <Box mt={2}>
          <Typography variant="body2" color="textSecondary">
            Exibindo {displayedFuelings.length} de {displayedFuelings.length} registros
          </Typography>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data/Hora</TableCell>
              <TableCell>Nº Documento</TableCell>
              <TableCell>Veículo</TableCell>
              <TableCell>Posto</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Litros</TableCell>
              <TableCell>Total Diesel</TableCell>
              <TableCell>KM</TableCell>
              <TableCell>Cheio</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedFuelings.map((fueling) => (
              <TableRow key={fueling.id}>
                <TableCell>{formatLocalDateTime(fueling.dataAbastecimento)}</TableCell>
                <TableCell>{fueling.numeroDocumento || '-'}</TableCell>
                <TableCell>{getVehicleName(fueling.veiculoId)}</TableCell>
                <TableCell>{getStationName(fueling.postoId)}</TableCell>
                <TableCell>{fueling.tipoCombustivel}</TableCell>
                <TableCell>{fueling.litros}L</TableCell>
                <TableCell>R$ {parseFloat(fueling.valorDiesel).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>{fueling.km}</TableCell>
                <TableCell>{fueling.cheio ? 'Sim' : 'Não'}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpen(fueling)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(fueling.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>


      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar Abastecimento' : 'Novo Abastecimento'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Data"
                  name="dataAbastecimento"
                  type="date"
                  value={formData.dataAbastecimento}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Hora"
                  name="horaAbastecimento"
                  type="time"
                  value={formData.horaAbastecimento}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </Grid>
            <TextField
              label="Número do Documento"
              name="numeroDocumento"
              value={formData.numeroDocumento}
              onChange={handleChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Veículo</InputLabel>
              <Select
                name="veiculoId"
                value={formData.veiculoId}
                onChange={handleChange}
                label="Veículo"
              >
                {(Array.isArray(vehicles) ? vehicles : []).map((vehicle) => (
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
                value={formData.postoId}
                onChange={handleChange}
                label="Posto"
              >
                {(Array.isArray(gasStations) ? gasStations : []).map((station) => (
                  <MenuItem key={station.id} value={station.id}>
                    {station.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
              label="Quantidade de Litros"
              name="litros"
              type="number"
              value={formData.litros}
              onChange={handleChange}
              fullWidth
            />
            <CurrencyInput
              label="Valor Total"
              name="valorDiesel"
              value={formData.valorDiesel}
              onChange={handleChange}
              fullWidth
            />
            <CurrencyInput
              label="Valor Arla"
              name="valorArla"
              value={formData.valorArla}
              onChange={handleChange}
              fullWidth
            />
            {!editingId && (
              <CurrencyInput
                label="Valor Diversos"
                name="valorDiversos"
                value={formData.valorDiversos}
                onChange={handleChange}
                fullWidth
              />
            )}
            <TextField
              label="Quilometragem"
              name="km"
              type="number"
              value={formData.km}
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


      <Notification
        open={notifOpen}
        message={notifMessage}
        severity={notifSeverity}
        onClose={() => setNotifOpen(false)}
      />
    </Box>
  );
}


export default Fuelings;
