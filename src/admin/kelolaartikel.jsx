import React, { useState, useMemo } from 'react';

const KelolaArtikel = ({ articles, onTambahClick, onDeleteArticle, onEditArticle }) => {
  const [expandedArticles, setExpandedArticles] = useState(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Jumlah artikel per halaman

  // Hitung data untuk pagination
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
      onDeleteArticle(articleToDelete);
      setShowConfirmModal(false);
      setArticleToDelete(null);
      
      // Jika halaman saat ini kosong setelah delete, pindah ke halaman sebelumnya
      const remainingItems = articles.length - 1;
      const maxPage = Math.ceil(remainingItems / itemsPerPage);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 10;
    
    // Tentukan range halaman yang akan ditampilkan
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust startPage jika endPage sudah di maksimum
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Nomor halaman
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
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

    // Tambahkan "Selanjutnya" di ujung kanan
    pageNumbers.push(
      <span key="selanjutnya" className="ml-4 text-sm text-gray-600">
        Selanjutnya
      </span>
    );

    return (
      <div className="flex items-center gap-0 mt-6">
        {pageNumbers}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-6 pt-18">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Kelola Artikel</h1>
          <button 
            onClick={onTambahClick}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Tambah Data +
          </button>
        </div>

        {/* Tabel Artikel */}
        <div className="bg-gray-100 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr className="border-b border-gray-300">
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Tanggal Artikel</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Artikel</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Isi</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Penulis</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Gambar</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((article, index) => {
                const isExpanded = expandedArticles.has(article.id);
                const shouldTruncate = article.isi && article.isi.length > 150;
                const displayText = isExpanded || !shouldTruncate
                  ? article.isi
                  : article.isi.substring(0, 150) + '...';

                return (
                  <tr key={article.id} className="bg-gray-100">
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
                          onClick={() => toggleExpand(article.id)}
                          className="text-xs text-blue-500 hover:text-blue-700 mt-2 cursor-pointer font-medium"
                        >
                          {isExpanded ? 'Sembunyikan' : 'Selengkapnya'}
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 align-top">
                      {article.penulis}
                    </td>
                    <td className="py-4 px-6 align-top">
                      {article.gambarUrl ? (
                        <img 
                          src={article.gambarUrl} 
                          alt="Artikel" 
                          className="w-16 h-12 object-cover rounded border border-gray-200"
                        />
                      ) : article.gambar ? (
                        <div className="w-16 h-12 bg-gray-300 rounded flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
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
                          onClick={() => handleDeleteClick(article.id)}
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

        {/* Pagination */}
        {renderPagination()}
      </div>

      {/* Modal Konfirmasi */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 relative">
            <button onClick={() => setShowConfirmModal(false)} className="absolute top-3 right-3 text-black text-xl font-bold">
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
    </div>
  );
};

export default KelolaArtikel;