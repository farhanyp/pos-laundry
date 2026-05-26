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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-6" 
      onClick={closeModal}
    >
      <div 
        className="bg-surface-container-low border border-outline-variant/20 shadow-2xl rounded-2xl w-full max-w-[550px] flex flex-col max-h-[90vh] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-5 border-b border-outline-variant/10 bg-surface-container-low shrink-0">
          <div>
            <h2 className="font-display text-[22px] font-bold text-primary">
              {isEditing ? "Edit Customer" : "Add New Customer"}
            </h2>
            <p className="text-on-surface-variant text-[13px] mt-1">
              {isEditing ? "Update details for the selected customer" : "Create a new customer entry"}
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

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            <div className="space-y-2">
              <label htmlFor="name" className="text-[14px] font-semibold text-on-surface">Customer Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-surface-container-highest border border-outline-variant/40 text-on-surface rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="whatsapp_no" className="text-[14px] font-semibold text-on-surface">WhatsApp Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[14px] font-medium">+62</span>
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
                  className="w-full bg-surface-container-highest border border-outline-variant/40 text-on-surface rounded-xl pl-12 pr-4 py-3 text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                  placeholder="81234567890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="text-[14px] font-semibold text-on-surface">Address</label>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={formData.address || ""}
                onChange={handleChange}
                className="w-full bg-surface-container-highest border border-outline-variant/40 text-on-surface rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50 resize-none custom-scrollbar"
                placeholder="Enter full address"
              />
            </div>
          </div>

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
              {isEditing ? "Save Changes" : "Create Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
