"use client";

import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/config/api';
import type { Website } from '@/types/website';

interface WebsiteModalProps {
  show: boolean;
  onHide: () => void;
  onSave: () => void;
  website: Website | null;
}

export default function WebsiteModal({
  show,
  onHide,
  onSave,
  website
}: WebsiteModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    game_url: '',
    icon: '',
    status: 1,
    index_status: 0,
    category_id: '',
    is_featured: false
  });

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]); // Initialize as empty array
  const { fetchData, loading, post, put, get } = useApi();

  useEffect(() => {
    if (website) {
      setFormData({
        name: website.name,
        url: website.url,
        game_url: website.game_url || '',
        icon: website.icon || '',
        status: website.status,
        index_status: website.index_status || 0,
        category_id: website.category_id || '',
        is_featured: website.is_featured || false
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
  }, [website]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await get(API_ENDPOINTS.categories);
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          icon: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let iconUrl = formData.icon;

      // Upload icon if new file is selected
      if (iconFile) {
        const formData = new FormData();
        formData.append('file', iconFile);
        const uploadResponse = await fetchData('/files', {
          method: 'POST',
          body: formData
        });
        iconUrl = uploadResponse.url;
      }

      const submitData = {
        ...formData,
        icon: iconUrl
      };

      if (website) {
        await put(API_ENDPOINTS.website(website.id), submitData);
      } else {
        await post(API_ENDPOINTS.websites, submitData);
      }
      onSave();
      onHide();
    } catch (error) {
      console.error('Error saving website:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {website ? 'Edit Website' : 'Add New Website'}
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
            <Form.Label>URL</Form.Label>
            <Form.Control
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Game URL</Form.Label>
            <Form.Control
              type="url"
              value={formData.game_url}
              onChange={(e) => setFormData({...formData, game_url: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Icon URL</Form.Label>
            <Form.Control
              type="url"
              value={formData.icon}
              onChange={(e) => setFormData({...formData, icon: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: Number(e.target.value)})}
            >
              <option value={1}>Online</option>
              <option value={0}>Offline</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Google Index Status</Form.Label>
            <Form.Select
              value={formData.index_status}
              onChange={(e) => setFormData({...formData, index_status: Number(e.target.value)})}
            >
              <option value={0}>Not Indexed</option>
              <option value={1}>Indexed</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={formData.category_id}
              onChange={(e) => setFormData({...formData, category_id: e.target.value})}
            >
              <option value="">Select Category</option>
              {categories && categories.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Feature Game"
              checked={formData.is_featured}
              onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
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