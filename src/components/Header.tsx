"use client";

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="navbar navbar-dark flex-md-nowrap p-0 shadow">
      {isMobile && (
        <button
          className="navbar-toggler d-md-none"
          type="button"
          onClick={onToggleSidebar}
          aria-controls="sidebarMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
      )}
      
      <a className="navbar-brand col-md-3 col-lg-2 me-0 px-3 fs-6" href="#">
        {isMobile ? "W3" : "Website Management"}
      </a>
      
      <div className="navbar-nav ms-auto">
        <div className="nav-item text-nowrap">
          <button 
            className="nav-link px-3 btn btn-link" 
            onClick={handleLogout}
          >
            {isMobile ? <i className="fas fa-sign-out-alt"></i> : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  );
} 