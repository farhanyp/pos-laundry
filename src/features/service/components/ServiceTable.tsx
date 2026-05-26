"use client";

import { useServices } from '@/hooks/useService';
import { useServiceStore } from '@/store/useServiceStore';
import { formatCurrency } from '@/lib/utils';
import { Service } from '@/types/service';

export const ServiceTable = () => {
  const { data: services, isLoading, error } = useServices();
  const { openModal, openDeleteAlert } = useServiceStore();

  if (isLoading) {
    return <div className="p-4 text-center text-on-surface-variant">Loading services...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-error">Failed to load services.</div>;
  }

  return (
    <div className="overflow-x-auto bg-surface-container-low rounded-lg border border-outline-variant/15">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-surface-container-highest border-b border-outline-variant/15">
            <th className="p-4 font-label-md text-primary font-medium">Name</th>
            <th className="p-4 font-label-md text-primary font-medium">Category</th>
            <th className="p-4 font-label-md text-primary font-medium">Price</th>
            <th className="p-4 font-label-md text-primary font-medium">Est. Hours</th>
            <th className="p-4 font-label-md text-primary font-medium">Unit</th>
            <th className="p-4 font-label-md text-primary font-medium">Status</th>
            <th className="p-4 font-label-md text-primary font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {services?.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                No services found.
              </td>
            </tr>
          ) : (
            services?.map((service: Service) => (
              <tr key={service.id} className="border-b border-outline-variant/10 hover:bg-surface-container transition-colors">
                <td className="p-4 text-body-md font-medium">{service.name}</td>
                <td className="p-4 text-body-md text-on-surface-variant">{service.category}</td>
                <td className="p-4 text-body-md">{formatCurrency(service.price)}</td>
                <td className="p-4 text-body-md text-on-surface-variant">{service.estimation_hours} hours</td>
                <td className="p-4 text-body-md text-on-surface-variant">{service.unit}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${service.is_active ? 'bg-primary-container/20 text-primary' : 'bg-error-container/20 text-error'}`}>
                    {service.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button 
                    onClick={() => openModal(service)}
                    className="text-primary hover:bg-primary-container/20 p-2 rounded transition-colors"
                    title="Edit Service"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button 
                    onClick={() => openDeleteAlert(service)}
                    className="text-error hover:bg-error-container/20 p-2 rounded transition-colors"
                    title="Delete Service"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
