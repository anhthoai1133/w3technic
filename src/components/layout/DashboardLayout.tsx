"use client";

import { ReactNode } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar />
        <main className="col-11 ms-sm-auto col-lg-11 px-md-4 content">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">{title}</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
} 