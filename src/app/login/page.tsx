'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    
    // Kiểm tra session khi component mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Login page session check:', session)
        
        if (session) {
          // Sử dụng window.location thay vì router
          window.location.href = '/web'
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session)
      if (event === 'SIGNED_IN' && session) {
        console.log('Signed in, redirecting to /web')
        // Sử dụng window.location thay vì router
        window.location.href = '/web'
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (!mounted || isLoading) return <div>Loading...</div>

  // Đảm bảo callbackUrl đúng
  const callbackUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/auth/callback`
    : ''

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-[360px] bg-white rounded-lg shadow-sm p-5">
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            style: {
              button: {
                background: '#4F46E5',
                color: 'white',
                padding: '8px',
                borderRadius: '4px',
                fontSize: '14px'
              },
              input: {
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e5e7eb',
                marginBottom: '10px'
              },
              anchor: {
                color: '#4F46E5',
                fontSize: '14px'
              }
            }
          }}
          theme="light"
          providers={['google']}
          redirectTo={callbackUrl}
        />
      </div>
    </div>
  )
}