"use client";

import React, { useState, useEffect } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Thêm khai báo type cho jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface AutoTableData {
  settings: {
    margin: {
      left: number;
    };
  };
}

interface CustomDataTableProps {
  columns: TableColumn<any>[];
  data: any[];
  loading?: boolean;
  pagination?: boolean;
  buttons?: {
    copy?: boolean;
    csv?: boolean;
    excel?: boolean;
    pdf?: boolean;
    print?: boolean;
  };
  selectableRows?: boolean;
  onSelectedRowsChange?: (selectedRows: any) => void;
}

const customStyles = {
  rows: {
    style: {
      minHeight: '52px',
    }
  },
  headCells: {
    style: {
      paddingLeft: '8px',
      paddingRight: '8px',
      backgroundColor: '#f8f9fa',
      fontWeight: 'bold'
    },
  },
  cells: {
    style: {
      paddingLeft: '8px',
      paddingRight: '8px',
    },
  },
};

const CustomDataTable: React.FC<CustomDataTableProps> = ({ 
  columns, 
  data, 
  loading = false,
  buttons = {
    copy: true,
    csv: true,
    excel: true,
    pdf: true,
    print: true
  },
  pagination = true,
  selectableRows = false,
  onSelectedRowsChange
}) => {
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFilteredData(data);
  }, [data]);

  // Lọc các cột có thể xuất (không bao gồm cột Actions và các cột không có selector)
  const getExportableColumns = () => {
    return columns.filter(col => {
      // Bỏ qua cột Actions hoặc các cột có cell custom mà không có selector
      return col.name !== 'Actions' && 
             // @ts-ignore
             (col.selector || (typeof col.cell === 'function' && col.exportable !== false));
    });
  };

  // Chuẩn bị dữ liệu để xuất
  const prepareExportData = () => {
    if (!data || data.length === 0) {
      // Nếu không có dữ liệu, trả về mảng chỉ có header
      const headers = getExportableColumns().map(col => col.name);
      return [headers];
    }
    
    const exportableColumns = getExportableColumns();
    const headers = exportableColumns.map(col => col.name);
    
    const rows = data.map(row => {
      return exportableColumns.map(col => {
        // @ts-ignore
        const selector = col.selector;
        if (selector && typeof selector === 'function') {
          return selector(row);
        }
        return '';
      });
    });
    
    return [headers, ...rows];
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchText(text);

    const filtered = data.filter(item => {
      return Object.keys(item).some(key => {
        const value = item[key];
        if (value === null || value === undefined) return false;
        return value.toString().toLowerCase().includes(text.toLowerCase());
      });
    });

    setFilteredData(filtered);
  };

  const exportToPDF = () => {
    const exportData = prepareExportData();
    const headers = exportData[0];
    const rows = exportData.slice(1);
    
    const doc = new jsPDF();
    doc.autoTable({
      head: [headers],
      body: rows.length > 0 ? rows : [Array(headers.length).fill('No data')],
      startY: 20,
      margin: { top: 20 },
      styles: { overflow: 'linebreak' },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      didDrawPage: function(data: AutoTableData) {
        // Header
        doc.setFontSize(20);
        doc.setTextColor(40);
        doc.text('Data Export', data.settings.margin.left, 10);
      }
    });
    
    doc.save('export.pdf');
  };

  const exportToExcel = () => {
    const exportData = prepareExportData();
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, 'export.xlsx');
  };

  const exportToCSV = () => {
    const exportData = prepareExportData();
    const csvContent = exportData.map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'export.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    const exportData = prepareExportData();
    const textContent = exportData.map(row => row.join('\t')).join('\n');
    
    navigator.clipboard.writeText(textContent).then(
      () => {
        alert('Data copied to clipboard');
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

  const printTable = () => {
    const exportData = prepareExportData();
    const headers = exportData[0];
    const rows = exportData.slice(1);
    
    let printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const htmlContent = `
      <html>
        <head>
          <title>Print</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Data Export</h1>
          <table>
            <thead>
              <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.length > 0 
                ? rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')
                : `<tr>${Array(headers.length).fill('<td>No data</td>').join('')}</tr>`
              }
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="custom-datatable">
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <div className="btn-group">
          {buttons.copy && (
            <button className="btn btn-sm btn-outline-secondary" onClick={copyToClipboard}>
              Copy
            </button>
          )}
          {buttons.csv && (
            <button className="btn btn-sm btn-outline-secondary" onClick={exportToCSV}>
              CSV
            </button>
          )}
          {buttons.excel && (
            <button className="btn btn-sm btn-outline-secondary" onClick={exportToExcel}>
              Excel
            </button>
          )}
          {buttons.pdf && (
            <button className="btn btn-sm btn-outline-secondary" onClick={exportToPDF}>
              PDF
            </button>
          )}
          {buttons.print && (
            <button className="btn btn-sm btn-outline-secondary" onClick={printTable}>
              Print
            </button>
          )}
        </div>
        <div>
          <label className="me-2">Search:</label>
          <input
            type="text"
            className="form-control form-control-sm d-inline-block"
            style={{ width: '200px' }}
            placeholder=""
            value={searchText}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      <DataTable
        columns={columns}
        data={filteredData}
        pagination={pagination}
        paginationPerPage={rowsPerPage}
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
        responsive
        highlightOnHover
        striped
        progressPending={loading}
        progressComponent={<div className="text-center my-3">Loading...</div>}
        noDataComponent={<div className="text-center my-3">No records found</div>}
        customStyles={customStyles}
        selectableRows={selectableRows}
        onSelectedRowsChange={onSelectedRowsChange}
      />
    </div>
  );
};

export default CustomDataTable;