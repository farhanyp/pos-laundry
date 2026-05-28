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
    midtransUrl, setMidtransUrl
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
                  <div className="bg-tertiary-container/10 border-2 border-tertiary/20 p-8 rounded-2xl text-center shadow-sm animate-in slide-in-from-bottom-4 fade-in flex flex-col items-center">
                    <div className="w-16 h-16 bg-tertiary/10 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-[32px] text-tertiary" data-icon="account_balance">account_balance</span>
                    </div>
                    <h4 className="text-title-md font-bold text-on-surface mb-2">Midtrans Payment Gateway</h4>
                    <p className="text-on-surface-variant text-body-md max-w-sm mx-auto mb-6">
                      A secure payment link and QRIS code will be generated upon confirmation.
                    </p>

                    <div className="w-full max-w-xs mx-auto bg-surface-container-lowest p-4 rounded-xl border border-tertiary/10">
                      <span className="text-label-sm font-bold text-on-surface-variant block mb-1">Total Bill to Pay</span>
                      <p className="text-headline-sm font-bold text-tertiary">{formatCurrency(paymentTotalAmount)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center border-4 border-outline-variant/20 mb-2">
                <span className="material-symbols-outlined text-[48px] text-primary" data-icon="qr_code_2">qr_code_2</span>
              </div>
              <div>
                <h3 className="text-headline-sm font-bold text-on-surface">Payment Link Generated</h3>
                <p className="text-body-md text-on-surface-variant max-w-md mx-auto mt-2">
                  A Midtrans payment link has been created. The customer can scan the QR code or visit this link to complete the payment.
                </p>
              </div>
              <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/30 text-sm font-mono text-on-surface w-full max-w-md overflow-hidden text-ellipsis whitespace-nowrap">
                <a href={midtransUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">{midtransUrl}</a>
              </div>
              <button
                onClick={handleSimulatePaymentSuccess}
                className="mt-4 flex items-center gap-2 bg-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-md"
              >
                <span className="material-symbols-outlined" data-icon="check_circle">check_circle</span>
                Simulate Successful Payment
              </button>
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
