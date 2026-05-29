"use client";

import { useState } from "react";
import { Customer } from "@/types/customer";
import { Loader2, Edit, Trash2, ChevronLeft, ChevronRight, Phone, MapPin } from "lucide-react";
import { formatWhatsAppNumber, canManageData } from "@/lib/utils";
import { useCustomerStore } from "@/store/useCustomerStore";
import { useAuthStore } from "@/store/useAuthStore";

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
}

export function CustomerTable({ customers, isLoading }: CustomerTableProps) {
  const { openModal, openDeleteAlert } = useCustomerStore();
  const currentUser = useAuthStore(state => state.user);
  const canManage = canManageData(currentUser?.roles);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil((customers?.length || 0) / itemsPerPage);
  const paginatedData = customers?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="w-full text-center py-8 text-on-surface-variant font-body-md border border-outline-variant/15 rounded-lg border-dashed">
        Tidak ada pelanggan ditemukan. Klik "Tambah Pelanggan" untuk membuat yang baru.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col gap-4 mb-4">
        {paginatedData.map((customer) => (
          <div key={customer.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden flex flex-col hover:border-primary/20 transition-all">
            <div className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="font-bold text-primary text-body-lg">{customer.name}</h4>
                  <div className="flex items-center gap-2 mt-1.5 text-on-surface-variant text-label-sm">
                    <Phone className="w-3.5 h-3.5" />
                    +{formatWhatsAppNumber(customer.whatsapp_no)}
                  </div>
                </div>
              </div>
              
              <div className="bg-surface-container-highest/30 p-3 rounded-lg text-label-sm text-on-surface-variant flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{customer.address || "-"}</span>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-outline-variant/10 mt-1">
                <div className="flex items-center gap-2 w-full">
                  {canManage && (
                    <>
                      <button
                        onClick={() => openModal(customer)}
                        className="flex-1 flex justify-center items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-label-sm font-bold hover:bg-primary/20 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteAlert(customer)}
                        className="flex-1 flex justify-center items-center gap-1.5 px-3 py-1.5 bg-error/10 text-error rounded-lg text-label-sm font-bold hover:bg-error/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Hapus
                      </button>
                    </>
                  )}
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
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Nomor WhatsApp</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Alamat</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {paginatedData.map((customer) => (
            <tr key={customer.id} className="hover:bg-surface-container-highest/20 transition-colors">
              <td className="px-4 py-3 font-body-md text-on-surface">
                <span className="font-medium text-primary">{customer.name}</span>
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface">
                +{formatWhatsAppNumber(customer.whatsapp_no)}
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface">
                {customer.address || "-"}
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface text-right">
                {canManage && (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openModal(customer)}
                      className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/20 rounded transition-colors"
                      title="Edit Customer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteAlert(customer)}
                      className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded transition-colors"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/15 bg-surface-container-low">
          <div className="text-label-sm text-on-surface-variant">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} hingga {Math.min(currentPage * itemsPerPage, customers?.length || 0)} dari {customers?.length || 0} entri
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
