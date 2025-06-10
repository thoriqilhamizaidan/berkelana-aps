// backend/services/paymentCleanupService.js - PROTECT PAID TRANSACTIONS
const { Op } = require('sequelize');
const db = require('../models');

class PaymentCleanupService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.cleanupInterval = 5 * 60 * 1000; // 5 menit check sekali
    this.expiryMinutes = 15; // 15 menit expiry
  }

  async start() {
    if (this.isRunning) {
      console.log('Cleanup service already running');
      return;
    }

    console.log('Starting payment cleanup service...');
    this.isRunning = true;

    // Jalankan cleanup pertama kali
    await this.runCleanup();

    // Set interval untuk cleanup berkala
    this.intervalId = setInterval(async () => {
      await this.runCleanup();
    }, this.cleanupInterval);

    console.log(`Payment cleanup service started - runs every ${this.cleanupInterval / 1000 / 60} minutes`);
  }

  async stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Payment cleanup service stopped');
  }

  async runCleanup() {
    try {
      console.log('Running payment cleanup...');
      
      // SOFT DELETE: Expired transactions (15 menit) - HANYA yang belum dibayar
      const softDeleteResult = await this.softDeleteExpiredTransactions();

      console.log(`Cleanup completed - Soft deleted: ${softDeleteResult.deleted}`);
      
      return {
        success: true,
        softDeleted: softDeleteResult.deleted,
        totalRevenueLoss: softDeleteResult.totalRevenueLoss || 0,
        details: softDeleteResult.details || [],
        message: 'Cleanup completed successfully'
      };
    } catch (error) {
      console.error('Error during cleanup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async softDeleteExpiredTransactions() {
    try {
      // Tanggal 15 menit yang lalu
      const fifteenMinutesAgo = new Date(Date.now() - (this.expiryMinutes * 60 * 1000));
      
      console.log(`Soft deleting transactions older than: ${fifteenMinutesAgo.toISOString()}`);

      // FIXED: Cari transaksi pending yang sudah expired - EXCLUDE yang sudah dibayar
      const expiredTransactions = await db.tabel_headtransaksi.findAll({
        where: {
          [Op.and]: [
            // HANYA pending transactions
            { 
              [Op.and]: [
                { 
                  [Op.or]: [
                    { status: 'pending' },
                    { payment_status: 'pending' }
                  ]
                },
                // ✅ PROTECTION: EXCLUDE transactions yang sudah dibayar
                { 
                  [Op.not]: [
                    { status: 'paid' }
                  ]
                },
                {
                  [Op.not]: [
                    { payment_status: 'paid' }
                  ]
                },
                {
                  [Op.not]: [
                    { payment_status: 'settlement' }
                  ]
                },
                {
                  [Op.not]: [
                    { payment_status: 'capture' }
                  ]
                }
              ]
            },
            { createdAt: { [Op.lt]: fifteenMinutesAgo } },
            { deletedAt: null }
          ]
        },
        attributes: ['id_headtransaksi', 'booking_code', 'total', 'createdAt', 'nama_pemesan', 'status', 'payment_status']
      });

      console.log(`Found ${expiredTransactions.length} expired UNPAID transactions for soft delete`);

      if (expiredTransactions.length === 0) {
        return { deleted: 0, details: [], totalRevenueLoss: 0 };
      }

      let deletedCount = 0;
      const deletedDetails = [];
      let totalRevenueLoss = 0;

      // Soft delete setiap transaksi expired yang BELUM dibayar
      for (const transaction of expiredTransactions) {
        try {
          // ✅ DOUBLE CHECK: Pastikan bukan transaksi yang sudah dibayar
          if (transaction.status === 'paid' || 
              transaction.payment_status === 'paid' || 
              transaction.payment_status === 'settlement' || 
              transaction.payment_status === 'capture') {
            console.log(`⚠️ SKIPPING paid transaction: ${transaction.booking_code} (status: ${transaction.status}, payment_status: ${transaction.payment_status})`);
            continue;
          }

          await db.sequelize.transaction(async (t) => {
            const now = new Date();
            
            // 1. Soft delete related payments dan update status ke 'expired'
            await db.tabel_payments.update(
              { 
                deletedAt: now,
                transaction_status: 'expired'
              },
              { 
                where: { id_headtransaksi: transaction.id_headtransaksi },
                transaction: t 
              }
            );

            // 2. Soft delete detail transaksi
            await db.tabel_detailtransaksi.update(
              { deletedAt: now },
              { 
                where: { id_headtransaksi: transaction.id_headtransaksi },
                transaction: t 
              }
            );

            // 3. Soft delete head transaksi dengan status 'expired'
            await db.tabel_headtransaksi.update(
              { 
                deletedAt: now,
                status: 'expired',
                payment_status: 'expired'
              },
              { 
                where: { id_headtransaksi: transaction.id_headtransaksi },
                transaction: t 
              }
            );
          });

          deletedCount++;
          const expiredMinutes = Math.floor((Date.now() - new Date(transaction.createdAt)) / (1000 * 60));
          const transactionTotal = transaction.total || 0;
          totalRevenueLoss += transactionTotal;
          
          deletedDetails.push({
            id: transaction.id_headtransaksi,
            booking_code: transaction.booking_code,
            created: transaction.createdAt,
            expired_minutes: expiredMinutes,
            total_amount: transactionTotal,
            customer: transaction.nama_pemesan,
            old_status: transaction.status,
            old_payment_status: transaction.payment_status,
            reason: 'unpaid_expired'
          });

          console.log(`✅ Auto-deleted UNPAID expired transaction: ${transaction.booking_code} (${expiredMinutes}min expired, Rp ${transactionTotal.toLocaleString()})`);
        } catch (deleteError) {
          console.error(`❌ Failed to soft delete transaction ${transaction.id_headtransaksi}:`, deleteError.message);
        }
      }

      // LOG BUSINESS METRICS
      console.log(`📊 BUSINESS IMPACT: ${deletedCount} UNPAID expired bookings, Total loss: Rp ${totalRevenueLoss.toLocaleString()}`);
      
      return { 
        deleted: deletedCount, 
        details: deletedDetails,
        totalRevenueLoss: totalRevenueLoss
      };
    } catch (error) {
      console.error('Error in softDeleteExpiredTransactions:', error);
      throw error;
    }
  }

  // Analytics menggunakan status 'expired' yang sudah ada
  async getAnalytics(days = 7) {
    try {
      const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
      
      // Query based on existing 'expired' status
      const expiredTransactions = await db.tabel_headtransaksi.findAll({
        where: {
          [Op.and]: [
            { deletedAt: { [Op.gte]: startDate } },
            { 
              [Op.or]: [
                { status: 'expired' },
                { payment_status: 'expired' }
              ]
            }
          ]
        },
        paranoid: false,
        attributes: ['booking_code', 'total', 'createdAt', 'deletedAt', 'nama_pemesan']
      });

      const totalLoss = expiredTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
      const averageLoss = expiredTransactions.length > 0 ? totalLoss / expiredTransactions.length : 0;

      return {
        period: `${days} days`,
        expiredCount: expiredTransactions.length,
        totalRevenueLoss: totalLoss,
        averageLossPerExpired: Math.round(averageLoss),
        dailyAverageExpired: Math.round((expiredTransactions.length / days) * 10) / 10,
        recentExpired: expiredTransactions.slice(0, 5).map(t => ({
          booking_code: t.booking_code,
          customer: t.nama_pemesan,
          amount: t.total,
          expired_date: t.deletedAt
        }))
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        period: `${days} days`,
        expiredCount: 0,
        totalRevenueLoss: 0,
        averageLossPerExpired: 0,
        dailyAverageExpired: 0,
        error: error.message
      };
    }
  }

  // Method untuk restore paid transactions yang salah dihapus
  async restorePaidTransactions() {
    try {
      console.log('🔄 Restoring wrongly deleted paid transactions...');
      
      // Cari transaksi yang dihapus tapi sebenarnya sudah dibayar
      const wronglyDeleted = await db.tabel_headtransaksi.findAll({
        where: {
          [Op.and]: [
            { deletedAt: { [Op.not]: null } },
            { 
              [Op.or]: [
                { status: 'paid' },
                { payment_status: 'paid' },
                { payment_status: 'settlement' },
                { payment_status: 'capture' }
              ]
            }
          ]
        },
        paranoid: false
      });

      console.log(`Found ${wronglyDeleted.length} wrongly deleted paid transactions`);

      let restoredCount = 0;
      for (const transaction of wronglyDeleted) {
        try {
          await db.sequelize.transaction(async (t) => {
            // Restore head transaction
            await db.tabel_headtransaksi.update(
              { deletedAt: null },
              { 
                where: { id_headtransaksi: transaction.id_headtransaksi },
                transaction: t,
                paranoid: false
              }
            );

            // Restore related records
            await db.tabel_payments.update(
              { deletedAt: null },
              { 
                where: { id_headtransaksi: transaction.id_headtransaksi },
                transaction: t,
                paranoid: false
              }
            );

            await db.tabel_detailtransaksi.update(
              { deletedAt: null },
              { 
                where: { id_headtransaksi: transaction.id_headtransaksi },
                transaction: t,
                paranoid: false
              }
            );
          });

          restoredCount++;
          console.log(`✅ Restored paid transaction: ${transaction.booking_code}`);
        } catch (restoreError) {
          console.error(`❌ Failed to restore transaction ${transaction.id_headtransaksi}:`, restoreError.message);
        }
      }

      console.log(`📊 Restored ${restoredCount} paid transactions`);
      return { restored: restoredCount };
    } catch (error) {
      console.error('Error restoring paid transactions:', error);
      throw error;
    }
  }

  // Manual cleanup method untuk testing
  async manualCleanup() {
    console.log('Running manual cleanup...');
    return await this.runCleanup();
  }

  // Method untuk mendapatkan status cleanup
  getStatus() {
    return {
      isRunning: this.isRunning,
      cleanupInterval: this.cleanupInterval,
      expiryMinutes: this.expiryMinutes,
      nextCleanup: this.intervalId ? new Date(Date.now() + this.cleanupInterval) : null
    };
  }

  // Method untuk mengubah interval cleanup (optional)
  updateInterval(minutes) {
    if (minutes < 1) {
      throw new Error('Interval must be at least 1 minute');
    }
    
    this.cleanupInterval = minutes * 60 * 1000;
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
    
    console.log(`Cleanup interval updated to ${minutes} minutes`);
  }
}

// Export singleton instance
const paymentCleanupService = new PaymentCleanupService();
module.exports = paymentCleanupService;