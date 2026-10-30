'use client'

import TeacherPanel from '@/components/teacher/teacher-panel'
import { AuthProvider } from '@/hooks/use-auth'

export default function TeacherPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#F3F8FD]">
        <TeacherPanel />
      </div>
    </AuthProvider>
  )
}
