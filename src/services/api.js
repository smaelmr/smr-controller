import axios from 'axios';

const api = axios.create({
  baseURL: 'smr-api:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
