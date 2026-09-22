'use client';

import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BinJourneyTimeline from './bin-journey-timeline';

interface BinDetailRow {
  BINNUMBER: string;
  IN_NUMBER: string | null;
  POOL: string | null;
  STOCK_POOL: string | null;
  SUB_POOL: string | null;
  IN_DATE_TIME: string | null;
  SALE_NUMBER: string | null;
  RUN_NUMBER: string | null;
  OUT_DATE_TIME: string | null;
  DEGREENING_ROOM: string | null;
  GRADE: string | null;
}

interface BinDetailDrawerRow {
  Orchard: string;
  PACKHOUSE: string;
  Cultivar: string;
  Variety: string;
  Bins: number;
  BinsKG: number;
}

interface BinDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  row: BinDetailDrawerRow | null;
  season: string;
  onBinClick: (binNumber: string) => void;
}

const PAGE_SIZE = 20;

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatNumberField(value: string | null): string {
  if (!value || value === '0') return '—';
  return value;
}

function formatPool(stockPool: string | null, pool: string | null): string {
  const hasStockPool = stockPool !== null && stockPool !== '';
  const hasPool = pool !== null && pool !== '';
  if (hasStockPool && hasPool) return `${stockPool} (${pool})`;
  if (hasStockPool) return stockPool as string;
  if (hasPool) return pool as string;
  return '—';
}

export default function BinDetailDrawer({
  open,
  onClose,
  row,
  season,
  onBinClick,
}: BinDetailDrawerProps) {
  const [bins, setBins] = useState<BinDetailRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [selectedBinNumber, setSelectedBinNumber] = useState<string | null>(null);

  // reset to page 1 and clear the timeline whenever the selected row changes
  useEffect(() => {
    setPage(1);
    setSelectedBinNumber(null);
  }, [row?.Orchard, row?.PACKHOUSE, row?.Cultivar, row?.Variety]);

  // clear the timeline whenever the drawer closes
  useEffect(() => {
    if (!open) setSelectedBinNumber(null);
  }, [open]);

  useEffect(() => {
    if (!open || !row) return;

    const controller = new AbortController();

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          orchard: row.Orchard,
          packhouse: row.PACKHOUSE,
          cultivar: row.Cultivar,
          variety: row.Variety,
          season,
          page: String(page),
          pageSize: String(PAGE_SIZE),
        });
        const response = await fetch(`/api/bin-register/detail?${params.toString()}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const json = await response.json();
        setBins(Array.isArray(json.data) ? json.data : []);
        setTotal(typeof json.total === 'number' ? json.total : 0);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error('Failed to fetch bin detail:', err);
        setError('Failed to load bin details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();

    return () => controller.abort();
  }, [open, row, season, page, retryKey]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Sheet open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Bin Details</SheetTitle>
          {row && (
            <SheetDescription>
              {row.Orchard} · {row.PACKHOUSE} · {row.Cultivar} · {row.Variety}
            </SheetDescription>
          )}
        </SheetHeader>

        {row && !selectedBinNumber && (
          <div className="mt-2 text-sm font-medium text-muted-foreground">
            {row.Bins} bins · {row.BinsKG.toFixed(2)} kg
          </div>
        )}

        <div className="mt-4">
          {selectedBinNumber ? (
            <BinJourneyTimeline
              binNumber={selectedBinNumber}
              onBack={() => setSelectedBinNumber(null)}
            />
          ) : loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={() => setRetryKey((k) => k + 1)}>
                Retry
              </Button>
            </div>
          ) : bins.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No bins found for this row
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bin Number</TableHead>
                      <TableHead>IN No</TableHead>
                      <TableHead>Pool</TableHead>
                      <TableHead>IN Date</TableHead>
                      <TableHead>Sale No</TableHead>
                      <TableHead>Run No</TableHead>
                      <TableHead>OUT Date</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bins.map((bin) => (
                      <TableRow key={bin.BINNUMBER}>
                        <TableCell>
                          <button
                            type="button"
                            className="text-primary underline-offset-2 hover:underline"
                            onClick={() => {
                              setSelectedBinNumber(bin.BINNUMBER);
                              onBinClick(bin.BINNUMBER);
                            }}
                          >
                            {bin.BINNUMBER}
                          </button>
                        </TableCell>
                        <TableCell>{bin.IN_NUMBER || '—'}</TableCell>
                        <TableCell>{formatPool(bin.STOCK_POOL, bin.POOL)}</TableCell>
                        <TableCell>{formatDate(bin.IN_DATE_TIME)}</TableCell>
                        <TableCell>{formatNumberField(bin.SALE_NUMBER)}</TableCell>
                        <TableCell>{formatNumberField(bin.RUN_NUMBER)}</TableCell>
                        <TableCell>{formatDate(bin.OUT_DATE_TIME)}</TableCell>
                        <TableCell>{bin.GRADE || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Prev
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
