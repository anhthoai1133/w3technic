'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthForm() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [origin, setOrigin] = useState('')
  
  useEffect(() => {
    setMounted(true)
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        router.push('/web')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  if (!mounted) return null

  return (
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
      redirectTo={origin ? `${origin}/auth/callback` : undefined}
    />
  )
}