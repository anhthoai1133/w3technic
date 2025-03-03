'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthComponent() {
  const router = useRouter()

  useEffect(() => {
    // Check session khi component mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        window.location.href = '/web'
      }
    }
    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        window.location.href = '/web'
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

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
      onlyThirdPartyProviders={false}
      magicLink={false}
      view="sign_in"
    />
  )
}