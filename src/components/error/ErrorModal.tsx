"use client";

import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/config/api';
import type { Error } from '@/types/error';

interface ErrorModalProps {
  show: boolean;
  onHide: () => void;
  onSave: () => void;
  error: Error | null;
}

export default function ErrorModal({
  show,
  onHide,
  onSave,
  error
}: ErrorModalProps) {
  const { fetchData, loading, put, post, get } = useApi();
  const [websites, setWebsites] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [formData, setFormData] = useState({
    website: '',
    description: '',
    status: 'Pending'
  });

  // Fetch websites on mount
  useEffect(() => {
    fetchWebsites();
  }, []);

  // Update form data when error changes
  useEffect(() => {
    if (error) {
      setFormData({
        website: error.website_name,
        description: error.description,
        status: error.status
      });
    } else {
      setFormData({
        website: '',
        description: '',
        status: 'Pending'
      });
    }
  }, [error]);

  const fetchWebsites = async () => {
    try {
      const data = await get(API_ENDPOINTS.websites);
      setWebsites(data);
    } catch (error) {
      console.error('Error fetching websites:', error);
      setWebsites([]);
    }
  };

  const handleWebsiteSearch = (value: string) => {
    const filtered = websites.filter((website: any) => 
      website.name.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        id: error?.id
      };
      
      if (error) {
        await put(API_ENDPOINTS.error_log(error.id), submitData);
      } else {
        await post(API_ENDPOINTS.error_logs, submitData);
      }
      
      onSave();
      onHide();
    } catch (err) {
      console.error('Error saving error:', err);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {error ? 'Edit Error' : 'Report New Error'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Website</Form.Label>
            <div className="position-relative">
              <Form.Control
                type="text"
                value={formData.website}
                onChange={(e) => {
                  setFormData({...formData, website: e.target.value});
                  handleWebsiteSearch(e.target.value);
                }}
                required
              />
              {suggestions.length > 0 && (
                <div className="position-absolute w-100 bg-white border rounded mt-1 z-50">
                  {suggestions.map((website: any) => (
                    <div
                      key={website.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setFormData({...formData, website: website.name});
                        setSuggestions([]);
                      }}
                    >
                      {website.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Error Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="Pending">Pending</option>
              <option value="Fixed">Fixed</option>
            </Form.Select>
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