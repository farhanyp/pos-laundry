"use client";

import { useState } from "react";
import { useOrderStore } from "@/store/use-order-store";
import { useCreateDPMutation, useProcessOrderPayment, useSettlePaymentMutation } from "@/hooks/useOrders";
import { formatCurrency, calculateDPAmount, calculateChange } from "@/lib/utils";
import { X, Banknote, QrCode, Receipt, CheckCircle, MessageCircle, ExternalLink, Check, Copy, Loader2 } from "lucide-react";

export function PaymentDialog() {
  const {
    isPaymentOpen, closePaymentDialog,
    activeOrder,
    paymentMethod, setPaymentMethod,
    paymentMode, setPaymentMode,
    amountPaid, setAmountPaid,
    midtransUrl, setMidtransUrl,
    setMidtransToken,
    selectedCustomer,
    newCustomerData
  } = useOrderStore();

  const processFullPaymentMutation = useProcessOrderPayment();
  const processDPMutation = useCreateDPMutation();
  const processSettleMutation = useSettlePaymentMutation();

  const [isCopied, setIsCopied] = useState(false);

  if (!isPaymentOpen || !activeOrder) return null;

  const isAlreadyDP = activeOrder.payment_status === 'DP';

  // Calculations
  const totalBill = activeOrder.total_amount;
  const dpAmount = calculateDPAmount(totalBill);

  let expectedAmount = totalBill;
  if (isAlreadyDP) {
    expectedAmount = activeOrder.remaining_amount;
  } else if (paymentMode === 'DP') {
    expectedAmount = dpAmount;
  }

  const changeReturn = calculateChange(amountPaid, expectedAmount);
  const isValidCash = paymentMethod === 'NON_TUNAI' || amountPaid >= expectedAmount;

  const handleProcessPayment = async () => {
    try {
      const payload = {
        orderId: activeOrder.id,
        paymentMethod,
        expectedAmount,
        cashGiven: amountPaid,
        totalAmount: activeOrder.total_amount,
      };

      let result;
      if (isAlreadyDP) {
        result = await processSettleMutation.mutateAsync(payload);
      } else if (paymentMode === 'DP') {
        result = await processDPMutation.mutateAsync(payload);
      } else {
        result = await processFullPaymentMutation.mutateAsync(payload);
      }

      if (paymentMethod === 'NON_TUNAI') {
        setMidtransUrl(result?.redirectUrl || '');
        // if (result?.redirectUrl) {
        //   window.open(result.redirectUrl, '_blank');
        // }
      } else {
        closePaymentDialog();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulatePaymentSuccess = () => {
    closePaymentDialog();
  };

  const handleSendWhatsApp = () => {
    if (!midtransUrl) return;

    let phone = selectedCustomer?.whatsapp_no || newCustomerData?.whatsapp_no;

    if (phone) {
      phone = phone.replace(/\D/g, '');
      if (phone.startsWith('0')) {
        phone = '62' + phone.substring(1);
      }
    }

    const customerName = selectedCustomer?.name || newCustomerData?.name || "Pelanggan";
    const customerPhone = selectedCustomer?.whatsapp_no || newCustomerData?.whatsapp_no || "-";

    const message = encodeURIComponent(`Halo Kak ${customerName} (${customerPhone}),\n\nPesanan laundry Anda telah dibuat. Silakan selesaikan pembayaran melalui link berikut yang aman dari Midtrans:\n\n${midtransUrl}\n\nTerima kasih!`);
    const waUrl = phone
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${message}`
      : `https://api.whatsapp.com/send?text=${message}`;

    window.open(waUrl, '_blank');
  };

  const handleCopyLink = async () => {
    if (!midtransUrl) return;
    try {
      await navigator.clipboard.writeText(midtransUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl w-full max-w-2xl flex flex-col shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">

        {/* Header */}
        <div className="px-4 md:px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container">
          <h2 className="text-title-lg font-display font-bold text-on-surface">Proses Pembayaran</h2>
          <button onClick={closePaymentDialog} className="p-2 rounded-full hover:bg-surface-container-highest text-on-surface-variant transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6 overflow-y-auto max-h-[80vh]">
          {!midtransUrl ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="text-center">
                <h3 className="text-title-lg font-bold text-primary mb-2">
                  {isAlreadyDP ? 'Pelunasan Sisa Tagihan' : 'Konfigurasi Pembayaran'}
                </h3>
                <p className="text-body-md text-on-surface-variant">
                  {isAlreadyDP ? 'Selesaikan sisa pembayaran untuk pengambilan laundry' : 'Pilih metode pembayaran untuk transaksi ini'}
                </p>
              </div>

              {!isAlreadyDP && (
                <div className="flex p-1 bg-surface-container-high rounded-xl mb-6">
                  <button
                    onClick={() => { setPaymentMode('FULL'); setAmountPaid(0); }}
                    className={`flex-1 py-2 text-label-md font-bold rounded-lg transition-colors ${paymentMode === 'FULL' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
                  >
                    Bayar Lunas
                  </button>
                  <button
                    onClick={() => {
                      setPaymentMode('DP');
                      setAmountPaid(0);
                      setPaymentMethod('CASH'); // Force CASH for DP
                    }}
                    className={`flex-1 py-2 text-label-md font-bold rounded-lg transition-colors ${paymentMode === 'DP' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
                  >
                    Bayar DP (50%)
                  </button>
                </div>
              )}

              <div className={`grid gap-4 ${paymentMode === 'DP' && !isAlreadyDP ? 'grid-cols-1 mx-auto' : 'sm:grid-cols-2'}`}>
                <button
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-all duration-200 ${paymentMethod === 'CASH' ? 'border-primary bg-primary/5 text-primary shadow-sm scale-[1.02]' : 'border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low hover:border-outline-variant/50'}`}
                >
                  <div className={`p-4 rounded-full transition-colors ${paymentMethod === 'CASH' ? 'bg-primary/10' : 'bg-surface-container-high'}`}>
                    <Banknote className="w-10 h-10" />
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-title-md block mb-1">CASH</span>
                    <span className="text-label-sm opacity-80 font-normal">Bayar Tunai</span>
                  </div>
                </button>

                {!(paymentMode === 'DP' && !isAlreadyDP) && (
                  <button
                    onClick={() => setPaymentMethod('NON_TUNAI')}
                    className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-all duration-200 ${paymentMethod === 'NON_TUNAI' ? 'border-primary bg-primary/5 text-primary shadow-sm scale-[1.02]' : 'border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low hover:border-outline-variant/50'}`}
                  >
                    <div className={`p-4 rounded-full transition-colors ${paymentMethod === 'NON_TUNAI' ? 'bg-primary/10' : 'bg-surface-container-high'}`}>
                      <QrCode className="w-10 h-10" />
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-title-md block mb-1">QRIS / E-Wallet</span>
                      <span className="text-label-sm opacity-80 font-normal">Bayar Non-Tunai</span>
                    </div>
                  </button>
                )}
              </div>

              {/* Dynamic Payment Details Section */}
              <div className="mt-8 transition-all duration-300">
                {paymentMethod === 'CASH' && (
                  <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 space-y-6 shadow-sm animate-in slide-in-from-bottom-4 fade-in">

                    {isAlreadyDP ? (
                      <div className="space-y-3 border-b border-outline-variant/20 pb-4">
                        <div className="flex justify-between items-center text-on-surface-variant">
                          <span className="text-label-md">Total Tagihan</span>
                          <span className="font-medium">{formatCurrency(activeOrder.total_amount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-on-surface-variant">
                          <span className="text-label-md">Sudah Dibayar (DP)</span>
                          <span className="font-medium">{formatCurrency(activeOrder.paid_amount)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-label-lg font-bold text-error">Sisa (Kekurangan)</span>
                          <span className="text-title-lg font-bold text-error">{formatCurrency(expectedAmount)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-end border-b border-outline-variant/20 pb-4">
                        <div>
                          <span className="text-on-surface-variant text-label-md block mb-1">
                            {paymentMode === 'DP' ? 'Uang Muka (50%)' : 'Total Tagihan'}
                          </span>
                          <span className="text-title-lg font-bold text-primary">{formatCurrency(expectedAmount)}</span>
                        </div>
                        {paymentMode === 'DP' && (
                          <div className="text-right">
                            <span className="text-on-surface-variant text-label-sm block mb-1">Total Keseluruhan</span>
                            <span className="text-label-md font-medium text-on-surface line-through opacity-70">{formatCurrency(totalBill)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="text-label-md font-bold text-on-surface mb-2 block">Uang Diterima</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 font-bold text-on-surface-variant text-lg">Rp</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={amountPaid ? amountPaid.toLocaleString('id-ID') : ""}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, "");
                            setAmountPaid(Number(rawValue));
                          }}
                          className="w-full p-4 pl-12 rounded-xl bg-surface-container-lowest border-2 border-outline-variant/30 text-on-surface text-xl font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 flex justify-between items-center mt-2">
                      <span className="text-on-surface-variant font-bold text-label-md">Kembalian:</span>
                      <span className={`text-title-md font-bold ${amountPaid >= expectedAmount ? 'text-secondary' : 'text-error'}`}>
                        {formatCurrency(changeReturn)}
                      </span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'NON_TUNAI' && (
                  <div className="w-full overflow-hidden bg-gradient-to-br from-tertiary/10 via-surface-container-lowest to-primary/5 border border-tertiary/20 p-8 rounded-3xl text-center shadow-sm animate-in slide-in-from-bottom-4 fade-in flex flex-col items-center">
                    {/* Decorative Background Elements */}
                    {/* <div className="absolute -top-12 -right-12 w-32 h-32 bg-tertiary/10 rounded-full blur-2xl"></div> */}
                    {/* <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div> */}

                    <div className="relative z-10 w-20 h-20 bg-gradient-to-tr from-tertiary to-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-tertiary/20 rotate-3 transition-transform hover:rotate-0 duration-300">
                      <QrCode className="w-10 h-10 text-white" />
                      <div className="absolute -top-2 -right-2 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-secondary"></span>
                      </div>
                    </div>

                    <h4 className="text-title-lg font-bold text-on-surface mb-2 tracking-tight">QRIS & E-Wallet</h4>
                    <p className="text-on-surface-variant text-body-md px-4 mb-8 leading-relaxed">
                      Powered by <span className="font-semibold text-tertiary">Midtrans</span>. Generate a secure QR code to accept payments via Gopay, ShopeePay, atau aplikasi QRIS lainnya.
                    </p>

                    <div className="relative z-10 w-full min-w-[280px] max-w-[320px] mx-auto bg-surface-container-lowest/80 backdrop-blur-md p-6 rounded-2xl border border-outline-variant/30 shadow-sm group hover:border-tertiary/50 transition-colors duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-label-md font-medium text-on-surface-variant flex items-center gap-1">
                          <Receipt className="w-4 h-4" />
                          Total Tagihan
                        </span>
                        <span className="text-[10px] font-bold px-2 py-1 bg-tertiary/10 text-tertiary rounded-full uppercase tracking-wider">Aman</span>
                      </div>
                      <p className="text-display-sm font-black text-on-surface tracking-tight flex items-baseline justify-center gap-1 group-hover:scale-105 transition-transform duration-300 origin-center">
                        {formatCurrency(expectedAmount)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-10 px-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-colors duration-500 animate-pulse"></div>
                <div className="relative w-28 h-28 bg-gradient-to-tr from-primary to-tertiary rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/30 rotate-3 transition-transform duration-500 hover:rotate-0 hover:scale-105">
                  <QrCode className="w-14 h-14 text-white" />
                  <div className="absolute -top-3 -right-3 flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-secondary border-2 border-surface"></span>
                  </div>
                </div>
              </div>

              <h3 className="text-display-sm font-black text-on-surface tracking-tight mb-3">Selesaikan Pembayaran</h3>
              <p className="text-body-lg text-on-surface-variant px-6 leading-relaxed mb-10">
                Halaman pembayaran aman dari Midtrans telah otomatis dibuka di tab baru. Silakan *scan* QRIS atau transfer melalui halaman tersebut.
              </p>

              <div className="flex flex-col gap-3 mx-auto">
                <button
                  onClick={handleSimulatePaymentSuccess}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-bold px-6 py-4 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
                >
                  <CheckCircle className="w-5 h-5" />
                  Saya Sudah Bayar
                </button>
                <button
                  onClick={handleSendWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold px-6 py-4 rounded-full shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/40 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Kirim via WhatsApp
                </button>
                <a
                  href={midtransUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full font-medium bg-tertiary text-on-tertiary shadow-lg shadow-tertiary/20 hover:shadow-tertiary/40 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Buka Link Pembayaran Lagi
                </a>
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full font-medium text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all duration-300"
                >
                  <div className="flex items-center justify-center">
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </div>
                  {isCopied ? "Tersalin!" : "Salin Link Pembayaran"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!midtransUrl && (
          <div className="px-4 md:px-6 py-4 border-t border-outline-variant/20 bg-surface-container flex justify-end">
            <button
              onClick={handleProcessPayment}
              disabled={!isValidCash || processFullPaymentMutation.isPending || processDPMutation.isPending || processSettleMutation.isPending}
              className="w-full md:w-auto justify-center px-4 md:px-8 py-2 md:py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {(processFullPaymentMutation.isPending || processDPMutation.isPending || processSettleMutation.isPending) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {paymentMethod === 'CASH' ? 'Proses Pembayaran & Cetak Struk' : 'Buat Link Pembayaran'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
