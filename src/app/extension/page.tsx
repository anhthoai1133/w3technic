"use client";

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import PageLayout from '@/components/layout/PageLayout';
import CustomDataTable from '@/components/common/CustomDataTable';
import ExtensionModal from '@/components/extension/ExtensionModal';
import { API_ENDPOINTS } from '@/config/api';
import type { Extension } from '@/types/extension';
import { TableColumn } from 'react-data-table-component';

export default function ExtensionPage() {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedExtension, setSelectedExtension] = useState<Extension | null>(null);
  const { fetchData, loading } = useApi();

  const columns: TableColumn<Extension>[] = [
    { 
      name: 'ID',
      selector: (row: Extension) => row.id,
      sortable: true,
      width: '70px'
    },
    { 
      name: 'Name',
      selector: (row: Extension) => row.name,
      sortable: true
    },
    { 
      name: 'Version',
      selector: (row: Extension) => row.version || '-',
      sortable: true
    },
    {
      name: 'Status',
      cell: (row: Extension) => (
        <span className={`badge ${row.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
          {row.status}
        </span>
      ),
      sortable: true
    },
    { 
      name: 'Last Updated',
      selector: (row: Extension) => row.last_updated || '-',
      sortable: true
    },
    { 
      name: 'Website URL',
      cell: (row: Extension) => (
        <a 
          href={row.website_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {row.website_url}
        </a>
      )
    },
    { 
      name: 'Extension URL',
      cell: (row: Extension) => (
        <a 
          href={row.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {row.url}
        </a>
      )
    },
    { 
      name: 'Users',
      selector: (row: Extension) => row.users || 0,
      sortable: true
    },
    {
      name: 'Actions',
      cell: (row: Extension) => (
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

  useEffect(() => {
    fetchExtensions();
  }, []);

  const fetchExtensions = async () => {
    try {
      const data = await fetchData(API_ENDPOINTS.extensions);
      setExtensions(data);
    } catch (error) {
      console.error('Error fetching extensions:', error);
    }
  };

  const handleEdit = (extension: Extension) => {
    setSelectedExtension(extension);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this extension?')) {
      try {
        await fetchData(`${API_ENDPOINTS.extensions}/${id}`, {
          method: 'DELETE'
        });
        fetchExtensions();
      } catch (error) {
        console.error('Error deleting extension:', error);
      }
    }
  };

  const actions = (
    <>
      <button 
        className="btn btn-primary"
        onClick={() => {
          setSelectedExtension(null);
          setShowModal(true);
        }}
      >
        <i className="fas fa-plus me-2"></i>
        Add New Extension
      </button>
      <button className="btn btn-secondary">
        <i className="fas fa-file-export me-2"></i>
        Export
      </button>
    </>
  );

  return (
    <PageLayout 
      title="Extension Management"
      actions={actions}
    >
      <CustomDataTable
        columns={columns}
        data={extensions}
        loading={loading}
      />

      <ExtensionModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={fetchExtensions}
        extension={selectedExtension}
      />
    </PageLayout>
  );
} 