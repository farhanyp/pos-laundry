"use client";

import { useState } from "react";
import { useOrderStore } from "@/store/use-order-store";
import { useCustomers, useCreateCustomer } from "@/hooks/useCustomer";
import { useServices } from "@/hooks/useService";
import { useDiscounts } from "@/hooks/useDiscount";
import { useTaxes } from "@/hooks/useTax";
import { useFees } from "@/hooks/useFee";
import { useAuthStore } from "@/store/useAuthStore";
import { useCreateOrderTransaction } from "@/hooks/useOrders";
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
    resetOrder
  } = useOrderStore();

  const { data: customers } = useCustomers();
  const createCustomerMutation = useCreateCustomer();
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

  const handleSubmitCustomerForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCustomer = await createCustomerMutation.mutateAsync({
        name: customerForm.name,
        whatsapp_no: formatWhatsAppNumber(customerForm.whatsapp_no),
        address: customerForm.address
      });
      setCustomer(newCustomer);
      setIsNewCustomerMode(false);
      setCustomerForm({ name: "", whatsapp_no: "", address: "" });
    } catch (e) {
      console.error("Failed to create customer", e);
    }
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
        }
      });

      handleClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">

        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container">
          <div>
            <h2 className="text-title-lg font-display font-bold text-on-surface">Create New Order</h2>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-label-sm font-bold ${step === s ? 'bg-primary text-on-primary' : step > s ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'}`}>
                    {s}
                  </div>
                  {s < 3 && <div className={`w-8 h-1 rounded-full ${step > s ? 'bg-primary-container' : 'bg-surface-variant'}`} />}
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
                      onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                      className="w-full p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-label-sm font-bold text-on-surface-variant mb-1 block">WhatsApp Number</label>
                    <input
                      type="text" required
                      value={customerForm.whatsapp_no}
                      onChange={e => setCustomerForm({ ...customerForm, whatsapp_no: e.target.value })}
                      className="w-full p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface"
                      placeholder="e.g. 08123456789"
                    />
                  </div>
                  <div>
                    <label className="text-label-sm font-bold text-on-surface-variant mb-1 block">Address (Optional)</label>
                    <textarea
                      value={customerForm.address}
                      onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })}
                      className="w-full p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface min-h-[80px]"
                      placeholder="Full delivery address"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={createCustomerMutation.isPending}
                    className="px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-label-md hover:bg-primary/20 transition-colors w-full flex items-center justify-center gap-2"
                  >
                    {createCustomerMutation.isPending && (
                      <span className="material-symbols-outlined animate-spin text-sm" data-icon="progress_activity">progress_activity</span>
                    )}
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

          {/* Dialog Footer handled separately */}

        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container flex justify-between items-center">
          {step > 1 ? (
            <button onClick={prevStep} className="px-6 py-2 rounded-lg font-label-md border border-outline-variant/30 text-on-surface hover:bg-surface-container-high transition-colors">
              Back
            </button>
          ) : <div />}

          {step < 3 && (
            <button
              onClick={nextStep}
              disabled={(step === 1 && !canProceedToStep2) || (step === 2 && !canProceedToStep3)}
              className="px-6 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Step
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleCreateOrder}
              disabled={createOrderMutation.isPending}
              className="px-6 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {createOrderMutation.isPending && (
                <span className="material-symbols-outlined animate-spin text-sm" data-icon="progress_activity">progress_activity</span>
              )}
              Create Order
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
