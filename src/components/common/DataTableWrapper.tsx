"use client";

import { useState } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';

interface DataTableWrapperProps {
  columns: TableColumn<any>[];
  data: any[];
  title?: string;
  loading?: boolean;
  actions?: React.ReactNode;
  onRowClicked?: (row: any) => void;
}

const customStyles = {
  table: {
    style: {
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    }
  },
  headRow: {
    style: {
      backgroundColor: '#f8f9fa',
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
      '&:hover': {
        backgroundColor: '#f8f9fa'
      }
    }
  },
  rows: {
    style: {
      minHeight: '60px',
      '&:hover': {
        backgroundColor: '#f8f9fa',
        cursor: 'pointer'
      }
    }
  },
  pagination: {
    style: {
      borderBottomLeftRadius: '8px',
      borderBottomRightRadius: '8px'
    }
  }
};

export default function DataTableWrapper({
  columns,
  data,
  title,
  loading = false,
  actions,
  onRowClicked
}: DataTableWrapperProps) {
  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const filteredItems = data.filter(
    item => JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase())
  );

  const subHeaderComponent = (
    <div className="d-flex justify-content-between align-items-center w-100 mb-3">
      <div className="d-flex gap-2">
        {actions}
      </div>
      <div className="d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Search..."
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
        />
        {filterText && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              setFilterText('');
              setResetPaginationToggle(!resetPaginationToggle);
            }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={filteredItems}
      progressPending={loading}
      pagination
      paginationResetDefaultPage={resetPaginationToggle}
      subHeader
      subHeaderComponent={subHeaderComponent}
      persistTableHead
      customStyles={customStyles}
      onRowClicked={onRowClicked}
      responsive
    />
  );
} 