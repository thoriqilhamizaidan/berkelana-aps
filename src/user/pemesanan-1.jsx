import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import Footer from './footer';
import { ChevronLeft } from 'lucide-react';
import { Icon } from '@iconify/react'; 

const Pemesanan1 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const ticket = location.state?.ticket || {};
  
  const [formData, setFormData] = useState({
    namaPesanan: '',
    noHandphone: '',
    email: '',
    namaPenumpang1: '',
    jenisKelamin1: 'Laki-laki',
    namaPenumpang2: '',
    jenisKelamin2: 'Laki-laki',
    namaPenumpang3: '',
    jenisKelamin3: 'Laki-laki'
  });
  
  const [rememberPesanan, setRememberPesanan] = useState(false);
  const [addSecondPassenger, setAddSecondPassenger] = useState(false);
  const [addThirdPassenger, setAddThirdPassenger] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
    // Navigate to next page
    navigate('/pemesanan-2', { state: { ticket, formData } });
  };

  return (
    <>
      
      
      {/* Simplified container structure - removed redundant containers */}
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Back button and title */}
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold ml-2">Pemesanan Anda!</h1>
        </div>
        
        <p className="text-gray-600 mb-6">Isi data Anda dan review pesanan Anda.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Data Pemesanan */}
              <div className="bg-neutral-100 rounded-lg shadow-lg p-5">
                <h2 className="text-xl font-bold mb-4">Data Pemesanan</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap* (tanpa gelar dan tanda baca)
                    </label>
                    <input
                      type="text"
                      name="namaPesanan"
                      value={formData.namaPesanan}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-purple1 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      No. Handphone*
                    </label>
                    <input
                      type="tel"
                      name="noHandphone"
                      value={formData.noHandphone}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-purple1 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email*
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-purple1 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberPesanan"
                      checked={rememberPesanan}
                      onChange={(e) => setRememberPesanan(e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-purple1 rounded focus:ring-purple-500 bg-white"
                    />
                    <label htmlFor="rememberPesanan" className="ml-2 text-sm text-gray-700">
                      Pemesan adalah penumpang
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Data Penumpang */}
              <div className="bg-neutral1 rounded-lg shadow-lg p-5">
                <h2 className="text-xl font-bold mb-4">Data Penumpang</h2>
                
                {/* Penumpang 1 */}
                <div className="space-y-3 mb-4">
                  <div className="font-semibold text-gray-700">Data Penumpang 1</div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap* (tanpa gelar dan tanda baca)
                    </label>
                    <input
                      type="text"
                      name="namaPenumpang1"
                      value={formData.namaPenumpang1}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-purple1 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Kelamin*
                    </label>
                    <select
                      name="jenisKelamin1"
                      value={formData.jenisKelamin1}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-purple1 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>
                
                {/* Penumpang 2 (Optional) */}
                {!addSecondPassenger ? (
                  <div className="text-center py-2">
                    <button
                      type="button"
                      onClick={() => setAddSecondPassenger(true)}
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      + Tambah Penumpang
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <div className="font-semibold text-gray-700">Data Penumpang 2</div>
                      <button
                        type="button"
                        onClick={() => {
                          setAddSecondPassenger(false);
                          setAddThirdPassenger(false);
                          setFormData(prev => ({
                            ...prev,
                            namaPenumpang2: '',
                            jenisKelamin2: 'Laki-laki',
                            namaPenumpang3: '',
                            jenisKelamin3: 'Laki-laki'
                          }));
                        }}
                        className="text-red-500 hover:text-red-700 font-medium text-sm"
                      >
                        Hapus Penumpang
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Lengkap* (tanpa gelar dan tanda baca)
                      </label>
                      <input
                        type="text"
                        name="namaPenumpang2"
                        value={formData.namaPenumpang2}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-purple1 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Kelamin*
                      </label>
                      <select
                        name="jenisKelamin2"
                        value={formData.jenisKelamin2}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-purple1 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                    
                    {/* Button to add third passenger */}
                    {!addThirdPassenger && (
                      <div className="text-center py-2">
                        <button
                          type="button"
                          onClick={() => setAddThirdPassenger(true)}
                          className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                          + Tambah Penumpang
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Penumpang 3 (Optional) */}
                {addSecondPassenger && addThirdPassenger && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <div className="font-semibold text-gray-700">Data Penumpang 3</div>
                      <button
                        type="button"
                        onClick={() => {
                          setAddThirdPassenger(false);
                          setFormData(prev => ({
                            ...prev,
                            namaPenumpang3: '',
                            jenisKelamin3: 'Laki-laki'
                          }));
                        }}
                        className="text-red-500 hover:text-red-700 font-medium text-sm"
                      >
                        Hapus Penumpang
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Lengkap* (tanpa gelar dan tanda baca)
                      </label>
                      <input
                        type="text"
                        name="namaPenumpang3"
                        value={formData.namaPenumpang3}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-purple1 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Kelamin*
                      </label>
                      <select
                        name="jenisKelamin3"
                        value={formData.jenisKelamin3}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-purple1 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-400 hover:bg-emerald-500 text-black font-bold py-2 px-6 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Lanjutkan
                </button>
              </div>
            </form>
          </div>
          
          {/* Right Side - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-purple-100 rounded-lg p-4 sticky top-4">
              <h3 className="font-bold text-lg mb-3">Selasa, 29 April 2025</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-black">GROGOL</div>
                    <div className="text-sm text-gray-600">04:20</div>
                    <div className="text-xs text-gray-500 mt-1">
                      JI Plaza Mayjen<br />
                      Raya No.111
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-black">CIAMPELAS</div>
                    <div className="text-sm text-gray-600">09:50</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Jl. Ciampelas No GHI
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-700 mt-3">
                  Estimasi waktu: 5 jam perjalanan
                </div>
                
                <div className="pt-3 border-t">
                  <div className="font-bold mb-1">Tipe Bus: Largest</div>
                  <div className="text-sm text-gray-700">Kapasitas kursi: 28 kursi</div>
                  <div className="text-sm text-gray-700">Format kursi: 2-2</div>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="font-bold mb-1">Fasilitas:</div>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <div className="flex items-center">
                      <Icon icon="mynaui:air-conditioner-solid" className="w-4 h-4 mr-1 text-purple-600" />
                      <span>AC</span>
                    </div>
                    <div className="flex items-center">
                      <Icon icon="f7:tv-fill" className="w-4 h-4 mr-1 text-purple-600" />
                      <span>Hiburan Sentral</span>
                    </div>
                    <div className="flex items-center">
                      <Icon icon="material-symbols:wifi-rounded" className="w-4 h-4 mr-1 text-purple-600" />
                      <span>Wi-Fi</span>
                    </div>
                    <div className="flex items-center">
                      <Icon icon="ph:seat-fill" className="w-4 h-4 mr-1 text-purple-600" />
                      <span>Kursi Recliner</span>
                    </div>
                    <div className="flex items-center">
                      <Icon icon="material-symbols:bed" className="w-4 h-4 mr-1 text-purple-600" />
                      <span>Selimut</span>
                    </div>
                    <div className="flex items-center">
                      <Icon icon="tabler:bottle-filled" className="w-4 h-4 mr-1 text-purple-600" />
                      <span>Mineral dan Snack</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Pemesanan1;