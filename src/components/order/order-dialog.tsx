"use client";

import { useState } from "react";
import { useOrderStore } from "@/store/use-order-store";
import { useCustomers } from "@/hooks/useCustomer";
import { useServices } from "@/hooks/useService";
import { useDiscounts } from "@/hooks/useDiscount";
import { useTaxes } from "@/hooks/useTax";
import { useFees } from "@/hooks/useFee";
import { useAuthStore } from "@/store/useAuthStore";
import { useCreateOrderTransaction } from "@/hooks/use-orders";
import { formatCurrency, formatWhatsAppNumber } from "@/lib/utils";
import { Customer } from "@/types/customer";
import { Service } from "@/types/service";
import { Discount } from "@/types/discount";
import { Tax } from "@/types/tax";
import { Fee } from "@/types/fee";

export function OrderDialog() {
  const {
    isOpen, setIsOpen,
    step, nextStep, prevStep, setStep,
    selectedCustomer, setCustomer,
    newCustomerData, setNewCustomerData,
    items, addItem, removeItem, updateItemQty,
    selectedDiscount, setDiscount,
    selectedTax, setTax,
    selectedFee, setFee,
    paymentMethod, setPaymentMethod,
    amountPaid, setAmountPaid,
    midtransUrl, setMidtransUrl,
    resetOrder
  } = useOrderStore();

  const { data: customers } = useCustomers();
  const { data: services } = useServices();
  const { data: discounts } = useDiscounts();
  const { data: taxes } = useTaxes();
  const { data: fees } = useFees();
  const user = useAuthStore((state) => state.user);
  
  const createOrderMutation = useCreateOrderTransaction();

  const [isNewCustomerMode, setIsNewCustomerMode] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: "", whatsapp_no: "", address: "" });

  const handleClose = () => {
    setIsOpen(false);
    resetOrder();
    setIsNewCustomerMode(false);
    setCustomerForm({ name: "", whatsapp_no: "", address: "" });
  };

  if (!isOpen) return null;

  // Computed Values
  const baseSubtotal = items.reduce((acc, item) => acc + (item.service.price * item.qty), 0);
  
  let discountAmount = 0;
  if (selectedDiscount) {
    if (selectedDiscount.discount_type === 'percentage') {
      discountAmount = (baseSubtotal * selectedDiscount.value) / 100;
      if (selectedDiscount.max_discount_amount && discountAmount > selectedDiscount.max_discount_amount) {
        discountAmount = selectedDiscount.max_discount_amount;
      }
    } else {
      discountAmount = selectedDiscount.value;
    }
  }

  const subtotalAfterDiscount = Math.max(0, baseSubtotal - discountAmount);

  let taxAmount = 0;
  if (selectedTax) {
    taxAmount = (subtotalAfterDiscount * selectedTax.rate_percentage) / 100;
  }

  let feeAmount = 0;
  if (selectedFee) {
    if (selectedFee.fee_type === 'percentage') {
      feeAmount = (subtotalAfterDiscount * selectedFee.value) / 100;
    } else {
      feeAmount = selectedFee.value;
    }
  }

  const totalAmount = subtotalAfterDiscount + taxAmount + feeAmount;

  // Validation
  const canProceedToStep2 = selectedCustomer !== null || (newCustomerData !== null && newCustomerData.name && newCustomerData.whatsapp_no);
  const canProceedToStep3 = items.length > 0;

  const handleSubmitCustomerForm = (e: React.FormEvent) => {
    e.preventDefault();
    setNewCustomerData({
      ...customerForm,
      whatsapp_no: formatWhatsAppNumber(customerForm.whatsapp_no)
    });
    setCustomer(null);
  };

  const handleCreateOrder = async () => {
    try {
      if (!user?.id) {
        throw new Error("Staff identity not found. Please log in again.");
      }

      await createOrderMutation.mutateAsync({
        user_id: user.id,
        customer_id: selectedCustomer?.id || null,
        new_customer: newCustomerData || undefined,
        items,
        financials: {
          discount_id: selectedDiscount?.id,
          tax_id: selectedTax?.id,
          fee_id: selectedFee?.id,
          discount_amount: discountAmount,
          tax_amount: taxAmount,
          service_fee_amount: feeAmount
        },
        payment: {
          method: paymentMethod,
          amount_paid: paymentMethod === 'CASH' ? amountPaid : totalAmount
        }
      });
      
      if (paymentMethod === 'NON_CASH') {
        // Show mock midtrans URL
        setMidtransUrl(`https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-${Date.now()}`);
      } else {
        handleClose();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulatePaymentSuccess = () => {
    handleClose(); // Close on success simulation
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container">
          <div>
            <h2 className="text-title-lg font-display font-bold text-on-surface">Create New Order</h2>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className="flex items-center gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-label-sm font-bold ${step === s ? 'bg-primary text-on-primary' : step > s ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'}`}>
                    {s}
                  </div>
                  {s < 4 && <div className={`w-8 h-1 rounded-full ${step > s ? 'bg-primary-container' : 'bg-surface-variant'}`} />}
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-surface-container-highest text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined" data-icon="close">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-container-lowest">
          
          {/* Step 1: Customer Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-title-md font-bold text-primary">Customer Details</h3>
                <button 
                  onClick={() => setIsNewCustomerMode(!isNewCustomerMode)}
                  className="text-label-md font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  {isNewCustomerMode ? "Select Existing Customer" : "+ Register New Customer"}
                </button>
              </div>

              {!isNewCustomerMode ? (
                <div className="space-y-4">
                  <label className="text-label-md font-bold text-on-surface">Select Customer</label>
                  <select 
                    className="w-full p-3 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    value={selectedCustomer?.id || ""}
                    onChange={(e) => {
                      const c = customers?.find((c: Customer) => c.id === e.target.value);
                      setCustomer(c || null);
                    }}
                  >
                    <option value="">-- Choose a customer --</option>
                    {customers?.map((c: Customer) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.whatsapp_no})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <form onSubmit={handleSubmitCustomerForm} className="space-y-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                  <div>
                    <label className="text-label-sm font-bold text-on-surface-variant mb-1 block">Full Name</label>
                    <input 
                      type="text" required
                      value={customerForm.name}
                      onChange={e => setCustomerForm({...customerForm, name: e.target.value})}
                      className="w-full p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-label-sm font-bold text-on-surface-variant mb-1 block">WhatsApp Number</label>
                    <input 
                      type="text" required
                      value={customerForm.whatsapp_no}
                      onChange={e => setCustomerForm({...customerForm, whatsapp_no: e.target.value})}
                      className="w-full p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface"
                      placeholder="e.g. 08123456789"
                    />
                  </div>
                  <div>
                    <label className="text-label-sm font-bold text-on-surface-variant mb-1 block">Address (Optional)</label>
                    <textarea 
                      value={customerForm.address}
                      onChange={e => setCustomerForm({...customerForm, address: e.target.value})}
                      className="w-full p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface min-h-[80px]"
                      placeholder="Full delivery address"
                    />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-label-md hover:bg-primary/20 transition-colors w-full">
                    Save New Customer
                  </button>
                </form>
              )}

              {/* Preview Selected */}
              {(selectedCustomer || newCustomerData) && (
                <div className="mt-6 p-4 border-l-4 border-primary bg-primary-container/10 rounded-r-xl">
                  <h4 className="text-label-md font-bold text-on-surface-variant mb-2">Selected Customer</h4>
                  <p className="text-body-lg font-bold text-on-surface">{selectedCustomer?.name || newCustomerData?.name}</p>
                  <p className="text-body-md text-on-surface-variant">{selectedCustomer?.whatsapp_no || newCustomerData?.whatsapp_no}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Service Selection */}
          {step === 2 && (
            <div className="flex gap-6 h-full min-h-[400px]">
              <div className="w-1/2 flex flex-col">
                <h3 className="text-title-md font-bold text-primary mb-4">Select Services</h3>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                  {services?.map((s: Service) => (
                    <div key={s.id} onClick={() => addItem(s)} className="p-3 bg-surface-container rounded-xl border border-outline-variant/20 hover:border-primary/50 cursor-pointer flex justify-between items-center transition-all group">
                      <div>
                        <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{s.name}</p>
                        <p className="text-label-sm text-on-surface-variant">{s.category} • {s.estimation_hours}h</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-on-surface">{formatCurrency(s.price)}</p>
                        <p className="text-label-sm text-on-surface-variant">per {s.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-1/2 flex flex-col bg-surface-container-low rounded-xl p-4 border border-outline-variant/20">
                <h3 className="text-title-md font-bold text-on-surface mb-4">Order Items</h3>
                <div className="flex-1 overflow-y-auto space-y-3">
                  {items.length === 0 ? (
                    <p className="text-on-surface-variant text-center mt-10">No items selected yet.</p>
                  ) : (
                    items.map(item => (
                      <div key={item.service.id} className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/30 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-on-surface">{item.service.name}</p>
                          <p className="text-label-sm text-on-surface-variant">{formatCurrency(item.service.price * item.qty)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-surface-container rounded-lg border border-outline-variant/30">
                            <button onClick={() => updateItemQty(item.service.id, Math.max(1, item.qty - 1))} className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]" data-icon="remove">remove</span></button>
                            <span className="w-8 text-center font-bold text-on-surface">{item.qty}</span>
                            <button onClick={() => updateItemQty(item.service.id, item.qty + 1)} className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]" data-icon="add">add</span></button>
                          </div>
                          <button onClick={() => removeItem(item.service.id)} className="p-1 text-error hover:bg-error/10 rounded-full transition-colors">
                            <span className="material-symbols-outlined text-[18px]" data-icon="delete">delete</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="pt-4 mt-4 border-t border-outline-variant/20 flex justify-between items-center">
                  <span className="font-bold text-on-surface-variant">Subtotal</span>
                  <span className="font-title-lg font-bold text-primary">{formatCurrency(baseSubtotal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Financial Adjustments */}
          {step === 3 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <h3 className="text-title-md font-bold text-primary mb-2">Financial Adjustments</h3>
              
              <div className="space-y-4">
                {/* Discount */}
                <div>
                  <label className="text-label-md font-bold text-on-surface block mb-1">Apply Discount</label>
                  <select 
                    className="w-full p-3 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    value={selectedDiscount?.id || ""}
                    onChange={(e) => {
                      const d = discounts?.find((x: Discount) => x.id === e.target.value);
                      setDiscount(d || null);
                    }}
                  >
                    <option value="">-- No Discount --</option>
                    {discounts?.filter((d: Discount) => d.is_active).map((d: Discount) => (
                      <option key={d.id} value={d.id}>{d.promo_name} (-{d.discount_type === 'percentage' ? d.value + '%' : formatCurrency(d.value)})</option>
                    ))}
                  </select>
                </div>

                {/* Tax */}
                <div>
                  <label className="text-label-md font-bold text-on-surface block mb-1">Apply Tax</label>
                  <select 
                    className="w-full p-3 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    value={selectedTax?.id || ""}
                    onChange={(e) => {
                      const t = taxes?.find((x: Tax) => x.id === e.target.value);
                      setTax(t || null);
                    }}
                  >
                    <option value="">-- No Tax --</option>
                    {taxes?.filter((t: Tax) => t.is_active).map((t: Tax) => (
                      <option key={t.id} value={t.id}>{t.tax_name} ({t.rate_percentage}%)</option>
                    ))}
                  </select>
                </div>

                {/* Fee */}
                <div>
                  <label className="text-label-md font-bold text-on-surface block mb-1">Apply Service Fee</label>
                  <select 
                    className="w-full p-3 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    value={selectedFee?.id || ""}
                    onChange={(e) => {
                      const f = fees?.find((x: Fee) => x.id === e.target.value);
                      setFee(f || null);
                    }}
                  >
                    <option value="">-- No Fee --</option>
                    {fees?.filter((f: Fee) => f.is_active).map((f: Fee) => (
                      <option key={f.id} value={f.id}>{f.fee_name} (+{f.fee_type === 'percentage' ? f.value + '%' : formatCurrency(f.value)})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Real-time Calculation Summary */}
              <div className="bg-surface-container-highest p-5 rounded-xl border border-outline-variant/20 mt-8 space-y-2">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span>{formatCurrency(baseSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-error font-bold">
                    <span>Discount</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Tax</span>
                    <span>+{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                {feeAmount > 0 && (
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Service Fee</span>
                    <span>+{formatCurrency(feeAmount)}</span>
                  </div>
                )}
                <div className="border-t border-outline-variant/30 pt-2 mt-2 flex justify-between items-center text-title-lg font-bold text-primary">
                  <span>Total Amount</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Payment Logic */}
          {step === 4 && !midtransUrl && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
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
                  onClick={() => setPaymentMethod('NON_CASH')}
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-all duration-200 ${paymentMethod === 'NON_CASH' ? 'border-primary bg-primary/5 text-primary shadow-sm scale-[1.02]' : 'border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low hover:border-outline-variant/50'}`}
                >
                  <div className={`p-4 rounded-full transition-colors ${paymentMethod === 'NON_CASH' ? 'bg-primary/10' : 'bg-surface-container-high'}`}>
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
                        <span className="text-title-lg font-bold text-primary">{formatCurrency(totalAmount)}</span>
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
                      <span className={`text-title-md font-bold ${amountPaid >= totalAmount ? 'text-secondary' : 'text-error'}`}>
                        {formatCurrency(Math.max(0, amountPaid - totalAmount))}
                      </span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'NON_CASH' && (
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
                      <p className="text-headline-sm font-bold text-tertiary">{formatCurrency(totalAmount)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dummy Midtrans Payment Screen */}
          {step === 4 && midtransUrl && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-6">
              <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center border-4 border-outline-variant/20 mb-2">
                <span className="material-symbols-outlined text-[48px] text-primary" data-icon="qr_code_2">qr_code_2</span>
              </div>
              <div>
                <h3 className="text-headline-sm font-bold text-on-surface">Payment Link Generated</h3>
                <p className="text-body-md text-on-surface-variant max-w-md mx-auto mt-2">
                  A dummy Midtrans Snap token and URL has been created. In a real environment, the customer would scan the QR code or visit this link.
                </p>
              </div>
              <div className="bg-surface-container p-3 rounded-lg border border-outline-variant/30 text-sm font-mono text-on-surface w-full max-w-md overflow-hidden text-ellipsis whitespace-nowrap">
                {midtransUrl}
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
          <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container flex justify-between items-center">
            {step > 1 ? (
              <button onClick={prevStep} className="px-6 py-2 rounded-lg font-label-md border border-outline-variant/30 text-on-surface hover:bg-surface-container-high transition-colors">
                Back
              </button>
            ) : <div />}
            
            {step < 4 ? (
              <button 
                onClick={nextStep} 
                disabled={(step === 1 && !canProceedToStep2) || (step === 2 && !canProceedToStep3)}
                className="px-6 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            ) : (
              <button 
                onClick={handleCreateOrder}
                disabled={paymentMethod === 'CASH' && amountPaid < totalAmount}
                className="px-8 py-2 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {createOrderMutation.isPending ? (
                  <span className="material-symbols-outlined animate-spin text-sm" data-icon="progress_activity">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-sm" data-icon="task_alt">task_alt</span>
                )}
                {paymentMethod === 'CASH' ? 'Process Order & Print Receipt' : 'Generate Payment Link'}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
