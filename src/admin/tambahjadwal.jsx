// src/admin/tambahjadwal.jsx
import React, { useState, useEffect } from 'react';
import kendaraanService from '../services/kendaraanService';
import jadwalService from '../services/jadwalService';

const TambahJadwal = ({ onSubmit, onCancel, loading: parentLoading }) => {
  const [formData, setFormData] = useState({
    jenisKendaraan: '',
    idKendaraan: '',
    tanggalKeberangkatan: '',
    waktuKeberangkatan: '',
    waktuSampai: '',
    estimasiDurasi: '',
    ruteKeberangkatan: '',
    ruteTujuan: '',
    hargaOngkos: ''
  });

  const [errors, setErrors] = useState({});
  const [kendaraanList, setKendaraanList] = useState([]);
  const [filteredKendaraan, setFilteredKendaraan] = useState([]);
  const [loadingKendaraan, setLoadingKendaraan] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch kendaraan data on mount
  useEffect(() => {
    fetchKendaraan();
  }, []);

  // Filter kendaraan by type when jenisKendaraan changes
  useEffect(() => {
    if (formData.jenisKendaraan) {
      const filtered = kendaraanList.filter(
        k => k.tipe_armada.toLowerCase() === formData.jenisKendaraan.toLowerCase()
      );
      setFilteredKendaraan(filtered);
      
      // Reset idKendaraan if current selection is not in filtered list
      if (formData.idKendaraan && !filtered.find(k => k.id_kendaraan === parseInt(formData.idKendaraan))) {
        setFormData(prev => ({ ...prev, idKendaraan: '' }));
      }
    } else {
      setFilteredKendaraan([]);
      setFormData(prev => ({ ...prev, idKendaraan: '' }));
    }
  }, [formData.jenisKendaraan, kendaraanList]);

  // Auto calculate duration when departure and arrival times change
  useEffect(() => {
    if (formData.waktuKeberangkatan && formData.waktuSampai) {
      const duration = calculateDuration(formData.waktuKeberangkatan, formData.waktuSampai);
      if (duration > 0) {
        setFormData(prev => ({
          ...prev,
          estimasiDurasi: duration.toString()
        }));
      }
    }
  }, [formData.waktuKeberangkatan, formData.waktuSampai]);

  const fetchKendaraan = async () => {
    try {
      setLoadingKendaraan(true);
      const response = await kendaraanService.getAllKendaraan();
      if (response.success) {
        setKendaraanList(response.data);
      }
    } catch (error) {
      console.error('Error fetching kendaraan:', error);
      alert('Gagal mengambil data kendaraan');
    } finally {
      setLoadingKendaraan(false);
    }
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    let startTotalMinutes = startHour * 60 + startMinute;
    let endTotalMinutes = endHour * 60 + endMinute;
    
    // Handle case where journey goes to next day
    if (endTotalMinutes < startTotalMinutes) {
      endTotalMinutes += 24 * 60; // Add 24 hours in minutes
    }
    
    return endTotalMinutes - startTotalMinutes;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} jam ${mins > 0 ? mins + ' menit' : ''}`;
    }
    return `${mins} menit`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.jenisKendaraan) {
      newErrors.jenisKendaraan = 'Jenis kendaraan harus dipilih';
    }

    if (!formData.idKendaraan) {
      newErrors.idKendaraan = 'Armada harus dipilih';
    }

    if (!formData.tanggalKeberangkatan) {
      newErrors.tanggalKeberangkatan = 'Tanggal keberangkatan harus diisi';
    }

    if (!formData.waktuKeberangkatan) {
      newErrors.waktuKeberangkatan = 'Waktu keberangkatan harus diisi';
    }

    if (!formData.waktuSampai) {
      newErrors.waktuSampai = 'Waktu sampai harus diisi';
    }

    if (!formData.estimasiDurasi) {
      newErrors.estimasiDurasi = 'Estimasi durasi harus diisi';
    } else if (isNaN(formData.estimasiDurasi) || parseInt(formData.estimasiDurasi) <= 0) {
      newErrors.estimasiDurasi = 'Estimasi durasi harus berupa angka positif';
    }

    if (!formData.ruteKeberangkatan) {
      newErrors.ruteKeberangkatan = 'Rute keberangkatan harus diisi';
    }

    if (!formData.ruteTujuan) {
      newErrors.ruteTujuan = 'Rute tujuan harus diisi';
    }

    if (!formData.hargaOngkos) {
      newErrors.hargaOngkos = 'Harga ongkos harus diisi';
    } else if (isNaN(formData.hargaOngkos) || parseInt(formData.hargaOngkos) <= 0) {
      newErrors.hargaOngkos = 'Harga ongkos harus berupa angka positif';
    }

    // Validate time logic
    if (formData.waktuKeberangkatan && formData.waktuSampai) {
      const duration = calculateDuration(formData.waktuKeberangkatan, formData.waktuSampai);
      if (duration <= 0) {
        newErrors.waktuSampai = 'Waktu sampai harus lebih besar dari waktu keberangkatan';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Get selected kendaraan data
      const selectedKendaraan = filteredKendaraan.find(
        k => k.id_kendaraan === parseInt(formData.idKendaraan)
      );

      // Format date and time for backend
      const date = new Date(formData.tanggalKeberangkatan);
      const departureDateTime = new Date(`${formData.tanggalKeberangkatan}T${formData.waktuKeberangkatan}:00`);
      const arrivalDateTime = new Date(`${formData.tanggalKeberangkatan}T${formData.waktuSampai}:00`);
      
      // If arrival is next day, add one day
      if (arrivalDateTime < departureDateTime) {
        arrivalDateTime.setDate(arrivalDateTime.getDate() + 1);
      }

      const jadwalData = {
        id_kendaraan: parseInt(formData.idKendaraan),
        kota_awal: formData.ruteKeberangkatan.toUpperCase(),
        kota_tujuan: formData.ruteTujuan.toUpperCase(),
        waktu_keberangkatan: departureDateTime.toISOString(),
        waktu_sampai: arrivalDateTime.toISOString(),
        durasi: parseInt(formData.estimasiDurasi),
        harga: parseInt(formData.hargaOngkos),
        id_promo: null
      };

      const response = await jadwalService.createJadwal(jadwalData);

      if (response.success) {
        alert('Jadwal berhasil ditambahkan!');
        onSubmit(response.data);
      }
    } catch (error) {
      console.error('Error creating jadwal:', error);
      alert(error.message || 'Gagal menambahkan jadwal');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = parentLoading || submitting || loadingKendaraan;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onCancel}
              className="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tambah Jadwal Baru</h1>
          <p className="text-gray-600">Buat jadwal keberangkatan baru untuk armada Anda</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Informasi Jadwal</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-5H8z" />
                    </svg>
                    Jenis Kendaraan
                  </span>
                </label>
                <select
                  name="jenisKendaraan"
                  value={formData.jenisKendaraan}
                  onChange={handleInputChange}
                  disabled={loadingKendaraan}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.jenisKendaraan ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Pilih jenis kendaraan</option>
                  <option value="Bus">Bus</option>
                  <option value="Shuttle">Shuttle</option>
                </select>
                {errors.jenisKendaraan && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.jenisKendaraan}
                  </p>
                )}
              </div>

              {/* Vehicle Selection */}
              {formData.jenisKendaraan && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V4m-4 4h6" />
                      </svg>
                      Pilih Armada
                    </span>
                  </label>
                  <select
                    name="idKendaraan"
                    value={formData.idKendaraan}
                    onChange={handleInputChange}
                    disabled={loadingKendaraan || filteredKendaraan.length === 0}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                      errors.idKendaraan ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Pilih armada</option>
                    {filteredKendaraan.map((kendaraan) => (
                      <option key={kendaraan.id_kendaraan} value={kendaraan.id_kendaraan}>
                        {kendaraan.nomor_armada} - {kendaraan.nomor_kendaraan} (Kapasitas: {kendaraan.kapasitas_kursi} kursi)
                      </option>
                    ))}
                  </select>
                  {errors.idKendaraan && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.idKendaraan}
                    </p>
                  )}
                  {filteredKendaraan.length === 0 && !loadingKendaraan && (
                    <p className="mt-1 text-sm text-yellow-600">
                      Tidak ada armada {formData.jenisKendaraan} yang tersedia
                    </p>
                  )}
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Tanggal Keberangkatan
                  </span>
                </label>
                <input
                  type="date"
                  name="tanggalKeberangkatan"
                  value={formData.tanggalKeberangkatan}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.tanggalKeberangkatan ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.tanggalKeberangkatan && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.tanggalKeberangkatan}
                  </p>
                )}
              </div>

              {/* Time Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Waktu Keberangkatan
                    </span>
                  </label>
                  <input
                    type="time"
                    name="waktuKeberangkatan"
                    value={formData.waktuKeberangkatan}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                      errors.waktuKeberangkatan ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.waktuKeberangkatan && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.waktuKeberangkatan}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Waktu Sampai
                    </span>
                  </label>
                  <input
                    type="time"
                    name="waktuSampai"
                    value={formData.waktuSampai}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                      errors.waktuSampai ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.waktuSampai && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.waktuSampai}
                    </p>
                  )}
                </div>
              </div>

              {/* Duration - Auto calculated */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Estimasi Durasi
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Auto</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="estimasiDurasi"
                    value={formData.estimasiDurasi}
                    onChange={handleInputChange}
                    placeholder="Durasi akan otomatis terisi"
                    min="1"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-gray-50 ${
                      errors.estimasiDurasi ? 'border-red-500' : 'border-gray-300'
                    }`}
                    readOnly
                  />
                  <div className="absolute right-4 top-3 text-sm text-gray-500">
                    menit
                  </div>
                </div>
                {formData.estimasiDurasi && (
                  <p className="mt-1 text-sm text-green-600">
                    ≈ {formatDuration(parseInt(formData.estimasiDurasi))}
                  </p>
                )}
                {errors.estimasiDurasi && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.estimasiDurasi}
                  </p>
                )}
              </div>

              {/* Routes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Kota Keberangkatan
                    </span>
                  </label>
                  <input
                    type="text"
                    name="ruteKeberangkatan"
                    value={formData.ruteKeberangkatan}
                    onChange={handleInputChange}
                    placeholder="Contoh: Jakarta"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                      errors.ruteKeberangkatan ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.ruteKeberangkatan && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.ruteKeberangkatan}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Kota Tujuan
                    </span>
                  </label>
                  <input
                    type="text"
                    name="ruteTujuan"
                    value={formData.ruteTujuan}
                    onChange={handleInputChange}
                    placeholder="Contoh: Bandung"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                      errors.ruteTujuan ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.ruteTujuan && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.ruteTujuan}
                    </p>
                  )}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Harga Ongkos
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-3 text-gray-500">Rp</div>
                  <input
                    type="number"
                    name="hargaOngkos"
                    value={formData.hargaOngkos}
                    onChange={handleInputChange}
                    placeholder="150000"
                    min="1"
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                      errors.hargaOngkos ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.hargaOngkos && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.hargaOngkos}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-8 border-t border-gray-200 mt-8">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Simpan Jadwal
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TambahJadwal;