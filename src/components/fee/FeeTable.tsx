"use client";

import { Fee } from "@/types/fee";
import { formatCurrency } from "@/lib/utils";
import { useFeeStore } from "@/store/useFeeStore";

interface FeeTableProps {
  fees: Fee[];
  isLoading: boolean;
}

export function FeeTable({ fees, isLoading }: FeeTableProps) {
  const { openModal, openAlert } = useFeeStore();

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-8">
        <span className="material-symbols-outlined animate-spin text-primary text-3xl" data-icon="progress_activity">
          progress_activity
        </span>
      </div>
    );
  }

  if (!fees || fees.length === 0) {
    return (
      <div className="w-full text-center py-8 text-on-surface-variant font-body-md border border-outline-variant/15 rounded-lg border-dashed">
        No fees found. Click "Add Fee" to create one.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-outline-variant/15 bg-surface-container-low shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-highest/30 border-b border-outline-variant/15">
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Name</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Type</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Value</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Status</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {fees.map((fee) => (
            <tr key={fee.id} className="hover:bg-surface-container-highest/20 transition-colors">
              <td className="px-4 py-3 font-body-md text-on-surface">
                <span className="font-medium text-primary">{fee.fee_name}</span>
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface-variant">
                <span className="px-2 py-1 bg-secondary-container/30 text-on-secondary-container text-[11px] font-medium rounded uppercase tracking-wider">
                  {fee.fee_type}
                </span>
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface">
                {fee.fee_type === 'percentage' ? `${fee.value}%` : formatCurrency(fee.value)}
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface">
                {fee.is_active ? (
                  <span className="flex items-center gap-1 text-[12px] text-primary">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[12px] text-error">
                    <span className="w-2 h-2 rounded-full bg-error inline-block"></span>
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => openModal(fee)}
                    className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/20 rounded transition-colors"
                    title="Edit Fee"
                  >
                    <span className="material-symbols-outlined text-[18px]" data-icon="edit">edit</span>
                  </button>
                  <button
                    onClick={() => openAlert(fee)}
                    className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded transition-colors"
                    title="Delete Fee"
                  >
                    <span className="material-symbols-outlined text-[18px]" data-icon="delete">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
