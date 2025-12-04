import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://31.97.168.79:8088/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
