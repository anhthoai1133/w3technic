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

// Mở rộng TableColumn để thêm thuộc tính searchable và exportable
interface ExtendedTableColumn<T> extends Omit<TableColumn<T>, 'selector'> {
  searchable?: boolean;
  exportable?: boolean;
  exportTransform?: (value: any) => string;
  selector?: (row: T) => any;
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
  buttons = {
    copy: false,
    csv: false,
    excel: false,
    pdf: false,
    print: false
  },
  onRowClicked
}) => {
  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Lọc dữ liệu dựa trên filterText
  const filteredItems = data.filter(item => {
    return columns.some(column => {
      // Chỉ tìm kiếm trên các cột có searchable = true hoặc không định nghĩa searchable
      if (column.searchable === false) return false;
      
      // Lấy giá trị từ selector nếu có
      let cellValue;
      if (column.selector) {
        cellValue = column.selector(item);
      } else {
        cellValue = item[column.name?.toString().toLowerCase() || ''];
      }
      
      // Kiểm tra nếu giá trị tồn tại và chứa filterText
      return cellValue !== undefined && 
             cellValue !== null && 
             String(cellValue).toLowerCase().includes(filterText.toLowerCase());
    });
  });

  // Chuẩn bị dữ liệu cho xuất file
  const prepareExportData = () => {
    return filteredItems.map(item => {
      const row: Record<string, any> = {};
      
      columns.forEach(column => {
        // Bỏ qua các cột không cần xuất
        if (column.exportable === false) return;
        
        const columnName = column.name?.toString() || '';
        
        // Lấy giá trị từ selector nếu có
        let cellValue;
        if (column.selector) {
          cellValue = column.selector(item);
        } else {
          cellValue = item[columnName.toLowerCase()];
        }
        
        // Áp dụng hàm chuyển đổi nếu có
        if (column.exportTransform && cellValue !== undefined) {
          cellValue = column.exportTransform(cellValue);
        }
        
        // Xử lý các trường đặc biệt như hình ảnh
        if (columnName.toLowerCase().includes('image') || 
            columnName.toLowerCase().includes('thumbnail') || 
            columnName.toLowerCase().includes('icon')) {
          cellValue = cellValue || 'No image';
        }
        
        // Xử lý các trường trạng thái
        if (columnName.toLowerCase().includes('status')) {
          if (typeof cellValue === 'number') {
            cellValue = cellValue === 1 ? 'Active' : 'Inactive';
          }
        }
        
        row[columnName] = cellValue;
      });
      
      return row;
    });
  };

  // Xuất ra Excel
  const exportToExcel = () => {
    const exportData = prepareExportData();
    const worksheet = utils.json_to_sheet(exportData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Data');
    
    // Điều chỉnh độ rộng cột
    const columnWidths = columns
      .filter(col => col.exportable !== false)
      .map(col => ({ wch: Math.max(12, col.name?.toString().length || 0) }));
    worksheet['!cols'] = columnWidths;
    
    writeFile(workbook, `${title || 'data'}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Xuất ra CSV
  const exportToCSV = () => {
    const exportData = prepareExportData();
    const headers = columns
      .filter(col => col.exportable !== false)
      .map(col => col.name?.toString() || '');
    
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Xử lý các giá trị có dấu phẩy
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title || 'data'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Xuất ra PDF
  const exportToPDF = () => {
    const exportData = prepareExportData();
    const headers = columns
      .filter(col => col.exportable !== false)
      .map(col => col.name?.toString() || '');
    
    const doc = new jsPDF();
    
    // Thêm tiêu đề
    if (title) {
      doc.text(title, 14, 15);
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
      doc.setFontSize(10);
    }
    
    // Tạo bảng
    doc.autoTable({
      head: [headers],
      body: exportData.map(row => headers.map(header => row[header] || '')),
      startY: title ? 30 : 15,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [66, 139, 202], textColor: 255 }
    });
    
    doc.save(`${title || 'data'}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Sao chép vào clipboard
  const copyToClipboard = () => {
    const exportData = prepareExportData();
    const headers = columns
      .filter(col => col.exportable !== false)
      .map(col => col.name?.toString() || '');
    
    const textContent = [
      headers.join('\t'),
      ...exportData.map(row => 
        headers.map(header => row[header] || '').join('\t')
      )
    ].join('\n');
    
    navigator.clipboard.writeText(textContent)
      .then(() => alert('Data copied to clipboard'))
      .catch(err => console.error('Failed to copy data: ', err));
  };

  // In dữ liệu
  const printData = () => {
    const exportData = prepareExportData();
    const headers = columns
      .filter(col => col.exportable !== false)
      .map(col => col.name?.toString() || '');
    
    // Tạo một cửa sổ in mới
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Tạo HTML cho bảng
    const tableHTML = `
      <html>
        <head>
          <title>${title || 'Data'}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h2 { margin-bottom: 10px; }
            .date { margin-bottom: 20px; color: #666; }
          </style>
        </head>
        <body>
          ${title ? `<h2>${title}</h2>` : ''}
          <div class="date">Generated on: ${new Date().toLocaleDateString()}</div>
          <table>
            <thead>
              <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${exportData.map(row => `
                <tr>
                  ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    
    // Đợi tải xong tài nguyên rồi in
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  // Sửa lại phần xử lý responsive columns
  const responsiveColumns = columns.map(column => {
    // Tạo bản sao của column để tránh thay đổi trực tiếp
    const newColumn = { ...column };
    
    // Xóa thuộc tính minWidth khỏi column để tránh lỗi
    delete newColumn.minWidth;
    
    // Điều chỉnh width dựa trên kích thước màn hình
    if (isMobile) {
      newColumn.width = undefined;
    }
    
    return newColumn;
  });

  // Custom styles cho DataTable
  const customStyles = {
    table: {
      style: {
        backgroundColor: '#ffffff',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #dee2e6',
      },
    },
    headCells: {
      style: {
        fontWeight: '600',
        color: '#495057',
        fontSize: '0.875rem',
      },
    },
    rows: {
      style: {
        minHeight: '48px',
        fontSize: '0.875rem',
        borderBottom: '1px solid #dee2e6',
        '&:hover': {
          backgroundColor: '#f8f9fa',
        },
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #dee2e6',
        fontSize: '0.875rem',
      },
    },
  };

  // SubHeader component với search và export buttons
  const subHeaderComponent = (
    <div className="d-flex flex-wrap justify-content-between align-items-center w-100 mb-3">
      <div className="mb-2 mb-md-0">
        <InputGroup>
          <InputGroup.Text>
            <i className="fas fa-search"></i>
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
          />
          {filterText && (
            <Button 
              variant="outline-secondary" 
              onClick={() => {
                setFilterText('');
                setResetPaginationToggle(!resetPaginationToggle);
              }}
            >
              <i className="fas fa-times"></i>
            </Button>
          )}
        </InputGroup>
      </div>
      
      {Object.values(buttons).some(Boolean) && (
        <div className="d-flex flex-wrap gap-2">
          {buttons.copy && (
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={copyToClipboard}
              title="Copy to clipboard"
            >
              <i className="fas fa-copy me-1"></i>
              {!isMobile && 'Copy'}
            </Button>
          )}
          {buttons.csv && (
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={exportToCSV}
              title="Export as CSV"
            >
              <i className="fas fa-file-csv me-1"></i>
              {!isMobile && 'CSV'}
            </Button>
          )}
          {buttons.excel && (
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={exportToExcel}
              title="Export as Excel"
            >
              <i className="fas fa-file-excel me-1"></i>
              {!isMobile && 'Excel'}
            </Button>
          )}
          {buttons.pdf && (
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={exportToPDF}
              title="Export as PDF"
            >
              <i className="fas fa-file-pdf me-1"></i>
              {!isMobile && 'PDF'}
            </Button>
          )}
          {buttons.print && (
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={printData}
              title="Print"
            >
              <i className="fas fa-print me-1"></i>
              {!isMobile && 'Print'}
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