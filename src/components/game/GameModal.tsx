"use client";

import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/config/api';
import type { Game } from '@/types/game';

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

  const [categories, setCategories] = useState([]);
  const { fetchData } = useApi();

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Xử lý giá trị dựa trên type của input
    let parsedValue: string | number = value;
    
    if (type === 'number') {
      parsedValue = value ? parseInt(value) : 0;
    } else if (name === 'status') {
      parsedValue = parseInt(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
      onHide();
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{game ? 'Edit Game' : 'Add New Game'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Gameplay URL</Form.Label>
            <Form.Control
              type="url"
              name="gameplay_url"
              value={formData.gameplay_url}
              onChange={handleChange}
              required
            />
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
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Game Source</Form.Label>
            <Form.Control
              type="text"
              name="game_source"
              value={formData.game_source}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Thumbnail URL</Form.Label>
            <Form.Control
              type="url"
              name="game_thumbnail"
              value={formData.game_thumbnail}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="game_desc"
              value={formData.game_desc}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Instructions</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="game_instruction"
              value={formData.game_instruction}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Developer</Form.Label>
            <Form.Control
              type="text"
              name="developer"
              value={formData.developer}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Published Year</Form.Label>
            <Form.Control
              type="number"
              name="published_year"
              value={formData.published_year}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Meta Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="meta_desc"
              value={formData.meta_desc}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Meta Title</Form.Label>
            <Form.Control
              type="text"
              name="meta_title"
              value={formData.meta_title}
              onChange={handleChange}
            />
          </Form.Group>

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