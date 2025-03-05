"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  
  const menuItems = [
    { href: "/web", icon: "globe", label: "Web" },
    { href: "/error", icon: "exclamation-triangle", label: "Error" },
    { href: "/extension", icon: "puzzle-piece", label: "Extensions" },
    { href: "/games", icon: "gamepad", label: "Games" },
    { href: "/cloudarcade", icon: "code", label: "Cloudarcade JSON" },
    { href: "/logs", icon: "clipboard-list", label: "System Logs" },
  ];

  return (
    <div className="position-sticky pt-3">
      <ul className="nav flex-column">
        {menuItems.map((item) => (
          <li key={item.href} className="nav-item">
            <Link 
              href={item.href}
              className={`nav-link text-white py-2 px-3 ${pathname === item.href ? 'active' : ''}`}
            >
              <i className={`fas fa-${item.icon} fa-fw me-2`}></i>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
} 