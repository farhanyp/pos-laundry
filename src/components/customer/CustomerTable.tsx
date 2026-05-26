"use client";

import { Customer } from "@/types/customer";
import { formatWhatsAppNumber } from "@/lib/utils";
import { useCustomerStore } from "@/store/useCustomerStore";

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
}

export function CustomerTable({ customers, isLoading }: CustomerTableProps) {
  const { openModal, openDeleteAlert } = useCustomerStore();

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-8">
        <span className="material-symbols-outlined animate-spin text-primary text-3xl" data-icon="progress_activity">
          progress_activity
        </span>
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
          {customers.map((customer) => (
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
                    <span className="material-symbols-outlined text-[18px]" data-icon="edit">edit</span>
                  </button>
                  <button
                    onClick={() => openDeleteAlert(customer)}
                    className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded transition-colors"
                    title="Delete Customer"
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
