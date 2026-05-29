"use client";

import React, { useState } from "react";
import { OrderWithDetails } from "@/types/order";
import { Loader2, Receipt, ChevronRight, ChevronLeft, Printer, Eye, CreditCard, PackageCheck, CheckCircle } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useOrderStore } from "@/store/use-order-store";
import { useUpdateOrderStatus } from "@/hooks/useOrders";
import { LaundryStatus } from "@/types/enums";

interface OrderTableProps {
  orders: OrderWithDetails[];
  isLoading: boolean;
}

export function OrderTable({ orders, isLoading }: OrderTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { openPaymentDialog } = useOrderStore();
  const updateOrderStatusMutation = useUpdateOrderStatus();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil((orders?.length || 0) / itemsPerPage);
  const paginatedData = orders?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/30 rounded-xl bg-surface-container-lowest">
        <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mb-3">
          <Receipt className="w-6 h-6 text-on-surface-variant" />
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
            <th className="p-4 text-label-md font-bold text-on-surface-variant text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10 bg-surface-container-lowest">
          {paginatedData.map((order) => {
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
                        <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
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
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Payment Action */}
                      {(order.payment_status === 'UNPAID' || order.payment_status === 'DP') && (
                        <>
                          <button
                            onClick={() => openPaymentDialog(order)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-label-sm font-medium hover:bg-primary/90 hover:shadow-md transition-all active:scale-95"
                          >
                            <CreditCard className="w-4 h-4" />
                            {order.payment_status === 'DP' ? 'Settle Payment' : 'Pay Now'}
                          </button>
                          <div className="w-px h-6 bg-outline-variant/30 mx-1"></div>
                        </>
                      )}

                      {/* Laundry Status Actions */}
                      {order.laundry_status === 'PROCESS' && (
                        <>
                          <button
                            onClick={() => updateOrderStatusMutation.mutate({ orderId: order.id, laundryStatus: LaundryStatus.WAITING_FOR_PICKUP })}
                            disabled={updateOrderStatusMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-on-secondary rounded-lg text-label-sm font-medium hover:bg-secondary/90 hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                          >
                            <PackageCheck className="w-4 h-4" />
                            Ready
                          </button>
                          <div className="w-px h-6 bg-outline-variant/30 mx-1"></div>
                        </>
                      )}

                      {order.laundry_status === 'WAITING_FOR_PICKUP' && (
                        <>
                          <button
                            onClick={() => updateOrderStatusMutation.mutate({ orderId: order.id, laundryStatus: LaundryStatus.COMPLETED })}
                            disabled={updateOrderStatusMutation.isPending || order.payment_status === 'DP' || order.payment_status === 'UNPAID'}
                            title={order.payment_status !== 'PAID' ? 'Payment must be settled first' : 'Mark as Complete'}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-tertiary text-on-tertiary rounded-lg text-label-sm font-medium hover:bg-tertiary/90 hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Complete
                          </button>
                          <div className="w-px h-6 bg-outline-variant/30 mx-1"></div>
                        </>
                      )}

                      {/* General Actions */}
                      <button className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors" title="Print Receipt">
                        <Printer className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-on-surface-variant hover:bg-surface-container-high rounded-md transition-colors" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/15 bg-surface-container-low">
          <div className="text-label-sm text-on-surface-variant">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, orders?.length || 0)} of {orders?.length || 0} entries
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-surface-container-highest disabled:opacity-50 disabled:cursor-not-allowed text-on-surface-variant"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded text-label-sm font-medium ${currentPage === page ? 'bg-primary text-on-primary' : 'hover:bg-surface-container-highest text-on-surface'}`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-surface-container-highest disabled:opacity-50 disabled:cursor-not-allowed text-on-surface-variant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
