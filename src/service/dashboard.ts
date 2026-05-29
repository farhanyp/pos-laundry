import { createClient } from '@/lib/supabase/client';
import { LaundryStatus, PaymentStatus } from '@/types/enums';

export interface DashboardStats {
  revenue: {
    current: number;
    percentage: number;
  };
  orders: {
    current: number;
    percentage: number;
    processing: number;
    waiting: number;
  };
  customers: {
    total: number;
    newThisMonth: number;
    percentage: number;
  };
  activeLaundry: number;
  unpaidAmount: number;
  chartData: {
    weekly: { label: string; value: number }[];
    monthly: { label: string; value: number }[];
  };
  paymentDistribution: {
    tunai: { amount: number; percentage: number };
    nonTunai: { amount: number; percentage: number };
    qrisGrowth: number;
  };
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const supabase = createClient();
  const now = new Date();
  
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Fetch recent orders for revenue, count stats, and payment distribution
  const { data: recentOrders, error: recentError } = await supabase
    .from('orders')
    .select('id, paid_amount, created_at, laundry_status, payment_status, order_payments(payment_type, amount)')
    .gte('created_at', sixtyDaysAgo);

  if (recentError) throw new Error(recentError.message);

  let currentRevenue = 0;
  let prevRevenue = 0;
  let currentOrders = 0;
  let prevOrders = 0;
  let currentTunai = 0;
  let currentNonTunai = 0;
  let prevTunai = 0;
  let prevNonTunai = 0;

  recentOrders?.forEach(order => {
    const isCompletedAndPaid = order.laundry_status === LaundryStatus.COMPLETED && order.payment_status === PaymentStatus.PAID;

    if (order.created_at >= thirtyDaysAgo) {
      if (isCompletedAndPaid) {
        currentRevenue += Number(order.paid_amount || 0);
        // Distribute the payments for this order
        order.order_payments?.forEach((payment: any) => {
           if (payment.payment_type === 'TUNAI') currentTunai += Number(payment.amount || 0);
           if (payment.payment_type === 'NON_TUNAI') currentNonTunai += Number(payment.amount || 0);
        });
      }
      currentOrders++;
    } else {
      if (isCompletedAndPaid) {
        prevRevenue += Number(order.paid_amount || 0);
        // Distribute the payments for previous period
        order.order_payments?.forEach((payment: any) => {
           if (payment.payment_type === 'TUNAI') prevTunai += Number(payment.amount || 0);
           if (payment.payment_type === 'NON_TUNAI') prevNonTunai += Number(payment.amount || 0);
        });
      }
      prevOrders++;
    }
  });

  const totalCurrentPayment = currentTunai + currentNonTunai;
  const tunaiPercentage = totalCurrentPayment > 0 ? (currentTunai / totalCurrentPayment) * 100 : 0;
  const nonTunaiPercentage = totalCurrentPayment > 0 ? (currentNonTunai / totalCurrentPayment) * 100 : 0;

  const totalPrevPayment = prevTunai + prevNonTunai;
  const prevNonTunaiPercentage = totalPrevPayment > 0 ? (prevNonTunai / totalPrevPayment) * 100 : 0;
  const qrisGrowth = nonTunaiPercentage - prevNonTunaiPercentage;

  const revenuePercentage = prevRevenue === 0 
    ? (currentRevenue > 0 ? 100 : 0) 
    : ((currentRevenue - prevRevenue) / prevRevenue) * 100;

  const ordersPercentage = prevOrders === 0 
    ? (currentOrders > 0 ? 100 : 0) 
    : ((currentOrders - prevOrders) / prevOrders) * 100;

