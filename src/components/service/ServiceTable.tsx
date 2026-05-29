"use client";

import { useState } from "react";
import { Service } from "@/types/service";
import { Loader2, Edit, Trash2, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useServiceStore } from "@/store/useServiceStore";

interface ServiceTableProps {
  services: Service[];
  isLoading: boolean;
}

export function ServiceTable({ services, isLoading }: ServiceTableProps) {
  const { openModal, openDeleteAlert } = useServiceStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil((services?.length || 0) / itemsPerPage);
  const paginatedData = services?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="w-full text-center py-8 text-on-surface-variant font-body-md border border-outline-variant/15 rounded-lg border-dashed">
        Tidak ada layanan ditemukan. Klik "Tambah Layanan" untuk membuat baru.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col gap-4 mb-4">
        {paginatedData.map((service) => (
          <div key={service.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden flex flex-col hover:border-primary/20 transition-all">
            <div className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="font-bold text-primary text-body-lg">{service.name}</h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 bg-secondary-container/30 text-on-secondary-container text-[11px] font-bold rounded uppercase tracking-wider">
                      {service.category}
                    </span>
                    {service.is_active ? (
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
                  <span className="font-bold text-on-surface text-title-sm">{formatCurrency(service.price)}</span>
                  <span className="text-[12px] font-medium text-on-surface-variant px-2 py-0.5 bg-surface-container-highest rounded-md">{service.unit}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10 mt-1">
                <span className="text-body-sm font-medium text-on-surface-variant flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary/70" />
                  {service.estimation_hours} jam est.
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(service)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-label-sm font-bold hover:bg-primary/20 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteAlert(service)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-error/10 text-error rounded-lg text-label-sm font-bold hover:bg-error/20 transition-colors"
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
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Nama</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Kategori</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Harga</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Est. Waktu</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Satuan</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Status</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {paginatedData.map((service) => (
            <tr key={service.id} className="hover:bg-surface-container-highest/20 transition-colors">
              <td className="px-4 py-3 font-body-md text-on-surface">
                <span className="font-medium text-primary">{service.name}</span>
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface-variant">
                <span className="px-2 py-1 bg-secondary-container/30 text-on-secondary-container text-[11px] font-medium rounded uppercase tracking-wider">
                  {service.category}
                </span>
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface">
                {formatCurrency(service.price)}
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface">
                {service.estimation_hours} jam
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface">
                {service.unit}
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface">
                {service.is_active ? (
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
                    onClick={() => openModal(service)}
                    className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/20 rounded transition-colors"
                    title="Edit Service"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteAlert(service)}
                    className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded transition-colors"
                    title="Delete Service"
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
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} sampai {Math.min(currentPage * itemsPerPage, services?.length || 0)} dari {services?.length || 0} data
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
