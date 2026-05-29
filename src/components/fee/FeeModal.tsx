"use client";

import { useEffect, useState } from "react";
import { useFeeStore } from "@/store/useFeeStore";
import { useCreateFee, useUpdateFee } from "@/hooks/useFee";
import { CreateFeeInput } from "@/types/fee";
import { X, Info, Tag, ChevronDown, Loader2 } from "lucide-react";

export function FeeModal() {
  const { isModalOpen, closeModal, selectedFee } = useFeeStore();
  const createMutation = useCreateFee();
  const updateMutation = useUpdateFee();

  const isEditing = !!selectedFee;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [formData, setFormData] = useState<CreateFeeInput>({
    fee_name: "",
    fee_type: "fixed",
    value: 0,
    is_active: true,
  });

  useEffect(() => {
    if (selectedFee) {
      setFormData({
        fee_name: selectedFee.fee_name,
        fee_type: selectedFee.fee_type,
        value: selectedFee.value,
        is_active: selectedFee.is_active,
      });
    } else {
      setFormData({
        fee_name: "",
        fee_type: "fixed",
        value: 0,
        is_active: true,
      });
    }
  }, [selectedFee, isModalOpen]);

  if (!isModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate(
        { id: selectedFee.id, payload: formData },
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

  return (
    <div 
      className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm transition-all duration-300" 
      onClick={closeModal}
    >
      <div 
        className="bg-surface-container-lowest shadow-2xl w-full sm:max-w-[480px] h-[100dvh] flex flex-col relative animate-in slide-in-from-bottom sm:slide-in-from-right duration-300 sm:border-l border-outline-variant/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 sm:px-8 py-6 border-b border-outline-variant/10 bg-surface-container-lowest shrink-0">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-[24px] font-bold text-primary leading-tight">
              {isEditing ? "Edit Biaya" : "Biaya Baru"}
            </h2>
            <p className="text-on-surface-variant text-[14px]">
              {isEditing ? "Perbarui detail biaya Anda" : "Tambahkan biaya baru ke sistem Anda"}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors p-2 rounded-full flex items-center justify-center shrink-0 -mr-2"
            disabled={isPending}
            type="button"
            title="Close panel"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 sm:px-8 py-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar bg-surface-container-lowest">
            
            {/* General Info Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-2">
                <Info className="w-5 h-5 text-primary" />
                <h3 className="text-[14px] font-bold text-primary uppercase tracking-wider">Informasi Biaya</h3>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="fee_name" className="text-[14px] font-semibold text-on-surface flex items-center gap-1">
                  Nama Biaya <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <Tag className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                  <input
                    id="fee_name"
                    name="fee_name"
                    type="text"
                    required
                    value={formData.fee_name}
                    onChange={handleChange}
                    className="w-full bg-surface-container-highest/30 hover:bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-xl pl-11 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                    placeholder="mis. Biaya Pengiriman"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="fee_type" className="text-[14px] font-semibold text-on-surface flex items-center gap-1">
                    Tipe Biaya <span className="text-error">*</span>
                  </label>
                  <div className="flex relative">
                    <select
                      id="fee_type"
                      name="fee_type"
                      required
                      value={formData.fee_type}
                      onChange={handleChange}
                      className="w-full bg-surface-container-highest/30 hover:bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-xl pl-4 pr-8 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none font-medium"
                    >
                      <option value="fixed">Tetap</option>
                      <option value="percentage">Persentase</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="value" className="text-[14px] font-semibold text-on-surface flex items-center gap-1">
                    Nilai <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    {formData.fee_type === 'fixed' && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[15px] font-medium">Rp</span>}
                    <input
                      id="value"
                      name="value"
                      type="text"
                      required
                      value={formData.value ? formData.value.toLocaleString("id-ID") : ""}
                      onChange={handleNumberTextChange}
                      className={`w-full bg-surface-container-highest/30 hover:bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-xl ${formData.fee_type === 'fixed' ? 'pl-11' : 'pl-4'} pr-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50 font-medium`}
                      placeholder="0"
                    />
                    {formData.fee_type === 'percentage' && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[15px] font-medium">%</span>}
                  </div>
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
                    Status Biaya
                  </span>
                  <span className="text-[13px] text-on-surface-variant mt-0.5">
                    {formData.is_active ? "Aktif dan diterapkan pada pesanan" : "Saat ini tidak aktif"}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-8 py-5 border-t border-outline-variant/10 bg-surface-container-low shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              disabled={isPending}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-[14px] font-bold text-on-surface-variant hover:bg-surface-variant/20 hover:text-on-surface transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl text-[14px] font-bold bg-primary text-on-primary hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-primary/20 hover:shadow-primary/40"
            >
              {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
              {isEditing ? "Simpan Perubahan" : "Buat Biaya"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
