"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Bell, CreditCard, Banknote, TrendingUp, CheckCircle2, Shirt, Plus } from 'lucide-react';
import { useOrderStore } from '@/store/use-order-store';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const { setIsOpen } = useOrderStore();
  const { data: stats, isLoading } = useDashboardStats();
  const [chartView, setChartView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const currentChartData = chartView === 'daily' 
    ? (stats?.chartData?.daily || [])
    : chartView === 'weekly'
      ? (stats?.chartData?.weekly || [])
      : (stats?.chartData?.monthly || []);

  const maxChartValue = currentChartData.length > 0
    ? Math.max(...currentChartData.map(d => d.value), 1) // At least 1 to avoid division by zero
    : 1;

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
              <span className={`px-2 py-1 rounded text-[10px] font-bold ${stats?.revenue.percentage && stats.revenue.percentage >= 0 ? 'text-primary bg-primary-container/20' : 'text-error bg-error-container/20'}`}>
                {isLoading ? "..." : `${stats?.revenue.percentage && stats.revenue.percentage > 0 ? '+' : ''}${stats?.revenue.percentage?.toFixed(1) || 0}%`}
              </span>
            </div>
            <div className="mt-4">
              <h2 className="font-display text-headline-lg text-primary">{isLoading ? "..." : formatCurrency(stats?.revenue.current || 0)}</h2>
              <p className="text-on-surface-variant text-[12px] mt-1 italic">30 hari terakhir</p>
            </div>
          </div>
          {/* Total Orders */}
          <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant/15 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-label-md">Total Pesanan</span>
              <span className={`px-2 py-1 rounded text-[10px] font-bold ${stats?.orders.percentage && stats.orders.percentage >= 0 ? 'text-primary bg-primary-container/20' : 'text-error bg-error-container/20'}`}>
                {isLoading ? "..." : `${stats?.orders.percentage && stats.orders.percentage > 0 ? '+' : ''}${stats?.orders.percentage?.toFixed(1) || 0}%`}
              </span>
            </div>
            <div className="mt-3">
              <h2 className="font-display text-headline-lg text-primary leading-none">{isLoading ? "..." : (stats?.orders.current || 0)}</h2>
              <div className="flex items-center gap-4 mt-3">
                <div>
                  <span className="text-on-surface-variant text-[10px] block uppercase tracking-wider">Proses</span>
                  <span className="text-primary font-bold text-label-md">{isLoading ? "-" : (stats?.orders.processing || 0)}</span>
                </div>
                <div className="w-px h-6 bg-outline-variant/30"></div>
                <div>
                  <span className="text-on-surface-variant text-[10px] block uppercase tracking-wider">Menunggu</span>
                  <span className="text-primary font-bold text-label-md">{isLoading ? "-" : (stats?.orders.waiting || 0)}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Total Customers */}
          <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant/15 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-label-md">Total Pelanggan</span>
              <span className={`px-2 py-1 rounded text-[10px] font-bold ${stats?.customers?.newThisMonth && stats.customers.newThisMonth > 0 ? 'text-primary bg-primary-container/20' : 'text-on-surface-variant bg-surface-variant/50'}`}>
                {isLoading ? "..." : `+${stats?.customers?.newThisMonth || 0} baru`}
              </span>
            </div>
            <div className="mt-4">
              <h2 className="font-display text-headline-lg text-primary">{isLoading ? "..." : (stats?.customers?.total || 0)}</h2>
              <p className="text-on-surface-variant text-[12px] mt-1 italic">
                {isLoading ? "..." : `${stats?.customers?.percentage && stats.customers.percentage > 0 ? '+' : ''}${stats?.customers?.percentage?.toFixed(1) || 0}% dibanding bulan lalu`}
              </p>
            </div>
          </div>
          {/* DP Only */}
          <div className="bg-surface-container-low p-md rounded-lg border border-outline-variant/15 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-label-md">Sisa Pelunasan DP</span>
              <span className="text-error bg-error-container/20 px-2 py-1 rounded text-[10px] font-bold">Tagihan</span>
            </div>
            <div className="mt-4">
              <h2 className="font-display text-headline-lg text-error">{isLoading ? "..." : formatCurrency(stats?.unpaidAmount || 0)}</h2>
              <p className="text-on-surface-variant text-[12px] mt-1 italic">Hanya pesanan berstatus DP</p>
            </div>
          </div>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter h-full">
          {/* Revenue Over Time Graph (Bento-style 2/3 width) */}
          <div className="lg:col-span-2 bg-surface-container-low rounded-lg border border-outline-variant/15 p-md flex flex-col min-h-[450px] shadow-sm hover:shadow transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-4">
              <div>
                <h3 className="font-display text-headline-sm text-primary">Performa Penjualan</h3>
                <p className="text-on-surface-variant text-body-md mt-1">
                  Pantau tren pendapatan Anda secara {chartView === 'daily' ? 'harian' : chartView === 'weekly' ? 'mingguan' : 'bulanan'}
                </p>
              </div>
              <div className="flex bg-surface-variant/30 p-1 rounded-xl w-fit border border-outline-variant/10">
                <button
                  onClick={() => setChartView('daily')}
                  className={`text-label-md px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 ${chartView === 'daily' ? 'bg-primary text-on-primary shadow-md transform scale-105' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  Harian
                </button>
                <button
                  onClick={() => setChartView('weekly')}
                  className={`text-label-md px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 ${chartView === 'weekly' ? 'bg-primary text-on-primary shadow-md transform scale-105' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  Mingguan
                </button>
                <button
                  onClick={() => setChartView('monthly')}
                  className={`text-label-md px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 ${chartView === 'monthly' ? 'bg-primary text-on-primary shadow-md transform scale-105' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  Bulanan
                </button>
              </div>
            </div>

            {/* Beautiful CSS Bar Chart */}
            <div className="flex-grow relative mt-2 flex items-end justify-between gap-1 sm:gap-4 pt-12">
              {/* Background horizontal lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
                {[5, 4, 3, 2, 1, 0].map((step) => (
                  <div key={step} className="flex items-center w-full">
                    <span className="text-[10px] text-on-surface-variant/60 w-16 hidden sm:block">
                      {formatCurrency((maxChartValue / 5) * step).replace('Rp', '').trim().split(',')[0]}
                    </span>
                    <div className="flex-grow border-t border-outline-variant/20 border-dashed h-0"></div>
                  </div>
                ))}
              </div>

              {/* Bars */}
              {currentChartData.map((data, idx) => {
                const heightPercentage = Math.max((data.value / maxChartValue) * 100, 2); // At least 2% height so it's visible
                return (
                  <div key={idx} className="relative flex flex-col items-center flex-grow group h-full justify-end z-10 pb-8">
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-primary-container text-on-primary-container text-[11px] font-bold px-3 py-2 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-20 flex flex-col items-center">
                      <span>{formatCurrency(data.value)}</span>
                      <span className="text-[9px] font-normal opacity-80 mt-0.5">{data.label}</span>
                    </div>

                    {/* Bar Container */}
                    <div className="w-full max-w-[40px] bg-secondary-container/50 rounded-t-lg relative overflow-hidden group-hover:bg-secondary-container transition-colors duration-300 cursor-pointer h-full flex items-end">
                      {/* Animated Fill */}
                      <div
                        className="w-full bg-primary rounded-t-lg transition-all duration-1000 ease-out group-hover:bg-primary/90 relative"
                        style={{ height: `${heightPercentage}%` }}
                      >
                        {/* Value inside bar if it's tall enough */}
                        {heightPercentage > 15 && data.value > 0 && (
                          <span className="absolute top-2 w-full text-center text-[9px] font-bold text-on-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -rotate-90 origin-center translate-y-4">
                            {(data.value / 1000).toFixed(0)}k
                          </span>
                        )}
                      </div>
                    </div>

                    {/* X-Axis Label */}
                    <span className="absolute bottom-0 text-[10px] sm:text-[11px] text-on-surface-variant mt-3 font-medium group-hover:text-primary transition-colors text-center w-full overflow-hidden text-ellipsis whitespace-nowrap">
                      {data.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Breakdown (Bento-style 1/3 width) */}
          <div className="bg-surface-container-low rounded-lg border border-outline-variant/15 p-md flex flex-col justify-between">
            <div>
              <h3 className="font-headline-md text-primary">Metode Pembayaran</h3>
              <p className="text-on-surface-variant text-label-sm">Distribusi tipe transaksi (30 hari terakhir)</p>
            </div>
            <div className="space-y-xl my-md">
              {/* Digital Payments */}
              <div className="space-y-xs">
                <div className="flex justify-between text-body-md">
                  <span className="font-medium text-primary flex items-center gap-2">
                    <CreditCard className="w-[18px] h-[18px]" />
                    Non-Tunai (QRIS/Transfer)
                  </span>
                  <span className="text-on-surface-variant">{isLoading ? "..." : `${stats?.paymentDistribution?.nonTunai.percentage.toFixed(0)}%`}</span>
                </div>
                <div className="h-4 w-full bg-secondary-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000 ease-out"
                    style={{ width: `${stats?.paymentDistribution?.nonTunai.percentage || 0}%` }}
                  ></div>
                </div>
                <p className="text-on-surface-variant text-[12px]">{isLoading ? "..." : `${formatCurrency(stats?.paymentDistribution?.nonTunai.amount || 0)} via gateway/transfer`}</p>
              </div>
              {/* Cash Payments */}
              <div className="space-y-xs">
                <div className="flex justify-between text-body-md">
                  <span className="font-medium text-primary flex items-center gap-2">
                    <Banknote className="w-[18px] h-[18px]" />
                    Tunai
                  </span>
                  <span className="text-on-surface-variant">{isLoading ? "..." : `${stats?.paymentDistribution?.tunai.percentage.toFixed(0)}%`}</span>
                </div>
                <div className="h-4 w-full bg-secondary-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000 ease-out"
                    style={{ width: `${stats?.paymentDistribution?.tunai.percentage || 0}%` }}
                  ></div>
                </div>
                <p className="text-on-surface-variant text-[12px]">{isLoading ? "..." : `${formatCurrency(stats?.paymentDistribution?.tunai.amount || 0)} pembayaran uang tunai`}</p>
              </div>
            </div>
            <div className="p-4 bg-surface-variant/40 rounded-lg border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-label-sm font-bold text-primary">Insight Pembayaran</p>
                  <p className="text-[12px] text-on-surface-variant">
                    {isLoading ? "Memuat insight..." : `Penggunaan Non-Tunai ${stats?.paymentDistribution?.qrisGrowth && stats.paymentDistribution.qrisGrowth >= 0 ? 'meningkat' : 'menurun'} ${Math.abs(stats?.paymentDistribution?.qrisGrowth || 0).toFixed(1)}% sejak bulan lalu.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

