// src/services/authService.js

// Try different ports - update this based on where your backend is actually running
const API_URL = 'http://localhost:3000/api';

// Common alternatives if 3000 doesn't work:
// const API_URL = 'http://localhost:5000/api';  // Very common for Express servers
// const API_URL = 'http://localhost:8000/api';  // Common for Python/Django
// const API_URL = 'http://localhost:3001/api';  // If React is on 3000
// const API_URL = 'http://localhost:4000/api';  // Another common choice

class AuthService {
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json(); // Ambil data dulu sebelum cek status

      if (!response.ok) {
        // Ambil pesan error dari response JSON
        throw new Error(data.message || 'Login gagal');
      }

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);

      // Biarkan error.message menampilkan pesan dari server
      throw new Error(error.message || 'Gagal login');
    }
  }

  // Register
  async register(userData) {
    try {
      console.log('Attempting to connect to:', `${API_URL}/register`); // Debug log
      
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Register error:', error);
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check if the server is running.');
      } else if (error.message.includes('HTTP error')) {
        throw new Error(`Server error: ${error.message}`);
      } else {
        throw new Error('Network error');
      }
    }
  }

  // Forgot Password
  async forgotPassword(email) {
    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check if the server is running.');
      } else {
        throw new Error('Network error');
      }
    }
  }

  // Verify OTP
  async verifyOTP(email, otp) {
    try {
      const response = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Verify OTP error:', error);
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check if the server is running.');
      } else {
        throw new Error('Network error');
      }
    }
  }

  // Reset Password
  async resetPassword(email, resetToken, newPassword) {
    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, resetToken, newPassword }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check if the server is running.');
      } else {
        throw new Error('Network error');
      }
    }
  }

  // Change Password
  async changePassword(currentPassword, newPassword) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Change password error:', error);
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check if the server is running.');
      } else {
        throw new Error('Network error');
      }
    }
  }

  // Resend OTP
  async resendOTP(email) {
    try {
      const response = await fetch(`${API_URL}/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Resend OTP error:', error);
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check if the server is running.');
      } else {
        throw new Error('Network error');
      }
    }
  }

  // Get Profile
  async getProfile() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check if the server is running.');
      } else {
        throw new Error('Network error');
      }
    }
  }

  // Update Profile
  async updateProfile(profileData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check if the server is running.');
      } else {
        throw new Error('Network error');
      }
    }
  }

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  // Get current user
  getCurrentUser() {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  }

  // Get token
  getToken() {
    return localStorage.getItem('token');
  }

  // Test connection method
  async testConnection() {
    try {
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export default new AuthService();