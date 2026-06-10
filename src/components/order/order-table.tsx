"use client";

import React, { useState } from "react";
import { OrderWithDetails } from "@/types/order";
import { Loader2, Receipt, ChevronRight, ChevronLeft, Printer, Eye, CreditCard, PackageCheck, CheckCircle, ShoppingBag, Shirt, Banknote, QrCode, ChevronDown, Trash, MessageCircle, X } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useOrderStore } from "@/store/use-order-store";
import { useAuthStore } from "@/store/useAuthStore";
import { useUpdateOrderStatus } from "@/hooks/useOrders";
import { LaundryStatus, Role } from "@/types/enums";

interface OrderTableProps {
  orders: OrderWithDetails[];
  isLoading: boolean;
}

export function OrderTable({ orders, isLoading }: OrderTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { openPaymentDialog, openDeleteAlert } = useOrderStore();
  const updateOrderStatusMutation = useUpdateOrderStatus();

  const currentUser = useAuthStore(state => state.user);
  // STAFF, OWNER, and SUPERADMIN all have delete permissions for orders as per requirements
  const canDelete = true;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil((orders?.length || 0) / itemsPerPage);
  const paginatedData = orders?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/30 rounded-xl bg-surface-container-lowest">
        <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mb-3">
          <Receipt className="w-6 h-6 text-on-surface-variant" />
        </div>
        <p className="text-on-surface font-body-lg">Tidak ada pesanan ditemukan</p>
        <p className="text-on-surface-variant text-body-sm mt-1">Mulai dengan membuat pesanan baru.</p>
      </div>
    );
  }

  const handleSendWhatsApp = (e: React.MouseEvent, order: OrderWithDetails) => {
    e.stopPropagation();

    let phone = order.customers?.whatsapp_no;

    if (phone) {
      phone = phone.replace(/\D/g, '');
      if (phone.startsWith('0')) {
        phone = '62' + phone.substring(1);
      }
    }

    const customerName = order.customers?.name || "Pelanggan";
    const customerPhone = order.customers?.whatsapp_no || "-";
    const trackUrl = `${window.location.origin}/track?invoice=${order.invoice_no}`;

    const nonTunaiPayment = order.order_payments?.find(p => p.payment_type === 'NON_TUNAI' && p.midtrans_payment_url);
    const midtransUrl = nonTunaiPayment?.midtrans_payment_url;

    let message = "";

    if (midtransUrl && order.payment_status !== 'PAID') {
      message = `Halo Kak ${customerName} (${customerPhone}),\n\nPesanan laundry Anda telah dibuat. Silakan selesaikan pembayaran melalui link berikut yang aman dari Midtrans:\n\n${midtransUrl}\n\nLacak status pesanan Anda di sini:\n${trackUrl}\n\nTerima kasih!`;
    } else {
      message = `Halo Kak ${customerName} (${customerPhone}),\n\nPesanan laundry Anda telah kami terima.\n\nTotal Tagihan: ${formatCurrency(order.total_amount)}\nSudah Dibayar: ${formatCurrency(order.paid_amount)}\nSisa Tagihan: ${formatCurrency(order.remaining_amount)}\n\nLacak status pesanan Anda di sini:\n${trackUrl}\n\nTerima kasih!`;
    }

    const encodedMessage = encodeURIComponent(message);
    const waUrl = phone
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`
      : `https://api.whatsapp.com/send?text=${encodedMessage}`;

    window.open(waUrl, '_blank');
  };

  const openDetailModal = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING_PAYMENT':
      case 'UNPAID': return 'bg-error-container text-on-error-container';
      case 'PROCESS': return 'bg-tertiary-container text-on-tertiary-container';
      case 'WAITING_FOR_PICKUP': return 'bg-secondary-container text-on-secondary-container';
      case 'COMPLETED':
      case 'PAID': return 'bg-primary-container text-on-primary-container';
      case 'DP': return 'bg-surface-variant text-on-surface-variant';
      default: return 'bg-surface-variant text-on-surface';
    }
  };

  // Reusable Order Details Component for both Mobile and Desktop views
  const OrderDetailsView = ({ order }: { order: OrderWithDetails }) => (
    <div className="p-4 md:p-6 bg-surface-container-low rounded-xl md:rounded-2xl border border-outline-variant/20 shadow-sm relative">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-tertiary rounded-l-xl md:rounded-l-2xl"></div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 ml-2 md:ml-0">

        {/* Order Items List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h4 className="text-title-sm font-bold text-on-surface">Detail Pesanan</h4>
            <span className="bg-surface-container-highest px-2.5 py-0.5 rounded-full text-xs font-bold text-on-surface-variant">
              {order.order_items?.length} items
            </span>
          </div>

          <div className="space-y-3">
            {order.order_items?.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10 hover:border-primary/20 hover:shadow-sm transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Shirt className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-label-md font-bold text-on-surface leading-tight mb-0.5 line-clamp-1">{item.services?.name}</p>
                    <p className="text-body-sm text-on-surface-variant">{item.qty} {item.services?.unit} x {formatCurrency(item.price_per_unit)}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-label-md font-bold text-on-surface">{formatCurrency(item.qty * item.price_per_unit)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History & Summary */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                <Receipt className="w-5 h-5" />
              </div>
              <h4 className="text-title-sm font-bold text-on-surface">Riwayat Pembayaran</h4>
            </div>

            {order.order_payments && order.order_payments.length > 0 ? (
              <div className="space-y-3">
                {order.order_payments?.map(payment => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10 hover:border-secondary/20 hover:shadow-sm transition-all group">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-colors ${payment.payment_type === 'TUNAI' ? 'bg-green-500/10 text-green-600 group-hover:bg-green-500/20' : 'bg-blue-500/10 text-blue-600 group-hover:bg-blue-500/20'}`}>
                        {payment.payment_type === 'TUNAI' ? <Banknote className="w-5 h-5" /> : <QrCode className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-label-md font-bold text-on-surface leading-tight mb-0.5">
                          {payment.payment_type === 'TUNAI' ? 'Cash' : 'QRIS'}
                        </p>
                        <p className="text-body-sm text-on-surface-variant">{formatDateTime(payment.created_at)}</p>
                      </div>
                    </div>
                    <p className="text-label-md shrink-0 font-bold text-on-surface">{formatCurrency(payment.amount)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/10 text-center text-on-surface-variant text-body-sm flex flex-col items-center justify-center gap-2 h-[100px] border-dashed">
                <Receipt className="w-6 h-6 opacity-50" />
                Belum ada histori pembayaran
              </div>
            )}
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/10 shadow-sm">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span className="font-medium text-on-surface">{formatCurrency(order.subtotal)}</span>
              </div>
              {(order.discount_amount ?? 0) > 0 && (
                <div className="flex justify-between text-error">
                  <span>Diskon</span>
                  <span className="font-bold">-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              {(order.tax_amount ?? 0) > 0 && (
                <div className="flex justify-between text-on-surface-variant">
                  <span>Pajak</span>
                  <span className="font-medium text-on-surface">+{formatCurrency(order.tax_amount)}</span>
                </div>
              )}
              {(order.service_fee_amount ?? 0) > 0 && (
                <div className="flex justify-between text-on-surface-variant">
                  <span>Layanan</span>
                  <span className="font-medium text-on-surface">+{formatCurrency(order.service_fee_amount)}</span>
                </div>
              )}
              <div className="pt-3 mt-3 border-t border-outline-variant/20 flex justify-between font-bold text-on-surface items-center">
                <span className="text-label-lg">Total Keseluruhan</span>
                <span className="text-title-md text-primary">{formatCurrency(order.total_amount)}</span>
              </div>
              <div className="flex justify-between font-bold text-on-surface items-center bg-secondary/5 p-2 rounded-lg -mx-2 px-2">
                <span className="text-label-md text-secondary">Sudah Dibayar</span>
                <span className="text-label-lg text-secondary">{formatCurrency(order.paid_amount)}</span>
              </div>
              {order.remaining_amount > 0 && (
                <div className="flex justify-between font-bold items-center bg-error/5 p-2 rounded-lg -mx-2 px-2 mt-1">
                  <span className="text-label-md text-error">Sisa Kekurangan</span>
                  <span className="text-label-lg text-error">{formatCurrency(order.remaining_amount)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  const OrderActions = ({ order }: { order: OrderWithDetails }) => (
    <div className="flex items-center justify-end gap-1">
      <button onClick={(e) => { e.stopPropagation(); openDetailModal(order); }} className="flex items-center gap-1.5 p-1.5 px-3 text-primary hover:bg-primary/10 rounded-md transition-colors text-label-sm font-medium" title="Lihat Detail">
        <Eye className="w-4 h-4" />
        <span className="hidden sm:inline">Lihat Detail</span>
      </button>
      {canDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); openDeleteAlert(order); }}
          className="p-1.5 text-error hover:bg-error/10 rounded-md transition-colors"
          title="Hapus Pesanan"
        >
          <Trash className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  const FullOrderActions = ({ order }: { order: OrderWithDetails }) => (
    <div className="flex items-center justify-end gap-2 sm:gap-3 flex-wrap sm:flex-nowrap w-full">
      {/* Primary Action Button */}
      <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-center sm:justify-end">
        {(order.payment_status === 'UNPAID' || order.payment_status === 'DP') && (
          <button
            onClick={(e) => { e.stopPropagation(); openPaymentDialog(order); closeDetailModal(); }}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-label-sm font-medium hover:bg-primary/90 hover:shadow-md transition-all active:scale-95 flex-1 sm:flex-none"
          >
            <CreditCard className="w-4 h-4" />
            {order.payment_status === 'DP' ? 'Lunasi' : 'Bayar'}
          </button>
        )}

        {order.laundry_status === 'PROCESS' && (
          <button
            onClick={(e) => { e.stopPropagation(); updateOrderStatusMutation.mutate({ orderId: order.id, laundryStatus: LaundryStatus.WAITING_FOR_PICKUP }); }}
            disabled={updateOrderStatusMutation.isPending}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-secondary text-on-secondary rounded-lg text-label-sm font-medium hover:bg-secondary/90 hover:shadow-md transition-all active:scale-95 disabled:opacity-50 flex-1 sm:flex-none"
          >
            <PackageCheck className="w-4 h-4" />
            Selesai Cuci
          </button>
        )}

        {order.laundry_status === 'WAITING_FOR_PICKUP' && (
          <button
            onClick={(e) => { e.stopPropagation(); updateOrderStatusMutation.mutate({ orderId: order.id, laundryStatus: LaundryStatus.COMPLETED }); }}
            disabled={updateOrderStatusMutation.isPending || order.payment_status === 'DP' || order.payment_status === 'UNPAID'}
            title={order.payment_status !== 'PAID' ? 'Pembayaran harus dilunasi terlebih dahulu' : 'Tandai Selesai'}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-tertiary text-on-tertiary rounded-lg text-label-sm font-medium hover:bg-tertiary/90 hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
          >
            <CheckCircle className="w-4 h-4" />
            Selesai
          </button>
        )}
      </div>

      {/* Secondary Actions Group */}
      <div className="flex items-center bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-0.5 shadow-sm shrink-0 mx-auto sm:mx-0">
        <button onClick={(e) => handleSendWhatsApp(e, order)} className="p-1.5 text-[#25D366] hover:bg-[#25D366]/10 rounded-md transition-colors" title="Kirim WhatsApp">
          <MessageCircle className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-outline-variant/30 mx-0.5"></div>
        <button onClick={(e) => e.stopPropagation()} className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors" title="Cetak Struk">
          <Printer className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full">

      {/* ---------------- MOBILE CARD VIEW ---------------- */}
      <div className="lg:hidden flex flex-col gap-4">
        {paginatedData.map((order) => {
          return (
            <div key={order.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
              {/* Card Header (Clickable for details) */}
              <div
                className="p-4 flex flex-col gap-3 cursor-pointer hover:bg-surface-container-lowest/80 transition-colors"
                onClick={() => openDetailModal(order)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-label-md font-bold text-primary block">{order.invoice_no}</span>
                    <span className="text-body-sm text-on-surface-variant">{formatDateTime(order.created_at)}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(order.laundry_status)}`}>
                      {order.laundry_status.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-outline-variant/10 pt-3">
                  <div>
                    <span className="text-body-md font-bold text-on-surface block">{order.customers?.name || "Unknown"}</span>
                    <span className="text-body-sm text-on-surface-variant flex items-center gap-1">
                      {order.customers?.whatsapp_no}
                    </span>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="text-title-md font-bold text-on-surface">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Actions Row */}
              <div className="px-4 pb-4 border-t border-outline-variant/10 pt-3 bg-surface-container-lowest">
                <OrderActions order={order} />
              </div>

            </div>
          )
        })}
      </div>

      {/* ---------------- DESKTOP TABLE VIEW ---------------- */}
      <div className="hidden lg:block w-full overflow-x-auto rounded-lg border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container border-b border-outline-variant/20">
              <th className="p-4 text-label-md font-bold text-on-surface-variant">Faktur & Tanggal</th>
              <th className="p-4 text-label-md font-bold text-on-surface-variant">Pelanggan</th>
              <th className="p-4 text-label-md font-bold text-on-surface-variant">Status</th>
              <th className="p-4 text-label-md font-bold text-on-surface-variant">Pembayaran</th>
              <th className="p-4 text-label-md font-bold text-on-surface-variant text-right">Total</th>
              <th className="p-4 text-label-md font-bold text-on-surface-variant text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10 bg-surface-container-lowest">
            {paginatedData.map((order) => {
              return (
                <React.Fragment key={order.id}>
                  <tr
                    className="hover:bg-surface-container-lowest/50 transition-colors group cursor-pointer"
                    onClick={() => openDetailModal(order)}
                  >
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-body-md font-bold text-primary">{order.invoice_no}</span>
                        <span className="text-body-sm text-on-surface-variant">
                          {formatDateTime(order.created_at)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-body-md font-bold text-on-surface">{order.customers?.name || "Unknown"}</span>
                        <span className="text-body-sm text-on-surface-variant">{order.customers?.whatsapp_no}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-label-sm font-bold ${getStatusColor(order.laundry_status)}`}>
                        {order.laundry_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-label-sm font-bold ${getStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="p-4 text-body-md font-bold text-on-surface text-right">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end">
                        <OrderActions order={order} />
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ---------------- PAGINATION ---------------- */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 mt-4 border border-outline-variant/15 rounded-lg bg-surface-container-low gap-3">
          <div className="text-label-sm text-on-surface-variant text-center sm:text-left">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} sampai {Math.min(currentPage * itemsPerPage, orders?.length || 0)} dari {orders?.length || 0} data
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-surface-container-highest disabled:opacity-50 disabled:cursor-not-allowed text-on-surface-variant"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded text-label-sm font-medium ${currentPage === page ? 'bg-primary text-on-primary' : 'hover:bg-surface-container-highest text-on-surface'}`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-surface-container-highest disabled:opacity-50 disabled:cursor-not-allowed text-on-surface-variant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ---------------- ORDER DETAIL MODAL ---------------- */}
      {isDetailModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeDetailModal}
        >
          <div
            className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl w-full max-w-4xl flex flex-col shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 md:px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container">
              <div>
                <h2 className="text-title-lg font-display font-bold text-on-surface">Detail Pesanan</h2>
                <p className="text-body-sm text-on-surface-variant">Faktur: <span className="font-bold text-primary">{selectedOrder.invoice_no}</span></p>
              </div>
              <button onClick={closeDetailModal} className="p-2 rounded-full hover:bg-surface-container-highest text-on-surface-variant transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 md:p-6 bg-surface">
              <OrderDetailsView order={selectedOrder} />
            </div>

            <div className="px-4 md:px-6 py-4 border-t border-outline-variant/20 bg-surface-container flex justify-end">
              <FullOrderActions order={selectedOrder} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
