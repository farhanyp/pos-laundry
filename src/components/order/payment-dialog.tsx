"use client";

import { useOrderStore } from "@/store/use-order-store";
import { useProcessOrderPayment } from "@/hooks/use-orders";
import { formatCurrency } from "@/lib/utils";

export function PaymentDialog() {
  const {
    isPaymentOpen, closePaymentDialog,
    paymentOrderId, paymentTotalAmount,
    paymentMethod, setPaymentMethod,
    amountPaid, setAmountPaid,
    midtransUrl, setMidtransUrl,
    setMidtransToken
  } = useOrderStore();

  const processPaymentMutation = useProcessOrderPayment();

  if (!isPaymentOpen) return null;

  const handleProcessPayment = async () => {
    if (!paymentOrderId) return;
    try {
      const result = await processPaymentMutation.mutateAsync({
        orderId: paymentOrderId,
        paymentMethod,
        amountPaid: paymentMethod === 'CASH' ? amountPaid : paymentTotalAmount,
        totalAmount: paymentTotalAmount
      });

      if (paymentMethod === 'NON_TUNAI') {
        setMidtransUrl(result?.redirectUrl || '');
        if (result?.redirectUrl) {
          window.open(result.redirectUrl, '_blank');
        }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl w-full max-w-2xl flex flex-col shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">

        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container">
          <h2 className="text-title-lg font-display font-bold text-on-surface">Process Payment</h2>
          <button onClick={closePaymentDialog} className="p-2 rounded-full hover:bg-surface-container-highest text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined" data-icon="close">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {!midtransUrl ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="text-center">
                <h3 className="text-title-lg font-bold text-primary mb-2">Payment Configuration</h3>
                <p className="text-body-md text-on-surface-variant">Select a payment method to complete the transaction</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-all duration-200 ${paymentMethod === 'CASH' ? 'border-primary bg-primary/5 text-primary shadow-sm scale-[1.02]' : 'border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low hover:border-outline-variant/50'}`}
                >
                  <div className={`p-4 rounded-full transition-colors ${paymentMethod === 'CASH' ? 'bg-primary/10' : 'bg-surface-container-high'}`}>
                    <span className="material-symbols-outlined text-4xl" data-icon="payments">payments</span>
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-title-md block mb-1">CASH</span>
                    <span className="text-label-sm opacity-80 font-normal">Bayar Tunai</span>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('NON_TUNAI')}
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-all duration-200 ${paymentMethod === 'NON_TUNAI' ? 'border-primary bg-primary/5 text-primary shadow-sm scale-[1.02]' : 'border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low hover:border-outline-variant/50'}`}
                >
                  <div className={`p-4 rounded-full transition-colors ${paymentMethod === 'NON_TUNAI' ? 'bg-primary/10' : 'bg-surface-container-high'}`}>
                    <span className="material-symbols-outlined text-4xl" data-icon="qr_code_scanner">qr_code_scanner</span>
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-title-md block mb-1">NON-CASH</span>
                    <span className="text-label-sm opacity-80 font-normal">QRIS / Transfer</span>
                  </div>
                </button>
              </div>

              {/* Dynamic Payment Details Section */}
              <div className="mt-8 transition-all duration-300">
                {paymentMethod === 'CASH' && (
                  <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 space-y-6 shadow-sm animate-in slide-in-from-bottom-4 fade-in">
                    <div className="flex justify-between items-end border-b border-outline-variant/20 pb-4">
                      <div>
                        <span className="text-on-surface-variant text-label-md block mb-1">Total Bill</span>
                        <span className="text-title-lg font-bold text-primary">{formatCurrency(paymentTotalAmount)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-label-md font-bold text-on-surface mb-2 block">Cash Received</label>
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
                      <span className="text-on-surface-variant font-bold text-label-md">Change Return:</span>
                      <span className={`text-title-md font-bold ${amountPaid >= paymentTotalAmount ? 'text-secondary' : 'text-error'}`}>
                        {formatCurrency(Math.max(0, amountPaid - paymentTotalAmount))}
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
                      <span className="material-symbols-outlined text-[40px] text-white" data-icon="qr_code_scanner">qr_code_scanner</span>
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
                          <span className="material-symbols-outlined text-sm" data-icon="receipt_long">receipt_long</span>
                          Total Tagihan
                        </span>
                        <span className="text-[10px] font-bold px-2 py-1 bg-tertiary/10 text-tertiary rounded-full uppercase tracking-wider">Aman</span>
                      </div>
                      <p className="text-display-sm font-black text-on-surface tracking-tight flex items-baseline justify-center gap-1 group-hover:scale-105 transition-transform duration-300 origin-center">
                        {formatCurrency(paymentTotalAmount)}
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
                  <span className="material-symbols-outlined text-[56px] text-white" data-icon="qr_code_scanner">qr_code_scanner</span>
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
                  <span className="material-symbols-outlined" data-icon="check_circle">check_circle</span>
                  Saya Sudah Bayar
                </button>
                <a
                  href={midtransUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full font-medium text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all duration-300 group"
                >
                  <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform" data-icon="open_in_new">open_in_new</span>
                  Buka Link Pembayaran Lagi
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!midtransUrl && (
          <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container flex justify-end">
            <button
              onClick={handleProcessPayment}
              disabled={paymentMethod === 'CASH' && amountPaid < paymentTotalAmount}
              className="px-8 py-2 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {processPaymentMutation.isPending ? (
                <span className="material-symbols-outlined animate-spin text-sm" data-icon="progress_activity">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-sm" data-icon="task_alt">task_alt</span>
              )}
              {paymentMethod === 'CASH' ? 'Process Payment & Print Receipt' : 'Generate Payment Link'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
