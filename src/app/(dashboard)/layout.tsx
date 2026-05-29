import { Sidebar } from '@/components/layout/Sidebar'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { OrderDialog } from '@/components/order/order-dialog'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="bg-background text-on-surface">
        <Sidebar />
        <main className="md:ml-64 min-h-screen">
          {children}
        </main>
        <OrderDialog />
      </div>
    </AuthGuard>
  )
}
