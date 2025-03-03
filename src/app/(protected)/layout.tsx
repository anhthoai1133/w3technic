'use client'

import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Protected layout session:', session)
    }
    checkSession()
  }, [])

  return (
    <div className="min-h-screen">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Header />
          {children}
        </main>
      </div>
    </div>
  )
}