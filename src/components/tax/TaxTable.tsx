"use client";

import { useState } from "react";
import { Tax } from "@/types/tax";
import { Receipt, Edit, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPercentage } from "@/lib/utils";
import { useTaxStore } from "@/store/useTaxStore";

interface TaxTableProps {
  taxes: Tax[];
  isLoading: boolean;
}

export function TaxTable({ taxes, isLoading }: TaxTableProps) {
  const { openModal, openDeleteAlert } = useTaxStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil((taxes?.length || 0) / itemsPerPage);
  const paginatedData = taxes?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (taxes.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 text-on-surface-variant">
        <Receipt className="w-12 h-12 mb-4 opacity-50" />
        <p className="font-body-lg">No taxes found</p>
        <p className="font-body-sm opacity-70">Add a new tax to get started</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-outline-variant/15">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-highest border-b border-outline-variant/15 text-label-md font-bold text-on-surface">
            <th className="p-4">Tax Name</th>
            <th className="p-4 text-right">Rate</th>
            <th className="p-4 text-center">Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10 bg-surface-container-low">
          {paginatedData.map((tax) => (
            <tr key={tax.id} className="hover:bg-surface-container transition-colors group">
              <td className="p-4">
                <p className="font-body-md font-bold text-on-surface">{tax.tax_name}</p>
              </td>
              <td className="p-4 text-right">
                <span className="font-body-md text-on-surface-variant">
                  {formatPercentage(tax.rate_percentage)}
                </span>
              </td>
              <td className="p-4 text-center">
                {tax.is_active ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container/30 text-primary font-label-sm border border-primary/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container/30 text-error font-label-sm border border-error/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                    Inactive
                  </span>
                )}
              </td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => openModal(tax)}
                    className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-container/20 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => openDeleteAlert(tax)}
                    className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
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
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, taxes?.length || 0)} of {taxes?.length || 0} entries
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
