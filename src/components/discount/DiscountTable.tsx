"use client";

import { useState } from "react";
import { Discount } from "@/types/discount";
import { Loader2, Edit, Trash2, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useDiscountStore } from "@/store/useDiscountStore";

interface DiscountTableProps {
  discounts: Discount[];
  isLoading: boolean;
}

export function DiscountTable({ discounts, isLoading }: DiscountTableProps) {
  const { openModal, openDeleteAlert } = useDiscountStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil((discounts?.length || 0) / itemsPerPage);
  const paginatedData = discounts?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!discounts || discounts.length === 0) {
    return (
      <div className="w-full text-center py-8 text-on-surface-variant font-body-md border border-outline-variant/15 rounded-lg border-dashed">
        Tidak ada diskon ditemukan. Klik "Tambah Diskon" untuk membuat baru.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col gap-4 mb-4">
        {paginatedData.map((discount) => (
          <div key={discount.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden flex flex-col hover:border-primary/20 transition-all">
            <div className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="font-bold text-primary text-body-lg">{discount.promo_name}</h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 bg-secondary-container/30 text-on-secondary-container text-[11px] font-bold rounded uppercase tracking-wider">
                      {discount.discount_type === 'percentage' || discount.discount_type === 'Percentage' ? 'Persentase' : 'Tetap'}
                    </span>
                    {discount.is_active ? (
                      <span className="flex items-center gap-1 text-[12px] text-primary font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                        Aktif
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[12px] text-error font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-error inline-block"></span>
                        Tidak Aktif
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-on-surface text-title-sm">
                    {discount.discount_type === 'percentage' || discount.discount_type === 'Percentage' ? `${discount.value}%` : formatCurrency(discount.value)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-label-sm text-on-surface-variant bg-surface-container-highest/30 p-2 rounded-lg mt-1">
                <div>
                  <span className="block text-[10px] uppercase font-bold tracking-wider opacity-70">Min Order</span>
                  <span className="font-medium text-on-surface">{formatCurrency(discount.min_order_amount)}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold tracking-wider opacity-70">Maks Diskon</span>
                  <span className="font-medium text-on-surface">{discount.max_discount_amount ? formatCurrency(discount.max_discount_amount) : '-'}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-outline-variant/10 mt-1 gap-3">
                <span className="text-body-sm font-medium text-on-surface-variant flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary/70" />
                  {new Date(discount.start_date).toLocaleDateString()} - {new Date(discount.end_date).toLocaleDateString()}
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(discount)}
                    className="flex-1 flex justify-center items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-label-sm font-bold hover:bg-primary/20 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteAlert(discount)}
                    className="flex-1 flex justify-center items-center gap-1.5 px-3 py-1.5 bg-error/10 text-error rounded-lg text-label-sm font-bold hover:bg-error/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto w-full rounded-lg border border-outline-variant/15 bg-surface-container-low shadow-sm">
        <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-highest/30 border-b border-outline-variant/15">
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Nama Promo</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Tipe</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Nilai</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Min Order</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Maks Diskon</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Periode</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Status</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {paginatedData.map((discount) => (
            <tr key={discount.id} className="hover:bg-surface-container-highest/20 transition-colors">
              <td className="px-4 py-3 font-body-md text-on-surface">
                <span className="font-medium text-primary">{discount.promo_name}</span>
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface-variant">
                <span className="px-2 py-1 bg-secondary-container/30 text-on-secondary-container text-[11px] font-medium rounded uppercase tracking-wider">
                  {discount.discount_type === 'percentage' || discount.discount_type === 'Percentage' ? 'Persentase' : 'Tetap'}
                </span>
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface">
                {discount.discount_type === 'percentage' || discount.discount_type === 'Percentage' ? `${discount.value}%` : formatCurrency(discount.value)}
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface">
                {formatCurrency(discount.min_order_amount)}
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface">
                {discount.max_discount_amount ? formatCurrency(discount.max_discount_amount) : '-'}
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface text-[13px]">
                <div>{new Date(discount.start_date).toLocaleDateString()} - </div>
                <div>{new Date(discount.end_date).toLocaleDateString()}</div>
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface">
                {discount.is_active ? (
                  <span className="flex items-center gap-1 text-[12px] text-primary">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                    Aktif
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[12px] text-error">
                    <span className="w-2 h-2 rounded-full bg-error inline-block"></span>
                    Tidak Aktif
                  </span>
                )}
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => openModal(discount)}
                    className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/20 rounded transition-colors"
                    title="Edit Discount"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteAlert(discount)}
                    className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded transition-colors"
                    title="Delete Discount"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/15 bg-surface-container-low">
          <div className="text-label-sm text-on-surface-variant">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} sampai {Math.min(currentPage * itemsPerPage, discounts?.length || 0)} dari {discounts?.length || 0} data
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
    </div>
  );
}
