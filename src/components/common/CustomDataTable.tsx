"use client";

import React, { useState, useEffect } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Button, Spinner, Form, InputGroup } from 'react-bootstrap';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { utils, writeFile } from 'xlsx';

// Thêm khai báo type cho jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Mở rộng TableColumn để thêm thuộc tính searchable
interface ExtendedTableColumn<T> extends TableColumn<T> {
  searchable?: boolean;
}

interface CustomDataTableProps {
  columns: ExtendedTableColumn<any>[];
  data: any[];
  title?: string;
  loading?: boolean;
  pagination?: boolean;
  selectableRows?: boolean;
  onSelectedRowsChange?: (selected: any) => void;
  buttons?: {
    copy?: boolean;
    csv?: boolean;
    excel?: boolean;
    pdf?: boolean;
    print?: boolean;
  };
  onRowClicked?: (row: any) => void;
}

const CustomDataTable: React.FC<CustomDataTableProps> = ({
  columns,
  data,
  title,
  loading = false,
  pagination = true,
  selectableRows = false,
  onSelectedRowsChange,
  buttons = {},
  onRowClicked,
}) => {
  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter data based on search text
  const filteredItems = data && data.length > 0 ? data.filter(
    item => {
      if (!item) return false;
      return Object.keys(item).some(key => {
        const value = item[key];
        if (value === null || value === undefined) return false;
        return value.toString().toLowerCase().includes(filterText.toLowerCase());
      });
    }
  ) : [];

  const handleClear = () => {
    if (filterText) {
      setResetPaginationToggle(!resetPaginationToggle);
      setFilterText('');
    }
  };

  // Export functions
  const exportToCSV = () => {
    // Lọc bỏ cột action (thường là cột cuối cùng)
    const exportColumns = columns.filter(col => col.name !== 'Actions' && col.name !== 'Action');
    const exportData = data.map(item => {
      const row = {};
      exportColumns.forEach(col => {
        // @ts-ignore
        row[col.name] = col.selector ? col.selector(item) : '';
      });
      return row;
    });
    
    // Tạo CSV
    const csvContent = [
      exportColumns.map(col => col.name).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    // Tạo và tải file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title || 'data'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    // Lọc bỏ cột action
    const exportColumns = columns.filter(col => col.name !== 'Actions' && col.name !== 'Action');
    
    // Chuẩn bị dữ liệu
    const exportData = data.map(item => {
      const row: Record<string, string> = {};
      exportColumns.forEach(col => {
        // Chuyển đổi giá trị thành string
        const value = col.selector ? col.selector(item) : '';
        row[col.name as string] = String(value || '');
      });
      return row;
    });
    
    // Tạo workbook và worksheet
    const wb = utils.book_new();
    const ws = utils.json_to_sheet(exportData);
    
    // Thêm worksheet vào workbook
    utils.book_append_sheet(wb, ws, 'Data');
    
    // Xuất file
    writeFile(wb, `${title || 'data'}.xlsx`);
  };

  const handleExportPDF = () => {
    // Lọc bỏ cột action
    const exportColumns = columns.filter(col => col.name !== 'Actions' && col.name !== 'Action');
    
    // Chuẩn bị dữ liệu
    const exportData = data.map(item => {
      return exportColumns.map(col => {
        // @ts-ignore
        return col.selector ? col.selector(item) : '';
      });
    });
    
    // Tạo PDF
    const doc = new jsPDF();
    doc.autoTable({
      head: [exportColumns.map(col => col.name)],
      body: exportData,
      theme: 'grid',
    });
    
    // Lưu file
    doc.save(`${title || 'data'}.pdf`);
  };

  const handlePrint = () => {
    if (!data || data.length === 0) return;
    
    // Create a printable version of the table
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <html>
        <head>
          <title>${title || 'Print'}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { text-align: center; }
          </style>
        </head>
        <body>
          ${title ? `<h1>${title}</h1>` : ''}
          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col.name}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `
                <tr>
                  ${columns.map(col => {
                    const selector = typeof col.selector === 'function' ? col.selector(item) : (col.selector ? item[col.selector as keyof typeof item] : '');
                    return `<td>${selector || ''}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCopy = () => {
    if (!data || data.length === 0) return;
    
    // Format data as tab-separated text
    const headers = columns.map(col => col.name).join('\t');
    const rows = data.map(item => 
      columns.map(col => {
        const selector = typeof col.selector === 'function' ? col.selector(item) : (col.selector ? item[col.selector as keyof typeof item] : '');
        return selector || '';
      }).join('\t')
    ).join('\n');
    
    const text = `${headers}\n${rows}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Data copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  // Responsive columns for mobile
  const responsiveColumns = isMobile 
    ? columns.map(col => ({
        ...col,
        width: col.width ? undefined : 'auto', // Remove fixed widths on mobile
        wrap: true,
      }))
    : columns;

  // Custom styles
  const customStyles = {
    table: {
      style: {
        minWidth: '100%',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #dee2e6',
        fontWeight: 'bold',
      },
    },
    rows: {
      style: {
        minHeight: '50px',
        fontSize: isMobile ? '0.875rem' : '1rem',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.03)',
        },
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #dee2e6',
        padding: '1rem 0',
      },
    },
  };

  // Search and export buttons
  const subHeaderComponent = (
    <div className={`d-flex ${isMobile ? 'flex-column w-100' : 'flex-row align-items-center justify-content-between'} gap-2 mb-3`}>
      <InputGroup className={isMobile ? 'mb-2 w-100' : 'w-auto'}>
        <Form.Control
          type="text"
          placeholder="Search..."
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
        />
        {filterText && (
          <Button variant="outline-secondary" onClick={handleClear}>
            <i className="fas fa-times"></i>
          </Button>
        )}
      </InputGroup>
      
      {Object.values(buttons).some(v => v) && (
        <div className={`d-flex ${isMobile ? 'flex-wrap w-100' : 'flex-row'} gap-2`}>
          {buttons.copy && (
            <Button variant="outline-secondary" size={isMobile ? 'sm' : undefined} onClick={handleCopy} className="d-flex align-items-center">
              <i className="fas fa-copy me-1"></i>
              <span>Copy</span>
            </Button>
          )}
          {buttons.csv && (
            <Button variant="outline-secondary" size={isMobile ? 'sm' : undefined} onClick={exportToCSV} className="d-flex align-items-center">
              <i className="fas fa-file-csv me-1"></i>
              <span>CSV</span>
            </Button>
          )}
          {buttons.excel && (
            <Button variant="outline-secondary" size={isMobile ? 'sm' : undefined} onClick={handleExportExcel} className="d-flex align-items-center">
              <i className="fas fa-file-excel me-1"></i>
              <span>Excel</span>
            </Button>
          )}
          {buttons.pdf && (
            <Button variant="outline-secondary" size={isMobile ? 'sm' : undefined} onClick={handleExportPDF} className="d-flex align-items-center">
              <i className="fas fa-file-pdf me-1"></i>
              <span>PDF</span>
            </Button>
          )}
          {buttons.print && (
            <Button variant="outline-secondary" size={isMobile ? 'sm' : undefined} onClick={handlePrint} className="d-flex align-items-center">
              <i className="fas fa-print me-1"></i>
              <span>Print</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="custom-datatable">
      {subHeaderComponent}
      
      <div className="table-responsive">
        <DataTable
          columns={responsiveColumns}
          data={filteredItems}
          title={title}
          pagination={pagination}
          paginationResetDefaultPage={resetPaginationToggle}
          responsive
          highlightOnHover
          striped
          progressPending={loading}
          progressComponent={<Spinner animation="border" role="status" />}
          noDataComponent={<div className="text-center my-3">No records found</div>}
          customStyles={customStyles}
          selectableRows={selectableRows}
          onSelectedRowsChange={onSelectedRowsChange}
          onRowClicked={onRowClicked}
          dense={isMobile}
          paginationPerPage={isMobile ? 5 : 10}
          paginationRowsPerPageOptions={isMobile ? [5, 10, 25] : [10, 25, 50, 100]}
        />
      </div>
    </div>
  );
};

export default CustomDataTable;