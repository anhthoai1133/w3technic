"use client";

import { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import CustomDataTable from '@/components/common/CustomDataTable';
import { mockGames } from '@/mocks/data';

export default function CloudarcadePage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [regenerateDescriptions, setRegenerateDescriptions] = useState(false);
  const [gameData, setGameData] = useState('');
  const [games, setGames] = useState(mockGames);

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  const columns = [
    { 
      name: 'Name',
      selector: (row: any) => row.name,
      sortable: true
    },
    {
      name: 'Category',
      selector: (row: any) => row.category_name,
      sortable: true
    },
    {
      name: 'Status',
      cell: (row: any) => (
        <span className={`badge ${row.status === 1 ? 'bg-success' : 'bg-danger'}`}>
          {row.status === 1 ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  return (
    <PageLayout title="Game Data Management">
      <div className="bg-white rounded shadow p-4">
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
                onClick={() => handleQuickSelect(28)}
              >
                Last 28 Days
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
          <button className="btn btn-primary">
            Fetch Game Data
          </button>
        </div>

        <textarea
          className="form-control"
          rows={10}
          value={gameData}
          onChange={(e) => setGameData(e.target.value)}
          placeholder="Game data will appear here..."
        />

        <CustomDataTable
          columns={columns}
          data={games}
          buttons={{}}
        />
      </div>
    </PageLayout>
  );
} 