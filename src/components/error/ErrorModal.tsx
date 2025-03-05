"use client";

import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { dataService } from '@/services/dataService';


interface ErrorModalProps {
  show: boolean;
  onHide: () => void;
  onSave: () => void;
  error: any;
}

export default function ErrorModal({
  show,
  onHide,
  onSave,
  error
}: ErrorModalProps) {
  const [websites, setWebsites] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    website_id: '',
    error_message: '',
    error_type: '',
    error_url: '',
    status: 0,
    solution: '',
    notes: ''
  });

  useEffect(() => {
    if (show) {
      fetchWebsites();
      if (error) {
        setFormData({
          website_id: error.website_id || '',
          error_message: error.error_message || '',
          error_type: error.error_type || '',
          error_url: error.error_url || '',
          status: error.status || 0,
          solution: error.solution || '',
          notes: error.notes || ''
        });
      } else {
        setFormData({
          website_id: '',
          error_message: '',
          error_type: '',
          error_url: '',
          status: 0,
          solution: '',
          notes: ''
        });
      }
    }
  }, [show, error]);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const data = await dataService.getWebsites();
      setWebsites(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching websites:', error);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const submitData = {
        ...formData,
        status: Number(formData.status)
      };
      
      if (error) {
        await dataService.updateError(error.id, submitData);
      } else {
        await dataService.createError(submitData);
      }
      
      onSave();
      setLoading(false);
    } catch (err) {
      console.error('Error saving error log:', err);
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{error ? 'Edit Error Log' : 'Add Error Log'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Website</Form.Label>
            <Form.Select 
              name="website_id"
              value={formData.website_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Website</option>
              {websites.map((website: any) => (
                <option key={website.id} value={website.id}>
                  {website.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Error Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="error_message"
              value={formData.error_message}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Error Type</Form.Label>
            <Form.Control
              type="text"
              name="error_type"
              value={formData.error_type}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Error URL</Form.Label>
            <Form.Control
              type="text"
              name="error_url"
              value={formData.error_url}
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
              <option value="0">Open</option>
              <option value="1">In Progress</option>
              <option value="2">Resolved</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Solution</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="solution"
              value={formData.solution}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
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