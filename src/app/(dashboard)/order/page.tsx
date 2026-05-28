"use client";

import { useState } from "react";
import { useOrders } from "@/hooks/use-orders";
import { useOrderStore } from "@/store/use-order-store";
import { OrderTable } from "@/components/order/order-table";
import { OrderDialog } from "@/components/order/order-dialog";
import { PaymentDialog } from "@/components/order/payment-dialog";
import { LaundryStatus, PaymentStatus } from "@/types/enums";

export default function OrderPage() {
  const { data: orders, isLoading, error } = useOrders();
  const { setIsOpen } = useOrderStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLaundryStatus, setFilterLaundryStatus] = useState<LaundryStatus | 'ALL'>('ALL');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<PaymentStatus | 'ALL'>('ALL');

  const filteredOrders = orders?.filter(order => {
    const matchSearch = order.invoice_no.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (order.customers?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchLaundry = filterLaundryStatus === 'ALL' || order.laundry_status === filterLaundryStatus;
    const matchPayment = filterPaymentStatus === 'ALL' || order.payment_status === filterPaymentStatus;
    return matchSearch && matchLaundry && matchPayment;
  });

  if (error) {
    return (
      <div className="p-margin-desktop w-full h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-error-container/20 text-error rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px]" data-icon="error">error</span>
        </div>
        <h2 className="font-display text-title-lg font-bold text-on-surface">Failed to load orders</h2>
        <p className="text-body-md text-on-surface-variant">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <header className="flex justify-between items-center px-margin-desktop w-full h-16 bg-background border-b border-outline-variant/15 sticky top-0 z-40 backdrop-blur-md bg-background/80">
        <div className="flex items-center gap-6">
          <h1 className="font-display text-headline-md font-bold text-primary">Active Orders</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <span className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors cursor-pointer" data-icon="notifications">notifications</span>
          </div>
          <button 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-primary text-on-primary font-label-md px-4 py-2 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors active:scale-95 duration-150"
          >
            <span className="material-symbols-outlined text-[18px]" data-icon="add">add</span>
            New Order
          </button>
        </div>
      </header>

      <div className="p-margin-desktop max-w-[1600px] mx-auto space-y-md">
        <div className="bg-surface-container-low rounded-lg border border-outline-variant/15 p-md flex flex-col">
          <div className="flex justify-between items-center mb-md">
            <div>
              <h3 className="font-headline-md text-primary">Order List</h3>
              <p className="text-on-surface-variant text-label-sm">Manage all active and past transactions</p>
            </div>
            <div className="flex gap-2">
              <select 
                value={filterLaundryStatus} 
                onChange={(e) => setFilterLaundryStatus(e.target.value as LaundryStatus | 'ALL')}
                className="bg-surface-container-highest rounded-lg p-2 text-body-sm text-on-surface outline-none border border-outline-variant/20 focus:border-primary"
              >
                <option value="ALL">All Laundry Status</option>
                <option value="WAITING_PAYMENT">Waiting Payment</option>
                <option value="PROCESS">Process</option>
                <option value="WAITING_FOR_PICKUP">Waiting for Pickup</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <select 
                value={filterPaymentStatus} 
                onChange={(e) => setFilterPaymentStatus(e.target.value as PaymentStatus | 'ALL')}
                className="bg-surface-container-highest rounded-lg p-2 text-body-sm text-on-surface outline-none border border-outline-variant/20 focus:border-primary"
              >
                <option value="ALL">All Payment Status</option>
                <option value="INITATE">Initate</option>
                <option value="UNPAID">Unpaid</option>
                <option value="DP">DP</option>
                <option value="PAID">Paid</option>
              </select>

              <div className="flex gap-2 bg-surface-container-highest rounded-lg p-1 border border-outline-variant/20 focus-within:border-primary items-center">
                <span className="material-symbols-outlined text-on-surface-variant p-1" data-icon="search">search</span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders..." 
                  className="bg-transparent border-none outline-none text-body-sm text-on-surface w-48"
                />
              </div>
            </div>
          </div>
          
          <OrderTable orders={filteredOrders || []} isLoading={isLoading} />
        </div>
      </div>

      <OrderDialog />
      <PaymentDialog />
    </>
  );
}
