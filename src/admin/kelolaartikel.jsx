import React, { useState, useMemo, useEffect } from 'react';

const KelolaArtikel = ({ onTambahClick, onDeleteArticle, onEditArticle, newArticle }) => {
  const [articles, setArticles] = useState([]);
  const [expandedArticles, setExpandedArticles] = useState(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchArticles = () => {
      setLoading(true);
      setError(null);
      
      fetch("http://localhost:3000/api/artikel")
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log('Fetched data:', data); // Debug log
          
          // Check if data is an array
          if (!Array.isArray(data)) {
            throw new Error('Data yang diterima bukan array');
          }
          
          const mapped = data.map(item => {
            const tanggalUpload = new Date(item.createdAt).toLocaleDateString('id-ID', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
            return {
              ...item,
              id: item.id_artikel, // Make sure we have consistent ID
              penulis: item.nama_penulis,
              artikel: item.judul,
              isi: item.isi,
              kategori: item.kategori,
              gambarUrl: item.gambar_artikel ? `http://localhost:3000/uploads/artikel/${item.gambar_artikel}` : null,
              authorPhotoUrl: item.foto_penulis ? `http://localhost:3000/uploads/artikel/${item.foto_penulis}` : null,
              tanggal: tanggalUpload
            };
          });
          const sorted = mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setArticles(sorted);
        })
        .catch((err) => {
          console.error('Fetch error:', err);
          setError(`Gagal memuat artikel: ${err.message}`);
          setArticles([]); // Set empty array on error
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchArticles();
  }, [newArticle]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return articles.slice(startIndex, endIndex);
  }, [articles, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(articles.length / itemsPerPage);

  const toggleExpand = (articleId) => {
    setExpandedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const handleDeleteClick = (id) => {
    setArticleToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (articleToDelete) {
      // Call API to delete article
      fetch(`http://localhost:3000/api/artikel/${articleToDelete}`, {
        method: 'DELETE'
      })
        .then(res => res.json())
        .then(data => {
          // Remove article from local state
          setArticles(prev => prev.filter(article => 
            (article.id_artikel || article.id) !== articleToDelete
          ));
          
          if (onDeleteArticle) {
            onDeleteArticle(articleToDelete);
          }
          
          setShowConfirmModal(false);
          setArticleToDelete(null);

          const remainingItems = articles.length - 1;
          const maxPage = Math.ceil(remainingItems / itemsPerPage);
          if (currentPage > maxPage && maxPage > 0) {
            setCurrentPage(maxPage);
          }
          
          alert('Artikel berhasil dihapus!');
        })
        .catch(err => {
          console.error('Delete error:', err);
          alert('Gagal menghapus artikel!');
          setShowConfirmModal(false);
          setArticleToDelete(null);
        });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 10;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add page number buttons
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={`page-${i}`}
          onClick={() => handlePageChange(i)}
          className={`w-8 h-8 text-sm flex items-center justify-center ${
            currentPage === i
              ? 'bg-purple-100 text-black rounded'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }

    // Add "Selanjutnya" text
    pageNumbers.push(
      <span key="next-label" className="ml-4 text-sm text-gray-600">
        Selanjutnya
      </span>
    );

    return <div className="flex items-center gap-0 mt-6">{pageNumbers}</div>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 pt-18">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">Memuat artikel...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6 pt-18">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Kelola Artikel</h1>
            <button
              onClick={onTambahClick}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Tambah Data +
            </button>
          </div>
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 pt-18">
     {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center  bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 relative">
            <button 
              onClick={() => setShowConfirmModal(false)} 
              className="absolute top-3 right-3 text-black text-xl font-bold"
            >
              ×
            </button>
            <h2 className="text-lg font-bold text-center mb-6">Apakah anda yakin?</h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-green-400 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Tidak
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Kelola Artikel</h1>
          <button
            onClick={onTambahClick}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Tambah Data +
          </button>
        </div>

        <div className="bg-gray-100 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr className="border-b border-gray-300">
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Tanggal Artikel</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Artikel</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Isi</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Kategori</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Penulis</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Gambar</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((article) => {
                const articleId = article.id_artikel || article.id;
                const isExpanded = expandedArticles.has(articleId);
                const shouldTruncate = article.isi && article.isi.length > 150;
                const displayText = isExpanded || !shouldTruncate
                  ? article.isi
                  : article.isi?.substring(0, 150) + '...';

                return (
                  <tr key={articleId} className="bg-gray-100">
                    <td className="py-4 px-6 text-sm text-gray-600 align-top">
                      {article.tanggal}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 font-medium align-top">
                      {article.artikel}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 align-top max-w-md">
                      <div className="whitespace-pre-wrap">{displayText}</div>
                      {shouldTruncate && (
                        <button
                          onClick={() => toggleExpand(articleId)}
                          className="text-xs text-blue-500 hover:text-blue-700 mt-2 cursor-pointer font-medium"
                        >
                          {isExpanded ? 'Sembunyikan' : 'Selengkapnya'}
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 align-top">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        article.kategori === 'Popular' ? 'bg-red-100 text-red-800' :
                        article.kategori === 'Destinasi' ? 'bg-blue-100 text-blue-800' :
                        article.kategori === 'Inspirasi' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {article.kategori || 'Tidak ada'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 align-top">
                      <div className="flex items-center gap-3">
                        {article.authorPhotoUrl ? (
                          <img
                            src={article.authorPhotoUrl}
                            alt="Author"
                            className="w-8 h-8 object-cover rounded-full border border-gray-200"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <span>{article.penulis}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-top">
                      {article.gambarUrl ? (
                        <img
                          src={article.gambarUrl}
                          alt="Artikel"
                          className="w-16 h-12 object-cover rounded border border-gray-200"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">Tidak ada</span>
                      )}
                    </td>
                    <td className="py-4 px-6 align-top">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEditArticle(article)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(articleId)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {renderPagination()}
      </div>
    </div>
  );
};

export default KelolaArtikel;