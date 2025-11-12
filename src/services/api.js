import axios from 'axios';

const api = axios.create({
  baseURL: 'http://31.97.168.79:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
