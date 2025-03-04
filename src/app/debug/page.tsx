"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugPage() {
  const [session, setSession] = useState<any>(null);
  const [cookies, setCookies] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        setSession(data.session);
        setCookies(document.cookie);
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <h1>Debug Page</h1>
      <div className="card mb-4">
        <div className="card-header">Session Status</div>
        <div className="card-body">
          <p>Session: {session ? 'Active' : 'Not active'}</p>
          {session && (
            <div>
              <p>User ID: {session.user.id}</p>
              <p>Email: {session.user.email}</p>
              <p>Expires At: {new Date(session.expires_at * 1000).toString()}</p>
            </div>
          )}
          <button className="btn btn-danger" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Cookies</div>
        <div className="card-body">
          <pre>{cookies}</pre>
        </div>
      </div>
    </div>
  );
} 