"use client";

import { useEffect, useState } from "react";
import { useServiceStore } from "@/store/useServiceStore";
import { useCreateService, useUpdateService } from "@/hooks/useService";
import { CreateServiceInput } from "@/types/service";

export function ServiceModal() {
  const { isModalOpen, closeModal, selectedService } = useServiceStore();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();

  const isEditing = !!selectedService;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [formData, setFormData] = useState<CreateServiceInput>({
    name: "",
    category: "",
    price: 0,
    estimation_hours: 0,
    unit: "1 kg",
    is_active: true,
  });

  const [unitAmount, setUnitAmount] = useState<string>("1");
  const [unitType, setUnitType] = useState<string>("kg");

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

      // Parse unit string (e.g., "3 kg") into amount and type
      const parts = selectedService.unit.split(" ");
      if (parts.length >= 2) {
        setUnitAmount(parts[0]);
        setUnitType(parts[1]);
      } else {
        setUnitAmount("1");
        setUnitType(selectedService.unit || "kg");
      }
    } else {
      setFormData({
        name: "",
        category: "",
        price: 0,
        estimation_hours: 0,
        unit: "1 kg",
        is_active: true,
      });
      setUnitAmount("1");
      setUnitType("kg");
    }
  }, [selectedService, isModalOpen]);

  if (!isModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate(
        { id: selectedService.id, payload: formData },
        {
          onSuccess: () => {
            closeModal();
          },
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          closeModal();
        },
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleNumberTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({
      ...prev,
      [name]: numericValue ? parseInt(numericValue, 10) : 0,
    }));
  };

  const handleUnitAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setUnitAmount(val);
    setFormData((prev) => ({ ...prev, unit: `${val} ${unitType}`.trim() }));
  };

  const handleUnitTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setUnitType(val);
    setFormData((prev) => ({ ...prev, unit: `${unitAmount} ${val}`.trim() }));
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-6" 
      onClick={closeModal}
    >
      <div 
        className="bg-surface-container-low border border-outline-variant/20 shadow-2xl rounded-2xl w-full max-w-[550px] flex flex-col max-h-[90vh] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-outline-variant/10 bg-surface-container-low shrink-0">
          <div>
            <h2 className="font-display text-[22px] font-bold text-primary">
              {isEditing ? "Edit Service" : "Add New Service"}
            </h2>
            <p className="text-on-surface-variant text-[13px] mt-1">
              {isEditing ? "Update details for the selected service" : "Create a new service catalog entry"}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors p-2 rounded-full flex items-center justify-center shrink-0"
            disabled={isPending}
            type="button"
            title="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]" data-icon="close">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            {/* Row 1: Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-[14px] font-semibold text-on-surface">Service Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-surface-container-highest border border-outline-variant/40 text-on-surface rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                placeholder="e.g. Wash & Fold Regular"
              />
            </div>

            {/* Row 2: Category & Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="category" className="text-[14px] font-semibold text-on-surface">Category</label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-surface-container-highest border border-outline-variant/40 text-on-surface rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                  placeholder="e.g. Kiloan"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="unitAmount" className="text-[14px] font-semibold text-on-surface">Unit</label>
                <div className="flex relative">
                  <input
                    id="unitAmount"
                    name="unitAmount"
                    type="text"
                    required
                    value={unitAmount}
                    onChange={handleUnitAmountChange}
                    className="w-1/2 bg-surface-container-highest border border-outline-variant/40 border-r-0 text-on-surface rounded-l-xl px-4 py-3 text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                    placeholder="e.g. 1"
                  />
                  <select
                    id="unitType"
                    name="unitType"
                    required
                    value={unitType}
                    onChange={handleUnitTypeChange}
                    className="w-1/2 bg-surface-container-highest border border-outline-variant/40 text-on-surface rounded-r-xl px-4 py-3 text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="meter">Meter (m)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" data-icon="expand_more">expand_more</span>
                </div>
              </div>
            </div>

            {/* Row 3: Price & Estimation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="price" className="text-[14px] font-semibold text-on-surface">Price (IDR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[14px] font-medium">Rp</span>
                  <input
                    id="price"
                    name="price"
                    type="text"
                    required
                    value={formData.price ? formData.price.toLocaleString("id-ID") : ""}
                    onChange={handleNumberTextChange}
                    className="w-full bg-surface-container-highest border border-outline-variant/40 text-on-surface rounded-xl pl-11 pr-4 py-3 text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="estimation_hours" className="text-[14px] font-semibold text-on-surface">Est. Time (Hours)</label>
                <div className="relative">
                  <input
                    id="estimation_hours"
                    name="estimation_hours"
                    type="text"
                    required
                    value={formData.estimation_hours ? formData.estimation_hours.toLocaleString("id-ID") : ""}
                    onChange={handleNumberTextChange}
                    className="w-full bg-surface-container-highest border border-outline-variant/40 text-on-surface rounded-xl px-4 py-3 pr-16 text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[14px]">hours</span>
                </div>
              </div>
            </div>

            {/* Row 4: Status Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-outline-variant/30 bg-surface-container-highest/50 hover:bg-surface-container-highest transition-colors">
                <div className="relative flex items-center">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="w-10 h-6 bg-surface-variant rounded-full peer-checked:bg-primary transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-background rounded-full transition-transform peer-checked:translate-x-4 shadow-sm"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold text-on-surface leading-none">Service Status</span>
                  <span className="text-[12px] text-on-surface-variant mt-1">
                    {formData.is_active ? "Active and visible to customers" : "Hidden from catalog"}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-outline-variant/10 bg-surface-container-lowest shrink-0 flex justify-end gap-3 rounded-b-2xl">
            <button
              type="button"
              onClick={closeModal}
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-semibold bg-primary text-on-primary hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-95 shadow-sm hover:shadow-md"
            >
              {isPending && (
                <span className="material-symbols-outlined text-[18px] animate-spin" data-icon="progress_activity">
                  progress_activity
                </span>
              )}
              {isEditing ? "Save Changes" : "Create Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
