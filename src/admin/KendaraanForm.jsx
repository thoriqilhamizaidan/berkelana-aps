// src/admin/kendaraanform.jsx
import React, { useState, useEffect } from 'react';

// Static data that was previously in kendaraandata.js
const fasilitasOptions = [
  'AC', 'WiFi', 'Toilet', 'TV', 'Reclining Seat', 
  'Charging Port', 'Snack', 'Selimut', 'Bantal'
];

const tipeArmadaOptions = ['Bus', 'Shuttle'];
const formatKursiOptions = ['2-2', '3-1'];

const initialFormData = {
  tipeArmada: '',
  fasilitas: [],
  nomorArmada: '',
  nomorKendaraan: '',
  formatKursi: '',
  kapasitasKursi: '',
  namaKondektur: '',
  nomorKondektur: '',
  gambar: null,
  gambarPreview: null
};

const validateKendaraanForm = (formData) => {
  const requiredFields = [
    'tipeArmada', 'nomorArmada', 'nomorKendaraan', 
    'formatKursi', 'kapasitasKursi', 'namaKondektur', 'nomorKondektur'
  ];
  
  return requiredFields.every(field => formData[field]);
};

const KendaraanForm = ({ 
  mode = 'add', // 'add' or 'edit'
  kendaraan = null, 
  onSubmit, 
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  // Load data for edit mode
  useEffect(() => {
    if (mode === 'edit' && kendaraan) {
      setFormData({
        tipeArmada: kendaraan.tipeArmada || '',
        fasilitas: [...(kendaraan.fasilitas || [])],
        nomorArmada: kendaraan.nomorArmada || '',
        nomorKendaraan: kendaraan.nomorKendaraan || '',
        formatKursi: kendaraan.formatKursi || '',
        kapasitasKursi: kendaraan.kapasitasKursi?.toString() || '',
        namaKondektur: kendaraan.namaKondektur || '',
        nomorKondektur: kendaraan.nomorKondektur || '',
        gambar: null, // Always null for edit mode since we're uploading new file
        gambarPreview: kendaraan.gambarPreview || null
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [mode, kendaraan]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFasilitasChange = (fasilitas) => {
    setFormData(prev => ({
      ...prev,
      fasilitas: prev.fasilitas.includes(fasilitas)
        ? prev.fasilitas.filter(f => f !== fasilitas)
        : [...prev.fasilitas, fasilitas]
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar!');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB!');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          gambar: file,
          gambarPreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.tipeArmada) newErrors.tipeArmada = 'Tipe armada harus dipilih';
    if (!formData.nomorArmada) newErrors.nomorArmada = 'Nomor armada harus diisi';
    if (!formData.nomorKendaraan) newErrors.nomorKendaraan = 'Nomor kendaraan harus diisi';
    if (!formData.formatKursi) newErrors.formatKursi = 'Format kursi harus dipilih';
    if (!formData.kapasitasKursi) {
      newErrors.kapasitasKursi = 'Kapasitas kursi harus diisi';
    } else if (isNaN(formData.kapasitasKursi) || parseInt(formData.kapasitasKursi) < 1) {
      newErrors.kapasitasKursi = 'Kapasitas kursi harus berupa angka yang valid';
    }
    if (!formData.namaKondektur) newErrors.namaKondektur = 'Nama kondektur harus diisi';
    if (!formData.nomorKondektur) newErrors.nomorKondektur = 'Nomor kondektur harus diisi';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      alert('Mohon lengkapi semua field yang wajib diisi!');
      return;
    }

    onSubmit(formData);
  };

  const ErrorMessage = ({ error }) => (
    error ? <p className="text-red-500 text-sm mt-1">{error}</p> : null
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Data Kendaraan | {mode === 'add' ? 'Tambah Data Kendaraan' : 'Edit Data Kendaraan'}
          </h1>
          {mode === 'edit' && kendaraan && (
            <p className="text-gray-600 mt-2">Edit data kendaraan: {kendaraan.nomorArmada}</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Tipe Armada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Armada <span className="text-red-500">*</span>
                </label>
                <select
                  name="tipeArmada"
                  value={formData.tipeArmada}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white ${
                    errors.tipeArmada ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Pilih tipe armada</option>
                  {tipeArmadaOptions.map(tipe => (
                    <option key={tipe} value={tipe}>{tipe}</option>
                  ))}
                </select>
                <ErrorMessage error={errors.tipeArmada} />
              </div>

              {/* Format Kursi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format Kursi <span className="text-red-500">*</span>
                </label>
                <select
                  name="formatKursi"
                  value={formData.formatKursi}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white ${
                    errors.formatKursi ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Pilih format kursi</option>
                  {formatKursiOptions.map(format => (
                    <option key={format} value={format}>{format}</option>
                  ))}
                </select>
                <ErrorMessage error={errors.formatKursi} />
              </div>

              {/* Fasilitas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fasilitas
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleFasilitasChange(e.target.value);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">Pilih fasilitas</option>
                  {fasilitasOptions.map(fasilitas => (
                    <option key={fasilitas} value={fasilitas}>{fasilitas}</option>
                  ))}
                </select>
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.fasilitas.map((fasilitas, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                      {fasilitas}
                      <button
                        type="button"
                        onClick={() => handleFasilitasChange(fasilitas)}
                        className="ml-2 text-blue-600 hover:text-blue-800 text-lg"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Upload Gambar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tambah gambar
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors bg-gray-50">
                  {formData.gambarPreview ? (
                    <div className="space-y-4">
                      <img 
                        src={formData.gambarPreview} 
                        alt="Preview" 
                        className="mx-auto max-h-40 rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, gambar: null, gambarPreview: null}))}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Hapus Gambar
                      </button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <div className="mx-auto w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id={`upload-gambar-${mode}`}
                      />
                      <label 
                        htmlFor={`upload-gambar-${mode}`}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer text-purple-600 hover:text-purple-800 font-medium hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Klik untuk upload gambar
                      </label>
                      <p className="text-xs text-gray-500 mt-2">Maksimal 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Nomor Armada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Armada <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="nomorArmada"
                  value={formData.nomorArmada}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.nomorArmada ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="ARM001"
                  required
                />
                <ErrorMessage error={errors.nomorArmada} />
              </div>

              {/* Nomor Kendaraan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Kendaraan <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="nomorKendaraan"
                  value={formData.nomorKendaraan}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.nomorKendaraan ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="B 1234 XY"
                  required
                />
                <ErrorMessage error={errors.nomorKendaraan} />
              </div>

              {/* Kapasitas Kursi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kapasitas Kursi <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  name="kapasitasKursi"
                  value={formData.kapasitasKursi}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.kapasitasKursi ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="30"
                  min="1"
                  required
                />
                <ErrorMessage error={errors.kapasitasKursi} />
              </div>

              {/* Nama Kondektur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kondektur <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="namaKondektur"
                  value={formData.namaKondektur}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.namaKondektur ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nama kondektur"
                  required
                />
                <ErrorMessage error={errors.namaKondektur} />
              </div>

              {/* Nomor Kondektur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Kondektur <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="nomorKondektur"
                  value={formData.nomorKondektur}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.nomorKondektur ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="081234567890"
                  required
                />
                <ErrorMessage error={errors.nomorKondektur} />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200 mt-8">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 rounded-lg font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors flex items-center"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KendaraanForm;