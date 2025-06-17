// src/services/kendaraanService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5052/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor (optional - untuk logging)
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    // Add Authorization header here
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor (untuk error handling global)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    // Handle common errors
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

class KendaraanService {
  async getAllKendaraan() {
    try {
      const response = await apiClient.get('/kendaraan');
      return response.data;
    } catch (error) {
      console.error('Error fetching kendaraan:', error);
      throw error;
    }
  }

  async getKendaraanById(id) {
    try {
      const response = await apiClient.get(`/kendaraan/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching kendaraan by id:', error);
      throw error;
    }
  }

  async createKendaraan(formData) {
    try {
      const form = new FormData();
      
      // Convert camelCase to snake_case for backend
      const fieldMapping = {
        tipeArmada: 'tipe_armada',
        nomorArmada: 'nomor_armada',
        nomorKendaraan: 'nomor_kendaraan',
        formatKursi: 'format_kursi',
        kapasitasKursi: 'kapasitas_kursi',
        namaKondektur: 'nama_kondektur',
        nomorKondektur: 'nomor_kondektur',
        fasilitas: 'fasilitas',
        gambar: 'gambar'
      };

      Object.keys(fieldMapping).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          if (key === 'fasilitas') {
            form.append(fieldMapping[key], JSON.stringify(formData[key]));
          } else if (key === 'gambar' && formData[key] instanceof File) {
            form.append(fieldMapping[key], formData[key]);
          } else if (key !== 'gambar') {
            form.append(fieldMapping[key], formData[key]);
          }
        }
      });

      // For FormData, axios automatically sets Content-Type to multipart/form-data
      const response = await apiClient.post('/kendaraan', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating kendaraan:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menambahkan kendaraan';
      throw new Error(errorMessage);
    }
  }

  async updateKendaraan(id, formData) {
    try {
      const form = new FormData();
      
      // Convert camelCase to snake_case for backend
      const fieldMapping = {
        tipeArmada: 'tipe_armada',
        nomorArmada: 'nomor_armada',
        nomorKendaraan: 'nomor_kendaraan',
        formatKursi: 'format_kursi',
        kapasitasKursi: 'kapasitas_kursi',
        namaKondektur: 'nama_kondektur',
        nomorKondektur: 'nomor_kondektur',
        fasilitas: 'fasilitas',
        gambar: 'gambar'
      };

      Object.keys(fieldMapping).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          if (key === 'fasilitas') {
            form.append(fieldMapping[key], JSON.stringify(formData[key]));
          } else if (key === 'gambar' && formData[key] instanceof File) {
            form.append(fieldMapping[key], formData[key]);
          } else if (key !== 'gambar') {
            form.append(fieldMapping[key], formData[key]);
          }
        }
      });

      const response = await apiClient.put(`/kendaraan/${id}`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating kendaraan:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memperbarui kendaraan';
      throw new Error(errorMessage);
    }
  }

  async deleteKendaraan(id) {
    try {
      const response = await apiClient.delete(`/kendaraan/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting kendaraan:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menghapus kendaraan';
      throw new Error(errorMessage);
    }
  }

  getImageUrl(filename) {
    if (!filename) return null;
    return `${API_BASE_URL.replace('/api', '')}/uploads/kendaraan/${filename}`;
  }
}

export default new KendaraanService();
