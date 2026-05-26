"use client";

import { useEffect, useState } from 'react';
import { useServiceStore } from '@/store/useServiceStore';
import { useCreateService, useUpdateService } from '@/hooks/useService';
import { CreateServiceInput } from '@/types/service';

const INITIAL_FORM: CreateServiceInput = {
  name: '',
  category: '',
  price: 0,
  estimation_hours: 0,
  unit: '',
  is_active: true,
};

export const ServiceFormModal = () => {
  const { isModalOpen, closeModal, selectedService } = useServiceStore();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  
  const [formData, setFormData] = useState<CreateServiceInput>(INITIAL_FORM);

  useEffect(() => {
    if (selectedService) {
      setFormData({
        name: selectedService.name,
        category: selectedService.category,
        price: selectedService.price,
        estimation_hours: selectedService.estimation_hours,
        unit: selectedService.unit,
        is_active: selectedService.is_active,
      });
    } else {
      setFormData(INITIAL_FORM);
    }
  }, [selectedService, isModalOpen]);

  if (!isModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedService) {
      updateMutation.mutate(
        { id: selectedService.id, payload: formData },
        { onSuccess: () => closeModal() }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => closeModal(),
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={closeModal}
    >
      <div 
        className="bg-surface-container-low border border-outline-variant/15 p-6 rounded-lg w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-headline-sm text-primary">
            {selectedService ? 'Edit Service' : 'Add New Service'}
          </h2>
          <button onClick={closeModal} className="text-on-surface-variant hover:text-on-surface bg-surface-container hover:bg-surface-container-highest p-1 rounded-full transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Name</label>
            <input 
              type="text" 
              name="name" 
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-background border border-outline-variant rounded p-2 text-body-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              placeholder="e.g. Wash & Fold Premium"
            />
          </div>
          
          <div>
            <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Category</label>
            <input 
              type="text" 
              name="category" 
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-background border border-outline-variant rounded p-2 text-body-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              placeholder="e.g. Wash & Fold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Price (IDR)</label>
              <input 
                type="number" 
                name="price" 
                required
                min="0"
                value={formData.price}
                onChange={handleChange}
                className="w-full bg-background border border-outline-variant rounded p-2 text-body-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Est. Hours</label>
              <input 
                type="number" 
                name="estimation_hours" 
                required
                min="0"
                value={formData.estimation_hours}
                onChange={handleChange}
                className="w-full bg-background border border-outline-variant rounded p-2 text-body-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-label-sm font-medium text-on-surface-variant mb-1">Unit</label>
            <select 
              name="unit" 
              required
              value={formData.unit}
              onChange={handleChange}
              className="w-full bg-background border border-outline-variant rounded p-2 text-body-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
            >
              <option value="" disabled>Select Unit</option>
              <option value="kg">Kg</option>
              <option value="pcs">Pcs</option>
              <option value="meter">Meter</option>
            </select>
          </div>

          <div className="flex items-center gap-2 mt-4 p-3 bg-surface-container rounded border border-outline-variant/10">
            <input 
              type="checkbox" 
              id="is_active"
              name="is_active" 
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-primary bg-background border-outline-variant rounded focus:ring-primary cursor-pointer"
            />
            <label htmlFor="is_active" className="text-body-md text-on-surface cursor-pointer select-none">Active Service</label>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-outline-variant/15">
            <button 
              type="button" 
              onClick={closeModal}
              className="px-4 py-2 text-body-md text-on-surface-variant hover:bg-surface-container-highest rounded transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="px-4 py-2 bg-primary text-on-primary font-label-md rounded hover:bg-primary-container transition-colors disabled:opacity-50 min-w-[120px] flex justify-center items-center"
            >
              {isPending ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> : 'Save Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
