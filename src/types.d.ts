declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';
  
  interface jsPDFAPI extends jsPDF {
    autoTable: (options: any) => jsPDF;
  }
  
  const autoTable: (options: any) => void;
  export default autoTable;
} 