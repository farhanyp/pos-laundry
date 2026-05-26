"use client";

import { Discount } from "@/types/discount";
import { formatCurrency } from "@/lib/utils";
import { useDiscountStore } from "@/store/useDiscountStore";

interface DiscountTableProps {
  discounts: Discount[];
  isLoading: boolean;
}

export function DiscountTable({ discounts, isLoading }: DiscountTableProps) {
  const { openModal, openDeleteAlert } = useDiscountStore();

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-8">
        <span className="material-symbols-outlined animate-spin text-primary text-3xl" data-icon="progress_activity">
          progress_activity
        </span>
      </div>
    );
  }

  if (!discounts || discounts.length === 0) {
    return (
      <div className="w-full text-center py-8 text-on-surface-variant font-body-md border border-outline-variant/15 rounded-lg border-dashed">
        No discounts found. Click "Add Discount" to create one.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-outline-variant/15 bg-surface-container-low shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-highest/30 border-b border-outline-variant/15">
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Promo Name</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Type</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Value</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Min Order</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Max Discount</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Period</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Status</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {discounts.map((discount) => (
            <tr key={discount.id} className="hover:bg-surface-container-highest/20 transition-colors">
              <td className="px-4 py-3 font-body-md text-on-surface">
                <span className="font-medium text-primary">{discount.promo_name}</span>
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface-variant">
                <span className="px-2 py-1 bg-secondary-container/30 text-on-secondary-container text-[11px] font-medium rounded uppercase tracking-wider">
                  {discount.discount_type}
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
                    onClick={() => openModal(discount)}
                    className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/20 rounded transition-colors"
                    title="Edit Discount"
                  >
                    <span className="material-symbols-outlined text-[18px]" data-icon="edit">edit</span>
                  </button>
                  <button
                    onClick={() => openDeleteAlert(discount)}
                    className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded transition-colors"
                    title="Delete Discount"
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
