// src/services/jadwalService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Periksa koneksi internet Anda.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Endpoint tidak ditemukan.');
    }
    
    if (error.response?.status === 500) {
      throw new Error('Terjadi kesalahan server. Silakan coba lagi.');
    }
    
    if (!error.response) {
      throw new Error('Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.');
    }
    
    throw error;
  }
);

class JadwalService {
  async getAllJadwal() {
    try {
      const response = await apiClient.get('/jadwal');
      return response.data;
    } catch (error) {
      console.error('Error fetching jadwal:', error);
      throw error;
    }
  }

  async getJadwalById(id) {
    try {
      const response = await apiClient.get(`/jadwal/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching jadwal by id:', error);
      throw error;
    }
  }

  async getJadwalByFilter(filters) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await apiClient.get(`/jadwal/filter?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered jadwal:', error);
      throw error;
    }
  }

  async createJadwal(jadwalData) {
    try {
      const response = await apiClient.post('/jadwal', jadwalData);
      return response.data;
    } catch (error) {
      console.error('Error creating jadwal:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menambahkan jadwal';
      throw new Error(errorMessage);
    }
  }

  async updateJadwal(id, jadwalData) {
    try {
      const response = await apiClient.put(`/jadwal/${id}`, jadwalData);
      return response.data;
    } catch (error) {
      console.error('Error updating jadwal:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memperbarui jadwal';
      throw new Error(errorMessage);
    }
  }

  async deleteJadwal(id) {
    try {
      const response = await apiClient.delete(`/jadwal/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting jadwal:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menghapus jadwal';
      throw new Error(errorMessage);
    }
  }
}

export default new JadwalService();