"use client";

import Link from 'next/link';
import { Bell, CreditCard, Banknote, TrendingUp, CheckCircle2, Shirt, Plus } from 'lucide-react';
import { useOrderStore } from '@/store/use-order-store';

export default function DashboardPage() {
  const { setIsOpen } = useOrderStore();

  return (
    <>
      <div className="p-margin-desktop pt-16 md:pt-margin-desktop max-w-[1600px] mx-auto space-y-md">
        {/* Page Title & Actions */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-display text-title-lg md:text-headline-md font-bold text-primary">Rangkuman Penjualan</h1>
          <button 
            onClick={() => setIsOpen(true)}
            className="bg-primary text-on-primary font-label-md p-2 md:px-4 md:py-2 rounded-lg hover:bg-primary-container transition-colors active:scale-95 duration-150 flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5 md:hidden" />
            <span className="hidden md:inline">Pesanan Baru</span>
          </button>
        </div>
        {/* Metric Snapshot Cards (Elevated Row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {/* Gross Revenue */}
          <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant/15 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-label-md">Total Pendapatan</span>
              <span className="text-primary bg-primary-container/20 px-2 py-1 rounded text-[10px] font-bold">+12.4%</span>
            </div>
            <div className="mt-4">
              <h2 className="font-display text-headline-lg text-primary">Rp 4.289.000</h2>
              <p className="text-on-surface-variant text-[12px] mt-1 italic">30 hari terakhir</p>
            </div>
          </div>
          {/* Total Orders */}
          <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant/15 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-label-md">Total Pesanan</span>
              <span className="text-primary bg-primary-container/20 px-2 py-1 rounded text-[10px] font-bold">+8.1%</span>
            </div>
            <div className="mt-4">
              <h2 className="font-display text-headline-lg text-primary">124</h2>
              <p className="text-on-surface-variant text-[12px] mt-1 italic">30 hari terakhir</p>
            </div>
          </div>
          {/* Laundry in Process */}
          <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant/15 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-label-md">Cucian Diproses</span>
              <span className="text-primary bg-primary-container/20 px-2 py-1 rounded text-[10px] font-bold">Aktif</span>
            </div>
            <div className="mt-4">
              <h2 className="font-display text-headline-lg text-primary">18</h2>
              <p className="text-on-surface-variant text-[12px] mt-1 italic">Menunggu & Proses</p>
            </div>
          </div>
          {/* Unpaid / DP */}
          <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant/15 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-label-md">Pembayaran Tertunda</span>
              <span className="text-error bg-error-container/20 px-2 py-1 rounded text-[10px] font-bold">Tagihan</span>
            </div>
            <div className="mt-4">
              <h2 className="font-display text-headline-lg text-error">Rp 340.000</h2>
              <p className="text-on-surface-variant text-[12px] mt-1 italic">Belum Lunas & DP</p>
            </div>
          </div>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter h-full">
          {/* Revenue Over Time Line Graph (Bento-style 2/3 width) */}
          <div className="lg:col-span-2 bg-surface-container-low rounded-lg border border-outline-variant/15 p-md flex flex-col min-h-[450px]">
            <div className="flex justify-between items-center mb-md">
              <div>
                <h3 className="font-headline-md text-primary">Performa Penjualan</h3>
                <p className="text-on-surface-variant text-label-sm">Grafik pendapatan harian</p>
              </div>
              <div className="flex gap-2">
                <button className="text-label-sm px-3 py-1 bg-surface-container-highest rounded-full text-on-surface-variant">Mingguan</button>
                <button className="text-label-sm px-3 py-1 bg-primary text-on-primary rounded-full">Bulanan</button>
              </div>
            </div>
            {/* Chart Simulation Area */}
            <div className="flex-grow relative mt-4 border-l border-b border-outline-variant/30 ml-12 mb-8">
              {/* Y-Axis Labels */}
              <div className="absolute -left-12 top-0 h-full flex flex-col justify-between text-[10px] text-on-surface-variant py-2">
                <span>500k</span>
                <span>400k</span>
                <span>300k</span>
                <span>200k</span>
                <span>100k</span>
                <span>0</span>
              </div>
              {/* X-Axis Labels */}
              <div className="absolute -bottom-8 left-0 w-full flex justify-between text-[10px] text-on-surface-variant px-2">
                <span>01 Mei</span>
                <span>07 Mei</span>
                <span>14 Mei</span>
                <span>21 Mei</span>
                <span>28 Mei</span>
              </div>
              {/* Simplified SVG Line Graph */}
              <svg className="absolute inset-0 w-full h-full preserve-3d" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="grad" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'rgba(72, 84, 34, 0.2)', stopOpacity: 1 }}></stop>
                    <stop offset="100%" style={{ stopColor: 'rgba(72, 84, 34, 0)', stopOpacity: 1 }}></stop>
                  </linearGradient>
                </defs>
                {/* Baseline Projection */}
                <path d="M0,80 L20,75 L40,78 L60,65 L80,68 L100,55" fill="none" stroke="#c7c8b9" strokeDasharray="2,2" strokeWidth="0.5"></path>
                {/* Actual Revenue Area */}
                <path d="M0,100 L0,90 L10,85 L25,70 L40,82 L55,50 L70,55 L85,30 L100,20 L100,100 Z" fill="url(#grad)"></path>
                {/* Actual Revenue Line */}
                <path d="M0,90 L10,85 L25,70 L40,82 L55,50 L70,55 L85,30 L100,20" fill="none" stroke="#485422" strokeWidth="2"></path>
                {/* Interactive Points */}
                <circle cx="55" cy="50" fill="#485422" r="1.5"></circle>
                <circle cx="85" cy="30" fill="#485422" r="1.5"></circle>
              </svg>
              {/* Tooltip Overlay (Mockup) */}
              <div className="absolute top-[35%] left-[55%] bg-primary-container text-on-primary-container px-3 py-2 rounded shadow-lg text-[11px] transform -translate-x-1/2 -translate-y-full">
                <span className="block font-bold">18 Mei</span>
                <span className="block">Rp 284.000</span>
              </div>
            </div>
          </div>

          {/* Payment Breakdown (Bento-style 1/3 width) */}
          <div className="bg-surface-container-low rounded-lg border border-outline-variant/15 p-md flex flex-col justify-between">
            <div>
              <h3 className="font-headline-md text-primary">Metode Pembayaran</h3>
              <p className="text-on-surface-variant text-label-sm">Distribusi tipe transaksi (Bulan Ini)</p>
            </div>
            <div className="space-y-xl my-md">
              {/* Digital Payments */}
              <div className="space-y-xs">
                <div className="flex justify-between text-body-md">
                  <span className="font-medium text-primary flex items-center gap-2">
                    <CreditCard className="w-[18px] h-[18px]" />
                    Non-Tunai (QRIS/Transfer)
                  </span>
                  <span className="text-on-surface-variant">65%</span>
                </div>
                <div className="h-4 w-full bg-secondary-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[65%] transition-all duration-1000 ease-out"></div>
                </div>
                <p className="text-on-surface-variant text-[12px]">Rp 2.787.850 via gateway/transfer</p>
              </div>
              {/* Cash Payments */}
              <div className="space-y-xs">
                <div className="flex justify-between text-body-md">
                  <span className="font-medium text-primary flex items-center gap-2">
                    <Banknote className="w-[18px] h-[18px]" />
                    Tunai
                  </span>
                  <span className="text-on-surface-variant">35%</span>
                </div>
                <div className="h-4 w-full bg-secondary-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[35%] transition-all duration-1000 ease-out"></div>
                </div>
                <p className="text-on-surface-variant text-[12px]">Rp 1.501.150 pembayaran uang tunai</p>
              </div>
            </div>
            <div className="p-4 bg-surface-variant/40 rounded-lg border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-label-sm font-bold text-primary">Insight Pembayaran</p>
                  <p className="text-[12px] text-on-surface-variant">Penggunaan QRIS meningkat 12% sejak bulan lalu.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer-style Recent Transaction Peek */}
        <div className="bg-surface-container-low rounded-lg border border-outline-variant/15 p-md overflow-hidden">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-label-md text-primary">Aktivitas Terkini</h3>
            <button className="text-label-sm text-primary hover:underline">Lihat Semua Riwayat</button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-outline-variant/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-primary-container/10 flex items-center justify-center text-primary">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-body-md font-medium">Pesanan #INV-001 Selesai</p>
                  <p className="text-[12px] text-on-surface-variant">Cuci Setrika Reguler • 5 KG</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-body-md font-bold text-primary">Rp 45.000</p>
                <p className="text-[10px] text-on-surface-variant">2 menit yang lalu</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-outline-variant/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-primary-container/10 flex items-center justify-center text-primary">
                  <Shirt className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-body-md font-medium">Pesanan Baru: Andi</p>
                  <p className="text-[12px] text-on-surface-variant">Cuci Sepatu • Express (Belum Lunas)</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-body-md font-bold text-error">Rp 60.000</p>
                <p className="text-[10px] text-on-surface-variant">14 menit yang lalu</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-outline-variant/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-primary-container/10 flex items-center justify-center text-primary">
                  <Banknote className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-body-md font-medium">Pembayaran DP Diterima</p>
                  <p className="text-[12px] text-on-surface-variant">Budi • #INV-003</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-body-md font-bold text-primary">Rp 20.000</p>
                <p className="text-[10px] text-on-surface-variant">1 jam yang lalu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

