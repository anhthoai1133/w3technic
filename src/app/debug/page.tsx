"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugPage() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setError(error.message);
        } else {
          setSessionData(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  return (
    <div className="container p-4">
      <h1>Debug Page</h1>
      
      <div className="card mb-4">
        <div className="card-header">Session Status</div>
        <div className="card-body">
          {loading ? (
            <p>Loading session data...</p>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <pre>{JSON.stringify(sessionData, null, 2)}</pre>
          )}
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-header">Environment Variables</div>
        <div className="card-body">
          <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</p>
          <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Not set'}</p>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">Actions</div>
        <div className="card-body">
          <button 
            className="btn btn-primary me-2"
            onClick={async () => {
              try {
                const { error } = await supabase.auth.signOut();
                if (error) {
                  setError(error.message);
                } else {
                  window.location.href = '/login';
                }
              } catch (err: any) {
                setError(err.message);
              }
            }}
          >
            Sign Out
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/login'}
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
} 