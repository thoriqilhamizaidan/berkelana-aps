// src/services/transaksiService.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const transaksiService = {
  // Simpan head transaksi
  createHeadTransaksi: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/headtransaksi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating head transaksi:', error);
      throw error;
    }
  },

  // Update head transaksi
  updateHeadTransaksi: async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/headtransaksi/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating head transaksi:', error);
      throw error;
    }
  },

  // Simpan detail transaksi
  createDetailTransaksi: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/detailtransaksi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating detail transaksi:', error);
      throw error;
    }
  },

  // Simpan multiple detail transaksi
  createMultipleDetailTransaksi: async (dataArray) => {
    try {
      console.log('Creating multiple detail transaksi:', dataArray);
      
      const promises = dataArray.map((data, index) => 
        fetch(`${API_BASE_URL}/detailtransaksi`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }).then(response => {
          if (!response.ok) {
            throw new Error(`Failed to create detail transaksi for passenger ${index + 1}: ${response.status}`);
          }
          return response.json();
        })
      );
      
      const results = await Promise.all(promises);
      console.log('All detail transaksi created successfully:', results);
      return results;
    } catch (error) {
      console.error('Error creating multiple detail transaksi:', error);
      throw error;
    }
  }
};

// UBAH INI: Dari named export ke default export
export default transaksiService;