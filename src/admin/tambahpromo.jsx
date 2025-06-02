import React, { useState, useRef } from "react";
import { Upload, Image, CheckCircle, AlertCircle } from "lucide-react";

const TambahPromo = ({ onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: "",
    details: "",
    code: "",
    potongan: "",
    berlakuHingga: "",
    image: null,
    imagePreview: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  
  // Ref untuk mencegah double submission
  const isSubmittingRef = useRef(false);
  const abortControllerRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file terlalu besar. Maksimal 5MB.");
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert("File harus berupa gambar.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
      imagePreview: null,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      details: "",
      code: "",
      potongan: "",
      berlakuHingga: "",
      image: null,
      imagePreview: null,
    });
    setSubmitStatus(null);
    setStatusMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // PENCEGAHAN DOUBLE SUBMISSION YANG LEBIH KETAT
    if (isSubmittingRef.current || isSubmitting) {
      console.log('Submission already in progress, blocking...');
      return;
    }
    
    // Set flag submission sedang berlangsung
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    
    // Validation
    if (!formData.title?.trim() || !formData.details?.trim() || !formData.code?.trim()) {
      alert("Mohon lengkapi semua field yang required!");
      // Reset flags jika validasi gagal
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    if (formData.potongan && (formData.potongan < 1 || formData.potongan > 100)) {
      alert("Potongan harus antara 1-100%!");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setSubmitStatus(null);
    setStatusMessage("");

    try {
      console.log('Starting submission...');

      // LANGSUNG PANGGIL onSubmit TANPA FETCH DOUBLE
      if (onSubmit && typeof onSubmit === "function") {
        // Siapkan data untuk dikirim
        const submitData = {
          title: formData.title.trim(),
          details: formData.details.trim(),
          code: formData.code.trim().toUpperCase(),
          potongan: formData.potongan || '0',
          berlakuHingga: formData.berlakuHingga,
          image: formData.image,
          id_admin: '1'
        };

        console.log('Calling onSubmit with data:', submitData);
        
        // Panggil onSubmit dari parent component (PromoTable)
        await onSubmit(submitData);
        
        setSubmitStatus('success');
        setStatusMessage('Promo berhasil ditambahkan!');
        
        // Reset form setelah sukses
        setTimeout(() => {
          resetForm();
        }, 1000);
      }

    } catch (error) {
      console.error('Error submitting promo:', error);
      setSubmitStatus('error');
      setStatusMessage(error.message || 'Terjadi kesalahan saat menambah promo');
    } finally {
      // Reset submission flags
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      abortControllerRef.current = null;
    }
  };

  const handleBackClick = () => {
    // Cancel ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Reset submission flags
    isSubmittingRef.current = false;
    setIsSubmitting(false);
    
    if (onCancel && typeof onCancel === "function") {
      onCancel();
    }
  };

  // Cleanup saat component unmount
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isSubmittingRef.current = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Promo | Tambah Promo
          </h1>
        </div>

        {submitStatus && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            submitStatus === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {submitStatus === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-100 rounded-lg shadow-sm p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-600 mb-3">
                Nama Promo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading || isSubmitting}
                placeholder="Masukkan nama promo"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-3">
                Detail Promo <span className="text-red-500">*</span>
              </label>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                disabled={loading || isSubmitting}
                placeholder="Jelaskan detail promo"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-3">
                Kode Promo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading || isSubmitting}
                placeholder="Contoh: DISKON20"
                style={{ textTransform: 'uppercase' }}
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
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading || isSubmitting}
                min="1"
                max="100"
                placeholder="Contoh: 20"
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
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading || isSubmitting}
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
                  disabled={loading || isSubmitting}
                />
                <div className="w-full px-4 py-3 border border-purple-400 rounded-lg bg-white flex items-center justify-between hover:bg-gray-50">
                  <span className="text-gray-500">
                    {formData.image ? formData.image.name : 'Pilih gambar (maks. 5MB)'}
                  </span>
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
                    disabled={loading || isSubmitting}
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
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                disabled={loading || isSubmitting}
              >
                Kembali
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center"
                disabled={loading || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahPromo;