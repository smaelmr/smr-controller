// Mock Data Storage
const STORAGE_KEYS = {
  VEHICLES: 'smr_vehicles',
  GAS_STATIONS: 'smr_gas_stations',
  SUPPLIERS: 'smr_suppliers',
  DRIVERS: 'smr_drivers',
  CLIENTS: 'smr_clients',
  TRIPS: 'smr_trips',
  FUELINGS: 'smr_fuelings',
  RECEIVABLES: 'smr_receivables',
  PAYABLES: 'smr_payables',
};

// Initialize with sample data
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify([
      { id: 1, marca: 'Scania', modelo: 'R450', ano: 2020, tipo: 'Cavalo Mecânico', placa: 'ABC-1234' },
      { id: 2, marca: 'Volvo', modelo: 'FH540', ano: 2019, tipo: 'Cavalo Mecânico', placa: 'DEF-5678' },
    ]));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.GAS_STATIONS)) {
    localStorage.setItem(STORAGE_KEYS.GAS_STATIONS, JSON.stringify([
      { id: 1, nome: 'Posto Ipiranga', localizacao: 'BR-116, KM 320', contato: '(51) 3333-4444' },
    ]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify([
      { id: 1, nome: 'Auto Mecânica Silva', servico: 'Manutenção Geral', localizacao: 'Porto Alegre - RS', contato: '(51) 9999-8888' },
    ]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.DRIVERS)) {
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify([
      { id: 1, nome: 'João Silva', cpf: '123.456.789-00', telefone: '(51) 99999-0000', cnhCategoria: 'E', cnhValidade: '2026-12-31' },
    ]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify([
      { id: 1, nomeRazao: 'Transportadora ABC Ltda', cnpjCpf: '12.345.678/0001-99', endereco: 'Av. Brasil, 1000', contato: '(51) 3344-5566' },
    ]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.TRIPS)) {
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify([
      { 
        id: 1, 
        valorFrete: 5000, 
        agenciamento: 500,
        origem: 'Porto Alegre', 
        destino: 'São Paulo', 
        clienteId: 1, 
        motoristaId: 1, 
        veiculoId: 1,
        dataColeta: '2025-10-01', 
        dataEntrega: '2025-10-03', 
        observacao: 'Carga frágil' 
      },
    ]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.FUELINGS)) {
    localStorage.setItem(STORAGE_KEYS.FUELINGS, JSON.stringify([
      { id: 1, valorTotal: 850, litros: 300, veiculoId: 1, postoId: 1, quilometragem: 218310, data: '2025-10-01', tipoCombustivel: 'Diesel' },
    ]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.RECEIVABLES)) {
    localStorage.setItem(STORAGE_KEYS.RECEIVABLES, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.PAYABLES)) {
    localStorage.setItem(STORAGE_KEYS.PAYABLES, JSON.stringify([]));
  }
};

// Generic CRUD operations
const getAll = (key) => {
  initializeData();
  return JSON.parse(localStorage.getItem(key) || '[]');
};

const getById = (key, id) => {
  const items = getAll(key);
  return items.find(item => item.id === parseInt(id));
};

const create = (key, item) => {
  const items = getAll(key);
  const newItem = { ...item, id: Date.now() };
  items.push(newItem);
  localStorage.setItem(key, JSON.stringify(items));
  return newItem;
};

const update = (key, id, updatedItem) => {
  const items = getAll(key);
  const index = items.findIndex(item => item.id === parseInt(id));
  if (index !== -1) {
    items[index] = { ...items[index], ...updatedItem };
    localStorage.setItem(key, JSON.stringify(items));
    return items[index];
  }
  return null;
};

const remove = (key, id) => {
  const items = getAll(key);
  const filtered = items.filter(item => item.id !== parseInt(id));
  localStorage.setItem(key, JSON.stringify(filtered));
  return true;
};

// Exported API
export const vehicleService = {
  getAll: () => getAll(STORAGE_KEYS.VEHICLES),
  getById: (id) => getById(STORAGE_KEYS.VEHICLES, id),
  create: (vehicle) => create(STORAGE_KEYS.VEHICLES, vehicle),
  update: (id, vehicle) => update(STORAGE_KEYS.VEHICLES, id, vehicle),
  delete: (id) => remove(STORAGE_KEYS.VEHICLES, id),
};

export const gasStationService = {
  getAll: () => getAll(STORAGE_KEYS.GAS_STATIONS),
  getById: (id) => getById(STORAGE_KEYS.GAS_STATIONS, id),
  create: (station) => create(STORAGE_KEYS.GAS_STATIONS, station),
  update: (id, station) => update(STORAGE_KEYS.GAS_STATIONS, id, station),
  delete: (id) => remove(STORAGE_KEYS.GAS_STATIONS, id),
};

export const supplierService = {
  getAll: () => getAll(STORAGE_KEYS.SUPPLIERS),
  getById: (id) => getById(STORAGE_KEYS.SUPPLIERS, id),
  create: (supplier) => create(STORAGE_KEYS.SUPPLIERS, supplier),
  update: (id, supplier) => update(STORAGE_KEYS.SUPPLIERS, id, supplier),
  delete: (id) => remove(STORAGE_KEYS.SUPPLIERS, id),
};

export const driverService = {
  getAll: () => getAll(STORAGE_KEYS.DRIVERS),
  getById: (id) => getById(STORAGE_KEYS.DRIVERS, id),
  create: (driver) => create(STORAGE_KEYS.DRIVERS, driver),
  update: (id, driver) => update(STORAGE_KEYS.DRIVERS, id, driver),
  delete: (id) => remove(STORAGE_KEYS.DRIVERS, id),
};

export const clientService = {
  getAll: () => getAll(STORAGE_KEYS.CLIENTS),
  getById: (id) => getById(STORAGE_KEYS.CLIENTS, id),
  create: (client) => create(STORAGE_KEYS.CLIENTS, client),
  update: (id, client) => update(STORAGE_KEYS.CLIENTS, id, client),
  delete: (id) => remove(STORAGE_KEYS.CLIENTS, id),
};

export const tripService = {
  getAll: () => getAll(STORAGE_KEYS.TRIPS),
  getById: (id) => getById(STORAGE_KEYS.TRIPS, id),
  create: (trip) => create(STORAGE_KEYS.TRIPS, trip),
  update: (id, trip) => update(STORAGE_KEYS.TRIPS, id, trip),
  delete: (id) => remove(STORAGE_KEYS.TRIPS, id),
};

export const fuelingService = {
  getAll: () => getAll(STORAGE_KEYS.FUELINGS),
  getById: (id) => getById(STORAGE_KEYS.FUELINGS, id),
  create: (fueling) => create(STORAGE_KEYS.FUELINGS, fueling),
  update: (id, fueling) => update(STORAGE_KEYS.FUELINGS, id, fueling),
  delete: (id) => remove(STORAGE_KEYS.FUELINGS, id),
};

export const receivablesService = {
  getAll: () => getAll(STORAGE_KEYS.RECEIVABLES),
  getById: (id) => getById(STORAGE_KEYS.RECEIVABLES, id),
  create: (item) => create(STORAGE_KEYS.RECEIVABLES, item),
  update: (id, item) => update(STORAGE_KEYS.RECEIVABLES, id, item),
  delete: (id) => remove(STORAGE_KEYS.RECEIVABLES, id),
};

export const payablesService = {
  getAll: () => getAll(STORAGE_KEYS.PAYABLES),
  getById: (id) => getById(STORAGE_KEYS.PAYABLES, id),
  create: (item) => create(STORAGE_KEYS.PAYABLES, item),
  update: (id, item) => update(STORAGE_KEYS.PAYABLES, id, item),
  delete: (id) => remove(STORAGE_KEYS.PAYABLES, id),
};