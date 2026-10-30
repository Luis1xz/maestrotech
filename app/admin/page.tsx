'use client'

import AdminPanel from '@/components/admin/admin-panel'
import { AuthProvider } from '@/hooks/use-auth'

export default function AdminPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#F3F8FD]">
        <AdminPanel />
      </div>
    </AuthProvider>
  )
}
