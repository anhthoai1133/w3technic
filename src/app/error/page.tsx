"use client";

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import PageLayout from '@/components/layout/PageLayout';
import CustomDataTable from '@/components/common/CustomDataTable';
import ErrorModal from '@/components/error/ErrorModal';
import { API_ENDPOINTS } from '@/config/api';
import type { Error } from '@/types/error';
import { TableColumn } from 'react-data-table-component';

export default function ErrorPage() {
  const [errors, setErrors] = useState<Error[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedError, setSelectedError] = useState<Error | null>(null);
  const { fetchData, loading } = useApi();

  useEffect(() => {
    fetchErrors();
  }, []);

  const columns = [
    { 
      name: 'ID',
      selector: (row: Error) => row.id,
      sortable: true,
      width: '70px'
    },
    { 
      name: 'Website',
      selector: (row: Error) => row.website_name,
      sortable: true
    },
    { 
      name: 'Description',
      selector: (row: Error) => row.description,
      sortable: true
    },
    {
      name: 'Status',
      cell: (row: Error) => (
        <span className={`badge ${row.status === 'Fixed' ? 'bg-success' : 'bg-warning'}`}>
          {row.status}
        </span>
      ),
      width: '100px'
    },
    { 
      name: 'Reported Date',
      selector: (row: Error) => row.reported_date,
      sortable: true
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
      width: '150px'
    }
  ];

  const actions = (
    <button 
      className="btn btn-primary"
      onClick={() => {
        setSelectedError(null);
        setShowModal(true);
      }}
    >
      <i className="fas fa-plus me-2"></i>
      Report New Error
    </button>
  );

  const fetchErrors = async () => {
    try {
      const data = await fetchData(API_ENDPOINTS.errors.list);
      setErrors(data);
    } catch (error) {
      console.error('Error fetching errors:', error);
    }
  };

  const handleEdit = (error: Error) => {
    setSelectedError(error);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this error?')) {
      try {
        await fetchData(`${API_ENDPOINTS.errors}/${id}`, {
          method: 'DELETE'
        });
        fetchErrors();
      } catch (error) {
        console.error('Error deleting error:', error);
      }
    }
  };

  return (
    <PageLayout 
      title="Error Management"
      actions={actions}
    >
      <CustomDataTable
        columns={columns}
        data={errors}
        loading={loading}
      />

      <ErrorModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={fetchErrors}
        error={selectedError}
      />
    </PageLayout>
  );
} 