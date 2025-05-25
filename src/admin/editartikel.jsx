import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';

export default function EditArtikel({ article, onBack, onUpdate }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    authorName: '',
    authorPhoto: null,
    articleImages: [],
    category: '',
  });

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.artikel || article.title || '',
        content: article.isi || article.content || '',
        authorName: article.penulis || article.authorName || '',
        authorPhoto: article.authorPhoto || article.authorPhotoUrl || null,
        articleImages: article.articleImages || (article.gambarUrl ? [article.gambarUrl] : []),
        category: article.kategori || article.category || '',
      });
    } else {
      // Reset form data when no article is provided
      setFormData({
        title: '',
        content: '',
        authorName: '',
        authorPhoto: null,
        articleImages: [],
        category: '',
      });
    }
  }, [article]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === 'author') {
          setFormData(prev => ({ ...prev, authorPhoto: event.target.result }));
        } else if (type === 'article') {
          setFormData(prev => ({
            ...prev,
            articleImages: [...prev.articleImages, event.target.result],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      articleImages: prev.articleImages.filter((_, i) => i !== index),
    }));
  };

  const removeAuthorPhoto = () => {
    setFormData(prev => ({ ...prev, authorPhoto: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.authorName) {
      alert('Mohon lengkapi semua bidang yang wajib diisi.');
      return;
    }

    const updatedArticle = {
      id: article?.id || Date.now(),
      artikel: formData.title,
      isi: formData.content,
      penulis: formData.authorName,
      tanggal: article?.tanggal || new Date().toLocaleDateString('id-ID'),
      authorPhoto: formData.authorPhoto,
      authorPhotoUrl: formData.authorPhoto, // Untuk konsistensi dengan kelolaartikel
      articleImages: formData.articleImages,
      gambarUrl: formData.articleImages[0] || article?.gambarUrl || '',
      kategori: formData.category,
    };

    if (onUpdate) {
      onUpdate(updatedArticle);
      alert('Artikel berhasil diperbarui!');
    } else {
      console.log('Form submitted:', formData);
      alert('Artikel berhasil disimpan!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-gray-800">
              Artikel | Edit Artikel
            </h1>
          </div>

          <div className="space-y-6">

            {/* Form Input Atas - Background Terpisah */}
            <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border font-bold border-purple-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 text-gray-700 bg-white"
                required
              />
            </div>

            {/* Edit Artikel Section - Satu Background */}
            <div className="bg-gray-100 p-6 rounded-lg border border-gray-200 space-y-8">
              
              {/* Edit Judul Artikel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Edit judul artikel
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-purple-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 text-gray-700 bg-white"
                  required
                />
              </div>

              {/* Edit Isi Artikel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Edit isi artikel
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full px-4 py-3 border border-purple-400 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 resize-none bg-white"
                  required
                />
              </div>

              {/* Tambah Kategori Artikel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tambah kategori artikel
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-purple-400 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 bg-white"
                  required
                >
                  <option value="">Pilih kategori</option>
                  <option value="Popular">Popular</option>
                  <option value="Destinasi">Destinasi</option>
                  <option value="Inspirasi">Inspirasi</option>
                </select>
              </div>

              {/* Edit Penulis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Edit penulis
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Nama</label>
                    <input
                      type="text"
                      name="authorName"
                      value={formData.authorName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-purple-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 text-gray-700 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Foto Penulis</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'author')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full h-12 border border-purple-400 rounded-lg bg-white flex items-center justify-between px-3 relative overflow-hidden">
                        {formData.authorPhoto ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={formData.authorPhoto}
                              alt="Author"
                              className="h-8 w-8 object-cover rounded-full border-2 border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeAuthorPhoto();
                              }}
                              className="w-4 h-4 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center z-20"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div></div>
                        )}
                        <Upload className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Gambar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Edit gambar artikel
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'article')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-full px-4 py-8 border border-purple-400 rounded-lg bg-white flex items-center justify-end">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {formData.articleImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 md:grid-cols-6 gap-3">
                    {formData.articleImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Gambar ${index + 1}`}
                          className="w-full h-20 object-cover rounded-md shadow-sm border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tombol Kembali dan Simpan */}
              <div className="flex justify-end gap-4 pt-6">
                <button
                  onClick={onBack}
                  className="px-12 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-12 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}