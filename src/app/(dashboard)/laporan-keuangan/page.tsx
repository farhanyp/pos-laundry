"use client";

import { useState, useMemo } from "react";
import { useOrders } from "@/hooks/useOrders";
import { formatCurrency, formatDateTime, translatePaymentStatus } from "@/lib/utils";
import { PaymentStatus } from "@/types/enums";
import { AlertTriangle, TrendingUp, Wallet, CreditCard, Clock, Receipt, Download, X } from "lucide-react";
import { generateLaporanPDF } from "@/lib/export-pdf";
import { OrderWithDetails } from "@/types/order";

export default function LaporanKeuanganPage() {
  const { data: orders, isLoading, error } = useOrders();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  const handleExportPDF = () => {
    generateLaporanPDF(
      (orders as OrderWithDetails[]) || [],
      exportStartDate,
      exportEndDate
    );
    setIsExportModalOpen(false);
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    return orders.filter(order => {
      let matchDate = true;
      if (startDate || endDate) {
        const orderDate = new Date(order.created_at);
        
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (orderDate < start) matchDate = false;
        }
        
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (orderDate > end) matchDate = false;
        }
      }
      return matchDate;
    });
  }, [orders, startDate, endDate]);

  const stats = useMemo(() => {
    let totalOmzet = 0;
    let totalPendapatan = 0;
    let totalPiutang = 0;
    let totalTunai = 0;
    let totalNonTunai = 0;

    filteredOrders.forEach(order => {
      totalOmzet += Number(order.total_amount);
      totalPiutang += Number(order.remaining_amount);

      order.order_payments?.forEach(payment => {
        // We only count successful payments. For Midtrans, maybe we should check midtrans_status
        // but for now let's assume if it's there and amount > 0, we count it, or we check midtrans_status === 'settlement' or null
        const isSuccess = payment.payment_type === 'TUNAI' || (payment.payment_type === 'NON_TUNAI' && (payment.midtrans_status === 'settlement' || payment.midtrans_status === 'capture' || !payment.midtrans_status));
        
        if (isSuccess) {
          totalPendapatan += Number(payment.amount);
          if (payment.payment_type === 'TUNAI') {
            totalTunai += Number(payment.amount);
          } else {
            totalNonTunai += Number(payment.amount);
          }
        }
      });
    });

    return { totalOmzet, totalPendapatan, totalPiutang, totalTunai, totalNonTunai };
  }, [filteredOrders]);

  if (error) {
    return (
      <div className="p-margin-desktop w-full h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-error-container/20 text-error rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="font-display text-title-lg font-bold text-on-surface">Gagal memuat data laporan</h2>
        <p className="text-body-md text-on-surface-variant">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-margin-desktop pt-16 md:pt-margin-desktop max-w-[1600px] mx-auto space-y-md">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="font-display text-title-lg md:text-headline-md font-bold text-primary">Laporan Keuangan</h1>
          <p className="text-body-md text-on-surface-variant">Ringkasan pendapatan dan riwayat pembayaran transaksi</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:items-center">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:items-center bg-surface-container-low sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none border border-outline-variant/20 sm:border-none">
            <span className="text-label-sm font-medium text-on-surface-variant sm:hidden mb-1">Periode Tanggal</span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="flex flex-col flex-1 sm:flex-none w-full sm:w-auto">
                <span className="text-[10px] text-on-surface-variant sm:hidden mb-1 ml-1">Mulai</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker();
                    } catch (err) {}
                  }}
                  className="w-full sm:w-[150px] bg-surface-container-highest rounded-lg p-2 text-body-sm text-on-surface outline-none border border-outline-variant/20 focus:border-primary cursor-pointer"
                />
              </div>
              <span className="hidden sm:block text-on-surface-variant font-medium">-</span>
              <div className="flex flex-col flex-1 sm:flex-none w-full sm:w-auto">
                <span className="text-[10px] text-on-surface-variant sm:hidden mb-1 ml-1">Sampai</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker();
                    } catch (err) {}
                  }}
                  className="w-full sm:w-[150px] bg-surface-container-highest rounded-lg p-2 text-body-sm text-on-surface outline-none border border-outline-variant/20 focus:border-primary cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            <span className="whitespace-nowrap">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-surface-container-low border border-outline-variant/15 p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-container text-on-primary-container rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-label-md font-medium text-on-surface-variant">Total Omzet</span>
          </div>
          <p className="text-title-lg font-bold text-primary">{formatCurrency(stats.totalOmzet)}</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/15 p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-label-md font-medium text-on-surface-variant">Pendapatan Masuk</span>
          </div>
          <p className="text-title-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(stats.totalPendapatan)}</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/15 p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-label-md font-medium text-on-surface-variant">Total Tunai</span>
          </div>
          <p className="text-title-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(stats.totalTunai)}</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/15 p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-label-md font-medium text-on-surface-variant">Total Non-Tunai</span>
          </div>
          <p className="text-title-lg font-bold text-purple-600 dark:text-purple-400">{formatCurrency(stats.totalNonTunai)}</p>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/15 p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-error-container text-on-error-container rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-label-md font-medium text-on-surface-variant">Total Piutang</span>
          </div>
          <p className="text-title-lg font-bold text-error">{formatCurrency(stats.totalPiutang)}</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-surface-container-low rounded-xl border border-outline-variant/15 overflow-hidden">
        <div className="p-4 border-b border-outline-variant/15 flex justify-between items-center">
          <h2 className="font-title-md font-bold text-on-surface">Detail Pembayaran Pesanan</h2>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-on-surface-variant animate-pulse">Memuat data...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant">Tidak ada data untuk periode ini.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-highest/50">
                  <th className="p-4 text-label-md font-medium text-on-surface-variant whitespace-nowrap">Tgl. Pesanan</th>
                  <th className="p-4 text-label-md font-medium text-on-surface-variant whitespace-nowrap">Invoice</th>
                  <th className="p-4 text-label-md font-medium text-on-surface-variant whitespace-nowrap">Pelanggan</th>
                  <th className="p-4 text-label-md font-medium text-on-surface-variant whitespace-nowrap">Total Tagihan</th>
                  <th className="p-4 text-label-md font-medium text-on-surface-variant whitespace-nowrap">Sudah Dibayar</th>
                  <th className="p-4 text-label-md font-medium text-on-surface-variant whitespace-nowrap">Sisa Tagihan</th>
                  <th className="p-4 text-label-md font-medium text-on-surface-variant whitespace-nowrap">Status</th>
                  <th className="p-4 text-label-md font-medium text-on-surface-variant whitespace-nowrap">Metode Bayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {filteredOrders.map(order => {
                  const paymentTypes = Array.from(new Set(order.order_payments?.map(p => p.payment_type))).join(', ') || '-';
                  
                  return (
                    <tr key={order.id} className="hover:bg-surface-container-highest/20 transition-colors">
                      <td className="p-4 text-body-sm text-on-surface whitespace-nowrap">{formatDateTime(order.created_at)}</td>
                      <td className="p-4 text-body-sm font-medium text-primary whitespace-nowrap">{order.invoice_no}</td>
                      <td className="p-4 text-body-sm text-on-surface whitespace-nowrap">{order.customers?.name || '-'}</td>
                      <td className="p-4 text-body-sm font-medium text-on-surface whitespace-nowrap">{formatCurrency(order.total_amount)}</td>
                      <td className="p-4 text-body-sm text-green-600 dark:text-green-400 font-medium whitespace-nowrap">{formatCurrency(order.paid_amount)}</td>
                      <td className="p-4 text-body-sm text-error font-medium whitespace-nowrap">{formatCurrency(order.remaining_amount)}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.payment_status === PaymentStatus.PAID ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          order.payment_status === PaymentStatus.DP ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-error-container/30 text-error'
                        }`}>
                          {translatePaymentStatus(order.payment_status)}
                        </span>
                      </td>
                      <td className="p-4 text-body-sm text-on-surface-variant whitespace-nowrap">
                        {paymentTypes === 'TUNAI' ? (
                          <span className="flex items-center gap-1"><Receipt className="w-3 h-3"/> Tunai</span>
                        ) : paymentTypes === 'NON_TUNAI' ? (
                          <span className="flex items-center gap-1"><CreditCard className="w-3 h-3"/> Non-Tunai</span>
                        ) : paymentTypes.includes('TUNAI') ? (
                          <span>Campuran</span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Export Modal */}
      {isExportModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" 
          onClick={() => setIsExportModalOpen(false)}
        >
          <div 
            className="bg-surface-container-lowest w-full max-w-[420px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Download className="w-5 h-5" />
                </div>
                <h2 className="font-display text-[20px] font-bold text-on-surface">Export Laporan</h2>
              </div>
              <button 
                onClick={() => setIsExportModalOpen(false)} 
                className="text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors p-2 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <p className="text-[14px] text-on-surface-variant leading-relaxed">
                Pilih rentang tanggal untuk mengekspor data laporan ke format PDF. Kosongkan untuk mengekspor semua data.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[14px] font-semibold text-on-surface">Mulai Tanggal</label>
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker();
                      } catch (err) {}
                    }}
                    className="w-full bg-surface-container-highest/30 hover:bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] font-semibold text-on-surface">Sampai Tanggal</label>
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker();
                      } catch (err) {}
                    }}
                    className="w-full bg-surface-container-highest/30 hover:bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-outline-variant/10 bg-surface-container-low flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl text-[14px] font-bold text-on-surface-variant hover:bg-surface-variant/20 hover:text-on-surface transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[14px] font-bold bg-primary text-on-primary hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 hover:shadow-primary/40"
              >
                <Download className="w-5 h-5" />
                Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
