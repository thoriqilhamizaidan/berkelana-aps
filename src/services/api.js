// src/services/api.js
import kendaraanService from './kendaraanService';
import jadwalService from './jadwalService';
import authService from './authService';
import artikelService from './artikelService'; // ✅ Menggunakan versi dari main
import transaksiService from './transaksiService';

export {
  kendaraanService,
  jadwalService,
  authService,
  artikelService,
  transaksiService
};