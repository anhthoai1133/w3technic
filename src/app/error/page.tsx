"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CustomDataTable from '@/components/common/CustomDataTable';
import { TableColumn } from 'react-data-table-component';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/config/api';
import { Button } from 'react-bootstrap';

interface ErrorLog {
  id: number;
  message: string;
  url: string;
  status_code: number;
  browser: string;
  ip_address: string;
  created_at: string;
}

export default function ErrorPage() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { get, delete: deleteApi, loading } = useApi();

  useEffect(() => {
    fetchErrors();
  }, []);

  const fetchErrors = async () => {
    try {
      const data = await get(API_ENDPOINTS.error_logs);
      setErrors(data);
    } catch (error) {
      console.error('Error fetching error logs:', error);
      setErrors([]);
    }
  };

  const columns: TableColumn<ErrorLog>[] = [
    { 
      name: 'ID',
      selector: (row: ErrorLog) => row.id,
      sortable: true,
      width: '70px'
    },
    { 
      name: 'Message',
      selector: (row: ErrorLog) => row.message,
      sortable: true
    },
    {
      name: 'URL',
      cell: (row: ErrorLog) => (
        <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-truncate d-block" style={{ maxWidth: '250px' }}>
          {row.url}
        </a>
      ),
      sortable: true
    },
    { 
      name: 'Status Code',
      selector: (row: ErrorLog) => row.status_code,
      sortable: true,
      width: '120px'
    },
    { 
      name: 'Browser',
      selector: (row: ErrorLog) => row.browser,
      sortable: true
    },
    { 
      name: 'IP Address',
      selector: (row: ErrorLog) => row.ip_address,
      sortable: true
    },
    { 
      name: 'Created At',
      selector: (row: ErrorLog) => row.created_at,
      sortable: true
    },
    {
      name: 'Actions',
      cell: (row: ErrorLog) => (
        <div className="d-flex gap-2">
          <button 
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(row.id)}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      ),
      width: '100px'
    }
  ];

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this error log?')) {
      try {
        await deleteApi(API_ENDPOINTS.error_log(id));
        await fetchErrors();
      } catch (error) {
        console.error('Error deleting error log:', error);
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all error logs?')) {
      try {
        await get(API_ENDPOINTS.error_logs, {
          method: 'DELETE'
        });
        await fetchErrors();
      } catch (error) {
        console.error('Error clearing error logs:', error);
      }
    }
  };

  const handleQuickSelect = (days: number) => {
    if (typeof window !== 'undefined') {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - days);
      
      setEndDate(end.toISOString().split('T')[0]);
      setStartDate(start.toISOString().split('T')[0]);
    }
  };

  const handleFilter = () => {
    // Implement filtering logic here
    alert(`Filtering errors from ${startDate} to ${endDate}`);
  };

  return (
    <DashboardLayout title="Error Logs">
      <div className="card mb-4">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Start Date:</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">End Date:</label>
              <input
                type="date" 
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Quick Select:</label>
              <div className="btn-group w-100">
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleQuickSelect(0)}
                >
                  Today
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleQuickSelect(7)}
                >
                  Last 7 Days
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleQuickSelect(30)}
                >
                  Last 30 Days
                </button>
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-between">
            <button 
              className="btn btn-primary"
              onClick={handleFilter}
            >
              <i className="fas fa-filter me-2"></i>
              Filter
            </button>
            <button 
              className="btn btn-danger"
              onClick={handleClearAll}
            >
              <i className="fas fa-trash me-2"></i>
              Clear All Errors
            </button>
          </div>
        </div>
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
    </DashboardLayout>
  );
} 