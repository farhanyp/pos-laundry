"use client";

import { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useOrderStore } from "@/store/use-order-store";
import { OrderTable } from "@/components/order/order-table";
import { OrderDialog } from "@/components/order/order-dialog";
import { PaymentDialog } from "@/components/order/payment-dialog";
import { OrderDeleteAlert } from "@/components/order/order-delete-alert";
import { LaundryStatus, PaymentStatus } from "@/types/enums";
import { Plus, Search, AlertTriangle } from "lucide-react";

export default function OrderPage() {
  const { data: orders, isLoading, error } = useOrders();
  const { setIsOpen } = useOrderStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLaundryStatus, setFilterLaundryStatus] = useState<LaundryStatus | 'ALL'>('ALL');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<PaymentStatus | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredOrders = orders?.filter(order => {
    const matchSearch = order.invoice_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customers?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchLaundry = filterLaundryStatus === 'ALL' || order.laundry_status === filterLaundryStatus;
    const matchPayment = filterPaymentStatus === 'ALL' || order.payment_status === filterPaymentStatus;
    
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

    return matchSearch && matchLaundry && matchPayment && matchDate;
  });

  if (error) {
    return (
      <div className="p-margin-desktop w-full h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-error-container/20 text-error rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="font-display text-title-lg font-bold text-on-surface">Gagal memuat pesanan</h2>
        <p className="text-body-md text-on-surface-variant">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-margin-desktop pt-16 md:pt-margin-desktop max-w-[1600px] mx-auto space-y-md">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-display text-title-lg md:text-headline-md font-bold text-primary">Pesanan Aktif</h1>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md p-2 md:px-4 md:py-2 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors active:scale-95 duration-150 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">Pesanan Baru</span>
          </button>
        </div>

        <div className="bg-surface-container-low rounded-lg border border-outline-variant/15 p-md flex flex-col">
          <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center mb-md gap-4">
            <div>
              <h3 className="font-headline-md text-primary">Daftar Pesanan</h3>
              <p className="text-on-surface-variant text-label-sm">Kelola semua transaksi aktif dan yang lalu</p>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full xl:w-auto">
              <select
                value={filterLaundryStatus}
                onChange={(e) => setFilterLaundryStatus(e.target.value as LaundryStatus | 'ALL')}
                className="w-full sm:w-auto bg-surface-container-highest rounded-lg p-2 text-body-sm text-on-surface outline-none border border-outline-variant/20 focus:border-primary cursor-pointer"
              >
                <option value="ALL">Semua Status Laundry</option>
                <option value="WAITING_PAYMENT">Menunggu Pembayaran</option>
                <option value="PROCESS">Proses</option>
                <option value="WAITING_FOR_PICKUP">Menunggu Pengambilan</option>
                <option value="COMPLETED">Selesai</option>
              </select>

              <select
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value as PaymentStatus | 'ALL')}
                className="w-full sm:w-auto bg-surface-container-highest rounded-lg p-2 text-body-sm text-on-surface outline-none border border-outline-variant/20 focus:border-primary cursor-pointer"
              >
                <option value="ALL">Semua Status Pembayaran</option>
                <option value="INITATE">Inisiasi</option>
                <option value="UNPAID">Belum Bayar</option>
                <option value="DP">DP</option>
                <option value="PAID">Lunas</option>
              </select>

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
                      className="w-full sm:w-[130px] bg-surface-container-highest rounded-lg p-2 text-body-sm text-on-surface outline-none border border-outline-variant/20 focus:border-primary cursor-pointer"
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
                      className="w-full sm:w-[130px] bg-surface-container-highest rounded-lg p-2 text-body-sm text-on-surface outline-none border border-outline-variant/20 focus:border-primary cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-auto flex-1 min-w-[200px] flex gap-2 bg-surface-container-highest rounded-lg p-2 border border-outline-variant/20 focus-within:border-primary items-center">
                <Search className="w-4 h-4 text-on-surface-variant" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari pesanan..."
                  className="bg-transparent border-none outline-none text-body-sm text-on-surface w-full"
                />
              </div>
            </div>
          </div>

          <OrderTable orders={filteredOrders || []} isLoading={isLoading} />
        </div>
      </div>

      <OrderDialog />
      <PaymentDialog />
      <OrderDeleteAlert />
    </>
  );
}
