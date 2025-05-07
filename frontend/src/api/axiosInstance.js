// src/api/axiosInstance.js
import axios from 'axios';
import { useUserStore } from '../store/userStore';  // Utilise l'import nommé ici

const instance = axios.create({
  baseURL: 'http://localhost:8000',
});

instance.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token;  // Accède à l'état du token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
