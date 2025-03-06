'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function RouterHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Lưu trạng thái sidebar vào sessionStorage khi chuyển trang
    const handleBeforeRouteChange = () => {
      const desktopSidebarState = localStorage.getItem('desktopSidebarOpen');
      if (desktopSidebarState) {
        sessionStorage.setItem('__sidebar_state', desktopSidebarState);
      }
    };

    // Đăng ký sự kiện
    window.addEventListener('beforeunload', handleBeforeRouteChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeRouteChange);
    };
  }, []);

  // Theo dõi thay đổi đường dẫn
  useEffect(() => {
    // Đánh dấu đã chuyển trang
    document.documentElement.classList.add('route-changed');
    
    // Xóa class sau khi hoàn tất
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('route-changed');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return null;
} 