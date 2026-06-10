import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { OrderWithDetails } from "@/types/order";
import { formatCurrency, formatDateTime, translatePaymentStatus } from "./utils";

export const generateLaporanPDF = (
  orders: OrderWithDetails[],
  exportStartDate: string,
  exportEndDate: string
) => {
  let dataToExport = orders || [];
  
  if (exportStartDate || exportEndDate) {
    dataToExport = dataToExport.filter((order) => {
      let matchDate = true;
      const orderDate = new Date(order.created_at);

      if (exportStartDate) {
        const start = new Date(exportStartDate);
        start.setHours(0, 0, 0, 0);
        if (orderDate < start) matchDate = false;
      }

      if (exportEndDate) {
        const end = new Date(exportEndDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) matchDate = false;
      }

      return matchDate;
    });
  }

  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text("Laporan Keuangan", 14, 22);

  // Date Range Info
  doc.setFontSize(11);
  let dateText = "Periode: Semua Waktu";
  if (exportStartDate && exportEndDate) {
    dateText = `Periode: ${formatDateTime(exportStartDate)} - ${formatDateTime(exportEndDate)}`;
  } else if (exportStartDate) {
    dateText = `Periode: Sejak ${formatDateTime(exportStartDate)}`;
  } else if (exportEndDate) {
    dateText = `Periode: Hingga ${formatDateTime(exportEndDate)}`;
  }
  doc.text(dateText, 14, 30);

  // Stats
  let totalOmzet = 0;
  let totalPendapatan = 0;
  let totalPiutang = 0;

  dataToExport.forEach((order) => {
    totalOmzet += Number(order.total_amount);
    totalPiutang += Number(order.remaining_amount);
    order.order_payments?.forEach((payment) => {
      const isSuccess =
        payment.payment_type === "TUNAI" ||
        (payment.payment_type === "NON_TUNAI" &&
          (payment.midtrans_status === "settlement" ||
            payment.midtrans_status === "capture" ||
            !payment.midtrans_status));
      if (isSuccess) {
        totalPendapatan += Number(payment.amount);
      }
    });
  });

  doc.text(`Total Omzet: ${formatCurrency(totalOmzet)}`, 14, 40);
  doc.text(`Total Pendapatan: ${formatCurrency(totalPendapatan)}`, 14, 46);
  doc.text(`Total Piutang: ${formatCurrency(totalPiutang)}`, 14, 52);

  // Table
  const tableData = dataToExport.map((order) => [
    formatDateTime(order.created_at),
    order.invoice_no,
    order.customers?.name || "-",
    formatCurrency(order.total_amount),
    formatCurrency(order.paid_amount),
    formatCurrency(order.remaining_amount),
    translatePaymentStatus(order.payment_status),
  ]);

  autoTable(doc, {
    startY: 60,
    head: [
      [
        "Tgl. Pesanan",
        "Invoice",
        "Pelanggan",
        "Total Tagihan",
        "Sudah Dibayar",
        "Sisa Tagihan",
        "Status",
      ],
    ],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save(`Laporan_Keuangan_${new Date().getTime()}.pdf`);
};
