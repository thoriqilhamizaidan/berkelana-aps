// src/admin/editjadwal.jsx
import React, { useState, useEffect } from 'react';
import kendaraanService from '../services/kendaraanService';
import jadwalService from '../services/jadwalService';

const EditJadwal = ({ jadwal, onSubmit, onCancel, loading: parentLoading }) => {
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
  const [isManualDuration, setIsManualDuration] = useState(false);
  const [kendaraanList, setKendaraanList] = useState([]);
  const [filteredKendaraan, setFilteredKendaraan] = useState([]);
  const [loadingKendaraan, setLoadingKendaraan] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch kendaraan data on mount
  useEffect(() => {
    fetchKendaraan();
  }, []);

  // Populate form with existing data
  useEffect(() => {
    if (jadwal) {
      // Jika data dari API
      if (jadwal.waktu_keberangkatan) {
        const departure = new Date(jadwal.waktu_keberangkatan);
        const arrival = new Date(jadwal.waktu_sampai);
        
        setFormData({
          jenisKendaraan: jadwal.Kendaraan?.tipe_armada || '',
          idKendaraan: jadwal.id_kendaraan?.toString() || '',
          tanggalKeberangkatan: departure.toISOString().split('T')[0],
          waktuKeberangkatan: departure.toTimeString().slice(0, 5),
          waktuSampai: arrival.toTimeString().slice(0, 5),
          estimasiDurasi: jadwal.durasi?.toString() || '',
          ruteKeberangkatan: jadwal.kota_awal || '',
          ruteTujuan: jadwal.kota_tujuan || '',
          hargaOngkos: jadwal.harga?.toString() || ''
        });
      }
      // Jika data dari state lokal (format lama)
      else {
        const dateStr = jadwal.jadwalKeberangkatan;
        let formattedDate = '';
        
        if (dateStr) {
          const parts = dateStr.split(', ')[1];
          if (parts) {
            const [day, monthName, year] = parts.split(' ');
            const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const monthIndex = monthNames.indexOf(monthName);
            if (monthIndex !== -1) {
              const month = (monthIndex + 1).toString().padStart(2, '0');
              const dayPadded = day.padStart(2, '0');
              formattedDate = `${year}-${month}-${dayPadded}`;
            }
          }
        }

        setFormData({
          jenisKendaraan: jadwal.kategoriArmada || '',
          idKendaraan: jadwal.idKendaraan?.toString() || '',
          tanggalKeberangkatan: formattedDate,
          waktuKeberangkatan: jadwal.waktuKeberangkatan || '',
          waktuSampai: jadwal.waktuSampai || '',
          estimasiDurasi: jadwal.durasi?.toString() || '',
          ruteKeberangkatan: jadwal.ruteKeberangkatan || '',
          ruteTujuan: jadwal.ruteTujuan || '',
          hargaOngkos: jadwal.harga?.toString() || ''
        });
      }
    }
  }, [jadwal]);

  // Filter kendaraan by type when jenisKendaraan changes
  useEffect(() => {
    if (formData.jenisKendaraan) {
      const filtered = kendaraanList.filter(
        k => k.tipe_armada.toLowerCase() === formData.jenisKendaraan.toLowerCase()
      );
      setFilteredKendaraan(filtered);
      
      // Keep current selection if it exists in filtered list
      if (formData.idKendaraan && !filtered.find(k => k.id_kendaraan === parseInt(formData.idKendaraan))) {
        // Try to keep the current kendaraan if editing
        if (jadwal && jadwal.id_kendaraan) {
          const currentKendaraan = kendaraanList.find(k => k.id_kendaraan === jadwal.id_kendaraan);
          if (currentKendaraan && currentKendaraan.tipe_armada.toLowerCase() === formData.jenisKendaraan.toLowerCase()) {
            setFilteredKendaraan([...filtered, currentKendaraan]);
          }
        }
      }
    } else {
      setFilteredKendaraan([]);
    }
  }, [formData.jenisKendaraan, kendaraanList, jadwal]);

  // Auto calculate duration when departure and arrival times change (only if not manually edited)
  useEffect(() => {
    if (formData.waktuKeberangkatan && formData.waktuSampai && !isManualDuration) {
      const duration = calculateDuration(formData.waktuKeberangkatan, formData.waktuSampai);
      if (duration > 0) {
        setFormData(prev => ({
          ...prev,
          estimasiDurasi: duration.toString()
        }));
      }
    }
  }, [formData.waktuKeberangkatan, formData.waktuSampai, isManualDuration]);

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
    
    // Track if duration is manually edited
    if (name === 'estimasiDurasi') {
      setIsManualDuration(true);
    }
    
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

  const handleAutoCalculate = () => {
    if (formData.waktuKeberangkatan && formData.waktuSampai) {
      const duration = calculateDuration(formData.waktuKeberangkatan, formData.waktuSampai);
      if (duration > 0) {
        setFormData(prev => ({
          ...prev,
          estimasiDurasi: duration.toString()
        }));
        setIsManualDuration(false);
      }
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
  
    // Validate hargaOngkos before submitting
    const hargaOngkosValue = parseInt(formData.hargaOngkos);
    if (hargaOngkosValue > 1000000000) {  // Adjust this limit according to your database's constraints
      alert("Harga ongkos terlalu besar. Silakan periksa nilai harga.");
      return;
    }
  
    try {
      setSubmitting(true);
  
      // Format date and time for backend
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
        harga: hargaOngkosValue,  // Ensure the value is within range
        id_promo: jadwal?.id_promo || null
      };
  
      const jadwalId = jadwal?.id_jadwal || jadwal?.id;
      const response = await jadwalService.updateJadwal(jadwalId, jadwalData);
  
      if (response.success) {
        alert('Jadwal berhasil diperbarui!');
        onSubmit(response.data);
      }
    } catch (error) {
      console.error('Error updating jadwal:', error);
      alert(error.message || 'Gagal memperbarui jadwal');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Jadwal</h1>
          <p className="text-gray-600">Perbarui informasi jadwal keberangkatan</p>
        </div>

        {/* Current Schedule Info */}
        {jadwal && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Jadwal saat ini:</strong> {jadwal.kota_awal || jadwal.ruteKeberangkatan} → {jadwal.kota_tujuan || jadwal.ruteTujuan}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Edit Informasi Jadwal</h2>
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

              {/* Duration - Auto calculated with manual override */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Estimasi Durasi
                    {!isManualDuration && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Auto</span>
                    )}
                    {isManualDuration && (
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Manual</span>
                    )}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="estimasiDurasi"
                    value={formData.estimasiDurasi}
                    onChange={handleInputChange}
                    placeholder="Durasi dalam menit"
                    min="1"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                      errors.estimasiDurasi ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute right-4 top-3 text-sm text-gray-500">
                    menit
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  {formData.estimasiDurasi && (
                    <p className="text-sm text-green-600">
                      ≈ {formatDuration(parseInt(formData.estimasiDurasi))}
                    </p>
                  )}
                  {formData.waktuKeberangkatan && formData.waktuSampai && (
                    <button
                      type="button"
                      onClick={handleAutoCalculate}
                      className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Hitung Otomatis
                    </button>
                  )}
                </div>
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
                    Update Jadwal
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

export default EditJadwal;