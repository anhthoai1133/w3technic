"use client";

import { ReactNode, useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

interface FormModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  children: ReactNode;
  loading?: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function FormModal({
  show,
  onHide,
  title,
  children,
  loading = false,
  onSubmit,
}: FormModalProps) {
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

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      size={isMobile ? undefined : "lg"}
      fullscreen={isMobile ? "sm-down" : undefined}
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <form onSubmit={onSubmit}>
        <Modal.Body className={isMobile ? "p-3" : "p-4"}>
          {children}
        </Modal.Body>
        <Modal.Footer className={isMobile ? "p-2" : "p-3"}>
          <Button variant="secondary" onClick={onHide} size={isMobile ? "sm" : undefined}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading}
            size={isMobile ? "sm" : undefined}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
} 