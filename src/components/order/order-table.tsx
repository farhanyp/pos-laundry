"use client";

import React, { useState } from "react";
import { OrderWithDetails } from "@/types/order";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useOrderStore } from "@/store/use-order-store";
import { useUpdateOrderStatus } from "@/hooks/use-orders";
import { LaundryStatus } from "@/types/enums";

interface OrderTableProps {
  orders: OrderWithDetails[];
  isLoading: boolean;
}

export function OrderTable({ orders, isLoading }: OrderTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { openPaymentDialog } = useOrderStore();
  const updateOrderStatusMutation = useUpdateOrderStatus();

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-[32px] text-primary" data-icon="progress_activity">progress_activity</span>
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/30 rounded-xl bg-surface-container-lowest">
        <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mb-3">
          <span className="material-symbols-outlined text-on-surface-variant" data-icon="receipt_long">receipt_long</span>
        </div>
        <p className="text-on-surface font-body-lg">No orders found</p>
        <p className="text-on-surface-variant text-body-sm mt-1">Start by creating a new order.</p>
      </div>
    );
  }

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING_PAYMENT':
      case 'UNPAID': return 'bg-error-container text-on-error-container';
      case 'PROCESS': return 'bg-tertiary-container text-on-tertiary-container';
      case 'WAITING_FOR_PICKUP': return 'bg-secondary-container text-on-secondary-container';
      case 'COMPLETED':
      case 'PAID': return 'bg-primary-container text-on-primary-container';
      case 'DP': return 'bg-surface-variant text-on-surface-variant';
      default: return 'bg-surface-variant text-on-surface';
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-outline-variant/20">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container border-b border-outline-variant/20">
            <th className="p-4 text-label-md font-bold text-on-surface-variant w-10"></th>
            <th className="p-4 text-label-md font-bold text-on-surface-variant">Invoice & Date</th>
            <th className="p-4 text-label-md font-bold text-on-surface-variant">Customer</th>
            <th className="p-4 text-label-md font-bold text-on-surface-variant">Status</th>
            <th className="p-4 text-label-md font-bold text-on-surface-variant">Payment</th>
            <th className="p-4 text-label-md font-bold text-on-surface-variant text-right">Total</th>
            <th className="p-4 text-label-md font-bold text-on-surface-variant text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10 bg-surface-container-lowest">
          {orders.map((order) => {
            const hasDetails = (order.order_items && order.order_items.length > 0) || (order.order_payments && order.order_payments.length > 0);
            const isExpanded = expandedRows.has(order.id);

            return (
              <React.Fragment key={order.id}>
                <tr className="hover:bg-surface-container-lowest/50 transition-colors group">
                  <td className="p-4">
                    {hasDetails && (
                      <button 
                        onClick={() => toggleRow(order.id)}
                        className="p-1 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
                      >
                        <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} data-icon="chevron_right">chevron_right</span>
                      </button>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-body-md font-bold text-primary">{order.invoice_no}</span>
                      <span className="text-body-sm text-on-surface-variant">
                        {formatDateTime(order.created_at)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-body-md font-bold text-on-surface">{order.customers?.name || "Unknown"}</span>
                      <span className="text-body-sm text-on-surface-variant">{order.customers?.whatsapp_no}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-label-sm font-bold ${getStatusColor(order.laundry_status)}`}>
                      {order.laundry_status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-label-sm font-bold ${getStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="p-4 text-body-md font-bold text-on-surface text-right">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {order.payment_status === 'UNPAID' && order.laundry_status === 'WAITING_PAYMENT' ? (
                        <button 
                          onClick={() => openPaymentDialog(order.id, order.total_amount)}
                          className="px-3 py-1 bg-primary text-on-primary rounded-lg text-label-sm font-bold hover:bg-primary/90 transition-colors"
                        >
                          CONTINUE TO PAYMENT
                        </button>
                      ) : order.payment_status === 'PAID' && order.laundry_status === 'PROCESS' ? (
                        <>
                          <button 
                            onClick={() => updateOrderStatusMutation.mutate({ orderId: order.id, laundryStatus: LaundryStatus.WAITING_FOR_PICKUP })}
                            disabled={updateOrderStatusMutation.isPending}
                            className="px-3 py-1 bg-secondary text-on-secondary rounded-lg text-label-sm font-bold hover:bg-secondary/90 transition-colors disabled:opacity-50"
                          >
                            READY TO PICKUP
                          </button>
                          <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors" title="Print Receipt">
                            <span className="material-symbols-outlined text-[18px]" data-icon="print">print</span>
                          </button>
                          <button className="p-2 text-on-surface hover:bg-surface-container-high rounded-full transition-colors" title="View Details">
                            <span className="material-symbols-outlined text-[18px]" data-icon="visibility">visibility</span>
                          </button>
                        </>
                      ) : order.payment_status === 'PAID' && order.laundry_status === 'WAITING_FOR_PICKUP' ? (
                        <>
                          <button 
                            onClick={() => updateOrderStatusMutation.mutate({ orderId: order.id, laundryStatus: LaundryStatus.COMPLETED })}
                            disabled={updateOrderStatusMutation.isPending}
                            className="px-3 py-1 bg-tertiary text-on-tertiary rounded-lg text-label-sm font-bold hover:bg-tertiary/90 transition-colors disabled:opacity-50"
                          >
                            COMPLETED
                          </button>
                          <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors" title="Print Receipt">
                            <span className="material-symbols-outlined text-[18px]" data-icon="print">print</span>
                          </button>
                          <button className="p-2 text-on-surface hover:bg-surface-container-high rounded-full transition-colors" title="View Details">
                            <span className="material-symbols-outlined text-[18px]" data-icon="visibility">visibility</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors" title="Print Receipt">
                            <span className="material-symbols-outlined text-[18px]" data-icon="print">print</span>
                          </button>
                          <button className="p-2 text-on-surface hover:bg-surface-container-high rounded-full transition-colors" title="View Details">
                            <span className="material-symbols-outlined text-[18px]" data-icon="visibility">visibility</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                {isExpanded && hasDetails && (
                  <tr className="bg-surface-container-lowest border-b border-outline-variant/10">
                    <td colSpan={7} className="p-0">
                      <div className="px-14 py-4 bg-surface-container-lowest/30 border-l-4 border-primary/40">
                        
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <h4 className="text-label-md font-bold text-on-surface-variant mb-2">Order Items ({order.order_items?.length})</h4>
                            <div className="bg-surface-container rounded-lg border border-outline-variant/10 overflow-hidden">
                              <table className="w-full text-sm text-left">
                                <thead className="bg-surface-container-high">
                                  <tr>
                                    <th className="px-3 py-2 text-on-surface-variant font-medium">Service</th>
                                    <th className="px-3 py-2 text-on-surface-variant font-medium text-right">Qty</th>
                                    <th className="px-3 py-2 text-on-surface-variant font-medium text-right">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/10">
                                  {order.order_items?.map(item => (
                                    <tr key={item.id} className="bg-surface-container-lowest">
                                      <td className="px-3 py-2 text-on-surface">{item.services?.name}</td>
                                      <td className="px-3 py-2 text-on-surface text-right">{item.qty} {item.services?.unit}</td>
                                      <td className="px-3 py-2 text-on-surface text-right">{formatCurrency(item.qty * item.price_per_unit)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-label-md font-bold text-on-surface-variant mb-2">Payment History</h4>
                            <div className="bg-surface-container rounded-lg border border-outline-variant/10 overflow-hidden">
                              <table className="w-full text-sm text-left">
                                <thead className="bg-surface-container-high">
                                  <tr>
                                    <th className="px-3 py-2 text-on-surface-variant font-medium">Date</th>
                                    <th className="px-3 py-2 text-on-surface-variant font-medium">Method</th>
                                    <th className="px-3 py-2 text-on-surface-variant font-medium text-right">Amount</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/10">
                                  {order.order_payments?.map(payment => (
                                    <tr key={payment.id} className="bg-surface-container-lowest">
                                      <td className="px-3 py-2 text-on-surface">
                                        {formatDateTime(payment.created_at)}
                                      </td>
                                      <td className="px-3 py-2 text-on-surface">{payment.payment_type}</td>
                                      <td className="px-3 py-2 text-on-surface text-right">{formatCurrency(payment.amount)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
