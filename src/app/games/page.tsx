"use client";

import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { dataService } from '@/services/dataService';
import CustomDataTable from '@/components/common/CustomDataTable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GameModal from '@/components/game/GameModal';
import type { Game } from '@/types/game';

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const data = await dataService.getGames();
      console.log("Fetched games:", data); // Debug log
      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (game: Game, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedGame(game);
    setShowModal(true);
  };

  const handleAddNew = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedGame(null);
    setShowModal(true);
  };

  const handleSave = async (gameData: Partial<Game>) => {
    await fetchGames(); // Refresh data after save
  };

  const columns = [
    {
      name: 'ID',
      selector: (row: Game) => row.id,
      sortable: true,
      width: '80px',
    },
    {
      name: 'Thumbnail',
      cell: (row: Game) => {
        if (!row.game_thumbnail) {
          return <div style={{ width: '50px', height: '50px' }}></div>;
        }
        
        return (
          <img 
            src={row.game_thumbnail} 
            alt={row.name}
            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        );
      },
      width: '100px',
      exportable: true,
      exportTransform: (value: string) => value ? 'Has thumbnail' : 'No thumbnail',
      selector: (row: Game) => row.game_thumbnail
    },
    {
      name: 'Name',
      selector: (row: Game) => row.name,
      sortable: true,
    },
    {
      name: 'Description',
      selector: (row: Game) => row.game_desc || '',
      sortable: true,
      wrap: true,
    },
    {
      name: 'Category',
      selector: (row: Game) => row.category_name || '',
      sortable: true,
    },
    {
      name: 'Status',
      selector: (row: Game) => row.status,
      sortable: true,
      cell: (row: Game) => (
        <span className={`badge ${row.status === 1 ? 'bg-success' : 'bg-danger'}`}>
          {row.status === 1 ? 'Active' : 'Inactive'}
        </span>
      ),
      width: '100px',
    },
    {
      name: 'Actions',
      cell: (row: Game) => (
        <div className="d-flex gap-2">
          <button 
            className="btn btn-sm btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row, e);
            }}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button 
            className="btn btn-sm btn-danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      ),
      width: '120px',
      ignoreRowClick: true,
    },
  ];

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        await dataService.deleteGame(id);
        setGames(games.filter(game => game.id !== id));
      } catch (error) {
        console.error('Error deleting game:', error);
      }
    }
  };

  return (
    <DashboardLayout title="Games">
      <div className="mb-4">
        <Button 
          variant="primary"
          onClick={handleAddNew}
        >
          <i className="fas fa-plus me-2"></i>
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
          print: true,
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