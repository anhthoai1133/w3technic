"use client";

import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { dataService } from '@/services/dataService';
import CustomDataTable from '@/components/common/CustomDataTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/navigation';
import WebsiteModal from '@/components/web/WebsiteModal';
import type { Website } from '@/types/website';

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const data = await dataService.getWebsites();
      console.log("Fetched websites:", data); // Debug log
      setWebsites(data || []);
    } catch (error) {
      console.error('Error fetching websites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (website: Website, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedWebsite(website);
    setShowModal(true);
  };

  const handleSave = async (websiteData: Partial<Website>) => {
    await fetchWebsites(); // Refresh data after save
  };

  const handleAddNew = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedWebsite(null);
    setShowModal(true);
  };

  const columns = [
    {
      name: 'ID',
      selector: (row: Website) => row.id,
      sortable: true,
      width: '80px',
    },
    {
      name: 'Icon',
      cell: (row: Website) => (
        <img 
          src={row.icon || '/placeholder-icon.png'} 
          alt={row.name}
          style={{ width: '32px', height: '32px', borderRadius: '4px' }}
        />
      ),
      width: '80px',
    },
    {
      name: 'Name',
      selector: (row: Website) => row.name,
      sortable: true,
    },
    {
      name: 'URL',
      selector: (row: Website) => row.url,
      sortable: true,
      cell: (row: Website) => (
        <a href={row.url} target="_blank" rel="noopener noreferrer">
          {row.url}
        </a>
      ),
    },
    {
      name: 'Status',
      selector: (row: Website) => row.status,
      sortable: true,
      cell: (row: Website) => (
        <span className={`badge bg-${row.status === 1 ? 'success' : 'danger'}`}>
          {row.status === 1 ? 'Active' : 'Inactive'}
        </span>
      ),
      width: '100px',
    },
    {
      name: 'Actions',
      cell: (row: Website) => (
        <div className="d-flex gap-1">
          <button 
            className="btn btn-sm btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row, e);
            }}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button 
            className="btn btn-sm btn-danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      ),
      width: '120px',
      ignoreRowClick: true,
    },
  ];

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this website?')) {
      try {
        await dataService.deleteWebsite(id);
        setWebsites(websites.filter(website => website.id !== id));
      } catch (error) {
        console.error('Error deleting website:', error);
      }
    }
  };

  return (
    <DashboardLayout title="Websites">
      <div className="mb-4">
        <Button 
          variant="primary"
          onClick={handleAddNew}
        >
          <i className="fas fa-plus me-2"></i>
          Add New Website
        </Button>
      </div>

      <CustomDataTable
        columns={columns}
        data={websites}
        loading={loading}
        pagination
        buttons={{
          copy: true,
          csv: true,
          excel: true,
          pdf: true,
          print: true,
        }}
        // onRowClicked={(row) => router.push(`/web/${row.id}`)}
      />

      <WebsiteModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleSave}
        website={selectedWebsite}
      />
    </DashboardLayout>
  );
} 