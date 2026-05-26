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
      className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm transition-all duration-300" 
      onClick={closeModal}
    >
      <div 
        className="bg-surface-container-lowest shadow-2xl w-full max-w-[480px] h-full flex flex-col relative animate-in slide-in-from-right duration-300 border-l border-outline-variant/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-outline-variant/10 bg-surface-container-lowest shrink-0">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-[24px] font-bold text-primary leading-tight">
              {isEditing ? "Edit Service" : "New Service"}
            </h2>
            <p className="text-on-surface-variant text-[14px]">
              {isEditing ? "Update the details of your service catalog" : "Add a new service to your catalog"}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors p-2 rounded-full flex items-center justify-center shrink-0 -mr-2"
            disabled={isPending}
            type="button"
            title="Close panel"
          >
            <span className="material-symbols-outlined text-[24px]" data-icon="close">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-8 py-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar bg-surface-container-lowest">
            
            {/* General Info Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-2">
                <span className="material-symbols-outlined text-primary text-[20px]" data-icon="info">info</span>
                <h3 className="text-[14px] font-bold text-primary uppercase tracking-wider">General Information</h3>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="name" className="text-[14px] font-semibold text-on-surface flex items-center gap-1">
                  Service Name <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">badge</span>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-surface-container-highest/30 hover:bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-xl pl-11 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                    placeholder="e.g. Wash & Fold Regular"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-[14px] font-semibold text-on-surface flex items-center gap-1">
                  Category <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">category</span>
                  <input
                    id="category"
                    name="category"
                    type="text"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-surface-container-highest/30 hover:bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-xl pl-11 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                    placeholder="e.g. Kiloan"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Time Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-2">
                <span className="material-symbols-outlined text-primary text-[20px]" data-icon="payments">payments</span>
                <h3 className="text-[14px] font-bold text-primary uppercase tracking-wider">Pricing & Estimation</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="price" className="text-[14px] font-semibold text-on-surface flex items-center gap-1">
                    Price (IDR) <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[15px] font-medium">Rp</span>
                    <input
                      id="price"
                      name="price"
                      type="text"
                      required
                      value={formData.price ? formData.price.toLocaleString("id-ID") : ""}
                      onChange={handleNumberTextChange}
                      className="w-full bg-surface-container-highest/30 hover:bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-xl pl-11 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50 font-medium"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="unitAmount" className="text-[14px] font-semibold text-on-surface flex items-center gap-1">
                    Unit <span className="text-error">*</span>
                  </label>
                  <div className="flex relative">
                    <input
                      id="unitAmount"
                      name="unitAmount"
                      type="text"
                      required
                      value={unitAmount}
                      onChange={handleUnitAmountChange}
                      className="w-1/2 bg-surface-container-highest/30 hover:bg-surface-container-highest/50 border border-outline-variant/40 border-r-0 text-on-surface rounded-l-xl px-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50 font-medium text-center"
                      placeholder="1"
                    />
                    <select
                      id="unitType"
                      name="unitType"
                      required
                      value={unitType}
                      onChange={handleUnitTypeChange}
                      className="w-1/2 bg-surface-container-highest/30 hover:bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-r-xl pl-3 pr-8 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none font-medium"
                    >
                      <option value="kg">kg</option>
                      <option value="pcs">pcs</option>
                      <option value="meter">meter</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]" data-icon="expand_more">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="estimation_hours" className="text-[14px] font-semibold text-on-surface flex items-center gap-1">
                  Est. Completion Time <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">timer</span>
                  <input
                    id="estimation_hours"
                    name="estimation_hours"
                    type="text"
                    required
                    value={formData.estimation_hours ? formData.estimation_hours.toLocaleString("id-ID") : ""}
                    onChange={handleNumberTextChange}
                    className="w-full bg-surface-container-highest/30 hover:bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-xl pl-11 pr-16 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50 font-medium"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[14px] font-medium bg-surface-container-highest px-2 py-1 rounded-md">hours</span>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="space-y-5 pt-2">
              <label className="flex items-center gap-4 cursor-pointer p-4 rounded-xl border border-outline-variant/30 bg-surface-container-highest/20 hover:bg-surface-container-highest/50 transition-all duration-200 group">
                <div className="relative flex items-center shrink-0">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="w-12 h-7 bg-surface-variant/50 rounded-full peer-checked:bg-primary transition-colors duration-300"></div>
                  <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5 shadow-sm"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-bold text-on-surface group-hover:text-primary transition-colors">
                    Service Status
                  </span>
                  <span className="text-[13px] text-on-surface-variant mt-0.5">
                    {formData.is_active ? "Active and available for new orders" : "Currently hidden from catalog"}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-outline-variant/10 bg-surface-container-low shrink-0 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-on-surface-variant hover:bg-surface-variant/20 hover:text-on-surface transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-[14px] font-bold bg-primary text-on-primary hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-primary/20 hover:shadow-primary/40"
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
