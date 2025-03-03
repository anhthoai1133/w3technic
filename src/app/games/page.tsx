"use client";

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import PageLayout from '@/components/layout/PageLayout';
import CustomDataTable from '@/components/common/CustomDataTable';
import { Modal, Form, Button } from 'react-bootstrap';
import GameModal from '@/components/game/GameModal';
import { API_ENDPOINTS } from '@/config/api';
import type { Game } from '@/types/game';
import { TableColumn } from 'react-data-table-component';
import { mockGames } from '@/mocks/data';

export default function GamePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const { fetchData, loading } = useApi();

  const columns: TableColumn<Game>[] = [
    { 
      name: 'ID',
      selector: (row: Game) => row.id,
      sortable: true,
      width: '70px'
    },
    { 
      name: 'Name',
      selector: (row: Game) => row.name,
      sortable: true
    },
    { 
      name: 'Gameplay URL',
      cell: (row: Game) => (
        <a 
          href={row.gameplay_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {row.gameplay_url}
        </a>
      )
    },
    { 
      name: 'Category',
      selector: (row: Game) => row.category_name || '-',
      sortable: true
    },
    {
      name: 'Thumbnail',
      cell: (row: Game) => (
        <img 
          src={row.game_thumbnail} 
          alt={row.name}
          className="game-thumbnail"
        />
      ),
      width: '80px'
    },
    { 
      name: 'Published Year',
      selector: (row: Game) => row.published_year || '-',
      sortable: true,
      width: '130px'
    },
    {
      name: 'Status',
      cell: (row: Game) => (
        <span className={`badge ${row.status === 1 ? 'bg-success' : 'bg-danger'}`}>
          {row.status === 1 ? 'Online' : 'Offline'}
        </span>
      ),
      sortable: true,
      width: '100px'
    },
    {
      name: 'Actions',
      cell: (row: Game) => (
        <div className="d-flex gap-2">
          <button 
            className="btn btn-sm btn-primary"
            onClick={() => handleEdit(row)}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button 
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(row.id)}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      ),
      width: '120px'
    }
  ];

  useEffect(() => {
    // Tạm thời dùng mock data
    setGames(mockGames as Game[]);
  }, []);

  const handleEdit = (game: Game) => {
    setSelectedGame(game);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this game?')) {
      try {
        await fetchData(`${API_ENDPOINTS.games}/${id}`, {
          method: 'DELETE'
        });
        setGames(mockGames as Game[]);
      } catch (error) {
        console.error('Error deleting game:', error);
      }
    }
  };

  const handleImport = async (importData: any) => {
    try {
      await fetchData(API_ENDPOINTS.games + '/import', {
        method: 'POST',
        data: importData
      });
      setGames(mockGames as Game[]);
      setShowImportModal(false);
    } catch (error) {
      console.error('Error importing games:', error);
    }
  };

  const actions = (
    <button 
      className="btn btn-primary"
      onClick={() => {
        setSelectedGame(null);
        setShowModal(true);
      }}
    >
      <i className="fas fa-plus me-2"></i>
      Add New Game
    </button>
  );

  return (
    <PageLayout 
      title="Game Management"
      actions={actions}
    >
      <CustomDataTable
        columns={columns}
        data={games}
        loading={loading}
        buttons={{
          copy: true,
          csv: true,
          excel: true,
          pdf: true,
          print: true
        }}
      />

      <GameModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={() => setGames(mockGames as Game[])}
        game={selectedGame}
      />

      {/* Import Modal */}
      <Modal show={showImportModal} onHide={() => setShowImportModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Import Games from JSON</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            as="textarea"
            rows={10}
            placeholder="Paste your JSON here"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImportModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => document.getElementById('fileInput')?.click()}>
            Import from File
          </Button>
        </Modal.Footer>
      </Modal>
    </PageLayout>
  );
} 