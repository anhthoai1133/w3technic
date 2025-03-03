"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from '@/lib/supabase'

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter()
  const menuItems = [
    { href: "/web", icon: "globe", label: "Web" },
    { href: "/error", icon: "exclamation-triangle", label: "Error" },
    { href: "/extension", icon: "puzzle-piece", label: "Extensions" },
    { href: "/games", icon: "gamepad", label: "Games" },
    { href: "/cloudarcade", icon: "code", label: "Cloudarcade JSON" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="col-auto bg-dark sidebar">
      <div className="position-sticky">
        <ul className="nav flex-column">
          {menuItems.map((item) => (
            <li key={item.href} className="nav-item">
              <Link 
                href={item.href}
                className={`nav-link text-white py-2 px-3 ${pathname === item.href ? 'active' : ''}`}
              >
                <i className={`fas fa-${item.icon} fa-fw`}></i>
                <span className="ms-2 d-none d-md-inline">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto p-4">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
} 