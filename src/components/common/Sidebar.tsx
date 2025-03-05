"use client";

import React from 'react';
import { Nav } from 'react-bootstrap';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  style?: React.CSSProperties;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, style }) => {
  const pathname = usePathname();
  
  return (
    <div className="sidebar bg-dark text-white" style={style}>
      <Nav className="flex-column pt-2">
        <Nav.Item>
          <Link href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}>
            <i className="fas fa-tachometer-alt me-2"></i> Dashboard
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link href="/web" className={`nav-link ${pathname === '/web' ? 'active' : ''}`}>
            <i className="fas fa-globe me-2"></i> Websites
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link href="/games" className={`nav-link ${pathname === '/games' ? 'active' : ''}`}>
            <i className="fas fa-gamepad me-2"></i> Games
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link href="/logs" className={`nav-link ${pathname === '/logs' ? 'active' : ''}`}>
            <i className="fas fa-list me-2"></i> Logs
          </Link>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default Sidebar; 