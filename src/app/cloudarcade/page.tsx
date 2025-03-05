"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CustomDataTable from '@/components/common/CustomDataTable';
import { TableColumn } from 'react-data-table-component';
import { dataService } from '@/services/dataService';

interface Game {
  id: number;
  name: string;
  gameplay_url: string;
  category_name: string;
  game_thumbnail: string;
  published_year: number;
  status: number;
  thumbnail: string;
  url: string;
  category_id: number;
  is_featured: boolean;
  created_at: string;
}

export default function CloudarcadePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [regenerateDescriptions, setRegenerateDescriptions] = useState(false);
  const [gameData, setGameData] = useState('');
  const [selectedGames, setSelectedGames] = useState<number[]>([]);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const data = await dataService.getGames();
      setGames(data);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (days: number) => {
    if (typeof window !== 'undefined') {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - days);
      
      setEndDate(end.toISOString().split('T')[0]);
      setStartDate(start.toISOString().split('T')[0]);
    }
  };

  const handleFetchData = () => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      const selectedGameData = games
        .filter(game => selectedGames.includes(game.id))
        .map(game => ({
          id: game.id,
          name: game.name,
          url: game.url,
          category: game.category_name,
          thumbnail: game.thumbnail
        }));
      
      setGameData(JSON.stringify(selectedGameData, null, 2));
      setLoading(false);
    }, 1000);
  };

  const handleRowSelected = ({ selectedRows }: { selectedRows: Game[] }) => {
    setSelectedGames(selectedRows.map(row => row.id));
  };

  const columns: TableColumn<Game>[] = [
    {
      name: 'Thumbnail',
      cell: (row: Game) => (
        <img 
          src={row.thumbnail || '/placeholder-thumbnail.png'} 
          alt={row.name}
          className="game-thumbnail"
        />
      ),
      width: '80px'
    },
    { 
      name: 'Name',
      selector: (row: Game) => row.name,
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
    }
  ];

  return (
    <DashboardLayout title="CloudArcade JSON Generator">
      <div className="card mb-4">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Start Date:</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">End Date:</label>
              <input
                type="date" 
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Quick Select:</label>
              <div className="btn-group w-100">
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleQuickSelect(0)}
                >
                  Today
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleQuickSelect(7)}
                >
                  Last 7 Days
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleQuickSelect(30)}
                >
                  Last 30 Days
                </button>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="regenerate"
                checked={regenerateDescriptions}
                onChange={(e) => setRegenerateDescriptions(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="regenerate">
                Regenerate Descriptions and Instructions
              </label>
            </div>
          </div>

          <div className="text-end mb-3">
            <button 
              className="btn btn-primary"
              onClick={handleFetchData}
              disabled={selectedGames.length === 0}
            >
              <i className="fas fa-download me-2"></i>
              Generate JSON
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <h4>Select Games</h4>
          <CustomDataTable
            columns={columns}
            data={games}
            loading={loading}
            buttons={{}}
            // @ts-ignore
            selectableRows
            onSelectedRowsChange={handleRowSelected}
          />
        </div>
        <div className="col-md-6">
          <h4>Generated JSON</h4>
          <textarea
            className="form-control"
            rows={20}
            value={gameData}
            onChange={(e) => setGameData(e.target.value)}
            placeholder="Game data will appear here..."
            style={{ fontFamily: 'monospace' }}
          />
          {gameData && (
            <div className="mt-3 text-end">
              <button 
                className="btn btn-success"
                onClick={() => {
                  const blob = new Blob([gameData], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'cloudarcade-games.json';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
              >
                <i className="fas fa-download me-2"></i>
                Download JSON
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 