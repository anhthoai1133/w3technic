"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CustomDataTable from '@/components/common/CustomDataTable';
import { TableColumn } from 'react-data-table-component';
import ExtensionModal from '@/components/extension/ExtensionModal';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/config/api';

interface Extension {
  id: number;
  name: string;
  version: string;
  status: string;
  last_updated: string;
  website_url: string;
  extension_url: string;
  users: number;
}

export default function ExtensionPage() {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedExtension, setSelectedExtension] = useState<Extension | null>(null);
  const { fetchData } = useApi();

  useEffect(() => {
    fetchExtensions();
  }, []);

  const fetchExtensions = async () => {
    try {
      setLoading(true);
      const data = await fetchData(API_ENDPOINTS.extensions);
      setExtensions(data);
    } catch (error) {
      console.error('Error fetching extensions:', error);
    } finally {
      setLoading(false);
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
        await fetchExtensions();
      } catch (error) {
        console.error('Error deleting extension:', error);
      }
    }
  };

  const handleSave = async (extensionData: Partial<Extension>): Promise<void> => {
    try {
      if (selectedExtension) {
        await fetchData(`${API_ENDPOINTS.extensions}/${selectedExtension.id}`, {
          method: 'PATCH',
          body: JSON.stringify(extensionData)
        });
      } else {
        await fetchData(API_ENDPOINTS.extensions, {
          method: 'POST',
          body: JSON.stringify(extensionData)
        });
      }
      await fetchExtensions();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving extension:', error);
      throw error;
    }
  };

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
      selector: (row: Extension) => row.version,
      sortable: true,
      width: '100px'
    },
    {
      name: 'Status',
      cell: (row: Extension) => (
        <span className={`badge ${row.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
          {row.status}
        </span>
      ),
      sortable: true,
      width: '100px'
    },
    { 
      name: 'Last Updated',
      selector: (row: Extension) => row.last_updated,
      sortable: true,
      width: '180px'
    },
    {
      name: 'Website URL',
      cell: (row: Extension) => (
        <a href={row.website_url} target="_blank" rel="noopener noreferrer">
          {row.website_url}
        </a>
      ),
      sortable: true
    },
    {
      name: 'Extension URL',
      cell: (row: Extension) => (
        <a href={row.extension_url} target="_blank" rel="noopener noreferrer" className="text-truncate d-block" style={{ maxWidth: '300px' }}>
          {row.extension_url}
        </a>
      ),
      sortable: true
    },
    { 
      name: 'Users',
      selector: (row: Extension) => row.users,
      sortable: true,
      width: '100px'
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

  return (
    <DashboardLayout title="Extension Management">
      <div className="mb-4 d-flex justify-content-end">
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
      </div>
      
      <CustomDataTable
        columns={columns}
        data={extensions}
        loading={loading}
        buttons={{
          copy: true,
          csv: true,
          excel: true,
          pdf: true,
          print: true
        }}
      />

      <ExtensionModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleSave}
        extension={selectedExtension}
      />
    </DashboardLayout>
  );
} 