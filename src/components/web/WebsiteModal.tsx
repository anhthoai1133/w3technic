"use client";

import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { dataService } from '@/services/dataService';
import type { Website, Category } from '@/types/website';

interface WebsiteModalProps {
  show: boolean;
  onHide: () => void;
  onSave: () => Promise<void>;
  website: Website | null;
}

export default function WebsiteModal({
  show,
  onHide,
  onSave,
  website
}: WebsiteModalProps) {
  const [formData, setFormData] = useState<Partial<Website>>({
    name: '',
    url: '',
    game_url: '',
    icon: '',
    status: 1,
    index_status: 1,
    category_id: '',
    is_featured: false,
    description: ''
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [iconPreview, setIconPreview] = useState('');

  useEffect(() => {
    if (show) {
      fetchCategories();
      if (website) {
        setFormData({
          name: website.name,
          url: website.url,
          game_url: website.game_url || '',
          icon: website.icon || '',
          status: website.status,
          index_status: website.index_status,
          category_id: website.category_id,
          is_featured: website.is_featured,
          description: website.description || ''
        });
        setIconPreview(website.icon || '');
      } else {
        resetForm();
      }
    }
  }, [show, website]);

  const fetchCategories = async () => {
    try {
      const data = await dataService.getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      game_url: '',
      icon: '',
      status: 1,
      index_status: 1,
      category_id: '',
      is_featured: false,
      description: ''
    });
    setIconPreview('');
    setValidated(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }
    
    setLoading(true);
    try {
      const submitData = { ...formData };
      
      if (website?.id) {
        await dataService.updateWebsite(website.id, submitData);
      } else {
        await dataService.createWebsite(submitData);
      }
      await onSave();
      onHide();
    } catch (error) {
      console.error('Error saving website:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{website ? 'Edit Website' : 'Add New Website'}</Modal.Title>
      </Modal.Header>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={8}>
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
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Please select a category.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Website URL</Form.Label>
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
            <Form.Label>Game URL (Optional)</Form.Label>
            <Form.Control
              type="url"
              name="game_url"
              value={formData.game_url}
              onChange={handleChange}
            />
          </Form.Group>

          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Icon URL</Form.Label>
                <Form.Control
                  type="url"
                  name="icon"
                  value={formData.icon}
                  onChange={(e) => {
                    handleChange(e);
                    setIconPreview(e.target.value);
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              {iconPreview && (
                <img 
                  src={iconPreview} 
                  alt="Icon Preview" 
                  className="img-thumbnail mt-4" 
                  style={{ maxHeight: '64px', maxWidth: '64px' }}
                  onError={() => setIconPreview('/placeholder-icon.png')}
                />
              )}
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Index Status</Form.Label>
                <Form.Select
                  name="index_status"
                  value={formData.index_status}
                  onChange={handleChange}
                  required
                >
                  <option value={1}>Indexed</option>
                  <option value={0}>Not Indexed</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Featured Website"
              name="is_featured"
              checked={formData.is_featured === true}
              onChange={handleChange}
            />
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
} 