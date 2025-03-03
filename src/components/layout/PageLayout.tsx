"use client";

import { ReactNode } from 'react';

interface PageLayoutProps {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function PageLayout({ title, actions, children }: PageLayoutProps) {
  return (
    <div className="page-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">{title}</h1>
        <div className="d-flex gap-2">
          {actions}
        </div>
      </div>
      {children}
    </div>
  );
} 