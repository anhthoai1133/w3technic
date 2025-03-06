"use client";

import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { dataService } from '@/services/dataService';
import type { Game, Category } from '@/types/game';

interface GameModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (gameData: Partial<Game>) => Promise<void>;
  game: Game | null;
}

export default function GameModal({
  show,
  onHide,
  onSave,
  game
}: GameModalProps) {
  const [formData, setFormData] = useState<Partial<Game>>({
    name: '',
    gameplay_url: '',
    category_id: '',
    game_source: '',
    game_thumbnail: '',
    game_desc: '',
    game_instruction: '',
    developer: '',
    published_year: new Date().getFullYear(),
    meta_desc: '',
    meta_title: '',
    status: 1
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  useEffect(() => {
    if (show) {
      fetchCategories();
      if (game) {
        setFormData({
          name: game.name,
          gameplay_url: game.gameplay_url,
          category_id: game.category_id,
          game_source: game.game_source || '',
          game_thumbnail: game.game_thumbnail || '',
          game_desc: game.game_desc || '',
          game_instruction: game.game_instruction || '',
          developer: game.developer || '',
          published_year: game.published_year || new Date().getFullYear(),
          meta_desc: game.meta_desc || '',
          meta_title: game.meta_title || '',
          status: game.status
        });
        setThumbnailPreview(game.game_thumbnail || '');
      } else {
        resetForm();
      }
    }
  }, [show, game]);

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
      gameplay_url: '',
      category_id: '',
      game_source: '',
      game_thumbnail: '',
      game_desc: '',
      game_instruction: '',
      developer: '',
      published_year: new Date().getFullYear(),
      meta_desc: '',
      meta_title: '',
      status: 1
    });
    setThumbnailPreview('');
    setValidated(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Tự động tạo URL thumbnail dựa trên tên game
    if (name === 'name') {
      const gameName = value.trim().toLowerCase().replace(/\s+/g, '-');
      const thumbnailUrl = `https://classroom7x.github.io/${gameName}.webp`;
      setFormData(prev => ({ ...prev, game_thumbnail: thumbnailUrl }));
      setThumbnailPreview(thumbnailUrl);
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
      
      if (game?.id) {
        await dataService.updateGame(game.id, submitData);
      } else {
        await dataService.createGame(submitData);
      }
      await onSave(submitData);
      onHide();
    } catch (error) {
      console.error('Error saving game:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{game ? 'Edit Game' : 'Add New Game'}</Modal.Title>
      </Modal.Header>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Game Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a game name.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category_id"
                  value={formData.category_id || ''}
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

          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Gameplay URL</Form.Label>
                <Form.Control
                  type="url"
                  name="gameplay_url"
                  value={formData.gameplay_url || ''}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a valid URL.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status || 1}
                  onChange={handleChange}
                  required
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Thumbnail URL</Form.Label>
                <Form.Control
                  type="url"
                  name="game_thumbnail"
                  value={formData.game_thumbnail || ''}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              {thumbnailPreview && (
                <img 
                  src={thumbnailPreview} 
                  alt="Thumbnail Preview" 
                  className="img-thumbnail mt-4" 
                  style={{ maxHeight: '100px' }}
                  onError={() => setThumbnailPreview('/placeholder.jpg')}
                />
              )}
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Game Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="game_desc"
              value={formData.game_desc || ''}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Game Instructions</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="game_instruction"
              value={formData.game_instruction || ''}
              onChange={handleChange}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Developer</Form.Label>
                <Form.Control
                  type="text"
                  name="developer"
                  value={formData.developer || ''}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Published Year</Form.Label>
                <Form.Control
                  type="number"
                  name="published_year"
                  value={formData.published_year || new Date().getFullYear()}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Meta Title</Form.Label>
            <Form.Control
              type="text"
              name="meta_title"
              value={formData.meta_title || ''}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Meta Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="meta_desc"
              value={formData.meta_desc || ''}
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