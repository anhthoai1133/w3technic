"use client";

import DataTable, { TableColumn } from 'react-data-table-component';
import { Spinner } from 'react-bootstrap';
import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import ReactDOMServer from 'react-dom/server';
import React from 'react';

// Add this type declaration
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Thêm type definition cho cell function
type CellFunction = (
  row: any, 
  rowIndex: number, 
  column: TableColumn<any>, 
  id: string | number
) => React.ReactNode;

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
}

// Improved utility function to get cell value
const getCellValue = (item: any, col: TableColumn<any>, rowIndex: number) => {
  // Bỏ qua cột Actions
  if (col.name === 'Actions') return '';

  // Nếu có cell renderer custom
  if (typeof col.cell === 'function') {
    const cellContent = col.cell(item, rowIndex, col, rowIndex);
    
    // Xử lý React elements
    if (React.isValidElement(cellContent)) {
      // Với status badges
      if (cellContent.type === 'span' && (cellContent.props as any).className?.includes('badge')) {
        return item.status === 1 ? 'Active' : 'Inactive';
      }
      
      // Với images, lấy src
      if (cellContent.type === 'img') {
        return (cellContent.props as any).src || '';
      }

      // Với links, lấy href
      if (cellContent.type === 'a') {
        return (cellContent.props as any).href || '';
      }

      // Các elements khác - lấy text content
      try {
        const div = document.createElement('div');
        div.innerHTML = ReactDOMServer.renderToString(cellContent);
        return div.textContent || '';
      } catch (error) {
        const props = cellContent.props as { children?: React.ReactNode };
        return String(props.children || '');
      }
    }

    return cellContent?.toString() || '';
  }

  // Lấy giá trị từ selector hoặc key
  let value;
  
  // First try with selector function
  if (typeof col.selector === 'function') {
    value = col.selector(item);
  } 
  // Then try with selector string
  else if (typeof col.selector === 'string') {
    value = item[col.selector];
  } 
  // Then try with column name
  else if (typeof col.name === 'string') {
    // Đặc biệt xử lý cho cột Icon
    if (col.name === 'Icon') {
      return item.icon || item.game_icon || item.thumbnail || '';
    }
    
    value = item[col.name.toLowerCase()];
  }

  return value !== undefined && value !== null ? String(value) : '';
};

export default function CustomDataTable({ 
  columns, 
  data, 
  loading,
  buttons = {
    copy: false,
    csv: false,
    excel: false,
    pdf: false,
    print: false
  }
}: CustomDataTableProps) {
  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      const headers = columns.map(col => col.name).join('\t');
      const rows = data.map((item, index) => {
        return columns.map(col => getCellValue(item, col, index)).join('\t');
      }).join('\n');
      
      const text = `${headers}\n${rows}`;
      
      // Sử dụng writeText thay vì writeText
      await navigator.clipboard.writeText(text);
      
      // Optional: Thông báo copy thành công
      alert('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      // Optional: Thông báo lỗi
      alert('Failed to copy to clipboard');
    }
  }, [columns, data]);

  // Export to CSV - Fixed version
  const handleCSV = useCallback(() => {
    // Create CSV string with proper line breaks and field separation
    let csvRows = [];
    
    // Add header row
    csvRows.push(
      columns
        .map(col => {
          const name = col.name?.toString() || '';
          // Properly escape quotes in column name
          return `"${name.replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    
    // Add data rows
    data.forEach((item, index) => {
      const rowValues = columns.map(col => {
        // Get the value and ensure it's a string
        const value = getCellValue(item, col, index);
        // Properly escape quotes and enclose in quotes
        return `"${value.replace(/"/g, '""')}"`;
      });
      
      // Add row to rows array
      csvRows.push(rowValues.join(','));
    });
    
    // Join all rows with CRLF line breaks
    const csvString = '\uFEFF' + csvRows.join('\r\n');
    
    // Create and download the file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'export.csv');
    link.click();
    window.URL.revokeObjectURL(url);
  }, [columns, data]);

  // Export to Excel
  const handleExcel = useCallback(() => {
    // Convert data to worksheet format
    const worksheet: any[] = [];
    
    // Add headers
    worksheet.push(columns.map(col => col.name));
    
    // Add data rows
    data.forEach((item, index) => {
      const row: any[] = [];
      columns.forEach(col => {
        row.push(getCellValue(item, col, index));
      });
      worksheet.push(row);
    });

    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheet);
    
    // Auto-size columns
    const colWidths = worksheet[0].map((_: any, i: number) => ({
      wch: Math.max(...worksheet.map(row => row[i]?.toString().length || 10))
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'export.xlsx');
  }, [columns, data]);

  // Export to PDF
  const handlePDF = useCallback(() => {
    // Convert data to table format
    const headers = columns.map(col => col.name);
    const rows = data.map((item, index) => {
      const row: any[] = [];
      columns.forEach(col => {
        row.push(getCellValue(item, col, index));
      });
      return row;
    });

    const doc = new jsPDF();
    doc.autoTable({
      head: [headers],
      body: rows,
      styles: { 
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: { 
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: columns.reduce((acc, _, i) => ({
        ...acc,
        [i]: { cellWidth: 'auto' }
      }), {})
    });

    doc.save('export.pdf');
  }, [columns, data]);

  // Print
  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Convert data to table format
    const headers = columns.map(col => col.name);
    const rows = data.map((item, index) => {
      const row: any[] = [];
      columns.forEach(col => {
        row.push(getCellValue(item, col, index));
      });
      return row;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Print</title>
          <style>
            @media print {
              table { 
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 1rem;
              }
              th, td { 
                padding: 8px;
                text-align: left;
                border: 1px solid #ddd;
              }
              th { 
                background-color: #f8f9fa !important;
                font-weight: bold;
                -webkit-print-color-adjust: exact;
              }
              tr:nth-child(even) { 
                background-color: #f9f9f9 !important;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }, [columns, data]);

  return (
    <div className="bg-white rounded shadow">
      <div className="p-3 border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <div className="btn-group gap-2">
            {buttons.copy && (
              <button className="btn btn-secondary btn-sm" onClick={handleCopy}>Copy</button>
            )}
            {buttons.csv && (
              <button className="btn btn-secondary btn-sm" onClick={handleCSV}>CSV</button>
            )}
            {buttons.excel && (
              <button className="btn btn-secondary btn-sm" onClick={handleExcel}>Excel</button>
            )}
            {buttons.pdf && (
              <button className="btn btn-secondary btn-sm" onClick={handlePDF}>PDF</button>
            )}
            {buttons.print && (
              <button className="btn btn-secondary btn-sm" onClick={handlePrint}>Print all</button>
            )}
          </div>
          <input 
            type="search"
            className="form-control form-control-sm"
            placeholder="Search..."
            style={{ width: '200px' }}
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data}
        pagination
        responsive
        progressPending={loading}
        progressComponent={<Spinner animation="border" />}
      />
    </div>
  );
}