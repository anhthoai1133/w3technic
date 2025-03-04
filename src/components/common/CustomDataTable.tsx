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

interface CustomDataTableProps {
  columns: TableColumn<any>[];
  data: any[];
  loading?: boolean;
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

const CustomDataTable: React.FC<CustomDataTableProps> = ({ 
  columns, 
  data, 
  loading = false,
  buttons = {
    copy: false,
    csv: false,
    excel: false,
    pdf: false,
    print: false
  },
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
    const exportableColumns = getExportableColumns();
    
    return data.map(item => {
      const row: Record<string, any> = {};
      
      exportableColumns.forEach(col => {
        // @ts-ignore
        const selector = col.selector;
        const name = col.name as string;
        
        if (typeof selector === 'function') {
          row[name] = selector(item);
        } else if (selector) {
          row[name] = item[selector as keyof typeof item];
        } else if (typeof col.cell === 'function') {
          const cellContent = col.cell(item, 0, col, 0);
          
          if (React.isValidElement(cellContent)) {
            // Xử lý thẻ img
            if (cellContent.type === 'img') {
              // Lấy src của hình ảnh
              row[name] = (cellContent.props as any).src || '';
            }
            // Xử lý thẻ a
            else if (cellContent.type === 'a' && (cellContent.props as any).href) {
              row[name] = (cellContent.props as any).href || '';
            }
            // Xử lý thẻ span có class badge
            else if (cellContent.type === 'span' && 
                (cellContent.props as any).className && 
                (cellContent.props as any).className.includes('badge')) {
              row[name] = (cellContent.props as any).children || '';
            }
            // Xử lý các trường hợp khác
            else {
              row[name] = (cellContent.props as any).children || '';
            }
          } else {
            row[name] = String(cellContent || '');
          }
        }
      });
      
      return row;
    });
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
    const exportColumns = getExportableColumns();
    
    const doc = new jsPDF();
    doc.autoTable({
      head: [exportColumns.map(col => col.name)],
      body: exportData.map(item => exportColumns.map(col => item[col.name as string] || ''))
    });
    doc.save('table.pdf');
  };

  const exportToExcel = () => {
    const exportData = prepareExportData();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'table.xlsx');
  };

  const exportToCSV = () => {
    const exportData = prepareExportData();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'table.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    const exportData = prepareExportData();
    const exportColumns = getExportableColumns();
    
    const header = exportColumns.map(col => col.name).join('\t');
    const rows = exportData.map(item => 
      exportColumns.map(col => item[col.name as string] || '').join('\t')
    ).join('\n');
    
    const text = header + '\n' + rows;
    
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  const printTable = () => {
    const exportData = prepareExportData();
    const exportColumns = getExportableColumns();
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Table</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Table Data</h1>
          <table>
            <thead>
              <tr>
                ${exportColumns.map(col => `<th>${col.name}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${exportData.map(item => `
                <tr>
                  ${exportColumns.map(col => `<td>${item[col.name as string] || ''}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
      },
    },
    headCells: {
      style: {
        fontSize: '14px',
        fontWeight: '600',
        padding: '16px',
      },
    },
    rows: {
      style: {
        fontSize: '14px',
        '&:not(:last-of-type)': {
          borderBottom: '1px solid #dee2e6',
        },
      },
    },
    cells: {
      style: {
        padding: '16px',
      },
    },
  };

  if (!mounted) {
    return null;
  }

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
              Print all
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
        pagination
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