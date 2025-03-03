"use client";

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import PageLayout from '@/components/layout/PageLayout';
import CustomDataTable from '@/components/common/CustomDataTable';
import WebsiteModal from '@/components/web/WebsiteModal';
import { API_ENDPOINTS } from '@/config/api';
import type { Website } from '@/types/website';
import { TableColumn } from 'react-data-table-component';
import { mockWebsites } from '@/mocks/data';

// Thêm interface FormData
interface FormData {
  name: string;
  url: string;
  game_url: string;
  icon: string;
  status: number;
  index_status: number;
  category_id: string;
  is_featured: boolean;
}

export default function WebPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const { fetchData, loading } = useApi();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    url: '',
    game_url: '',
    icon: '',
    status: 1,
    index_status: 0, 
    category_id: '',
    is_featured: false
  });

  const columns: TableColumn<Website>[] = [
    { 
      name: 'ID',
      selector: (row: Website) => row.id,
      sortable: true,
      width: '70px'
    },
    {
      name: 'Icon',
      cell: (row: Website) => (
        <img 
          src={row.icon || '/placeholder-icon.png'} 
          alt={row.name}
          className="w-8 h-8 rounded"
        />
      ),
      width: '80px'
    },
    { 
      name: 'Name',
      selector: (row: Website) => row.name,
      sortable: true
    },
    {
      name: 'URL',
      cell: (row: Website) => (
        <a href={row.url} target="_blank" rel="noopener noreferrer">
          {row.url}
        </a>
      )
    },
    {
      name: 'Status',
      cell: (row: Website) => (
        <span className={`badge ${row.status === 1 ? 'bg-success' : 'bg-danger'}`}>
          {row.status === 1 ? 'Active' : 'Inactive'}
        </span>
      ),
      sortable: true,
      width: '100px'
    },
    {
      name: 'Actions',
      cell: (row: Website) => (
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
    // Tạm thời dùng mock data
    setWebsites(mockWebsites);
  }, []);

  useEffect(() => {
    if (selectedWebsite) {
      setFormData({
        name: selectedWebsite.name,
        url: selectedWebsite.url,
        game_url: selectedWebsite.game_url || '',
        icon: selectedWebsite.icon || '',
        status: selectedWebsite.status,
        index_status: selectedWebsite.index_status,
        category_id: selectedWebsite.category_id,
        is_featured: selectedWebsite.is_featured
      });
    } else {
      setFormData({
        name: '',
        url: '',
        game_url: '',
        icon: '',
        status: 1,
        index_status: 0,
        category_id: '',
        is_featured: false
      });
    }
  }, [selectedWebsite]);

  const fetchWebsites = async () => {
    try {
      const data = await fetchData(API_ENDPOINTS.websites);
      setWebsites(data);
    } catch (error) {
      console.error('Error fetching websites:', error);
    }
  };

  const handleEdit = (website: Website) => {
    setSelectedWebsite(website);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this website?')) {
      try {
        await fetchData(`${API_ENDPOINTS.websites}/${id}`, {
          method: 'DELETE'
        });
        fetchWebsites();
      } catch (error) {
        console.error('Error deleting website:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedWebsite) {
        await fetchData(`${API_ENDPOINTS.websites}/${selectedWebsite.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await fetchData(API_ENDPOINTS.websites, {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      fetchWebsites();
      setShowModal(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const actions = (
    <button 
      className="btn btn-primary"
      onClick={() => {
        setSelectedWebsite(null);
        setShowModal(true);
      }}
    >
      <i className="fas fa-plus me-2"></i>
      Add New Website
    </button>
  );

  return (
    <PageLayout 
      title="Website Management"
      actions={actions}
    >
      <CustomDataTable
        columns={columns}
        data={websites}
        loading={loading}
        buttons={{
          copy: true,
          csv: true,
          excel: true,
          pdf: true,
          print: true
        }}
      />

      <WebsiteModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={fetchWebsites}
        website={selectedWebsite}
      />
    </PageLayout>
  );
} 