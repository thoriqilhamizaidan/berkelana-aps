import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRef } from 'react';
// Hapus import html2canvas dan jsPDF
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
// Tambahkan import pdfmake dan vfs_fonts
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { transaksiService } from '../services/transaksiService';
import { useAuth } from './context/AuthContext';
import kendaraanService from '../services/kendaraanService';

// Inisialisasi font pdfmake
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

const ETicket = () => {
  const { bookingCode } = useParams(); // Mengambil booking code dari URL parameter
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vehicleImage, setVehicleImage] = useState(null); // State untuk gambar kendaraan

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Pastikan user sudah login
        if (!isLoggedIn) {
          navigate('/login');
          return;
        }
        
        // Ambil user ID dari context atau localStorage
        const userId = user?.id || user?.id_user || transaksiService.getCurrentUserId();
        
        if (!userId) {
          setError('User ID tidak ditemukan, silakan login ulang');
          setLoading(false);
          return;
        }
        
        // Ambil semua transaksi user
        const response = await transaksiService.getTransaksiByUser(userId);
        
        if (!response.success) {
          setError('Gagal mengambil data tiket');
          setLoading(false);
          return;
        }
        
        // Cari transaksi dengan booking code yang sesuai
        const ticketData = response.data.find(t => 
          t.booking_code === bookingCode && 
          (t.status === 'paid' || t.payment_status === 'settlement' || t.payment_status === 'capture')
        );
        
        if (!ticketData) {
          setError('Tiket tidak ditemukan atau belum dibayar');
          setLoading(false);
          return;
        }
        
        // Ambil detail transaksi untuk mendapatkan data penumpang
        const detailResponse = await transaksiService.getDetailTransaksi(ticketData.id_headtransaksi);
        
        // Format data penumpang dari detail transaksi
        let passengerDetails = [];
        let vehicleImageFilename = null;
        
        if (detailResponse.success && detailResponse.data && detailResponse.data.length > 0) {
          passengerDetails = detailResponse.data.map(detail => ({
            name: detail.nama_penumpang,
            seat: `Seat ${detail.nomor_kursi}`
          }));
          
          // Ambil data gambar kendaraan dari detail transaksi pertama
          if (detailResponse.data[0]?.Jadwal?.Kendaraan?.gambar) {
            vehicleImageFilename = detailResponse.data[0].Jadwal.Kendaraan.gambar;
            // Dapatkan URL gambar menggunakan kendaraanService
            const imageUrl = kendaraanService.getImageUrl(vehicleImageFilename);
            setVehicleImage(imageUrl);
          }
        } else {
          // Fallback jika tidak ada detail transaksi
          passengerDetails = [{ name: ticketData.nama_pemesan, seat: 'Seat 1' }];
        }
        
        // Format data tiket untuk ditampilkan
        setTicket({
          bookingCode: ticketData.booking_code,
          date: new Date(ticketData.waktu_keberangkatan).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          duration: formatDuration(ticketData.waktu_keberangkatan, ticketData.waktu_sampai),
          departureCity: ticketData.kota_awal,
          arrivalCity: ticketData.kota_tujuan,
          departureTime: new Date(ticketData.waktu_keberangkatan).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          departureDetails: `Terminal ${ticketData.kota_awal}`,
          arrivalTime: new Date(ticketData.waktu_sampai).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          arrivalDetails: `Terminal ${ticketData.kota_tujuan}`,
          passengerDetails: passengerDetails,
          contactPerson: {
            name: ticketData.nama_pemesan,
            no: ticketData.no_hp_pemesan,
            email: ticketData.email_pemesan
          },
          shuttleCode: ticketData.nomor_armada || '201A',
          kondekturNo: ticketData.nomor_kondektur || '081249401599'
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ticket data:', error);
        setError('Terjadi kesalahan saat mengambil data tiket');
        setLoading(false);
      }
    };
    
    fetchTicketData();
  }, [bookingCode, isLoggedIn, navigate, user]);

  // Format durasi perjalanan
  const formatDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    
    const startTime = new Date(start);
    const endTime = new Date(end);
    
    const durationMs = endTime - startTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} jam${minutes > 0 ? ` ${minutes} menit` : ''}`;
    }
    return `${minutes} menit`;
  };

  const handleClose = () => {
    navigate('/tiket-saya'); // Navigate to Tiketsaya page when button is clicked
  };

  const ticketRef = useRef();

  // Implementasi baru menggunakan pdfmake
  // Ganti fungsi handleDownloadPDF dengan yang ini:
const handleDownloadPDF = async () => {
  try {
    // Tambahkan pesan loading
    const loadingDiv = document.createElement('div');
    loadingDiv.style.position = 'fixed';
    loadingDiv.style.top = '0';
    loadingDiv.style.left = '0';
    loadingDiv.style.width = '100%';
    loadingDiv.style.height = '100%';
    loadingDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
    loadingDiv.style.display = 'flex';
    loadingDiv.style.justifyContent = 'center';
    loadingDiv.style.alignItems = 'center';
    loadingDiv.style.zIndex = '9999';
    loadingDiv.innerHTML = '<div style="background: white; padding: 20px; border-radius: 10px;">Sedang membuat PDF...</div>';
    document.body.appendChild(loadingDiv);
    
    // Fungsi untuk mengubah gambar menjadi base64
    const getBase64FromUrl = async (url) => {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };
    
    // Ambil logo Berkelana sebagai base64
    const logoUrl = '/images/Berkelana-logo.png';
    let logoBase64;
    try {
      logoBase64 = await getBase64FromUrl(logoUrl);
    } catch (error) {
      console.error('Error loading logo:', error);
      logoBase64 = null;
    }
    
    // Ambil gambar kendaraan sebagai base64 jika ada
    let vehicleImageBase64 = null;
    if (vehicleImage) {
      try {
        vehicleImageBase64 = await getBase64FromUrl(vehicleImage);
      } catch (error) {
        console.error('Error loading vehicle image:', error);
        try {
          vehicleImageBase64 = await getBase64FromUrl('/images/seat.jpg');
        } catch (e) {
          console.error('Error loading fallback image:', e);
        }
      }
    } else {
      try {
        vehicleImageBase64 = await getBase64FromUrl('/images/seat.jpg');
      } catch (error) {
        console.error('Error loading fallback image:', error);
      }
    }
    
    // Definisi dokumen PDF yang lebih mirip dengan halaman
    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        // Header dengan logo dan close button (disesuaikan untuk PDF)
        {
          columns: [
            logoBase64 ? {
              image: logoBase64,
              width: 150,
              margin: [0, 0, 0, 20]
            } : {
              text: 'BERKELANA',
              fontSize: 24,
              bold: true,
              color: '#6B21A8',
              margin: [0, 0, 0, 20]
            },
            {
              text: '',
              width: '*'
            }
          ]
        },
        
        // Title Section dengan Kode Booking (mirip halaman)
        {
          columns: [
            {
              text: 'E-Tiket Bus',
              fontSize: 24,
              bold: true,
              color: '#000000',
              width: '*'
            },
            {
              text: [
                {
                  text: 'Kode Booking: ',
                  fontSize: 12,
                  color: '#000000'
                },
                {
                  text: ticket.bookingCode,
                  fontSize: 12,
                  bold: true,
                  color: '#000000'
                }
              ],
              alignment: 'right',
              background: '#F3E8FF',
              margin: [10, 5, 10, 5]
            }
          ],
          margin: [0, 0, 0, 10]
        },
        
        // Subtitle
        {
          text: 'Pilih kursi Anda dan review pesanan Anda.',
          color: '#666666',
          margin: [0, 0, 0, 20]
        },
        
        // Bus Image and Details Section (Mirip layout halaman)
        {
            table: {
    widths: ['35%', '65%'],
    body: [
      [
        // Bus Image Side (tetap sama)
        {
          stack: [
            vehicleImageBase64 ? {
              image: vehicleImageBase64,
              width: 150,
              height: 120,
              margin: [0, 0, 0, 15]
            } : {
              text: 'Gambar Bus',
              alignment: 'center',
              margin: [0, 40, 0, 40],
              color: '#666666'
            },
            {
              text: [
                { text: 'Kode Shuttle: ', color: '#666666' },
                { text: ticket.shuttleCode, color: '#666666' }
              ],
              fontSize: 11,
              margin: [0, 0, 0, 3]
            },
            {
              text: [
                { text: 'No Kondektur: ', color: '#666666' },
                { text: ticket.kondekturNo, color: '#666666' }
              ],
              fontSize: 11
            }
          ],
          fillColor: '#F9FAFB',
          margin: [15, 15, 15, 15]
        },
        // Journey Details Side dengan layout sederhana
        {
          stack: [
            {
              text: ticket.date,
              fontSize: 16,
              bold: true,
              margin: [0, 0, 0, 20]
            },
            
            // Departure Section
            {
              table: {
                widths: ['*'],
                body: [
                  [
                    {
                      stack: [
                        {
                          text: 'KEBERANGKATAN',
                          fontSize: 10,
                          bold: true,
                          color: '#10B981',
                          margin: [0, 0, 0, 5]
                        },
                        {
                          text: ticket.departureCity,
                          fontSize: 14,
                          bold: true,
                          margin: [0, 0, 0, 2]
                        },
                        {
                          text: ticket.departureTime,
                          fontSize: 12,
                          color: '#666666',
                          margin: [0, 0, 0, 2]
                        },
                        {
                          text: ticket.departureDetails,
                          fontSize: 11,
                          color: '#999999'
                        }
                      ],
                      fillColor: '#F8FDF9',
                      margin: [12, 12, 12, 12]
                    }
                  ]
                ]
              },
              layout: {
                hLineWidth: function() { return 1; },
                vLineWidth: function() { return 1; },
                hLineColor: function() { return '#10B981'; },
                vLineColor: function() { return '#10B981'; }
              },
              margin: [0, 0, 0, 15]
            },
            
            // Duration
            {
              text: `Durasi Perjalanan: ${ticket.duration}`,
              fontSize: 11,
              color: '#666666',
              alignment: 'center',
              margin: [0, 0, 0, 15]
            },
            
            // Arrival Section
            {
              table: {
                widths: ['*'],
                body: [
                  [
                    {
                      stack: [
                        {
                          text: 'TUJUAN',
                          fontSize: 10,
                          bold: true,
                          color: '#10B981',
                          margin: [0, 0, 0, 5]
                        },
                        {
                          text: ticket.arrivalCity,
                          fontSize: 14,
                          bold: true,
                          margin: [0, 0, 0, 2]
                        },
                        {
                          text: ticket.arrivalTime,
                          fontSize: 12,
                          color: '#666666',
                          margin: [0, 0, 0, 2]
                        },
                        {
                          text: ticket.arrivalDetails,
                          fontSize: 11,
                          color: '#999999'
                        }
                      ],
                      fillColor: '#F8FDF9',
                      margin: [12, 12, 12, 12]
                    }
                  ]
                ]
              },
              layout: {
                hLineWidth: function() { return 1; },
                vLineWidth: function() { return 1; },
                hLineColor: function() { return '#10B981'; },
                vLineColor: function() { return '#10B981'; }
              }
            }
          ],
          margin: [20, 15, 15, 15]
        }
      ]
    ]
  },
  layout: {
    hLineWidth: function() { return 1; },
    vLineWidth: function() { return 1; },
    hLineColor: function() { return '#E5E7EB'; },
    vLineColor: function() { return '#E5E7EB'; }
  },
  margin: [0, 0, 0, 20]
},

// Information Section (tanpa icon sama sekali - LEBIH SEDERHANA)
{
  table: {
    widths: ['*', '*', '*'],
    body: [
      [
        {
          stack: [
            {
              text: 'WAKTU KEBERANGKATAN',
              fontSize: 10,
              bold: true,
              color: '#10B981',
              margin: [0, 0, 0, 5]
            },
            {
              text: 'Tiba di titik naik setidaknya 60 menit sebelum keberangkatan',
              fontSize: 9,
              color: '#666666'
            }
          ],
          fillColor: '#F9FAFB',
          margin: [8, 8, 8, 8]
        },
        {
          stack: [
            {
              text: 'E-TIKET DIGITAL',
              fontSize: 10,
              bold: true,
              color: '#10B981',
              margin: [0, 0, 0, 5]
            },
            {
              text: 'Tunjukkan e-tiket ke petugas bus atau shuttle',
              fontSize: 9,
              color: '#666666'
            }
          ],
          fillColor: '#F9FAFB',
          margin: [8, 8, 8, 8]
        },
        {
          stack: [
            {
              text: 'KARTU IDENTITAS',
              fontSize: 10,
              bold: true,
              color: '#10B981',
              margin: [0, 0, 0, 5]
            },
            {
              text: 'Siapkan kartu identitas untuk verifikasi penumpang',
              fontSize: 9,
              color: '#666666'
            }
          ],
          fillColor: '#F9FAFB',
          margin: [8, 8, 8, 8]
        }
      ]
    ]
  },
  layout: {
    hLineWidth: function() { return 1; },
    vLineWidth: function() { return 1; },
    hLineColor: function() { return '#E5E7EB'; },
    vLineColor: function() { return '#E5E7EB'; }
  },
  margin: [0, 0, 0, 20]
},
        
        // Data Penumpang (mirip halaman)
        {
          text: 'Data Penumpang',
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        {
          stack: ticket.passengerDetails.map((passenger, index) => ({
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    stack: [
                      {
                        text: `Data Penumpang ${index + 1}`,
                        color: '#666666',
                        fontSize: 11,
                        margin: [0, 0, 0, 3]
                      },
                      {
                        text: `${passenger.name} - ${passenger.seat}`,
                        bold: true
                      }
                    ],
                    margin: [12, 12, 12, 12]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: function() { return 1; },
              vLineWidth: function() { return 1; },
              hLineColor: function() { return '#E5E7EB'; },
              vLineColor: function() { return '#E5E7EB'; }
            },
            margin: [0, 0, 0, 8]
          })),
          margin: [0, 0, 0, 20]
        },
        
        // Hal yang perlu diketahui (mirip halaman)
        {
          text: 'Hal yang perlu diketahui',
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  stack: [
                    {
                      text: 'Ketentuan Umum',
                      bold: true,
                      margin: [0, 0, 0, 8]
                    },
                    {
                      ul: [
                        'Penumpang sudah siap setidaknya 60 menit sebelum keberangkatan di titik keberangkatan yang telah ditentukan oleh agen. Keterlambatan penumpang dapat menyebabkan tiket dibatalkan secara sepihak dan tidak mendapatkan pengembalian dana.',
                        'Waktu keberangkatan yang tertera di aplikasi adalah waktu lokal di titik keberangkatan.',
                        'Pelanggan diwajibkan untuk menunjukkan e-tiket dan identitas yang berlaku (KTP/ Paspor/ SIM).'
                      ],
                      fontSize: 11,
                      color: '#374151'
                    }
                  ],
                  margin: [15, 15, 15, 15]
                }
              ]
            ]
          },
          layout: {
            hLineWidth: function() { return 0; },
            vLineWidth: function() { return 0; },
            fillColor: function() { return '#F3F4F6'; }
          },
          margin: [0, 0, 0, 20]
        },
        
        // Barang Bawaan (mirip halaman)
        {
          text: 'Barang Bawaan',
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  stack: [
                    {
                      ol: [
                        'Penumpang dilarang membawa barang terlarang/ilegal dan membahayakan seperti senjata tajam, mudah terbakar, dan berbau menyengat. Penumpang bertanggung jawab penuh untuk kepemilikan tersebut dan konsekuensinya.',
                        'Ukuran dan berat bagasi per penumpang tidak melebihi aturan yang ditetapkan. Jika bagasi melebihi ukuran atau berat tersebut, maka penumpang diharuskan membayar biaya tambahan sesuai ketentuan agen.',
                        'Penumpang dilarang membawa hewan jenis apapun ke dalam kendaraan.'
                      ],
                      fontSize: 11,
                      color: '#374151'
                    }
                  ],
                  margin: [15, 15, 15, 15]
                }
              ]
            ]
          },
          layout: {
            hLineWidth: function() { return 0; },
            vLineWidth: function() { return 0; },
            fillColor: function() { return '#F3F4F6'; }
          },
          margin: [0, 0, 0, 20]
        },
        
        // Kebijakan Pembatalan (mirip halaman)
        {
          text: 'Kebijakan Pembatalan, Refund dan Reschedule',
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  stack: [
                    {
                      ol: [
                        'Pembatalan dan Refund dapat dilakukan sesuai dengan kebijakan perusahaan.',
                        'Tidak dapat refund pada jam keberangkatan.'
                      ],
                      fontSize: 11,
                      color: '#374151'
                    }
                  ],
                  margin: [15, 15, 15, 15]
                }
              ]
            ]
          },
          layout: {
            hLineWidth: function() { return 0; },
            vLineWidth: function() { return 0; },
            fillColor: function() { return '#F3F4F6'; }
          },
          margin: [0, 0, 0, 20]
        },
        
        // Footer
        {
          text: 'Terima kasih telah menggunakan layanan Berkelana',
          alignment: 'center',
          margin: [0, 30, 0, 0],
          color: '#666666',
          fontSize: 12
        }
      ],
      defaultStyle: {
        fontSize: 12,
        color: '#333333'
      }
    };
    
    // Filter out null values dari content
    docDefinition.content = docDefinition.content.filter(item => item !== null);
    
    // Buat PDF dan download dengan nama yang lebih deskriptif
    const fileName = `E-Tiket_${ticket.departureCity}-${ticket.arrivalCity}_${ticket.bookingCode}.pdf`;
    pdfMake.createPdf(docDefinition).download(fileName);
    
    // Hapus pesan loading
    document.body.removeChild(loadingDiv);
  } catch (error) {
    console.error('Error saat membuat PDF:', error);
    alert('Terjadi kesalahan saat membuat PDF. Silakan coba lagi.');
    // Pastikan loading div dihapus jika terjadi error
    const loadingDiv = document.querySelector('[style*="position: fixed"]');
    if (loadingDiv) {
      document.body.removeChild(loadingDiv);
    }
  }
};

  // Tampilkan error state
  if (error || !ticket) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-white p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tiket Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{error || 'Tiket tidak tersedia atau belum dibayar'}</p>
          <button
            onClick={() => navigate('/tiket-saya')}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            Kembali ke Tiket Saya
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto" ref={ticketRef}>
        {/* Header with Logo (No Padding) */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <img src="/images/Berkelana-logo.png" alt="Berkelana" className="h-12 sm:h-16 md:h-20 text-purple-600" />
          </div>
          <button
            onClick={handleClose} // Add onClick event to handle the close button
            className="text-gray-400 hover:text-purple-200" // Change color on hover
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Title Section with Padding */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-4 sm:px-6 md:px-10 gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">E-Tiket Bus</h1>
          <div className="text-sm w-full sm:w-auto">
            <span className="bg-purple-100 text-black font-semibold px-3 sm:px-6 py-2 sm:py-3 rounded inline-block w-full sm:w-auto text-center">
              Kode Booking: <span className="font-semibold">{ticket.bookingCode}</span>
            </span>
          </div>
        </div>
        <p className="text-gray-600 mb-4 px-4 sm:px-6 md:px-10">Pilih kursi Anda dan review pesanan Anda.</p>

        {/* Bus Image and Details */}
        <div className="border border-gray-200 rounded-lg mb-6 overflow-hidden mx-4 sm:mx-6 md:mx-10">
          <div className="flex flex-col md:flex-row">
            {/* Bus Image Side */}
            <div className="w-full md:w-1/3 bg-gray-50 p-4 flex flex-col">
              <img 
                src={vehicleImage || "/images/seat.jpg"} 
                alt="Interior Bus" 
                className="w-full h-48 object-cover rounded-lg mb-4" 
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = "/images/seat.jpg"; // Fallback image
                }}
              />
              <div className="text-gray-600 text-sm space-y-1">
                <p>Kode Shuttle: {ticket.shuttleCode}</p>
                <p>No Kondektur: {ticket.kondekturNo}</p>
              </div>
            </div>

            {/* Journey Details Side */}
            <div className="w-full md:w-2/3 p-4 sm:p-6 bg-white">
              <div className="text-xl font-semibold mb-6">{ticket.date}</div>
              {/* Journey Timeline */}
              <div className="relative">
                <div className="absolute left-3 top-3 w-0.5 h-40 bg-emerald-500"></div>
                {/* From */}
                <div className="flex mb-8 relative">
                  <div className="mr-4 z-10">
                    <div className="w-6 h-6 rounded-full bg-emerald-500"></div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">{ticket.departureCity}</div>
                    <div className="text-gray-600">{ticket.departureTime}</div>
                    <div className="text-gray-500">{ticket.departureDetails}</div>
                  </div>
                </div>

                {/* Duration */}
                <div className="ml-12 mb-8 text-gray-500">{ticket.duration}</div>
                
                {/* To */}
                <div className="flex relative">
                  <div className="mr-4 z-10">
                    <div className="w-6 h-6 rounded-full bg-emerald-500"></div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">{ticket.arrivalCity}</div>
                    <div className="text-gray-600">{ticket.arrivalTime}</div>
                    <div className="text-gray-500">{ticket.arrivalDetails}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 px-4 sm:px-6 md:px-10">
          <div className="bg-gray-100 rounded-md flex items-start sm:items-center p-3 text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" className="text-green-500 mr-2 flex-shrink-0 mt-1 sm:mt-0">
              <path fill="currentColor" fillRule="evenodd" d="M7.5.85a.5.5 0 0 0-.5.5v2.172a.5.5 0 1 0 1 0v-1.65a5.65 5.65 0 1 1-4.81 1.974a.5.5 0 1 0-.762-.647A6.65 6.65 0 1 0 7.5.85m-.76 7.23L4.224 4.573a.25.25 0 0 1 .348-.348L8.081 6.74a.96.96 0 1 1-1.34 1.34" clipRule="evenodd"/>
            </svg>
            <span>Tiba di titik naik setidaknya 60 menit sebelum keberangkatan</span>
          </div>
          <div className="bg-gray-100 rounded-md flex items-start sm:items-center p-3 text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-1 sm:mt-0" 
                viewBox="0 0 48 48" fill="none">
              <g stroke="currentColor" strokeLinecap="round" strokeWidth="4">
                <path strokeLinejoin="round" d="M9 16L34 6l4 10M4 16h40v6c-3 0-6 2-6 5.5s3 6.5 6 6.5v6H4v-6c3 0 6-2 6-6s-3-6-6-6z"/>
                <path d="M17 25.385h6m-6 6h14"/>
              </g>
            </svg>
            <span>Tunjukkan e-tiket ke petugas bus atau shuttle</span>
          </div>
          <div className="bg-gray-100 rounded-md flex items-start sm:items-center p-3 text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-1 sm:mt-0" viewBox="0 0 24 24" fill="none">
              <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                <path d="M14 3.5h-4c-3.771 0-5.657 0-6.828 1.172S2 7.729 2 11.5v1c0 3.771 0 5.657 1.172 6.828S6.229 20.5 10 20.5h4c3.771 0 5.657 0 6.828-1.172S22 16.271 22 12.5v-1c0-3.771 0-5.657-1.172-6.828S17.771 3.5 14 3.5"/>
                <path d="M5 16c1.036-2.581 4.896-2.75 6 0M9.75 9.75a1.75 1.75 0 1 1-3.5 0a1.75 1.75 0 0 1 3.5 0M14 8.5h5M14 12h5m-5 3.5h2.5"/>
              </g>
            </svg>
            <span>Siapkan kartu identitas untuk verifikasi penumpang</span>
          </div>
        </div>

        {/* Passenger Data */}
        <div className="mb-6 px-4 sm:px-6 md:px-10">
          <h2 className="text-xl font-semibold mb-3">Data Pemesan</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">{ticket.contactPerson.name}</p>
                <p className="text-gray-600">{ticket.contactPerson.no}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="break-words">{ticket.contactPerson.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Passengers */}
        <div className="mb-6 px-4 sm:px-6 md:px-10">
          <h2 className="text-xl font-semibold mb-3">Data Penumpang</h2>
          <div className="space-y-2">
            {ticket.passengerDetails.map((passenger, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-3">
                <p className="text-gray-600">Data Penumpang {index + 1}</p>
                <p className="font-semibold">{passenger.name} - {passenger.seat}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Things to Know */}
        <div className="mb-6 px-4 sm:px-6 md:px-10">
          <h2 className="text-xl font-semibold mb-3">Hal yang perlu diketahui</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Ketentuan Umum</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
              <li>Penumpang sudah siap setidaknya 60 menit sebelum keberangkatan di titik keberangkatan yang telah
 ditentukan oleh agen. Keterlambatan penumpang dapat menyebabkan tiket dibatalkan secara sepihak dan
 tidak mendapatkan pengembalian dana.</li>
              <li>Waktu keberangkatan yang tertera di aplikasi adalah waktu lokal di titik keberangkatan.</li>
              <li>Pelanggan diwajibkan untuk menunjukkan e-tiket dan identitas yang berlaku (KTP/ Paspor/ SIM).</li>
            </ul>
          </div>
        </div>

        {/* Luggage */}
        <div className="mb-6 px-4 sm:px-6 md:px-10">
          <h2 className="text-xl font-semibold mb-3">Barang Bawaan</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <ul className="text-sm text-gray-700 space-y-1 list-decimal pl-5">
              <li>Penumpang dilarang membawa barang terlarang/ilegal dan membahayakan seperti senjata tajam, mudah
 terbakar, dan berbau menyengat. Penumpang bertanggung jawab penuh untuk kepemilikan tersebut dan konsekuensinya.</li>
              <li>Ukuran dan berat bagasi per penumpang tidak melebihi aturan yang ditetapkan. Jika bagasi melebihi
ukuran atau berat tersebut, maka penumpang diharuskan membayar biaya tambahan sesuai ketentuan agen.</li>
              <li>Penumpang dilarang membawa hewan jenis apapun ke dalam kendaraan.</li>
            </ul>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="px-4 sm:px-6 md:px-10">
          <h2 className="text-xl font-semibold mb-3">Kebijakan Pembatalan, Refund dan Reschedule</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <ul className="text-sm text-gray-700 space-y-1 list-decimal pl-5">
              <li>Pembatalan dan Refund dapat dilakukan sesuai dengan kebijakan perusahaan.</li>
              <li>Tidak dapat refund pada jam keberangkatan.</li>
            </ul>
          </div>
        </div>

        {/* Tombol Download */}
        <div className="text-center mt-6 mb-10 px-4 sm:px-6 md:px-10">
          <button
            onClick={handleDownloadPDF}
            className="bg-green-500 hover:bg-green-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md font-semibold w-full sm:w-auto"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ETicket;