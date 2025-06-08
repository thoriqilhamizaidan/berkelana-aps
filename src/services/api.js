// src/services/api.js
import kendaraanService from './kendaraanService';
import jadwalService from './jadwalService';
import authService from './authService';
import artikelService from './artikelService';
import { transaksiService } from './transaksiService'; // ✅ UBAH ini jadi named import

export {
  kendaraanService,
  jadwalService,
  authService,
  artikelService,
  transaksiService
};