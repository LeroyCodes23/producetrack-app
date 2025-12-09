'use client'

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { PlusCircle, Search } from "lucide-react";
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SensusData {
    FatherCard: string;
    CardName: string;
    FarmName: string;
    Orchard: string;
    FruitCode: string;
    PUC: string;
    YearPlnt: string;
    TreeWidth: number;
    RowWidth: number;
    TreeCount: number;
    Ha: number;
    HaBearing: number;
  // new/optional columns returned by stored procedure
  Commodity?: string;
  Comm?: string;
  Cultivar?: string;
  Variety?: string;
  BigStatus?: string;
  // some DBs might return column names with spaces
  // use index access for those if necessary when rendering
  OnderStam?: string;
}

export default function SensusTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sensusData, setSensusData] = useState<SensusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/sensus-data');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch data' }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSensusData(data);
      } catch (error: any) {
        console.error(error);
        setError(error.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm) {
      return sensusData;
    }
    const q = String(searchTerm).toLowerCase();
    const normalize = (v: any) => String(v ?? '').toLowerCase();

    return sensusData.filter(item =>
      normalize(item.FatherCard).includes(q) ||
      normalize(item.CardName).includes(q) ||
      normalize(item.PUC).includes(q) ||
      normalize(item.FruitCode).includes(q)
    );
  }, [searchTerm, sensusData]);

  // helper to pick the first non-empty value from possible column names
  const pickField = (item: any, ...keys: string[]) => {
    for (const k of keys) {
      const v = (item as any)[k];
      if (v !== undefined && v !== null && String(v) !== '') return String(v);
    }
    return 'N/A';
  };

  // Build a meaningful report title based on current search or rows
  const getReportTitle = (rows: SensusData[], opts?: { all?: boolean }) => {
    if (opts?.all) return 'Sensus Report: All Producers';
    if (!searchTerm) return `Sensus Report`;
    if (rows.length === 0) return `Sensus Report: '${searchTerm}'`;
    const firstProducer = rows[0].CardName;
    if (rows.every(r => r.CardName === firstProducer)) return `Sensus Report: '${firstProducer}'`;
    const firstFarm = rows[0].FarmName;
    if (rows.every(r => r.FarmName === firstFarm)) return `Sensus Report: '${firstFarm}'`;
    return `Sensus Report: '${searchTerm}'`;
  };

  // Export a styled PDF using html2canvas + jsPDF loaded from CDN
  // Export PDF, context-aware (all or filtered)
  const exportPdf = async (rows: SensusData[], opts?: { all?: boolean }) => {
    // Always use the correct data for full report
    const dataRows = opts?.all ? sensusData : rows;
    if (!dataRows || dataRows.length === 0) return;
    const logoUrl = await resolveLogoUrl();
    const reportTitle = getReportTitle(dataRows, opts);

    // build a container for the report
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '1600px'; // wider for landscape
    container.style.background = '#fff';
    container.innerHTML = `
      <div style="padding:20px;font-family:Arial,Helvetica,sans-serif;color:#000">
        <div style="display:flex;align-items:center;margin-bottom:12px">
          <img src="${logoUrl}" style="height:60px;margin-right:12px" alt="logo" />
          <h2 style="margin:0">${reportTitle}</h2>
        </div>
        <table style="border-collapse:collapse;width:100%">
          <thead>
            <tr>${['Producer Code','Producer Name','Farm Name','Comm','Cultivar','Variety','Orchard','PUC','Big Status','Plant year','Onderstam','TreeWidth','RowWidth','TreeCount','Ha','HaBearing'].map(c=>`<th style=\"border:1px solid #ccc;padding:6px;font-size:12px\">${c}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${dataRows.map(r=>`<tr>${[
              r.FatherCard ?? '',
              r.CardName ?? '',
              r.FarmName ?? '',
              pickField(r,'Commodity','Comm'),
              pickField(r,'Cultivar'),
              pickField(r,'Variety','FruitCode'),
              r.Orchard ?? '',
              r.PUC ?? '',
              pickField(r,'BigStatus','Big Status'),
              r.YearPlnt ?? '',
              pickField(r,'OnderStam','Onder Stam'),
              r.TreeWidth ?? '',
              r.RowWidth ?? '',
              r.TreeCount ?? '',
              r.Ha ?? '',
              r.HaBearing ?? ''
            ].map(cell=>`<td style=\"border:1px solid #ccc;padding:6px;font-size:12px\">${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>`;
    document.body.appendChild(container);

    const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
      if ((window as any).html2canvas && (window as any).jspdf) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load script ${src}`));
      document.head.appendChild(s);
    });

    try {
      // load html2canvas and jspdf UMD bundles from CDN
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

      // @ts-ignore
      const html2canvas = (window as any).html2canvas;
      // @ts-ignore
      const { jsPDF } = (window as any).jspdf || (window as any).jspdf || (window as any).jspdf || {};
      if (!html2canvas || !jsPDF) throw new Error('Required libraries not available');

      // Multi-page PDF rendering: slice the table if too tall
      const pdf = new jsPDF('l', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const canvas = await html2canvas(container, { scale: 2 });
      const imgProps = { width: canvas.width, height: canvas.height };
      const pageContentHeight = pageHeight - margin * 2;
      let renderedHeight = 0;

      while (renderedHeight < imgProps.height) {
        // Crop the current page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgProps.width;
        pageCanvas.height = Math.min(pageContentHeight * (imgProps.width / pageWidth), imgProps.height - renderedHeight);
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, renderedHeight,
            imgProps.width, pageCanvas.height,
            0, 0,
            imgProps.width, pageCanvas.height
          );
        }
        const imgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        const drawWidth = pageWidth - margin * 2;
        const drawHeight = pageCanvas.height * (drawWidth / imgProps.width);
        pdf.addImage(imgData, 'JPEG', margin, margin, drawWidth, drawHeight);
        renderedHeight += pageCanvas.height;
        if (renderedHeight < imgProps.height) pdf.addPage();
      }
      pdf.save(`sensus_export_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error('PDF export failed', err);
      alert('PDF generation failed — falling back to print preview.');
      printReport(dataRows);
    } finally {
      container.remove();
    }
  };

  // Export filtered data to CSV (opens in Excel)
  const candidateLogoPaths = [
    '/logo-citrusdal-100.jpg',
    '/logo-citrusdal.jpg',
    '/Citrusdal_100 Jaar Logo [Final] jpeg.jpg'
  ];

  const resolveLogoUrl = async () => {
    for (const p of candidateLogoPaths) {
      try {
        const url = new URL(p, window.location.origin).href;
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) return url;
      } catch (e) {
        // ignore and try next
      }
    }
    // fallback to first candidate URL
    return new URL(candidateLogoPaths[candidateLogoPaths.length - 1], window.location.origin).href;
  };

  // Export CSV, context-aware (all or filtered)
  const exportCsv = async (rows: SensusData[], opts?: { all?: boolean }) => {
    if (!rows || rows.length === 0) return;
    const logoUrl = await resolveLogoUrl();
    const reportTitle = getReportTitle(rows, opts);
    const headers = [
      'Producer Code','Producer Name','Farm Name','Comm','Cultivar','Variety','Orchard','PUC','Big Status','Plant year','Onderstam','TreeWidth','RowWidth','TreeCount','Ha','HaBearing'
    ];
    const escape = (v: any) => {
      if (v === null || v === undefined) return '';
      const s = String(v).replace(/"/g, '""');
      return `"${s}"`;
    };

    // First lines: metadata (report title, company, exported by, date, logo URL)
    const companyName = 'Citrusdal';
    const exportedBy = (window as any).__CURRENT_USER_NAME__ || 'Unknown';
    const exportDate = new Date().toISOString();

    const lines = [
      [escape('Report Title'), escape(reportTitle)].join(','),
      [escape('Company'), escape(companyName)].join(','),
      [escape('Exported By'), escape(exportedBy)].join(','),
      [escape('Export Date'), escape(exportDate)].join(','),
      [escape('Logo URL'), escape(logoUrl)].join(','),
      '', // blank line between metadata and headers
      headers.join(',')
    ];
    for (const r of rows) {
      const line = [
        escape(r.FatherCard),
        escape(r.CardName),
        escape(r.FarmName),
        escape(pickField(r, 'Commodity', 'Comm')),
        escape(pickField(r, 'Cultivar')),
        escape(pickField(r, 'Variety', 'FruitCode')),
        escape(r.Orchard),
        escape(r.PUC),
        escape(pickField(r, 'BigStatus', 'Big Status')),
        escape(r.YearPlnt),
        escape(pickField(r, 'OnderStam', 'Onder Stam')),
        escape(r.TreeWidth),
        escape(r.RowWidth),
        escape(r.TreeCount),
        escape(r.Ha),
        escape(r.HaBearing),
      ].join(',');
      lines.push(line);
    }

    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sensus_export_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Print a simple HTML table (user can save as PDF via browser print)
  // Print PDF, context-aware (all or filtered)
  const printReport = (rows: SensusData[], opts?: { all?: boolean }) => {
    // keep synchronous print using a resolved URL from the candidate paths
    const logoUrl = new URL(candidateLogoPaths[candidateLogoPaths.length - 1], window.location.origin).href;
    const reportTitle = getReportTitle(rows, opts);
    const cols = ['Producer Code','Producer Name','Farm Name','Comm','Cultivar','Variety','Orchard','PUC','Big Status','Plant year','Onderstam','TreeWidth','RowWidth','TreeCount','Ha','HaBearing'];
    const tableRows = rows.map(r => `
      <tr>
        <td>${r.FatherCard ?? ''}</td>
        <td>${r.CardName ?? ''}</td>
        <td>${r.FarmName ?? ''}</td>
        <td>${pickField(r,'Commodity','Comm')}</td>
        <td>${pickField(r,'Cultivar')}</td>
        <td>${pickField(r,'Variety','FruitCode')}</td>
        <td>${r.Orchard ?? ''}</td>
        <td>${r.PUC ?? ''}</td>
        <td>${pickField(r,'BigStatus','Big Status')}</td>
        <td>${r.YearPlnt ?? ''}</td>
        <td>${pickField(r,'OnderStam','Onder Stam')}</td>
        <td>${r.TreeWidth ?? ''}</td>
        <td>${r.RowWidth ?? ''}</td>
        <td>${r.TreeCount ?? ''}</td>
        <td>${r.Ha ?? ''}</td>
        <td>${r.HaBearing ?? ''}</td>
      </tr>`).join('\n');
    const html = `
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 12mm; }
              html, body { width: 100%; height: 100%; }
                  table { page-break-inside: auto; }
                  tr { page-break-inside: avoid; page-break-after: auto; }
                  thead { display: table-header-group; }
                  tfoot { display: table-footer-group; }
            }
            body{margin:0;padding:8px;font-family:Arial,Helvetica,sans-serif}
            table{border-collapse:collapse;width:100%}
            td,th{border:1px solid #ccc;padding:6px;font-size:10px}
            .report-header{display:flex;align-items:center;margin-bottom:12px}
            .report-header img{height:60px;margin-right:12px}
          </style>
        </head>
        <body>
          <div class="report-header">
            <img src="${logoUrl}" alt="logo" />
            <h2>${reportTitle}</h2>
          </div>
          <table>
            <thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>`;

    const w = window.open('', '_blank');
    if (!w) {
      alert('Unable to open print window. Please allow popups for this site.');
      return;
    }
    w.document.write(html);
    w.document.close();
    w.focus();
    // delay print to allow render (give image time to load)
    setTimeout(() => { w.print(); }, 800);
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-[60vh]">
          <p>Loading data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-[60vh] text-red-500">
          <p>Error: {error}</p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[60vh]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producer Code</TableHead>
              <TableHead>Producer Name</TableHead>
              <TableHead>Farm Name</TableHead>
              <TableHead>Comm</TableHead>
              <TableHead>Cultivar</TableHead>
              <TableHead>Variety</TableHead>
              <TableHead>Orchard</TableHead>
              <TableHead>PUC</TableHead>
              <TableHead>Big Status</TableHead>
              <TableHead>Plant year</TableHead>
              <TableHead>Onderstam</TableHead>
              <TableHead>TreeWidth</TableHead>
              <TableHead>RowWidth</TableHead>
              <TableHead>Tree Count</TableHead>
              <TableHead>Sum of Hectares</TableHead>
              <TableHead>Bearing Ha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <TableRow key={`${item.PUC}-${item.Orchard}-${index}`}>
                  <TableCell>{item.FatherCard}</TableCell>
                  <TableCell>{item.CardName}</TableCell>
                  <TableCell>{item.FarmName}</TableCell>
                      <TableCell>{pickField(item, 'Commodity', 'Comm')}</TableCell>
                      <TableCell>{pickField(item, 'Cultivar')}</TableCell>
                      <TableCell>{pickField(item, 'Variety', 'FruitCode')}</TableCell>
                  <TableCell>{item.Orchard}</TableCell>
                  <TableCell>{item.PUC}</TableCell>
                      <TableCell>{pickField(item, 'BigStatus', 'Big Status')}</TableCell>
                      <TableCell>{item.YearPlnt}</TableCell>
                      <TableCell>{pickField(item, 'OnderStam', 'Onder Stam')}</TableCell>
                  <TableCell>{item.TreeWidth}</TableCell>
                  <TableCell>{item.RowWidth}</TableCell>
                  <TableCell>{item.TreeCount}</TableCell>
                  <TableCell>{item.Ha}</TableCell>
                  <TableCell>{item.HaBearing}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={15} className="h-24 text-center text-muted-foreground">
                  No sensus data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    );
  };

  return (
    <Card>
      <CardHeader>
           <div className="flex justify-between items-center">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="search" 
                      placeholder="Search by producer code, producer name, PUC, or variety..." 
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Sensus
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    if (!searchTerm) {
                      exportCsv(sensusData, { all: true });
                    } else {
                      exportCsv(filteredData);
                    }
                  }}>
                    Export CSV
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        Download/Print PDF
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        if (!searchTerm) {
                          exportPdf(sensusData, { all: true });
                        } else {
                          exportPdf(filteredData);
                        }
                      }}>
                        Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        if (!searchTerm) {
                          printReport(sensusData, { all: true });
                        } else {
                          printReport(filteredData);
                        }
                      }}>
                        Print PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
            </div>
      </CardHeader>
      <CardContent>
        {renderTableContent()}
      </CardContent>
    </Card>
  );
}
