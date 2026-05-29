"use client";

import { useState } from "react";
import { Customer } from "@/types/customer";
import { Loader2, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatWhatsAppNumber } from "@/lib/utils";
import { useCustomerStore } from "@/store/useCustomerStore";

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
}

export function CustomerTable({ customers, isLoading }: CustomerTableProps) {
  const { openModal, openDeleteAlert } = useCustomerStore();
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
        No customers found. Click "Add Customer" to create one.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-outline-variant/15 bg-surface-container-low shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-highest/30 border-b border-outline-variant/15">
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Name</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">WhatsApp No</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Address</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap text-right">Actions</th>
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/15 bg-surface-container-low">
          <div className="text-label-sm text-on-surface-variant">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, customers?.length || 0)} of {customers?.length || 0} entries
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
