// src/services/artikelService.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Fungsi untuk mengambil semua artikel
const fetchArticles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/artikel`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};

// Fungsi untuk mengambil artikel berdasarkan ID
const fetchArticleById = async (id) => {
  try {
    console.log('Fetching article with ID:', id);
    
    // Ambil semua artikel dan filter berdasarkan ID
    const response = await fetch(`${API_BASE_URL}/artikel`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const articles = await response.json();
    console.log('All articles received:', articles.length);
    
    // Cari artikel berdasarkan ID
    const article = articles.find(art => 
      art.id_artikel === parseInt(id) || 
      art.id_artikel === id ||
      art.id === parseInt(id) ||
      art.id === id
    );
    
    if (!article) {
      throw new Error(`Artikel dengan ID ${id} tidak ditemukan`);
    }
    
    console.log('Found article:', article);
    return article;
  } catch (error) {
    console.error('Error fetching article by ID:', error);
    throw error;
  }
};

// Alias untuk konsistensi dengan artikelDetail.jsx
const getArticleById = fetchArticleById;

// Fungsi untuk menambah jumlah pembaca artikel
const incrementArticleViews = async (articleId) => {
  try {
    console.log('Attempting to increment views for article ID:', articleId);
    
    // Pastikan articleId adalah number atau string yang valid
    if (!articleId) {
      throw new Error('Article ID is required');
    }

    // Mengirim PATCH request ke server untuk menambah jumlah pembaca
    const response = await fetch(`${API_BASE_URL}/artikel/${articleId}/increment-views`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to increment views: ${response.status}`);
    }

    const result = await response.json();
    console.log('Server response data:', result);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to increment views');
    }

    console.log('Views incremented successfully:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error incrementing article views:', error);
    // Re-throw the error so the calling function can handle it
    throw error;
  }
};

// Fungsi untuk mencari artikel berdasarkan query
const searchArticles = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/artikel/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching articles:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan artikel berdasarkan kategori
const getArticlesByCategory = async (category) => {
  try {
    const response = await fetch(`${API_BASE_URL}/artikel/category/${category}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan artikel populer
const getPopularArticles = async (limit = 6) => {
  try {
    // First try the specific endpoint
    const response = await fetch(`${API_BASE_URL}/artikel/popular?limit=${limit}`);
    if (response.ok) {
      return await response.json();
    }
    
    // If specific endpoint doesn't exist, fallback to general endpoint
    console.log('Popular endpoint not available, using fallback');
    const allArticles = await fetchArticles();
    
    // Sort by views/popularity (assuming there's a field like 'jumlah_pembaca' or 'views')
    const sortedArticles = allArticles.sort((a, b) => {
      const viewsA = a.jumlah_pembaca || a.views || 0;
      const viewsB = b.jumlah_pembaca || b.views || 0;
      return viewsB - viewsA;
    });
    
    return sortedArticles.slice(0, limit);
  } catch (error) {
    console.error('Error fetching popular articles:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan artikel terbaru - FIXED VERSION
const getLatestArticles = async (limit = 10) => {
  try {
    const allArticles = await fetchArticles();

    const sortedArticles = allArticles.sort((a, b) => {
      const dateA = new Date(a.tanggal_publikasi || a.created_at || a.date || 0);
      const dateB = new Date(b.tanggal_publikasi || b.created_at || b.date || 0);
      return dateB.getTime() - dateA.getTime();
    });

    // Transform data: tambahkan penulis dan foto_penulis
    const transformed = sortedArticles.slice(0, limit).map(article => ({
      ...article,
      penulis: article.nama_penulis,
      foto_penulis: article.foto_penulis,
      gambarUrl: article.gambar_artikel ? `${import.meta.env.VITE_API_BASE_URL}/uploads/artikel/${article.gambar_artikel}` : null,
      authorPhotoUrl: article.foto_penulis ? `${import.meta.env.VITE_API_BASE_URL}/uploads/artikel/${article.foto_penulis}` : null
    }));

    return transformed;
  } catch (error) {
    console.error('Error fetching latest articles (fallback):', error);
    throw error;
  }
};
// Export semua fungsi untuk digunakan di tempat lain
export default {
  fetchArticles,
  fetchArticleById,
  getArticleById, // Alias untuk konsistensi
  incrementArticleViews,
  searchArticles,
  getArticlesByCategory,
  getPopularArticles,
  getLatestArticles
};