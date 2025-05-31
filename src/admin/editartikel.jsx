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
        authorPhoto: article.authorPhotoUrl || null,
        articleImages: article.gambarUrl ? [article.gambarUrl] : [],
        category: article.kategori || article.category || '',
      });
    } else {
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

  const dataURLtoBlob = (dataURL) => {
    try {
      // Check if dataURL is valid
      if (!dataURL || typeof dataURL !== 'string') {
        throw new Error('Invalid dataURL');
      }

      // Check if it contains the expected comma separator
      if (!dataURL.includes(',')) {
        throw new Error('Invalid dataURL format - missing comma separator');
      }

      const [header, base64] = dataURL.split(',');
      
      // Check if header exists and has the expected format
      if (!header || !base64) {
        throw new Error('Invalid dataURL format - missing header or base64 data');
      }

      // Extract MIME type with better error handling
      const mimeMatch = header.match(/:(.*?);/);
      if (!mimeMatch || !mimeMatch[1]) {
        throw new Error('Invalid dataURL format - cannot extract MIME type');
      }

      const mime = mimeMatch[1];
      const binary = atob(base64);
      let len = binary.length;
      const u8arr = new Uint8Array(len);
      
      while (len--) {
        u8arr[len] = binary.charCodeAt(len);
      }
      
      return new Blob([u8arr], { type: mime });
    } catch (error) {
      console.error('Error converting dataURL to blob:', error);
      // Return a default empty blob if conversion fails
      return new Blob([], { type: 'image/jpeg' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.authorName) {
      alert('Mohon lengkapi semua bidang yang wajib diisi.');
      return;
    }

    const formPayload = new FormData();
    formPayload.append('judul', formData.title);
    formPayload.append('isi', formData.content);
    formPayload.append('kategori', formData.category);
    formPayload.append('nama_penulis', formData.authorName);

    // Handle article images
    if (formData.articleImages.length > 0) {
      const imageData = formData.articleImages[0];
      
      // Check if it's a base64 data URL (newly uploaded)
      if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
        try {
          const blob = dataURLtoBlob(imageData);
          formPayload.append('gambar_artikel', blob, 'artikel.jpg');
        } catch (error) {
          console.error('Error processing article image:', error);
          alert('Terjadi kesalahan saat memproses gambar artikel.');
          return;
        }
      }
      // If it's an existing URL, we don't need to upload it again
    }

    // Handle author photo
    if (formData.authorPhoto) {
      // Check if it's a base64 data URL (newly uploaded)
      if (typeof formData.authorPhoto === 'string' && formData.authorPhoto.startsWith('data:image')) {
        try {
          const blob = dataURLtoBlob(formData.authorPhoto);
          formPayload.append('foto_penulis', blob, 'penulis.jpg');
        } catch (error) {
          console.error('Error processing author photo:', error);
          alert('Terjadi kesalahan saat memproses foto penulis.');
          return;
        }
      }
      // If it's an existing URL, we don't need to upload it again
    }

    fetch(`http://localhost:3000/api/artikel/${article?.id_artikel || article?.id}`, {
      method: 'PUT',
      body: formPayload
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        alert('Artikel berhasil diperbarui!');
        if (onUpdate) {
          const updatedData = {
            ...data,
            artikel: data.judul,
            isi: data.isi,
            kategori: data.kategori,
            penulis: data.nama_penulis,
            gambarUrl: data.gambar_artikel ? `http://localhost:3000/uploads/artikel/${data.gambar_artikel}` : null,
            authorPhotoUrl: data.foto_penulis ? `http://localhost:3000/uploads/artikel/${data.foto_penulis}` : null,
          };
          onUpdate(updatedData);
        }
      })
      .catch(err => {
        console.error('Gagal:', err);
        alert('Terjadi kesalahan saat memperbarui artikel.');
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-gray-800">
              Artikel | Edit Artikel
            </h1>
          </div>

          <div className="space-y-6">
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

            <div className="bg-gray-100 p-6 rounded-lg border border-gray-200 space-y-8">
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