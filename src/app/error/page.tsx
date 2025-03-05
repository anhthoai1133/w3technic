"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CustomDataTable from '@/components/common/CustomDataTable';
import { TableColumn } from 'react-data-table-component';
import ErrorModal from '@/components/error/ErrorModal';
import { Button } from 'react-bootstrap';
import { dataService } from '@/services/dataService';

interface Error {
  id: number;
  website_id: number;
  website_name: string;
  error_message: string;
  error_type: string;
  error_url: string;
  status: number;
  solution: string;
  notes: string;
  created_at: string;
}

export default function ErrorPage() {
  const [errors, setErrors] = useState<Error[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedError, setSelectedError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchErrors();
  }, []);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const data = await dataService.getErrors();
      setErrors(data);
    } catch (error) {
      console.error('Error fetching error logs:', error);
      setErrors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (error: Error) => {
    setSelectedError(error);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this error log?')) {
      setLoading(true);
      try {
        await dataService.deleteError(id);
        await fetchErrors();
      } catch (error) {
        console.error('Error deleting error log:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all error logs?')) {
      setLoading(true);
      try {
        await dataService.clearAllLogs();
        await fetchErrors();
      } catch (error) {
        console.error('Error clearing error logs:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    await fetchErrors();
    setShowModal(false);
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="badge bg-danger">Open</span>;
      case 1:
        return <span className="badge bg-warning">In Progress</span>;
      case 2:
        return <span className="badge bg-success">Resolved</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const columns: TableColumn<Error>[] = [
    {
      name: 'ID',
      selector: (row: Error) => row.id,
      sortable: true,
      width: '70px'
    },
    {
      name: 'Website',
      selector: (row: Error) => row.website_name || 'N/A',
      sortable: true
    },
    {
      name: 'Error Type',
      selector: (row: Error) => row.error_type,
      sortable: true
    },
    {
      name: 'Error Message',
      selector: (row: Error) => row.error_message,
      sortable: true,
      wrap: true,
      cell: (row: Error) => (
        <div className="text-truncate" style={{ maxWidth: '300px' }}>
          {row.error_message}
        </div>
      )
    },
    {
      name: 'Status',
      selector: (row: Error) => row.status,
      sortable: true,
      cell: (row: Error) => getStatusBadge(row.status)
    },
    {
      name: 'Created At',
      selector: (row: Error) => row.created_at,
      sortable: true,
      format: (row: Error) => new Date(row.created_at).toLocaleString()
    },
    {
      name: 'Actions',
      cell: (row: Error) => (
        <div className="d-flex gap-2">
          <button 
            className="btn btn-sm btn-primary"
            onClick={() => handleEdit(row)}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button 
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(row.id)}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      ),
      width: '120px'
    }
  ];

  return (
    <DashboardLayout title="Error Logs">
      <div className="mb-3 d-flex justify-content-between">
        <Button variant="primary" onClick={() => { setSelectedError(null); setShowModal(true); }}>
          Add New Error Log
        </Button>
        <Button variant="danger" onClick={handleClearAll}>
          Clear All Logs
        </Button>
      </div>
      
      <CustomDataTable
        columns={columns}
        data={errors}
        loading={loading}
        pagination
        buttons={{
          copy: true,
          csv: true,
          excel: true,
          pdf: true,
          print: true
        }}
      />
      
      <ErrorModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleSave}
        error={selectedError}
      />
    </DashboardLayout>
  );
} 