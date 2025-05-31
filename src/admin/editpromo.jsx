import React, { useState, useEffect } from 'react';
import { Upload, Image } from 'lucide-react';

// Utility: format backend datetime for datetime-local input
function toDatetimeLocal(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const pad = n => n.toString().padStart(2, '0');
  return (
    date.getFullYear() +
    '-' + pad(date.getMonth() + 1) +
    '-' + pad(date.getDate()) +
    'T' + pad(date.getHours()) +
    ':' + pad(date.getMinutes())
  );
}

const EditPromo = ({ promo, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    details: '',
    code: '',
    potongan: '',
    berlakuHingga: '',
    id_admin: '',
    image: null,         // File object (if new)
    imagePreview: null,  // For preview and to show current image
  });

  useEffect(() => {
    if (promo) {
      setFormData({
        id: promo.id || '',
        title: promo.title || '',
        details: Array.isArray(promo.details) ? promo.details.join('\n') : (promo.details || ''),
        code: promo.code || '',
        potongan: promo.potongan || '',
        berlakuHingga: toDatetimeLocal(promo.berlakuHingga),
        id_admin: promo.id_admin || '',
        image: null, // always reset file input on edit open
        imagePreview: promo.image || null,
      });
    }
  }, [promo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: null
    }));
  };

  const handleBackClick = () => {
    if (onCancel) onCancel();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.details && formData.code) {
      onSubmit(formData);
    } else {
      alert('Mohon lengkapi semua field yang required!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Promo | Edit Promo
          </h1>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-gray-100 rounded-lg shadow-sm p-8"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-600 mb-3">
                Nama Promo
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-3">
                Detail Promo
              </label>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg resize-none"
                rows={3}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-3">
                Kode Promo
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-3">
                Potongan (%)
              </label>
              <input
                type="number"
                name="potongan"
                value={formData.potongan}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-3">
                Berlaku Hingga
              </label>
              <input
                type="datetime-local"
                name="berlakuHingga"
                value={formData.berlakuHingga}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-3">
                ID Admin
              </label>
              <input
                type="number"
                name="id_admin"
                value={formData.id_admin}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-3">
                Gambar Promo
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading}
                />
                <div className="w-full px-4 py-3 border border-purple-400 rounded-lg bg-white flex items-center justify-end">
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              {formData.imagePreview ? (
                <div className="flex justify-start mt-3 relative">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="w-32 h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="flex justify-start mt-2">
                  <div className="w-24 h-24 bg-gray-400 rounded-lg flex items-center justify-center">
                    <Image className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={handleBackClick}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
                disabled={loading}
              >
                Kembali
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium"
                disabled={loading}
              >
                Simpan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPromo;