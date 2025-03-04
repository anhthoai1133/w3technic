"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CustomDataTable from '@/components/common/CustomDataTable';
import { TableColumn } from 'react-data-table-component';
import GameModal from '@/components/game/GameModal';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/config/api';

interface Game {
  id: number;
  name: string;
  gameplay_url: string;
  category_name: string;
  game_thumbnail: string;
  published_year: number;
  status: number;
  created_at: string;
  categoryId?: number;
  game_source?: string;
  game_desc?: string;
  game_instruction?: string;
  developer?: string;
  meta_desc?: string;
  meta_title?: string;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const { fetchData } = useApi();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const data = await fetchData(API_ENDPOINTS.games);
      setGames(data);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

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
        await fetchGames();
      } catch (error) {
        console.error('Error deleting game:', error);
      }
    }
  };

  const handleSyncGames = async () => {
    try {
      setSyncLoading(true);
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Giả lập dữ liệu mới
      const newGames = [...games];
      newGames[0] = {...newGames[0], status: newGames[0].status === 1 ? 0 : 1};
      
      setGames(newGames);
      alert('Games synchronized successfully!');
    } catch (error) {
      console.error('Error syncing games:', error);
      alert('Failed to sync games');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleImportGames = async () => {
    try {
      setImportLoading(true);
      
      // Tạo input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.csv';
      
      // Xử lý khi file được chọn
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const content = event.target?.result;
            // Giả sử file là JSON
            const importedGames = JSON.parse(content as string);
            
            // Thêm games mới vào danh sách
            setGames(prev => [...prev, ...importedGames]);
            alert('Games imported successfully!');
          } catch (error) {
            console.error('Error parsing file:', error);
            alert('Failed to import games. Please check your file format.');
          } finally {
            setImportLoading(false);
          }
        };
        reader.readAsText(file);
      };

      input.click();
    } catch (error) {
      console.error('Error importing games:', error);
      alert('Failed to import games');
      setImportLoading(false);
    }
  };

  const handleSave = async (gameData: Partial<Game>) => {
    try {
      if (selectedGame) {
        // Edit existing game
        await fetchData(`${API_ENDPOINTS.games}/${selectedGame.id}`, {
          method: 'PATCH',
          body: JSON.stringify(gameData)
        });
      } else {
        // Add new game
        await fetchData(API_ENDPOINTS.games, {
          method: 'POST',
          body: JSON.stringify(gameData)
        });
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
      <div className="mb-4 d-flex justify-content-between">
        <div>
          <button 
            className="btn btn-success me-2" 
            onClick={handleSyncGames}
            disabled={syncLoading}
          >
            <i className={`fas ${syncLoading ? 'fa-spinner fa-spin' : 'fa-sync-alt'} me-2`}></i>
            {syncLoading ? 'Syncing...' : 'Sync Games'}
          </button>
          <button 
            className="btn btn-info"
            onClick={handleImportGames}
            disabled={importLoading}
          >
            <i className={`fas ${importLoading ? 'fa-spinner fa-spin' : 'fa-file-import'} me-2`}></i>
            {importLoading ? 'Importing...' : 'Import Games'}
          </button>
        </div>
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
      </div>
      
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
        onSave={handleSave}
        game={selectedGame ? {
          ...selectedGame,
          category_id: selectedGame.categoryId?.toString() || '',
          game_source: selectedGame.game_source || '',
          game_desc: selectedGame.game_desc || '',
          game_instruction: selectedGame.game_instruction || '',
          developer: selectedGame.developer || '',
          meta_desc: selectedGame.meta_desc || '',
          meta_title: selectedGame.meta_title || '',
        } : null}
      />
    </DashboardLayout>
  );
} 