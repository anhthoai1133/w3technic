"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CustomDataTable from '@/components/common/CustomDataTable';
import { TableColumn } from 'react-data-table-component';
import GameModal from '@/components/game/GameModal';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/config/api';
import { Button } from 'react-bootstrap';

interface Game {
  id: number;
  name: string;
  gameplay_url: string;
  category_name: string;
  category_id: string;
  game_thumbnail: string;
  published_year: number;
  status: number;
  created_at: string;
  game_source: string;
  game_desc: string;
  game_instruction: string;
  developer: string;
  meta_desc: string;
  meta_title: string;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const { get, post, put, delete: deleteApi, loading } = useApi();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const data = await get(API_ENDPOINTS.games);
      setGames(data);
    } catch (error) {
      console.error('Error fetching games:', error);
      setGames([]);
    }
  };

  const handleEdit = (game: Game) => {
    setSelectedGame(game);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this game?')) {
      try {
        await deleteApi(API_ENDPOINTS.game(id));
        await fetchGames();
      } catch (error) {
        console.error('Error deleting game:', error);
      }
    }
  };

  const handleSave = async (gameData: Partial<Game>) => {
    try {
      if (selectedGame) {
        await put(API_ENDPOINTS.game(selectedGame.id), gameData);
      } else {
        await post(API_ENDPOINTS.games, gameData);
      }
      await fetchGames();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  const columns: TableColumn<Game>[] = [
    { 
      name: 'ID',
      selector: (row: Game) => row.id,
      sortable: true,
      width: '70px'
    },
    {
      name: 'Thumbnail',
      cell: (row: Game) => (
        <img 
          src={row.game_thumbnail || '/placeholder-thumbnail.png'} 
          alt={row.name}
          className="game-thumbnail"
        />
      ),
      width: '100px'
    },
    { 
      name: 'Name',
      selector: (row: Game) => row.name,
      sortable: true
    },
    {
      name: 'URL',
      cell: (row: Game) => (
        <a href={row.gameplay_url} target="_blank" rel="noopener noreferrer">
          {row.gameplay_url}
        </a>
      ),
      sortable: true
    },
    { 
      name: 'Category',
      selector: (row: Game) => row.category_name,
      sortable: true
    },
    {
      name: 'Status',
      cell: (row: Game) => (
        <span className={`badge ${row.status === 1 ? 'bg-success' : 'bg-danger'}`}>
          {row.status === 1 ? 'Active' : 'Inactive'}
        </span>
      ),
      sortable: true,
      width: '100px'
    },
    {
      name: 'Published Year',
      selector: (row: Game) => row.published_year,
      sortable: true
    },
    { 
      name: 'Created At',
      selector: (row: Game) => row.created_at,
      sortable: true
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

  return (
    <DashboardLayout title="Game Management">
      <div className="mb-3 d-flex justify-content-between">
        <Button variant="primary" onClick={() => { setSelectedGame(null); setShowModal(true); }}>
          Add New Game
        </Button>
      </div>
      
      <CustomDataTable
        columns={columns}
        data={games}
        loading={loading}
        pagination
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
        onSave={handleSave}
        game={selectedGame}
      />
    </DashboardLayout>
  );
} 