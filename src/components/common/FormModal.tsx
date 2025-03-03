"use client";

import { ReactNode } from 'react';
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
  onSubmit
}: FormModalProps) {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <form onSubmit={onSubmit}>
        <Modal.Body>
          {children}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
} 