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
import { X, Loader2, WashingMachine, Scale, Shirt, Clock, ShoppingCart, Plus, Minus } from "lucide-react";

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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="bg-surface-container-low border border-outline-variant/30 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="px-4 md:px-6 py-4 border-b border-outline-variant/20 flex flex-wrap justify-between items-center bg-surface-container gap-2">
          <div>
            <h2 className="text-title-md md:text-title-lg font-display font-bold text-on-surface">Buat Pesanan Baru</h2>
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
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-container-lowest">

          {/* Step 1: Customer Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-title-md font-bold text-primary">Detail Pelanggan</h3>
                <button
                  onClick={() => setIsNewCustomerMode(!isNewCustomerMode)}
                  className="text-label-md font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  {isNewCustomerMode ? "Pilih Pelanggan Lama" : "+ Daftarkan Pelanggan Baru"}
                </button>
              </div>

              {!isNewCustomerMode ? (
                <div className="space-y-4">
                  <label className="text-label-md font-bold text-on-surface">Pilih Pelanggan</label>
                  <select
                    className="w-full p-3 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    value={selectedCustomer?.id || ""}
                    onChange={(e) => {
                      const c = customers?.find((c: Customer) => c.id === e.target.value);
                      setCustomer(c || null);
                    }}
                  >
                    <option value="">-- Pilih pelanggan --</option>
                    {customers?.map((c: Customer) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.whatsapp_no})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <form onSubmit={handleSubmitCustomerForm} className="space-y-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                  <div>
                    <label className="text-label-sm font-bold text-on-surface-variant mb-1 block">Nama Lengkap</label>
                    <input
                      type="text" required
                      value={customerForm.name}
                      onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                      className="w-full p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface"
                      placeholder="mis. Budi Santoso"
                    />
                  </div>
                  <div>
                    <label className="text-label-sm font-bold text-on-surface-variant mb-1 block">Nomor WhatsApp</label>
                    <input
                      type="text" required
                      value={customerForm.whatsapp_no}
                      onChange={e => setCustomerForm({ ...customerForm, whatsapp_no: e.target.value })}
                      className="w-full p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface"
                      placeholder="mis. 08123456789"
                    />
                  </div>
                  <div>
                    <label className="text-label-sm font-bold text-on-surface-variant mb-1 block">Alamat (Opsional)</label>
                    <textarea
                      value={customerForm.address}
                      onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })}
                      className="w-full p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface min-h-[80px]"
                      placeholder="Alamat pengiriman lengkap"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={createCustomerMutation.isPending}
                    className="px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-label-md hover:bg-primary/20 transition-colors w-full flex items-center justify-center gap-2"
                  >
                    {createCustomerMutation.isPending && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    Simpan Pelanggan Baru
                  </button>
                </form>
              )}

              {/* Preview Selected */}
              {(selectedCustomer || newCustomerData) && (
                <div className="mt-6 p-4 border-l-4 border-primary bg-primary-container/10 rounded-r-xl">
                  <h4 className="text-label-md font-bold text-on-surface-variant mb-2">Pelanggan Terpilih</h4>
                  <p className="text-body-lg font-bold text-on-surface">{selectedCustomer?.name || newCustomerData?.name}</p>
                  <p className="text-body-md text-on-surface-variant">{selectedCustomer?.whatsapp_no || newCustomerData?.whatsapp_no}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Service Selection */}
          {step === 2 && (
            <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[500px] animate-in slide-in-from-right-4 fade-in duration-300">
              
              {/* Left Column: Services Catalog */}
              <div className="w-full xl:w-[55%] flex flex-col bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-outline-variant/10 bg-surface-container/30">
                  <h3 className="text-title-lg font-bold text-on-surface flex items-center gap-2">
                    <WashingMachine className="w-6 h-6 text-primary" />
                    Pilih Layanan
                  </h3>
                  <p className="text-body-sm text-on-surface-variant mt-1">Pilih satu atau lebih layanan untuk pelanggan.</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-container-lowest/50">
                  {services?.map((s: Service) => {
                    const isSelected = items.some(i => i.service.id === s.id);
                    return (
                      <div 
                        key={s.id} 
                        onClick={() => !isSelected && addItem(s)} 
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center group relative overflow-hidden ${
                          isSelected 
                            ? 'border-primary/40 bg-primary/5 cursor-default' 
                            : 'border-outline-variant/20 bg-surface-container-lowest hover:border-primary/50 hover:shadow-md'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-primary"></div>
                        )}
                        
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-primary/20 text-primary' : 'bg-surface-container-high text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary'}`}>
                            {s.category.toLowerCase().includes('kilo') ? <Scale className="w-6 h-6" /> : <Shirt className="w-6 h-6" />}
                          </div>
                          <div>
                            <p className={`font-bold transition-colors ${isSelected ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`}>
                              {s.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-surface-container-high rounded text-on-surface-variant">{s.category}</span>
                              <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {s.estimation_hours} jam
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-title-md text-on-surface">{formatCurrency(s.price)}</p>
                          <p className="text-label-sm text-on-surface-variant font-medium">/ {s.unit}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Order Cart */}
              <div className="w-full xl:w-[45%] flex flex-col bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden relative">
                <div className="p-5 border-b border-outline-variant/10 bg-primary/5">
                  <h3 className="text-title-lg font-bold text-primary flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6" />
                    Keranjang Pesanan
                  </h3>
                  <p className="text-body-sm text-primary/70 mt-1">{items.length} layanan terpilih</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-6 opacity-60">
                      <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-4">
                        <ShoppingCart className="w-10 h-10 text-on-surface-variant" />
                      </div>
                      <p className="font-bold text-on-surface-variant text-label-lg mb-1">Keranjang Kosong</p>
                      <p className="text-body-sm text-on-surface-variant">Pilih layanan di sebelah kiri untuk menambahkannya ke keranjang pesanan.</p>
                    </div>
                  ) : (
                    items.map(item => (
                      <div key={item.service.id} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-3 relative group">
                        
                        {/* Header Item */}
                        <div className="flex justify-between items-start">
                          <div className="pr-8">
                            <p className="font-bold text-on-surface text-label-lg leading-tight">{item.service.name}</p>
                            <p className="text-label-sm text-primary font-medium mt-0.5">{formatCurrency(item.service.price)} / {item.service.unit}</p>
                          </div>
                          <button onClick={() => removeItem(item.service.id)} className="absolute right-3 top-3 p-1.5 text-on-surface-variant hover:bg-error/10 hover:text-error rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Input Kuantitas & Subtotal */}
                        <div className="flex items-center justify-between mt-1 bg-surface-container/40 p-3 rounded-lg border border-outline-variant/20">
                          
                          {/* Input Area */}
                          <div>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant mb-1.5">Input Kuantitas</p>
                            <div className="flex items-center gap-2">
                              <div className="relative group/input">
                                <input 
                                  type="number" 
                                  min="0.1" 
                                  step={item.service.category.toLowerCase().includes('kilo') ? "0.1" : "1"}
                                  value={item.qty === 0 ? '' : item.qty} 
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '') {
                                      updateItemQty(item.service.id, 0);
                                    } else {
                                      updateItemQty(item.service.id, parseFloat(val));
                                    }
                                  }}
                                  className="w-28 bg-surface-container-lowest border border-outline-variant/40 rounded-lg py-2 pl-3 pr-10 text-on-surface text-title-md font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all group-hover/input:border-primary/50"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-label-md font-bold pointer-events-none">
                                  {item.service.unit}
                                </span>
                              </div>
                              
                              {/* Quick Add/Sub Buttons */}
                              <div className="flex flex-col gap-1">
                                <button onClick={() => updateItemQty(item.service.id, Number((item.qty + 1).toFixed(2)))} className="bg-surface-container hover:bg-primary/10 hover:text-primary text-on-surface-variant rounded h-5 w-7 flex items-center justify-center transition-colors">
                                  <Plus className="w-3 h-3" />
                                </button>
                                <button onClick={() => updateItemQty(item.service.id, Math.max(0.1, Number((item.qty - 1).toFixed(2))))} className="bg-surface-container hover:bg-error/10 hover:text-error text-on-surface-variant rounded h-5 w-7 flex items-center justify-center transition-colors">
                                  <Minus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Subtotal */}
                          <div className="text-right">
                            <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant mb-1">Subtotal</p>
                            <p className="font-black text-title-md text-on-surface">{formatCurrency(item.service.price * (item.qty || 0))}</p>
                          </div>

                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Summary Footer */}
                {items.length > 0 && (
                  <div className="p-5 bg-surface-container-low border-t border-outline-variant/20 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)] z-10">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-label-md font-bold text-on-surface-variant">Estimasi Subtotal</p>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">Belum termasuk pajak/diskon</p>
                      </div>
                      <span className="font-display text-[24px] font-black text-primary tracking-tight">{formatCurrency(baseSubtotal)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Financial Adjustments */}
          {step === 3 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <h3 className="text-title-md font-bold text-primary mb-2">Penyesuaian Biaya</h3>

              <div className="space-y-4">
                {/* Discount */}
                <div>
                  <label className="text-label-md font-bold text-on-surface block mb-1">Terapkan Diskon</label>
                  <select
                    className="w-full p-3 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    value={selectedDiscount?.id || ""}
                    onChange={(e) => {
                      const d = discounts?.find((x: Discount) => x.id === e.target.value);
                      setDiscount(d || null);
                    }}
                  >
                    <option value="">-- Tanpa Diskon --</option>
                    {discounts?.filter((d: Discount) => d.is_active).map((d: Discount) => (
                      <option key={d.id} value={d.id}>{d.promo_name} (-{d.discount_type === 'percentage' ? d.value + '%' : formatCurrency(d.value)})</option>
                    ))}
                  </select>
                </div>

                {/* Tax */}
                <div>
                  <label className="text-label-md font-bold text-on-surface block mb-1">Terapkan Pajak</label>
                  <select
                    className="w-full p-3 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    value={selectedTax?.id || ""}
                    onChange={(e) => {
                      const t = taxes?.find((x: Tax) => x.id === e.target.value);
                      setTax(t || null);
                    }}
                  >
                    <option value="">-- Tanpa Pajak --</option>
                    {taxes?.filter((t: Tax) => t.is_active).map((t: Tax) => (
                      <option key={t.id} value={t.id}>{t.tax_name} ({t.rate_percentage}%)</option>
                    ))}
                  </select>
                </div>

                {/* Fee */}
                <div>
                  <label className="text-label-md font-bold text-on-surface block mb-1">Terapkan Biaya Layanan</label>
                  <select
                    className="w-full p-3 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    value={selectedFee?.id || ""}
                    onChange={(e) => {
                      const f = fees?.find((x: Fee) => x.id === e.target.value);
                      setFee(f || null);
                    }}
                  >
                    <option value="">-- Tanpa Biaya --</option>
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
                    <span>Diskon</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Pajak</span>
                    <span>+{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                {feeAmount > 0 && (
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Biaya Layanan</span>
                    <span>+{formatCurrency(feeAmount)}</span>
                  </div>
                )}
                <div className="border-t border-outline-variant/30 pt-2 mt-2 flex justify-between items-center text-title-lg font-bold text-primary">
                  <span>Total Keseluruhan</span>
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
              Kembali
            </button>
          ) : <div />}

          {step < 3 && (
            <button
              onClick={nextStep}
              disabled={(step === 1 && !canProceedToStep2) || (step === 2 && !canProceedToStep3)}
              className="px-6 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Lanjut
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleCreateOrder}
              disabled={createOrderMutation.isPending}
              className="px-6 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {createOrderMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Buat Pesanan
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
