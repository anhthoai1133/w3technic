"use client";

import { Modal, Button } from 'react-bootstrap';

interface Log {
  id: number;
  level: string;
  message: string;
  context: string;
  timestamp: string;
  source: string;
  user_id?: string;
  user_email?: string;
  ip_address: string;
  user_agent: string;
}

interface LogModalProps {
  show: boolean;
  onHide: () => void;
  log: Log | null;
}

export default function LogModal({ show, onHide, log }: LogModalProps) {
  if (!log) return null;

  // Parse context if it's a JSON string
  let contextData = log.context;
  try {
    if (typeof log.context === 'string') {
      contextData = JSON.parse(log.context);
    }
  } catch (e) {
    // If parsing fails, use the original string
    contextData = log.context;
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <span className={`badge bg-${getLevelBadgeClass(log.level)} me-2`}>
            {log.level}
          </span>
          Log Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <strong>ID:</strong> {log.id}
        </div>
        
        <div className="mb-3">
          <strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}
        </div>
        
        <div className="mb-3">
          <strong>Source:</strong> {log.source || 'N/A'}
        </div>
        
        <div className="mb-3">
          <strong>User:</strong> {log.user_email || 'N/A'}
        </div>

        <div className="mb-3">
          <strong>Message:</strong>
          <div className="p-3 bg-light rounded mt-2">
            {log.message}
          </div>
        </div>

        <div>
          <strong>Context:</strong>
          <pre className="p-3 bg-light rounded mt-2 overflow-auto" style={{ maxHeight: '300px' }}>
            {typeof contextData === 'object' 
              ? JSON.stringify(contextData, null, 2) 
              : contextData}
          </pre>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function getLevelBadgeClass(level: string): string {
  switch(level.toLowerCase()) {
    case 'error':
      return 'danger';
    case 'warning':
      return 'warning';
    case 'info':
      return 'info';
    case 'debug':
      return 'primary';
    default:
      return 'secondary';
  }
} 