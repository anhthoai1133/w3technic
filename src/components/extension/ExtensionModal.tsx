"use client";

import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useApi } from '@/hooks/useApi';

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

interface ExtensionModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (extensionData: Partial<Extension>) => Promise<void>;
  extension: Extension | null;
}

export default function ExtensionModal({ show, onHide, onSave, extension }: ExtensionModalProps) {
  const [formData, setFormData] = useState<Partial<Extension>>({
    name: '',
    version: '',
    status: 'Inactive',
    website_url: '',
    extension_url: '',
    users: 0
  });

  const { loading } = useApi();

  useEffect(() => {
    if (extension) {
      setFormData({
        name: extension.name,
        version: extension.version,
        status: extension.status,
        website_url: extension.website_url,
        extension_url: extension.extension_url,
        users: extension.users
      });
    } else {
      setFormData({
        name: '',
        version: '',
        status: 'Inactive',
        website_url: '',
        extension_url: '',
        users: 0
      });
    }
  }, [extension]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await onSave(formData);
      onHide();
    } catch (error) {
      console.error('Error saving extension:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{extension ? 'Edit Extension' : 'Add New Extension'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Version</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({...formData, version: e.target.value})}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Users</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.users}
                  onChange={(e) => setFormData({...formData, users: parseInt(e.target.value) || 0})}
                  required
                />
              </Form.Group>
            </div>
          </div>

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
            <Form.Label>Extension URL</Form.Label>
            <Form.Control
              type="url"
              value={formData.extension_url}
              onChange={(e) => setFormData({...formData, extension_url: e.target.value})}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
} 