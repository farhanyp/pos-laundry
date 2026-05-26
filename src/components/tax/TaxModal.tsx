"use client";

import { useEffect, useState } from "react";
import { useTaxStore } from "@/store/useTaxStore";
import { useCreateTax, useUpdateTax } from "@/hooks/useTax";
import { CreateTaxInput } from "@/types/tax";

export function TaxModal() {
  const { isModalOpen, closeModal, selectedTax } = useTaxStore();
  const createMutation = useCreateTax();
  const updateMutation = useUpdateTax();

  const isEditing = !!selectedTax;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [formData, setFormData] = useState<CreateTaxInput>({
    tax_name: "",
    rate_percentage: 0,
    is_active: true,
  });

  const [percentageStr, setPercentageStr] = useState("");
  const [decimalStr, setDecimalStr] = useState("");

  useEffect(() => {
    if (selectedTax) {
      setFormData({
        tax_name: selectedTax.tax_name,
        rate_percentage: selectedTax.rate_percentage,
        is_active: selectedTax.is_active,
      });
      setPercentageStr(selectedTax.rate_percentage.toString());
      setDecimalStr((selectedTax.rate_percentage / 100).toString());
    } else {
      setFormData({
        tax_name: "",
        rate_percentage: 0,
        is_active: true,
      });
      setPercentageStr("");
      setDecimalStr("");
    }
  }, [selectedTax, isModalOpen]);

  if (!isModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate(
        { id: selectedTax.id, payload: formData },
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setPercentageStr(val);
    const num = parseFloat(val) || 0;
    setDecimalStr((num / 100).toString());
    setFormData(prev => ({ ...prev, rate_percentage: num }));
  };

  const handleDecimalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setDecimalStr(val);
    const num = parseFloat(val) || 0;
    setPercentageStr((num * 100).toString());
    setFormData(prev => ({ ...prev, rate_percentage: num * 100 }));
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
        <div className="flex justify-between items-center px-8 py-6 border-b border-outline-variant/10 bg-surface-container-lowest shrink-0">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-[24px] font-bold text-primary leading-tight">
              {isEditing ? "Edit Tax" : "New Tax"}
            </h2>
            <p className="text-on-surface-variant text-[14px]">
              {isEditing ? "Update details for the selected tax" : "Add a new tax to the system"}
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

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-8 py-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar bg-surface-container-lowest">
            
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-2">
                <span className="material-symbols-outlined text-primary text-[20px]" data-icon="receipt_long">receipt_long</span>
                <h3 className="text-[14px] font-bold text-primary uppercase tracking-wider">Tax Details</h3>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="tax_name" className="text-[14px] font-semibold text-on-surface flex items-center gap-1">
                  Tax Name <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">badge</span>
                  <input
                    id="tax_name"
                    name="tax_name"
                    type="text"
                    required
                    value={formData.tax_name}
                    onChange={handleChange}
                    className="w-full bg-surface-container-highest/30 hover:bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-xl pl-11 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                    placeholder="e.g. VAT"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="rate_percentage" className="text-[14px] font-semibold text-on-surface flex items-center gap-1">
                    Rate (%) <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">percent</span>
                    <input
                      id="rate_percentage"
                      name="rate_percentage"
                      type="text"
                      required
                      value={percentageStr}
                      onChange={handlePercentageChange}
                      className="w-full bg-surface-container-highest/30 hover:bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-xl pl-11 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                      placeholder="e.g. 10.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="rate_decimal" className="text-[14px] font-semibold text-on-surface flex items-center gap-1">
                    Rate (Decimal) <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">calculate</span>
                    <input
                      id="rate_decimal"
                      name="rate_decimal"
                      type="text"
                      required
                      value={decimalStr}
                      onChange={handleDecimalChange}
                      className="w-full bg-surface-container-highest/30 hover:bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-xl pl-11 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                      placeholder="e.g. 0.10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      id="is_active"
                      name="is_active"
                      className="sr-only peer"
                      checked={formData.is_active}
                      onChange={handleChange}
                    />
                    <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                  <span className="text-[15px] font-medium text-on-surface cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}>Active Status</span>
                </div>
                <p className="text-[13px] text-on-surface-variant mt-1">If disabled, this tax rate will not be applied to new transactions.</p>
              </div>

            </div>
          </div>

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
              {isEditing ? "Save Changes" : "Create Tax"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
