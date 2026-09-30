'use client'

import AdminPanel from '@/components/admin/admin-panel'
import { AuthProvider } from '@/hooks/use-auth'

export default function AdminPage() {
  return (
    <AuthProvider>
      <div className="dark">
        <AdminPanel />
      </div>
    </AuthProvider>
  )
}
