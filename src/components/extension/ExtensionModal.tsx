"use client";

import { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/config/api';
import type { Extension } from '@/types/extension';

interface ExtensionModalProps {
  show: boolean;
  onHide: () => void;
  onSave: () => void;
  extension: Extension | null;
}

export default function ExtensionModal({
  show,
  onHide,
  onSave,
  extension
}: ExtensionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    version: '',
    url: '',
    website_url: '',
    status: 'Active',
    description: ''
  });

  const { fetchData, loading } = useApi();

  useEffect(() => {
    if (extension) {
      setFormData({
        name: extension.name,
        version: extension.version || '',
        url: extension.url || '',
        website_url: extension.website_url || '',
        status: extension.status || 'Active',
        description: extension.description || ''
      });
    } else {
      setFormData({
        name: '',
        version: '',
        url: '',
        website_url: '',
        status: 'Active',
        description: ''
      });
    }
  }, [extension]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (extension) {
        await fetchData(`${API_ENDPOINTS.extensions}/${extension.id}`, {
          method: 'PUT',
          data: formData
        });
      } else {
        await fetchData(API_ENDPOINTS.extensions, {
          method: 'POST',
          data: formData
        });
      }
      onSave();
      onHide();
    } catch (error) {
      console.error('Error saving extension:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {extension ? 'Edit Extension' : 'Add New Extension'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Version</Form.Label>
            <Form.Control
              type="text"
              value={formData.version}
              onChange={(e) => setFormData({...formData, version: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Extension URL</Form.Label>
            <Form.Control
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Website URL</Form.Label>
            <Form.Control
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData({...formData, website_url: e.target.value})}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
} 