"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Package, Clock, CheckCircle2, AlertCircle, Receipt, Loader2, ArrowLeft, WashingMachine, Shirt, Sparkles, MapPin } from "lucide-react";
import Link from "next/link";
import { getOrderByInvoice } from "@/service/orders";
import { formatCurrency, formatDateTime, translateLaundryStatus, translatePaymentStatus, cn } from "@/lib/utils";
import { LaundryStatus, PaymentStatus } from "@/types/enums";

export default function TrackPage() {
  const [invoiceInput, setInvoiceInput] = useState("");
  const [searchInvoice, setSearchInvoice] = useState("");

  const { data: order, isLoading, isError, error } = useQuery({
    queryKey: ["track-order", searchInvoice],
    queryFn: () => getOrderByInvoice(searchInvoice),
    enabled: !!searchInvoice,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (invoiceInput.trim()) {
      setSearchInvoice(invoiceInput.trim());
    }
  };

  const getStatusIndex = (status: LaundryStatus) => {
    switch (status) {
      case LaundryStatus.WAITING_PAYMENT: return 0;
      case LaundryStatus.PROCESS: return 1;
      case LaundryStatus.WAITING_FOR_PICKUP: return 2;
      case LaundryStatus.COMPLETED: return 3;
      default: return 0;
    }
  };

  const currentStep = order ? getStatusIndex(order.laundry_status) : 0;

  const timelineSteps = [
    { title: "Menunggu Pembayaran", icon: Receipt, desc: "Selesaikan pembayaran" },
    { title: "Sedang Diproses", icon: WashingMachine, desc: "Pakaian dicuci & disetrika" },
    { title: "Siap Diambil", icon: Sparkles, desc: "Selesai & menunggu pickup" },
    { title: "Selesai", icon: CheckCircle2, desc: "Pesanan telah diambil" },
  ];

  return (
    <div className="min-h-screen bg-surface font-sans">
      {/* Hero Section with Search */}
      <div className="relative bg-gradient-to-b from-primary/10 to-surface pt-16 pb-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center border-b border-outline-variant/10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-secondary/10 rounded-full blur-3xl opacity-50"></div>
        </div>
        
        <div className="w-full relative z-10 flex flex-col items-center">
          <Link href="/" className="inline-flex items-center px-4 py-2 bg-surface/50 backdrop-blur-md rounded-full text-primary hover:bg-primary hover:text-on-primary mb-8 transition-all duration-300 shadow-sm border border-outline-variant/20 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Kembali ke Beranda</span>
          </Link>
          
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-extrabold text-on-surface tracking-tight text-center leading-tight sm:leading-tight lg:leading-tight">
            Lacak Pesanan <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Laundry Anda</span>
          </h1>
          <p className="mt-4 text-body-lg sm:text-title-md text-on-surface-variant text-center w-full sm:w-10/12 md:w-3/4 lg:w-1/2 leading-relaxed">
            Masukkan nomor faktur pesanan Anda untuk memantau status cucian dan pembayaran secara real-time.
          </p>

          <form onSubmit={handleSearch} className="mt-8 sm:mt-10 w-full sm:w-10/12 md:w-8/12 lg:w-7/12 relative z-20">
            <div className="relative w-full group">
              {/* Focus Glow Background */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[2rem] sm:rounded-full blur-md opacity-0 group-focus-within:opacity-40 transition-opacity duration-500"></div>
              
              <div className="relative flex items-center w-full">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
                  <Search className="h-6 w-6 text-on-surface-variant group-focus-within:text-primary transition-colors duration-300" />
                </div>
                <input
                  type="text"
                  value={invoiceInput}
                  onChange={(e) => setInvoiceInput(e.target.value)}
                  className="block w-full pl-16 pr-6 sm:pr-48 py-4 sm:py-5 border-2 border-outline-variant/40 rounded-2xl sm:rounded-full bg-surface/90 backdrop-blur-xl text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/80 shadow-lg hover:shadow-xl transition-all text-body-lg sm:text-lg font-semibold"
                  placeholder="Contoh: INV-20231012-1234"
                  required
                />
                
                {/* Desktop Button - Hidden on mobile, absolute inside input */}
                <div className="hidden sm:flex absolute inset-y-2 right-2 items-center">
                  <button
                    type="submit"
                    disabled={isLoading || !invoiceInput.trim()}
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-label-lg font-bold rounded-full shadow-md text-on-primary bg-primary hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Mencari
                      </>
                    ) : (
                      "Lacak Sekarang"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Button - Visible only on mobile, stacked below input */}
            <div className="sm:hidden w-full mt-4">
              <button
                type="submit"
                disabled={isLoading || !invoiceInput.trim()}
                className="w-full inline-flex items-center justify-center px-8 py-4 border border-transparent text-label-lg font-bold rounded-2xl shadow-lg text-on-primary bg-primary hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Mencari
                  </>
                ) : (
                  "Lacak Sekarang"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Area */}
      <div className="px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center min-h-[400px]">
        <div className="w-full xl:w-10/12 transition-all duration-700 ease-out-expo">
          
          {isError && (
            <div className="bg-error-container/20 border-2 border-error-container p-8 rounded-[2rem] flex flex-col items-center text-center w-full md:w-8/12 mx-auto animate-in zoom-in-95 duration-500 shadow-sm">
              <div className="p-4 bg-error-container rounded-full mb-4">
                <AlertCircle className="w-12 h-12 text-error" />
              </div>
              <h3 className="text-headline-sm font-extrabold text-error">Gagal Mengambil Data</h3>
              <p className="text-on-surface-variant mt-2 text-lg">{(error as Error).message || "Silakan coba beberapa saat lagi."}</p>
            </div>
          )}

          {searchInvoice && !isLoading && !isError && !order && (
            <div className="bg-surface border border-outline-variant/20 p-12 rounded-[2rem] flex flex-col items-center text-center w-full md:w-8/12 mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 shadow-xl">
              <div className="relative">
                <div className="absolute -inset-4 bg-secondary-container rounded-full blur-xl opacity-50"></div>
                <Package className="w-24 h-24 text-secondary relative z-10 mb-6" />
              </div>
              <h3 className="text-headline-sm font-extrabold text-on-surface">Pesanan Tidak Ditemukan</h3>
              <p className="text-on-surface-variant mt-4 text-lg">
                Maaf, kami tidak dapat menemukan pesanan dengan nomor faktur
              </p>
              <div className="mt-4 font-mono font-bold text-xl text-primary bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20">
                {searchInvoice}
              </div>
              <p className="text-on-surface-variant/70 mt-6">
                Pastikan nomor yang Anda masukkan sudah benar dan coba lagi.
              </p>
            </div>
          )}

          {order && (
            <div className="bg-surface rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl border border-outline-variant/10 animate-in fade-in slide-in-from-bottom-12 duration-700">
              
              {/* Receipt Header Style */}
              <div className="bg-surface p-6 sm:p-10 border-b-2 border-dashed border-outline-variant/30 relative">
                {/* Decorative cutouts for receipt effect */}
                <div className="absolute -left-4 bottom-[-16px] w-8 h-8 bg-surface-container rounded-full hidden sm:block shadow-inner"></div>
                <div className="absolute -right-4 bottom-[-16px] w-8 h-8 bg-surface-container rounded-full hidden sm:block shadow-inner"></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                      <Receipt className="w-8 h-8 text-on-primary" />
                    </div>
                    <div>
                      <p className="text-label-md text-on-surface-variant uppercase tracking-[0.2em] mb-1 font-bold">Faktur Pesanan</p>
                      <h2 className="text-headline-sm sm:text-headline-md font-black text-on-surface font-mono tracking-tight">
                        {order.invoice_no}
                      </h2>
                    </div>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <div className="bg-surface-variant/30 px-5 py-4 rounded-2xl border border-outline-variant/20 flex-1 md:flex-none">
                      <p className="text-label-sm text-on-surface-variant mb-1 font-medium">Tanggal Masuk</p>
                      <p className="text-body-lg font-bold text-on-surface flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        {formatDateTime(order.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Left Column: Progress & Status (7 spans) */}
                <div className="lg:col-span-7 p-6 sm:p-10 bg-surface-container-lowest border-r border-outline-variant/10">
                  <div className="mb-10">
                    <h3 className="text-title-lg font-extrabold text-on-surface mb-8 flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-primary" />
                      Status Perjalanan Pakaian Anda
                    </h3>
                    
                    {/* Modern Timeline */}
                    <div className="relative pl-6 space-y-8 sm:space-y-12">
                      {/* Vertical connecting line */}
                      <div className="absolute left-[1.875rem] top-8 bottom-8 w-1 bg-outline-variant/20 rounded-full"></div>
                      
                      {/* Active progress line */}
                      <div 
                        className="absolute left-[1.875rem] top-8 w-1 bg-primary rounded-full transition-all duration-1000 ease-out"
                        style={{ height: currentStep === 0 ? '0%' : currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%' }}
                      ></div>

                      {timelineSteps.map((step, index) => {
                        const isCompleted = index < currentStep;
                        const isCurrent = index === currentStep;
                        const StepIcon = step.icon;

                        return (
                          <div key={index} className="relative flex items-start gap-6 group">
                            {/* Node icon */}
                            <div className={cn(
                              "w-12 h-12 rounded-full flex items-center justify-center shrink-0 relative z-10 transition-all duration-300 shadow-sm",
                              isCompleted ? "bg-primary text-on-primary ring-4 ring-primary/20" :
                              isCurrent ? "bg-surface border-2 border-primary text-primary ring-4 ring-primary/10 shadow-lg scale-110" :
                              "bg-surface border-2 border-outline-variant/30 text-outline"
                            )}>
                              <StepIcon className={cn("w-5 h-5", isCurrent && "animate-pulse")} />
                            </div>
                            
                            {/* Text content */}
                            <div className={cn(
                              "pt-1.5 transition-all duration-300",
                              !isCompleted && !isCurrent && "opacity-50"
                            )}>
                              <h4 className={cn(
                                "text-title-md font-bold mb-1",
                                isCurrent ? "text-primary" : "text-on-surface"
                              )}>{step.title}</h4>
                              <p className="text-body-md text-on-surface-variant">{step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Status Card */}
                  <div className="mt-8 bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 shadow-inner">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={cn(
                        "p-3 rounded-xl shadow-sm",
                        order.payment_status === PaymentStatus.PAID ? "bg-primary-container text-primary" :
                        order.payment_status === PaymentStatus.DP ? "bg-tertiary-container text-tertiary" :
                        "bg-error-container text-error"
                      )}>
                        {order.payment_status === PaymentStatus.PAID ? <CheckCircle2 className="w-6 h-6" /> :
                         order.payment_status === PaymentStatus.DP ? <Clock className="w-6 h-6" /> :
                         <AlertCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="text-label-md text-on-surface-variant font-medium uppercase tracking-widest mb-1">Status Pembayaran</p>
                        <h4 className="text-title-lg font-extrabold text-on-surface">
                          {translatePaymentStatus(order.payment_status)}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Customer & Payment Details (5 spans) */}
                <div className="lg:col-span-5 bg-surface p-6 sm:p-10 flex flex-col justify-between">
                  <div>
                    {/* Customer Info Card */}
                    <div className="bg-primary/5 rounded-3xl p-6 mb-8 border border-primary/10 hover:border-primary/30 transition-colors duration-300 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-primary font-bold text-title-lg">
                            {order.customers?.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="text-label-sm text-on-surface-variant font-bold uppercase tracking-wider mb-1">Pelanggan</p>
                          <p className="text-title-md font-bold text-on-surface">{order.customers?.name}</p>
                        </div>
                      </div>
                      {order.estimated_finish && (
                        <div className="mt-6 flex items-center gap-3 bg-surface p-3 rounded-2xl border border-outline-variant/10 shadow-sm">
                          <div className="bg-secondary-container p-2 rounded-xl text-on-secondary-container">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-label-sm text-on-surface-variant font-medium">Estimasi Selesai</p>
                            <p className="font-bold text-on-surface text-body-lg">
                              {formatDateTime(order.estimated_finish)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Items */}
                    <div className="mb-8">
                      <h4 className="text-title-md font-extrabold text-on-surface mb-4 flex items-center gap-2">
                        <Shirt className="w-5 h-5 text-on-surface-variant" />
                        Rincian Cucian
                      </h4>
                      <div className="space-y-3">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 group p-3 hover:bg-surface-variant/30 rounded-2xl transition-colors">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                              <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                                <Package className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-body-md text-on-surface leading-tight sm:leading-normal">{item.services?.name}</p>
                                <p className="text-body-sm text-on-surface-variant">{item.qty} x {formatCurrency(item.price_per_unit)}</p>
                              </div>
                            </div>
                            <div className="w-full sm:w-auto flex justify-end pl-14 sm:pl-0">
                              <span className="font-bold text-body-md text-on-surface">
                                {formatCurrency(item.qty * item.price_per_unit)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 shadow-sm space-y-4">
                    <div className="flex justify-between items-center text-on-surface-variant">
                      <span className="font-medium text-body-lg">Total Tagihan</span>
                      <span className="font-bold text-title-md text-on-surface">{formatCurrency(order.total_amount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-on-surface-variant">
                      <span className="font-medium text-body-lg">Telah Dibayar</span>
                      <span className="font-bold text-title-md text-primary">{formatCurrency(order.paid_amount)}</span>
                    </div>
                    {order.remaining_amount > 0 && (
                      <div className="pt-4 border-t border-dashed border-outline-variant/30 flex justify-between items-center text-error">
                        <span className="font-bold text-body-lg uppercase tracking-wider">Sisa Bayar</span>
                        <span className="font-black text-title-lg">{formatCurrency(order.remaining_amount)}</span>
                      </div>
                    )}
                  </div>
                  
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
