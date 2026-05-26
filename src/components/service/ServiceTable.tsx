"use client";

import { Service } from "@/types/service";
import { formatCurrency } from "@/lib/utils";
import { useServiceStore } from "@/store/useServiceStore";

interface ServiceTableProps {
  services: Service[];
  isLoading: boolean;
}

export function ServiceTable({ services, isLoading }: ServiceTableProps) {
  const { openModal, openDeleteAlert } = useServiceStore();

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-8">
        <span className="material-symbols-outlined animate-spin text-primary text-3xl" data-icon="progress_activity">
          progress_activity
        </span>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="w-full text-center py-8 text-on-surface-variant font-body-md border border-outline-variant/15 rounded-lg border-dashed">
        No services found. Click "Add Service" to create one.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-outline-variant/15 bg-surface-container-low shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-highest/30 border-b border-outline-variant/15">
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Name</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Category</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Price</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Est. Hours</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Unit</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap">Status</th>
            <th className="px-4 py-3 font-label-md text-on-surface-variant whitespace-nowrap text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {services.map((service) => (
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
                {service.estimation_hours} hours
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface">
                {service.unit}
              </td>
              <td className="px-4 py-3 font-body-md text-on-surface">
                {service.is_active ? (
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
                    onClick={() => openModal(service)}
                    className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/20 rounded transition-colors"
                    title="Edit Service"
                  >
                    <span className="material-symbols-outlined text-[18px]" data-icon="edit">edit</span>
                  </button>
                  <button
                    onClick={() => openDeleteAlert(service)}
                    className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded transition-colors"
                    title="Delete Service"
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
