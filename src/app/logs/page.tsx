"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CustomDataTable from '@/components/common/CustomDataTable';
import { TableColumn } from 'react-data-table-component';
import { Button } from 'react-bootstrap';
import { dataService } from '@/services/dataService';
import LogModal from '@/components/logs/LogModal';

interface Log {
  id: number;
  level: string;
  message: string;
  context: string;
  timestamp: string;
  source: string;
  user_id: string;
  user_email: string;
  ip_address: string;
  user_agent: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dataService.getLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('Failed to load logs. Please try again later.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this log?')) {
      setLoading(true);
      try {
        await dataService.deleteLog(id);
        await fetchLogs();
      } catch (error) {
        console.error('Error deleting log:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      setLoading(true);
      try {
        await dataService.clearLogs();
        await fetchLogs();
      } catch (error) {
        console.error('Error clearing logs:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDetails = (log: Log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const columns: TableColumn<Log>[] = [
    {
      name: 'Level',
      selector: (row: Log) => row.level,
      sortable: true,
      cell: (row: Log) => (
        <span className={`badge bg-${getLevelColor(row.level)}`}>
          {row.level}
        </span>
      ),
      width: '100px'
    },
    {
      name: 'Message',
      selector: (row: Log) => row.message,
      sortable: true,
      wrap: true,
      cell: (row: Log) => (
        <div className="text-truncate" style={{maxWidth: '300px'}}>
          {row.message}
        </div>
      )
    },
    {
      name: 'Source',
      selector: (row: Log) => row.source || 'N/A',
      sortable: true,
      width: '120px'
    },
    {
      name: 'User',
      selector: (row: Log) => row.user_email || 'N/A',
      sortable: true,
      width: '200px'
    },
    {
      name: 'Timestamp',
      selector: (row: Log) => row.timestamp,
      sortable: true,
      format: (row: Log) => new Date(row.timestamp).toLocaleString(),
      width: '180px'
    },
    {
      name: 'Actions',
      cell: (row: Log) => (
        <div className="d-flex gap-2">
          <Button 
            size="sm" 
            variant="info"
            onClick={() => handleViewDetails(row)}
          >
            <i className="fas fa-eye"></i>
          </Button>
          <Button 
            size="sm" 
            variant="danger"
            onClick={() => handleDelete(row.id)}
          >
            <i className="fas fa-trash"></i>
          </Button>
        </div>
      ),
      width: '100px'
    }
  ];

  return (
    <DashboardLayout title="System Logs">
      <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h3 className="m-0">Total Logs: {logs.length}</h3>
        <Button variant="danger" onClick={handleClearAll}>
          <i className="fas fa-trash me-2"></i>
          Clear All Logs
        </Button>
      </div>
      
      {error && (
        <div className="alert alert-danger mb-3">{error}</div>
      )}
      
      <div className="card">
        <div className="card-body">
          <CustomDataTable
            columns={columns}
            data={logs}
            loading={loading}
            pagination
            buttons={{
              csv: true,
              excel: true,
              pdf: true,
              print: true
            }}
          />
        </div>
      </div>

      <LogModal
        show={showModal}
        onHide={() => setShowModal(false)}
        log={selectedLog}
      />
    </DashboardLayout>
  );
}

function getLevelColor(level: string): string {
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