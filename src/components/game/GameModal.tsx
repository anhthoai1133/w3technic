"use client";

import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/config/api';
import type { Game } from '@/types/game';

interface GameModalProps {
  show: boolean;
  onHide: () => void;
  onSave: () => void;
  game?: Game | null;
}

export default function GameModal({
  show,
  onHide,
  onSave,
  game
}: GameModalProps) {
  const [formData, setFormData] = useState({
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

  const [categories, setCategories] = useState([]);
  const { fetchData, loading } = useApi();

  useEffect(() => {
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
    } else {
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
    }
  }, [game]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await fetchData(API_ENDPOINTS.categories);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchData(API_ENDPOINTS.games, {
        method: game ? 'PUT' : 'POST',
        data: {
          ...formData,
          id: game?.id
        }
      });
      onSave();
      onHide();
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  // Automatic thumbnail URL generation based on game name
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      game_thumbnail: `https://classroom7x.github.io/${name.toLowerCase().replace(/\s+/g, '-')}.webp`
    }));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {game ? 'Edit Game' : 'Add New Game'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name *</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Gameplay URL *</Form.Label>
            <Form.Control
              type="url"
              value={formData.gameplay_url}
              onChange={(e) => setFormData({...formData, gameplay_url: e.target.value})}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category *</Form.Label>
            <Form.Select
              value={formData.category_id}
              onChange={(e) => setFormData({...formData, category_id: e.target.value})}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Game Source</Form.Label>
            <Form.Control
              type="text"
              value={formData.game_source}
              onChange={(e) => setFormData({...formData, game_source: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Thumbnail URL</Form.Label>
            <Form.Control
              type="url"
              value={formData.game_thumbnail}
              onChange={(e) => setFormData({...formData, game_thumbnail: e.target.value})}
            />
            {formData.game_thumbnail && (
              <img 
                src={formData.game_thumbnail} 
                alt="Thumbnail Preview"
                className="mt-2 rounded"
                style={{ maxWidth: '200px' }}
              />
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.game_desc}
              onChange={(e) => setFormData({...formData, game_desc: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Instructions</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.game_instruction}
              onChange={(e) => setFormData({...formData, game_instruction: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Developer</Form.Label>
            <Form.Control
              type="text"
              value={formData.developer}
              onChange={(e) => setFormData({...formData, developer: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Published Year</Form.Label>
            <Form.Control
              type="number"
              min={1970}
              max={new Date().getFullYear()}
              value={formData.published_year}
              onChange={(e) => setFormData({...formData, published_year: parseInt(e.target.value)})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Meta Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.meta_desc}
              onChange={(e) => setFormData({...formData, meta_desc: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Meta Title</Form.Label>
            <Form.Control
              type="text"
              value={formData.meta_title}
              onChange={(e) => setFormData({...formData, meta_title: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: parseInt(e.target.value)})}
            >
              <option value={1}>Online</option>
              <option value={0}>Offline</option>
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