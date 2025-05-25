import React, { useState, useMemo } from 'react';

const LaporanPenjualanTiket = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBus, setSelectedBus] = useState('');
  const [selectedTanggal, setSelectedTanggal] = useState('');
  const [selectedBulan, setSelectedBulan] = useState('');
  const [selectedTahun, setSelectedTahun] = useState('');
  
  const itemsPerPage = 10;

  // Data dummy untuk laporan penjualan tiket dengan variasi Bus dan Shuttle
  const laporanData = [
    {
      id: 1,
      kodePesanan: '29052025A',
      pemesan: 'Nasywa Putri Natalisa',
      emailPemesan: 'natalianasywaputri@gmail.com',
      tanggalKeberangkatan: 'Selasa, 29 April 2025',
      ruteKeberangkatan: 'Grogol - Cihampelas',
      banyakPenumpang: 2,
      totalPemesanan: 'Rp 310.000',
      status: 'Lunas',
      jenisKendaraan: 'Bus',
      tanggal: 29,
      bulan: 4,
      tahun: 2025
    },
    {
      id: 2,
      kodePesanan: '30052025B',
      pemesan: 'Ahmad Rizki Pratama',
      emailPemesan: 'ahmadrizki@gmail.com',
      tanggalKeberangkatan: 'Rabu, 30 April 2025',
      ruteKeberangkatan: 'Bandung - Jakarta',
      banyakPenumpang: 1,
      totalPemesanan: 'Rp 85.000',
      status: 'Lunas',
      jenisKendaraan: 'Shuttle',
      tanggal: 30,
      bulan: 4,
      tahun: 2025
    },
    {
      id: 3,
      kodePesanan: '01052025C',
      pemesan: 'Siti Nurhaliza',
      emailPemesan: 'sitinur@gmail.com',
      tanggalKeberangkatan: 'Kamis, 1 Mei 2025',
      ruteKeberangkatan: 'Surabaya - Malang',
      banyakPenumpang: 3,
      totalPemesanan: 'Rp 450.000',
      status: 'Lunas',
      jenisKendaraan: 'Bus',
      tanggal: 1,
      bulan: 5,
      tahun: 2025
    },
    {
      id: 4,
      kodePesanan: '02052025D',
      pemesan: 'Budi Santoso',
      emailPemesan: 'budisantoso@gmail.com',
      tanggalKeberangkatan: 'Jumat, 2 Mei 2025',
      ruteKeberangkatan: 'Jakarta - Bogor',
      banyakPenumpang: 2,
      totalPemesanan: 'Rp 120.000',
      status: 'Lunas',
      jenisKendaraan: 'Shuttle',
      tanggal: 2,
      bulan: 5,
      tahun: 2025
    },
    {
      id: 5,
      kodePesanan: '03052025E',
      pemesan: 'Diana Sari',
      emailPemesan: 'dianasari@gmail.com',
      tanggalKeberangkatan: 'Sabtu, 3 Mei 2025',
      ruteKeberangkatan: 'Yogyakarta - Solo',
      banyakPenumpang: 1,
      totalPemesanan: 'Rp 75.000',
      status: 'Lunas',
      jenisKendaraan: 'Shuttle',
      tanggal: 3,
      bulan: 5,
      tahun: 2025
    },
    {
      id: 6,
      kodePesanan: '04052025F',
      pemesan: 'Eko Prasetyo',
      emailPemesan: 'ekoprasetyo@gmail.com',
      tanggalKeberangkatan: 'Minggu, 4 Mei 2025',
      ruteKeberangkatan: 'Medan - Binjai',
      banyakPenumpang: 4,
      totalPemesanan: 'Rp 600.000',
      status: 'Lunas',
      jenisKendaraan: 'Bus',
      tanggal: 4,
      bulan: 5,
      tahun: 2025
    },
    {
      id: 7,
      kodePesanan: '05052025G',
      pemesan: 'Fatimah Zahra',
      emailPemesan: 'fatimahzahra@gmail.com',
      tanggalKeberangkatan: 'Senin, 5 Mei 2025',
      ruteKeberangkatan: 'Bekasi - Depok',
      banyakPenumpang: 1,
      totalPemesanan: 'Rp 65.000',
      status: 'Lunas',
      jenisKendaraan: 'Shuttle',
      tanggal: 5,
      bulan: 5,
      tahun: 2025
    },
    {
      id: 8,
      kodePesanan: '06052025H',
      pemesan: 'Galih Pangestu',
      emailPemesan: 'galihpangestu@gmail.com',
      tanggalKeberangkatan: 'Selasa, 6 Mei 2025',
      ruteKeberangkatan: 'Semarang - Kudus',
      banyakPenumpang: 2,
      totalPemesanan: 'Rp 280.000',
      status: 'Lunas',
      jenisKendaraan: 'Bus',
      tanggal: 6,
      bulan: 5,
      tahun: 2025
    },
    {
      id: 9,
      kodePesanan: '07052025I',
      pemesan: 'Hana Safitri',
      emailPemesan: 'hanasafitri@gmail.com',
      tanggalKeberangkatan: 'Rabu, 7 Mei 2025',
      ruteKeberangkatan: 'Tangerang - Cengkareng',
      banyakPenumpang: 1,
      totalPemesanan: 'Rp 45.000',
      status: 'Lunas',
      jenisKendaraan: 'Shuttle',
      tanggal: 7,
      bulan: 5,
      tahun: 2025
    },
    {
      id: 10,
      kodePesanan: '08052025J',
      pemesan: 'Indra Gunawan',
      emailPemesan: 'indragunawan@gmail.com',
      tanggalKeberangkatan: 'Kamis, 8 Mei 2025',
      ruteKeberangkatan: 'Palembang - Lampung',
      banyakPenumpang: 3,
      totalPemesanan: 'Rp 525.000',
      status: 'Lunas',
      jenisKendaraan: 'Bus',
      tanggal: 8,
      bulan: 5,
      tahun: 2025
    },
    {
      id: 11,
      kodePesanan: '09052025K',
      pemesan: 'Julia Maharani',
      emailPemesan: 'juliamaharani@gmail.com',
      tanggalKeberangkatan: 'Jumat, 9 Mei 2025',
      ruteKeberangkatan: 'Serpong - BSD',
      banyakPenumpang: 2,
      totalPemesanan: 'Rp 90.000',
      status: 'Lunas',
      jenisKendaraan: 'Shuttle',
      tanggal: 9,
      bulan: 5,
      tahun: 2025
    },
    {
      id: 12,
      kodePesanan: '10052025L',
      pemesan: 'Kevin Pratama',
      emailPemesan: 'kevinpratama@gmail.com',
      tanggalKeberangkatan: 'Sabtu, 10 Mei 2025',
      ruteKeberangkatan: 'Bali - Lombok',
      banyakPenumpang: 2,
      totalPemesanan: 'Rp 380.000',
      status: 'Lunas',
      jenisKendaraan: 'Bus',
      tanggal: 10,
      bulan: 5,
      tahun: 2025
    },
    {
      id: 13,
      kodePesanan: '15032025M',
      pemesan: 'Lisa Andriani',
      emailPemesan: 'lisaandriani@gmail.com',
      tanggalKeberangkatan: 'Sabtu, 15 Maret 2025',
      ruteKeberangkatan: 'Jakarta - Bandung',
      banyakPenumpang: 1,
      totalPemesanan: 'Rp 150.000',
      status: 'Lunas',
      jenisKendaraan: 'Bus',
      tanggal: 15,
      bulan: 3,
      tahun: 2025
    },
    {
      id: 14,
      kodePesanan: '20062024N',
      pemesan: 'Michael Jordan',
      emailPemesan: 'michaeljordan@gmail.com',
      tanggalKeberangkatan: 'Kamis, 20 Juni 2024',
      ruteKeberangkatan: 'Surabaya - Yogyakarta',
      banyakPenumpang: 3,
      totalPemesanan: 'Rp 450.000',
      status: 'Lunas',
      jenisKendaraan: 'Bus',
      tanggal: 20,
      bulan: 6,
      tahun: 2024
    },
    {
      id: 15,
      kodePesanan: '05122024O',
      pemesan: 'Nina Sari',
      emailPemesan: 'ninasari@gmail.com',
      tanggalKeberangkatan: 'Kamis, 5 Desember 2024',
      ruteKeberangkatan: 'Bogor - Depok',
      banyakPenumpang: 1,
      totalPemesanan: 'Rp 65.000',
      status: 'Lunas',
      jenisKendaraan: 'Shuttle',
      tanggal: 5,
      bulan: 12,
      tahun: 2024
    }
  ];

  // Filter data berdasarkan semua filter yang dipilih
  const filteredData = useMemo(() => {
    return laporanData.filter(item => {
      // Filter berdasarkan jenis kendaraan
      if (selectedBus && selectedBus !== '' && item.jenisKendaraan.toLowerCase() !== selectedBus.toLowerCase()) {
        return false;
      }
      
      // Filter berdasarkan tanggal
      if (selectedTanggal && selectedTanggal !== '' && item.tanggal !== parseInt(selectedTanggal)) {
        return false;
      }
      
      // Filter berdasarkan bulan
      if (selectedBulan && selectedBulan !== '' && item.bulan !== parseInt(selectedBulan)) {
        return false;
      }
      
      // Filter berdasarkan tahun
      if (selectedTahun && selectedTahun !== '' && item.tahun !== parseInt(selectedTahun)) {
        return false;
      }
      
      return true;
    });
  }, [laporanData, selectedBus, selectedTanggal, selectedBulan, selectedTahun]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Reset ke page 1 ketika filter berubah
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedBus, selectedTanggal, selectedBulan, selectedTahun]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleETicketClick = (kodePesanan) => {
    // Navigate to etiketadmin.jsx - implementasi tergantung routing
    window.open(`/admin/etiket/${kodePesanan}`, '_blank');
  };

  const handleSimpanPDF = () => {
    // Implementasi export PDF
    alert('Fitur simpan PDF akan diimplementasikan');
  };

  // Hitung statistik berdasarkan filter
  const getStatistik = () => {
    const totalPenumpang = filteredData.reduce((sum, item) => sum + item.banyakPenumpang, 0);
    const totalPendapatan = filteredData.reduce((sum, item) => {
      const amount = parseInt(item.totalPemesanan.replace(/[^0-9]/g, ''));
      return sum + amount;
    }, 0);
    
    return {
      totalTransaksi: filteredData.length,
      totalPenumpang,
      totalPendapatan: new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(totalPendapatan)
    };
  };

  const statistik = getStatistik();

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pageNumbers.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
        >
          ‹
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 text-sm ${
            currentPage === i
              ? 'bg-purple-500 text-white rounded'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pageNumbers.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
        >
          ›
        </button>
      );
    }

    // Selanjutnya button
    pageNumbers.push(
      <button
        key="selanjutnya"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        className="ml-2 px-3 py-1 text-sm text-purple-600 hover:bg-gray-100"
      >
        Selanjutnya
      </button>
    );

    return (
      <div className="flex items-center justify-center gap-1 mt-6">
        {pageNumbers}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black1 mb-6">Laporan Penjualan Tiket</h1>
          
          {/* Statistik Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-purplelight rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{statistik.totalTransaksi}</div>
              <div className="text-sm text-gray-600">Total Transaksi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statistik.totalPenumpang}</div>
              <div className="text-sm text-gray-600">Total Penumpang</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statistik.totalPendapatan}</div>
              <div className="text-sm text-gray-600">Total Pendapatan</div>
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <select 
              value={selectedBus}
              onChange={(e) => setSelectedBus(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm font-medium"
            >
              <option value="">Semua Kendaraan</option>
              <option value="Bus">Bus</option>
              <option value="Shuttle">Shuttle</option>
            </select>

            <select 
              value={selectedTanggal}
              onChange={(e) => setSelectedTanggal(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Semua Tanggal</option>
              {[...Array(31)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>

            <select 
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Semua Bulan</option>
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>

            <select 
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Semua Tahun</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>

          {/* Filter Status */}
          {(selectedBus || selectedTanggal || selectedBulan || selectedTahun) && (
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-purple-700 font-medium">Filter aktif:</span>
                {selectedBus && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {selectedBus}
                    <button 
                      onClick={() => setSelectedBus('')}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedTanggal && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    Tanggal {selectedTanggal}
                    <button 
                      onClick={() => setSelectedTanggal('')}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedBulan && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][parseInt(selectedBulan)]}
                    <button 
                      onClick={() => setSelectedBulan('')}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedTahun && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    Tahun {selectedTahun}
                    <button 
                      onClick={() => setSelectedTahun('')}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                <span className="text-purple-600 ml-2">({filteredData.length} transaksi)</span>
                <button 
                  onClick={() => {
                    setSelectedBus('');
                    setSelectedTanggal('');
                    setSelectedBulan('');
                    setSelectedTahun('');
                  }}
                  className="ml-3 text-purple-600 hover:text-purple-800 text-sm underline"
                >
                  Hapus Semua Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-300 rounded-b-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray1">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Kode Pesanan</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Pemesan</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Email Pemesan</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Tanggal Keberangkatan</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Rute Keberangkatan</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Jenis</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Penumpang</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Total Pemesanan</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">E-Tiket</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-3 px-4 text-sm text-gray-900">{item.kodePesanan}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{item.pemesan}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{item.emailPemesan}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{item.tanggalKeberangkatan}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{item.ruteKeberangkatan}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.jenisKendaraan === 'Bus' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.jenisKendaraan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-center">{item.banyakPenumpang}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{item.totalPemesanan}</td>
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() => handleETicketClick(item.kodePesanan)}
                        className="text-purple-600 hover:text-purple-800 hover:underline"
                      >
                        E-Tiket
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-8 px-4 text-center text-gray-500">
                    Tidak ada data yang ditemukan untuk filter yang dipilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {renderPagination()}

        {/* Simpan PDF Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSimpanPDF}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium"
          >
            Simpan PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default LaporanPenjualanTiket;