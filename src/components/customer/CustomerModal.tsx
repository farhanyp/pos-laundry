"use client";

import { useEffect, useState } from "react";
import { useCustomerStore } from "@/store/useCustomerStore";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/useCustomer";
import { CreateCustomerInput } from "@/types/customer";

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
        className="bg-surface-container-lowest shadow-2xl w-full max-w-[480px] h-full flex flex-col relative animate-in slide-in-from-right duration-300 border-l border-outline-variant/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-8 py-6 border-b border-outline-variant/10 bg-surface-container-lowest shrink-0">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-[24px] font-bold text-primary leading-tight">
              {isEditing ? "Edit Customer" : "New Customer"}
            </h2>
            <p className="text-on-surface-variant text-[14px]">
              {isEditing ? "Update details for the selected customer" : "Add a new customer to the database"}
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
                <span className="material-symbols-outlined text-primary text-[20px]" data-icon="person">person</span>
                <h3 className="text-[14px] font-bold text-primary uppercase tracking-wider">Personal Information</h3>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="name" className="text-[14px] font-semibold text-on-surface flex items-center gap-1">
                  Customer Name <span className="text-error">*</span>
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
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-2">
                <span className="material-symbols-outlined text-primary text-[20px]" data-icon="contact_mail">contact_mail</span>
                <h3 className="text-[14px] font-bold text-primary uppercase tracking-wider">Contact Details</h3>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="whatsapp_no" className="text-[14px] font-semibold text-on-surface flex items-center gap-1">
                  WhatsApp Number <span className="text-error">*</span>
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
                  Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-4 text-on-surface-variant/50 text-[20px]">location_on</span>
                  <textarea
                    id="address"
                    name="address"
                    rows={4}
                    value={formData.address || ""}
                    onChange={handleChange}
                    className="w-full bg-surface-container-highest/30 hover:bg-surface-container-highest/50 border border-outline-variant/40 text-on-surface rounded-xl pl-11 pr-4 py-3.5 text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50 resize-none custom-scrollbar leading-relaxed"
                    placeholder="Enter full address"
                  />
                </div>
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
              {isEditing ? "Save Changes" : "Create Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
