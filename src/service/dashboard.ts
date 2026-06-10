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
    daily: { label: string; value: number }[];
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

  // 1. Fetch ALL orders with payments — aligned with Laporan Keuangan logic
  const { data: allOrders, error: allOrdersError } = await supabase
    .from('orders')
    .select('id, total_amount, remaining_amount, payment_status, laundry_status, created_at, order_payments(payment_type, amount, midtrans_status)');

  if (allOrdersError) throw new Error(allOrdersError.message);

  // All-time totals (matching Laporan Keuangan)
  let totalRevenue = 0;
  let totalTunai = 0;
  let totalNonTunai = 0;
  let totalPiutang = 0;

  // 30-day window for trend/percentage comparison
  let currentRevenue = 0;
  let prevRevenue = 0;
  let currentOrders = 0;
  let prevOrders = 0;
  let currentTunai = 0;
  let currentNonTunai = 0;
  let prevTunai = 0;
  let prevNonTunai = 0;

  allOrders?.forEach(order => {
    // Sum piutang from ALL orders with outstanding balance
    totalPiutang += Number(order.remaining_amount || 0);

    // Order count for trend (30-day window)
    if (order.created_at >= sixtyDaysAgo) {
      if (order.created_at >= thirtyDaysAgo) {
        currentOrders++;
      } else {
        prevOrders++;
      }
    }

    // Sum payments using same logic as Laporan Keuangan
    order.order_payments?.forEach((payment: any) => {
      const isSuccess =
        payment.payment_type === 'TUNAI' ||
        (payment.payment_type === 'NON_TUNAI' &&
          (payment.midtrans_status === 'settlement' ||
            payment.midtrans_status === 'capture' ||
            !payment.midtrans_status));

      if (isSuccess) {
        const amount = Number(payment.amount || 0);

        // All-time totals
        totalRevenue += amount;
        if (payment.payment_type === 'TUNAI') totalTunai += amount;
        else totalNonTunai += amount;

        // 30-day trend breakdown
        if (order.created_at >= sixtyDaysAgo) {
          if (order.created_at >= thirtyDaysAgo) {
            currentRevenue += amount;
            if (payment.payment_type === 'TUNAI') currentTunai += amount;
            else currentNonTunai += amount;
          } else {
            prevRevenue += amount;
            if (payment.payment_type === 'TUNAI') prevTunai += amount;
            else prevNonTunai += amount;
          }
        }
      }
    });
  });

  // Payment distribution percentages based on all-time totals
  const totalAllPayments = totalTunai + totalNonTunai;
  const tunaiPercentage = totalAllPayments > 0 ? (totalTunai / totalAllPayments) * 100 : 0;
  const nonTunaiPercentage = totalAllPayments > 0 ? (totalNonTunai / totalAllPayments) * 100 : 0;

  // QRIS growth: 30-day trend in non-tunai percentage
  const totalCurrPayment = currentTunai + currentNonTunai;
  const currNonTunaiPercentage = totalCurrPayment > 0 ? (currentNonTunai / totalCurrPayment) * 100 : 0;
  const totalPrevPayment = prevTunai + prevNonTunai;
  const prevNonTunaiPercentage = totalPrevPayment > 0 ? (prevNonTunai / totalPrevPayment) * 100 : 0;
  const qrisGrowth = currNonTunaiPercentage - prevNonTunaiPercentage;

  // Revenue trend percentage (30-day vs previous 30-day)
  const revenuePercentage =
    prevRevenue === 0
      ? currentRevenue > 0 ? 100 : 0
      : ((currentRevenue - prevRevenue) / prevRevenue) * 100;

  const ordersPercentage =
    prevOrders === 0
      ? currentOrders > 0 ? 100 : 0
      : ((currentOrders - prevOrders) / prevOrders) * 100;

  // 2. Fetch Active Laundry Count
  const { count: activeLaundryCount, error: activeError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('laundry_status', [LaundryStatus.WAITING_PAYMENT, LaundryStatus.PROCESS, LaundryStatus.WAITING_FOR_PICKUP]);

  if (activeError) throw new Error(activeError.message);

  // 3. Fetch breakdown for processing and waiting
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

  // 4. Fetch customers stats
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

  const customersPercentage =
    prevCustomers === 0
      ? currentCustomers > 0 ? 100 : 0
      : ((currentCustomers - prevCustomers) / prevCustomers) * 100;

  // 5. Fetch chart data (last 6 months)
  const sixMonthsAgoStr = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();

  const { data: chartOrders, error: chartError } = await supabase
    .from('orders')
    .select('paid_amount, created_at')
    .gte('created_at', sixMonthsAgoStr);

  if (chartError) throw new Error(chartError.message);

  const dailyMap = new Map<string, { label: string; value: number }>();
  const weeklyMap = new Map<string, { label: string; value: number }>();
  const monthlyMap = new Map<string, { label: string; value: number }>();

  // Initialize daily map (today, 8 blocks of 3 hours)
  const timeBlocks = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
  timeBlocks.forEach(block => {
    dailyMap.set(block, { label: block, value: 0 });
  });

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

    // Daily match (only for today)
    if (orderDate.toDateString() === now.toDateString()) {
      const hour = orderDate.getHours();
      const blockIndex = Math.floor(hour / 3);
      if (blockIndex >= 0 && blockIndex < timeBlocks.length) {
        const blockKey = timeBlocks[blockIndex];
        if (dailyMap.has(blockKey)) {
          dailyMap.get(blockKey)!.value += amount;
        }
      }
    }

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

  return {
    revenue: {
      current: totalRevenue,
      percentage: revenuePercentage,
    },
    orders: {
      current: currentOrders,
      percentage: ordersPercentage,
      processing: processingCount,
      waiting: waitingCount,
    },
    customers: {
      total: totalCustomersCount || 0,
      newThisMonth: currentCustomers,
      percentage: customersPercentage,
    },
    activeLaundry: activeLaundryCount || 0,
    unpaidAmount: totalPiutang,
    chartData: {
      daily: Array.from(dailyMap.values()),
      weekly: Array.from(weeklyMap.values()),
      monthly: Array.from(monthlyMap.values()),
    },
    paymentDistribution: {
      tunai: { amount: totalTunai, percentage: tunaiPercentage },
      nonTunai: { amount: totalNonTunai, percentage: nonTunaiPercentage },
      qrisGrowth,
    },
  };
};
