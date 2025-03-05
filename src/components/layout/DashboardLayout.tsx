"use client";

import { ReactNode, useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  // Sử dụng 2 cờ riêng biệt cho desktop và mobile
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // Mặc định là mobile để tránh nhấp nháy
  const [isInitialized, setIsInitialized] = useState(false);
  const initialRenderRef = useRef(true);

  // Khôi phục trạng thái desktop sidebar từ localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDesktopState = localStorage.getItem('desktopSidebarOpen');
      const isMobileView = window.innerWidth < 768;
      
      // Đặt trạng thái mobile trước
      setIsMobile(isMobileView);
      
      // Chỉ đặt trạng thái desktop nếu không phải mobile
      if (!isMobileView) {
        if (savedDesktopState !== null) {
          setDesktopSidebarOpen(savedDesktopState === 'true');
        }
      }
      
      // Đánh dấu đã khởi tạo
      setIsInitialized(true);
      initialRenderRef.current = false;
    }
  }, []);

  // Lưu trạng thái desktop sidebar vào localStorage
  useEffect(() => {
    if (!initialRenderRef.current && !isMobile) {
      localStorage.setItem('desktopSidebarOpen', String(desktopSidebarOpen));
    }
  }, [desktopSidebarOpen, isMobile]);

  // Xử lý thay đổi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (mobile !== isMobile) {
        setIsMobile(mobile);
        
        // Đảm bảo mobile sidebar luôn đóng khi chuyển sang mobile
        if (mobile) {
          setMobileSidebarOpen(false);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Thêm class vào body khi mobile sidebar mở
  useEffect(() => {
    if (isMobile && mobileSidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isMobile, mobileSidebarOpen]);

  // Đóng mobile sidebar khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && mobileSidebarOpen) {
        const sidebar = document.querySelector('.sidebar');
        const header = document.querySelector('.navbar-toggler');
        
        if (sidebar && 
            !sidebar.contains(event.target as Node) && 
            header && 
            !header.contains(event.target as Node)) {
          setMobileSidebarOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, mobileSidebarOpen]);

  // Toggle sidebar dựa vào chế độ hiện tại
  const toggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setDesktopSidebarOpen(!desktopSidebarOpen);
    }
  };

  // Đóng mobile sidebar khi click vào overlay
  const handleOverlayClick = () => {
    if (mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  };

  // Xác định trạng thái sidebar hiện tại dựa vào chế độ
  const sidebarOpen = isMobile ? mobileSidebarOpen : desktopSidebarOpen;

  // Thêm class CSS để ngăn nhấp nháy
  const sidebarClass = `sidebar ${sidebarOpen ? 'show' : 'hidden'} ${isMobile ? 'mobile' : 'desktop'}`;

  return (
    <div className="dashboard-container">
      {/* Chỉ hiển thị khi đã khởi tạo xong */}
      <div className={isInitialized ? 'initialized' : 'not-initialized'}>
        <div className="header">
          <Header onToggleSidebar={toggleSidebar} />
        </div>
        
        {/* Overlay chỉ hiển thị ở mobile khi sidebar mở */}
        <div 
          className={`sidebar-overlay ${isMobile && mobileSidebarOpen ? 'show' : ''}`} 
          onClick={handleOverlayClick}
        ></div>
        
        <div className="content-wrapper">
          <div className={sidebarClass}>
            <Sidebar />
          </div>
          
          <main className="main-content">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h1 className="h2">{title}</h1>
            </div>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
} 