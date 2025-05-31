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

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Attach the token to the headers
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
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
  // Get all jadwal
  async getAllJadwal() {
    try {
      const response = await apiClient.get('/jadwal');
      return response.data;
    } catch (error) {
      console.error('Error fetching jadwal:', error);
      throw error;
    }
  }

  // Get jadwal by ID
  async getJadwalById(id) {
    try {
      const response = await apiClient.get(`/jadwal/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching jadwal by id:', error);
      throw error;
    }
  }

  // Create a new jadwal
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

  // Update an existing jadwal
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

  // Delete a jadwal
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
