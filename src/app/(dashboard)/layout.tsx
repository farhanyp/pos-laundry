import { Sidebar } from '@/components/layout/Sidebar'
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="bg-background text-on-surface">
        <Sidebar />
        <main className="ml-64 min-h-screen">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
