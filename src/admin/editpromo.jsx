import React, { useState, useEffect } from 'react';
import { Upload, Image } from 'lucide-react';

const EditPromo = ({ onBack, onSave, editData }) => {
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    code: '',
    image: null,
    imagePreview: null,
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title || '',
        details: editData.details || '',
        code: editData.code || '',
        image: null,
        imagePreview: editData.image || null,
      });
    }
  }, [editData]);

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
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: imageUrl
      }));
    }
  };

  const handleSubmit = () => {
    if (formData.title && formData.details && formData.code) {
      const newPromo = {
        title: formData.title,
        details: formData.details.split('\n').filter(Boolean),
        code: formData.code,
        image: formData.imagePreview,
      };
      onSave(newPromo);
      alert('Promo berhasil diubah!');
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
        <div className="bg-gray-100 rounded-lg shadow-sm p-8">
          <div className="space-y-6">
            {/* Nama Promo */}
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
              />
            </div>
            {/* Detail Promo */}
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
              />
            </div>
            {/* Kode Promo */}
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
              />
            </div>
            {/* Gambar Promo */}
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
                />
                <div className="w-full px-4 py-8 border border-purple-400 rounded-lg bg-white flex items-center justify-end">
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
                    onClick={() =>
                      setFormData(prev => ({
                        ...prev,
                        image: null,
                        imagePreview: null
                      }))
                    }
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
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
            {/* Tombol */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={onBack}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium"
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

export default EditPromo;