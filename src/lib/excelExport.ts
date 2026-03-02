// Excel Export Utility for Parts Table
import * as XLSX from 'xlsx';
import type { InspectionData, PhotoData, AdditionalPart, PhotoCategory } from '@/types/report';

interface ExcelPartRow {
  Cliente: string;
  Descrição: string;
  Equipamento: string;
  Data: string;
  Mês: string;
  PN: string;
  Quantidade: string;
  Criticidade: string;
  'Nome da Peça': string;
}

// Get month name from date string
function getMonthName(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '-';
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const monthIndex = parseInt(parts[1], 10) - 1;
  if (monthIndex >= 0 && monthIndex < 12) {
    return monthNames[monthIndex];
  }
  return '-';
}

// Format date for display
function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parts[2].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[0];
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

// Export parts table to Excel for Home tab (with categories)
export function exportPartsTableToExcelHome(
  inspection: InspectionData,
  categories: PhotoCategory[]
): void {
  const rows: ExcelPartRow[] = [];
  
  // Process all parts from all categories
  categories.forEach((category) => {
    // Main parts
    category.photos.filter(p => p.pn).forEach((photo) => {
      rows.push({
        Cliente: inspection.cliente || '-',
        Descrição: inspection.descricao || '-',
        Equipamento: inspection.tag || '-',
        Data: formatDate(inspection.data),
        Mês: getMonthName(inspection.data),
        PN: photo.pn,
        Quantidade: photo.quantity || '-',
        Criticidade: photo.criticality || '-',
        'Nome da Peça': photo.partName || '-',
      });
      
      // Sub-parts
      category.additionalParts
        .filter(ap => ap.parentPn === photo.pn)
        .forEach((subPart) => {
          rows.push({
            Cliente: inspection.cliente || '-',
            Descrição: inspection.descricao || '-',
            Equipamento: inspection.tag || '-',
            Data: formatDate(inspection.data),
            Mês: getMonthName(inspection.data),
            PN: subPart.pn,
            Quantidade: subPart.quantity || '-',
            Criticidade: subPart.criticality || '-',
            'Nome da Peça': subPart.partName || '-',
          });
        });
    });
  });
  
  generateExcelFile(rows, inspection);
}

// Export parts table to Excel for Inspeção tab
export function exportPartsTableToExcelInspecao(
  inspection: InspectionData,
  photos: PhotoData[],
  additionalParts: AdditionalPart[]
): void {
  const rows: ExcelPartRow[] = [];
  
  // Main parts
  photos.filter(p => p.pn).forEach((photo) => {
    rows.push({
      Cliente: inspection.cliente || '-',
      Descrição: inspection.descricao || '-',
      Equipamento: inspection.tag || '-',
      Data: formatDate(inspection.data),
      Mês: getMonthName(inspection.data),
      PN: photo.pn,
      Quantidade: photo.quantity || '-',
      Criticidade: photo.criticality || '-',
      'Nome da Peça': photo.partName || '-',
    });
    
    // Sub-parts
    additionalParts
      .filter(ap => ap.parentPn === photo.pn)
      .forEach((subPart) => {
        rows.push({
          Cliente: inspection.cliente || '-',
          Descrição: inspection.descricao || '-',
          Equipamento: inspection.tag || '-',
          Data: formatDate(inspection.data),
          Mês: getMonthName(inspection.data),
          PN: subPart.pn,
          Quantidade: subPart.quantity || '-',
          Criticidade: subPart.criticality || '-',
          'Nome da Peça': subPart.partName || '-',
        });
      });
  });
  
  generateExcelFile(rows, inspection);
}

// Generate the Excel file
function generateExcelFile(rows: ExcelPartRow[], inspection: InspectionData): void {
  if (rows.length === 0) {
    alert('Não há peças para exportar.');
    return;
  }
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  
  // Set column widths
  const colWidths = [
    { wch: 20 }, // Cliente
    { wch: 30 }, // Descrição
    { wch: 15 }, // Equipamento
    { wch: 12 }, // Data
    { wch: 12 }, // Mês
    { wch: 15 }, // PN
    { wch: 10 }, // Quantidade
    { wch: 12 }, // Criticidade
    { wch: 30 }, // Nome da Peça
  ];
  ws['!cols'] = colWidths;
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Tabela de Peças');
  
  // Generate filename
  const tag = inspection.tag || 'export';
  const date = new Date().toISOString().split('T')[0];
  const filename = `Tabela_Pecas_${tag}_${date}.xlsx`;
  
  // Write and download
  XLSX.writeFile(wb, filename);
}