  // 2. Fetch Active Laundry Count
  const { count: activeLaundryCount, error: activeError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('laundry_status', [LaundryStatus.WAITING_PAYMENT, LaundryStatus.PROCESS, LaundryStatus.WAITING_FOR_PICKUP]);

  if (activeError) throw new Error(activeError.message);

  // 3. Fetch Unpaid Amount (DP Only)
  const { data: unpaidOrders, error: unpaidError } = await supabase
    .from('orders')
    .select('remaining_amount')
    .eq('payment_status', PaymentStatus.DP);

  if (unpaidError) throw new Error(unpaidError.message);

  const unpaidAmount = unpaidOrders?.reduce((acc, order) => acc + Number(order.remaining_amount || 0), 0) || 0;

  // 4. Fetch breakdown for processing and waiting
  const { data: statusOrders, error: statusError } = await supabase
    .from('orders')
    .select('laundry_status')
    .in('laundry_status', [LaundryStatus.WAITING_PAYMENT, LaundryStatus.PROCESS]);

  if (statusError) throw new Error(statusError.message);

  let processingCount = 0;
  let waitingCount = 0;
  statusOrders?.forEach(order => {
    if (order.laundry_status === LaundryStatus.PROCESS) processingCount++;
    if (order.laundry_status === LaundryStatus.WAITING_PAYMENT) waitingCount++;
  });

  // 5. Fetch customers stats
  const { count: totalCustomersCount, error: totalCustError } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });

  if (totalCustError) throw new Error(totalCustError.message);

  const { data: recentCustomers, error: recentCustError } = await supabase
    .from('customers')
    .select('created_at')
    .gte('created_at', sixtyDaysAgo);

  if (recentCustError) throw new Error(recentCustError.message);

  let currentCustomers = 0;
  let prevCustomers = 0;

  recentCustomers?.forEach(customer => {
    if (customer.created_at >= thirtyDaysAgo) {
      currentCustomers++;
    } else {
      prevCustomers++;
    }
  });

  const customersPercentage = prevCustomers === 0 
    ? (currentCustomers > 0 ? 100 : 0) 
    : ((currentCustomers - prevCustomers) / prevCustomers) * 100;

  // 6. Fetch chart data (weekly: last 7 days, monthly: last 6 months)
  const sixMonthsAgoStr = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();

  const { data: chartOrders, error: chartError } = await supabase
    .from('orders')
    .select('paid_amount, created_at')
    .gte('created_at', sixMonthsAgoStr);

  if (chartError) throw new Error(chartError.message);

  const weeklyMap = new Map<string, { label: string; value: number }>();
  const monthlyMap = new Map<string, { label: string; value: number }>();

  // Initialize weekly map (last 7 days)
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const label = daysOfWeek[d.getDay()];
    weeklyMap.set(dateStr, { label, value: 0 });
  }

  // Initialize monthly map (last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    const label = monthNames[d.getMonth()];
    monthlyMap.set(monthKey, { label, value: 0 });
  }

  chartOrders?.forEach(order => {
    const orderDate = new Date(order.created_at);
    const amount = Number(order.paid_amount || 0);

    // Weekly match
    const dateStr = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')}`;
    if (weeklyMap.has(dateStr)) {
      weeklyMap.get(dateStr)!.value += amount;
    }

    // Monthly match
    const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
    if (monthlyMap.has(monthKey)) {
      monthlyMap.get(monthKey)!.value += amount;
    }
  });

  // 7. Payment distribution is now calculated in step 1 to ensure it matches revenue exactly.

  return {
    revenue: {
      current: currentRevenue,
      percentage: revenuePercentage
    },
    orders: {
      current: currentOrders,
      percentage: ordersPercentage,
      processing: processingCount,
      waiting: waitingCount
    },
    customers: {
      total: totalCustomersCount || 0,
      newThisMonth: currentCustomers,
      percentage: customersPercentage
    },
    activeLaundry: activeLaundryCount || 0,
    unpaidAmount,
    chartData: {
      weekly: Array.from(weeklyMap.values()),
      monthly: Array.from(monthlyMap.values())
    },
    paymentDistribution: {
      tunai: { amount: currentTunai, percentage: tunaiPercentage },
      nonTunai: { amount: currentNonTunai, percentage: nonTunaiPercentage },
      qrisGrowth
    }
  };
};
