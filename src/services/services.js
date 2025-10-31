import api from './api';

export const clientService = {
  getAll: () => api.get('/person/client').then(res => Array.isArray(res.data) ? res.data : res.data.data || []),
  getById: id => api.get(`/person/client/${id}`).then(res => res.data),
  create: data => api.post('/person/client', data).then(res => res.data),
  update: (id, data) => api.put(`/person/client/${id}`, data).then(res => res.data),
  delete: id => api.delete(`/person/client/${id}`).then(res => res.data),
};

export const supplierService = {
  getAll: () => api.get('/supplier').then(res => res.data),
  getById: id => api.get(`/supplier/${id}`).then(res => res.data),
  create: data => api.post('/supplier', data).then(res => res.data),
  update: (id, data) => api.put(`/supplier/${id}`, data).then(res => res.data),
  delete: id => api.delete(`/supplier/${id}`).then(res => res.data),
};

export const gasStationService = {
  getAll: () => api.get('/person/gas-station').then(res => Array.isArray(res.data) ? res.data : res.data.data || []),
  getById: id => api.get(`/person/gas-station/${id}`).then(res => res.data),
  create: data => api.post('/person/gas-station', data).then(res => res.data),
  update: (id, data) => api.put(`/person/gas-station/${id}`, data).then(res => res.data),
  delete: id => api.delete(`/person/gas-station/${id}`).then(res => res.data),
};

export const fuelingService = {
  getAll: () => api.get('/fueling').then(res => Array.isArray(res.data) ? res.data : res.data.data || []),
  getById: id => api.get(`/fueling/${id}`).then(res => res.data),
  create: data => api.post('/fueling', data).then(res => res.data),
  update: (id, data) => api.put(`/fueling/${id}`, data).then(res => res.data),
  delete: id => api.delete(`/fueling/${id}`).then(res => res.data),
  getByMonthYear: (month, year) => api.get(`/fueling?month=${month}&year=${year}`).then(res => Array.isArray(res.data) ? res.data : res.data.data || []),
  getConsumoByMonthYear: (month, year) => api.get(`/fueling/consumo?month=${month}&year=${year}`).then(res => Array.isArray(res.data) ? res.data : res.data.data || []),
};

export const driverService = {
  getAll: () => api.get('/person/driver').then(res => res.data),
  getById: id => api.get(`/person/driver/${id}`).then(res => res.data),
  create: data => api.post('/person/driver', data).then(res => res.data),
  update: (id, data) => api.put(`/person/driver/${id}`, data).then(res => res.data),
  delete: id => api.delete(`/person/driver/${id}`).then(res => res.data),
};

export const payableService = {
  getAll: () => api.get('/payable').then(res => res.data),
  getById: id => api.get(`/payable/${id}`).then(res => res.data),
  create: data => api.post('/payable', data).then(res => res.data),
  update: (id, data) => api.put(`/payable/${id}`, data).then(res => res.data),
  delete: id => api.delete(`/payable/${id}`).then(res => res.data),
};

export const receivableService = {
  getAll: () => api.get('/receivable').then(res => res.data),
  getById: id => api.get(`/receivable/${id}`).then(res => res.data),
  create: data => api.post('/receivable', data).then(res => res.data),
  update: (id, data) => api.put(`/receivable/${id}`, data).then(res => res.data),
  delete: id => api.delete(`/receivable/${id}`).then(res => res.data),
};

export const vehicleService = {
  getAll: () => api.get('/vehicle').then(res => Array.isArray(res.data) ? res.data : res.data.data || []),
  getById: id => api.get(`/vehicle/${id}`).then(res => res.data),
  create: data => api.post('/vehicle', data).then(res => res.data),
  update: (id, data) => api.put(`/vehicle/${id}`, data).then(res => res.data),
  delete: id => api.delete(`/vehicle/${id}`).then(res => res.data),
};

export const tripService = {
  getAll: () => api.get('/trip').then(res => res.data),
  getById: id => api.get(`/trip/${id}`).then(res => res.data),
  create: data => api.post('/trip', data).then(res => res.data),
  update: (id, data) => api.put(`/trip/${id}`, data).then(res => res.data),
  delete: id => api.delete(`/trip/${id}`).then(res => res.data),
  getByMonthYear: (month, year) => api.get(`/trip?month=${month}&year=${year}`).then(res => res.data),
};
