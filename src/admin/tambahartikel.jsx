import React, { useState } from 'react';
import { Upload, Image, ArrowLeft } from 'lucide-react';

const TambahArtikel = ({ onBack, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    authorName: '',
    authorPhoto: null,
    authorPhotoPreview: null,
    articleImage: null,
    articleImagePreview: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        [fieldName]: file,
        [`${fieldName}Preview`]: imageUrl
      }));
    }
  };

  const handleSubmit = () => {
    if (formData.title && formData.content && formData.authorName) {
      const newArticle = {
        id: Date.now(),
        tanggal: new Date().toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        artikel: formData.title,
        isi: formData.content,
        penulis: formData.authorName,
        gambar: formData.articleImage ? true : false,
        gambarUrl: formData.articleImagePreview
      };

      setFormData({
        title: '',
        content: '',
        authorName: '',
        authorPhoto: null,
        authorPhotoPreview: null,
        articleImage: null,
        articleImagePreview: null
      });

      onSave(newArticle);
      alert('Artikel berhasil ditambahkan!');
    } else {
      alert('Mohon lengkapi semua field yang required!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Artikel | Tambah Artikel
          </h1>
        </div>

        <div className="bg-gray-100 rounded-lg shadow-sm p-8">
          <div className="space-y-6">
            {/* Tambah judul artikel */}
            <div>
              <label className="block text-sm text-gray-600 mb-3">
                Tambah judul artikel
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                placeholder=""
              />
            </div>

            {/* Tambah isi artikel */}
            <div>
              <label className="block text-sm text-gray-600 mb-3">
                Tambah isi artikel
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none"
                placeholder=""
              />
            </div>

            {/* Tambah penulis */}
            <div>
              <label className="block text-sm text-gray-600 mb-4">
                Tambah penulis
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Nama</label>
                  <input
                    type="text"
                    name="authorName"
                    value={formData.authorName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                    placeholder=""
                  />
                </div>

                {/* Foto Penulis */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Foto Penulis
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'authorPhoto')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full h-12 border border-purple-400 rounded-lg bg-white flex items-center justify-between px-3 relative overflow-hidden">
                      {formData.authorPhotoPreview ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={formData.authorPhotoPreview}
                            alt="Author Preview"
                            className="h-8 w-8 object-cover rounded-full"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData(prev => ({
                                ...prev,
                                authorPhoto: null,
                                authorPhotoPreview: null
                              }));
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

            {/* Tambah gambar */}
            <div>
              <label className="block text-sm text-gray-600 mb-3">
                Tambah gambar
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'articleImage')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-full px-4 py-8 border border-purple-400 rounded-lg bg-white flex items-center justify-end">
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Preview gambar artikel */}
            {formData.articleImagePreview ? (
              <div className="flex justify-start">
                <div className="relative">
                  <img
                    src={formData.articleImagePreview}
                    alt="Preview"
                    className="w-32 h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData(prev => ({
                        ...prev,
                        articleImage: null,
                        articleImagePreview: null
                      }))
                    }
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-start">
                <div className="w-24 h-24 bg-gray-400 rounded-lg flex items-center justify-center">
                  <Image className="w-8 h-8 text-white" />
                </div>
              </div>
            )}

            {/* Tombol Simpan & Kembali */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={onBack}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TambahArtikel;
