"use client";

import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { dataService } from '@/services/dataService';
import { Website } from '@/types/website';

interface WebsiteModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (websiteData: Partial<Website>) => Promise<void> | void;
  website: Website | null;
}

export default function WebsiteModal({ show, onHide, website, onSave }: WebsiteModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    category_id: '',
    description: '',
    status: '1',
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (show) {
      fetchCategories();
      if (website) {
        setFormData({
          name: website.name || '',
          url: website.url || '',
          category_id: website.category_id?.toString() || '',
          description: website.description || '',
          status: website.status?.toString() || '1',
        });
      } else {
        resetForm();
      }
    }
  }, [show, website]);

  const fetchCategories = async () => {
    try {
      const data = await dataService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      category_id: '',
      description: '',
      status: '1',
    });
    setValidated(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const form = e.currentTarget as HTMLFormElement;
    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }
    
    setLoading(true);
    try {
      const submitData: Partial<Website> = {
        ...formData,
        status: parseInt(formData.status, 10),
        category_id: formData.category_id
      };
      
      if (website?.id) {
        await dataService.updateWebsite(website.id, submitData);
      } else {
        await dataService.createWebsite(submitData);
      }
      await onSave(submitData);
    } catch (error) {
      console.error('Error saving website:', error);
    } finally {
      setLoading(false);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{website ? 'Edit Website' : 'Add New Website'}</Modal.Title>
      </Modal.Header>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Website Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a website name.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>URL</Form.Label>
            <Form.Control
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid URL.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories && categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Please select a category.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
} 