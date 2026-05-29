"use client";

import { useEffect, useState } from "react";
import { useCustomerStore } from "@/store/useCustomerStore";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/useCustomer";
import { CreateCustomerInput } from "@/types/customer";
import { X, User, Phone, MapPin, Loader2 } from "lucide-react";

export function CustomerModal() {
  const { isModalOpen, closeModal, selectedCustomer } = useCustomerStore();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const isEditing = !!selectedCustomer;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [formData, setFormData] = useState<CreateCustomerInput>({
    name: "",
    whatsapp_no: "",
    address: "",
  });

  useEffect(() => {
    if (selectedCustomer) {
      setFormData({
        name: selectedCustomer.name,
        whatsapp_no: selectedCustomer.whatsapp_no,
        address: selectedCustomer.address || "",
      });
    } else {
      setFormData({
        name: "",
        whatsapp_no: "",
        address: "",
      });
    }
  }, [selectedCustomer, isModalOpen]);

  if (!isModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate(
        { id: selectedCustomer.id, payload: formData },
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
        <div className="flex justify-between items-center px-6 sm:px-8 py-6 border-b border-outline-variant/10 bg-surface-container-lowest shrink-0">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-[24px] font-bold text-primary leading-tight">
              {isEditing ? "Edit Pelanggan" : "Pelanggan Baru"}
            </h2>
            <p className="text-on-surface-variant text-[14px]">
              {isEditing ? "Perbarui detail untuk pelanggan yang dipilih" : "Tambahkan pelanggan baru ke database"}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors p-2 rounded-full flex items-center justify-center shrink-0 -mr-2"
            disabled={isPending}
            type="button"
            title="Tutup panel"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 sm:px-8 py-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar bg-surface-container-lowest">
            
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-2">
                <User className="w-5 h-5 text-primary" />
                <h3 className="text-[14px] font-bold text-primary uppercase tracking-wider">Informasi Pribadi</h3>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="name" className="text-[14px] font-semibold text-on-surface flex items-center gap-1">
                  Nama Pelanggan <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-surface-container-highest/30 hover:bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-xl pl-11 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-2">
                <Phone className="w-5 h-5 text-primary" />
                <h3 className="text-[14px] font-bold text-primary uppercase tracking-wider">Detail Kontak</h3>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="whatsapp_no" className="text-[14px] font-semibold text-on-surface flex items-center gap-1">
                  Nomor WhatsApp <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[15px] font-medium">+62</span>
                  <input
                    id="whatsapp_no"
                    name="whatsapp_no"
                    type="text"
                    required
                    value={formData.whatsapp_no.startsWith("62") ? formData.whatsapp_no.substring(2) : formData.whatsapp_no}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      handleChange({
                        target: {
                          name: "whatsapp_no",
                          value: val ? `62${val}` : "",
                        }
                      } as any);
                    }}
                    className="w-full bg-surface-container-highest/30 hover:bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-xl pl-12 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50 font-medium"
                    placeholder="81234567890"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="text-[14px] font-semibold text-on-surface flex items-center gap-1">
                  Alamat
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-4 top-4 text-on-surface-variant/50" />
                  <textarea
                    id="address"
                    name="address"
                    rows={4}
                    value={formData.address || ""}
                    onChange={handleChange}
                    className="w-full bg-surface-container-highest/30 hover:bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-xl pl-11 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50 resize-none custom-scrollbar leading-relaxed"
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>
              </div>
            </div>
            
          </div>

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
              {isEditing ? "Simpan Perubahan" : "Tambah Pelanggan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
