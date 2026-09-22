'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Sprout,
  Package,
  Snowflake,
  Boxes,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BinDetailFull {
  BINNUMBER: string;
  SEASON: string | null;
  CLIENT: string | null;
  ORCHARD: string | null;
  PACKHOUSE: string | null;
  POOL: string | null;
  STOCK_POOL: string | null;
  SUB_POOL: string | null;
  COMMODITY: string | null;
  Cultivar: string | null;
  VARIETY: string | null;
  IN_TYPE: string | null;
  IN_NUMBER: string | null;
  IN_DATE_TIME: string | null;
  IN_WEIGHT: number | null;
  SALE_NUMBER: string | null;
  RUN_NUMBER: string | null;
  OUT_DATE_TIME: string | null;
  OUT_WEIGHT: number | null;
  DEGREENING_ROOM: string | null;
  DEGREEN_START: string | null;
  DEGREEN_DURATION: string | null;
  GRADE: string | null;
  TRANS_USER: string | null;
  TRANS_DATE_TIME: string | null;
  PROCESSED: string | null;
}

interface BinJourneyTimelineProps {
  binNumber: string;
  onBack: () => void;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function hasValue(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value !== '';
}

function isMeaningfulNumber(value: string | null | undefined): boolean {
  return hasValue(value) && value !== '0';
}

function formatPool(stockPool: string | null, pool: string | null): string {
  const hasStockPool = hasValue(stockPool);
  const hasPool = hasValue(pool);
  if (hasStockPool && hasPool) return `${stockPool} (${pool})`;
  if (hasStockPool) return stockPool as string;
  if (hasPool) return pool as string;
  return '—';
}

function formatWeight(value: number | null): string {
  if (value === null || value === undefined) return '—';
  return `${value} kg`;
}

export default function BinJourneyTimeline({ binNumber, onBack }: BinJourneyTimelineProps) {
  const [bin, setBin] = useState<BinDetailFull | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchBin = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const response = await fetch(`/api/bin-register/${encodeURIComponent(binNumber)}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (response.status === 404) {
          setNotFound(true);
          setBin(null);
          return;
        }
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const json = await response.json();
        setBin(json.data ?? null);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error('Failed to fetch bin journey:', err);
        setError('Failed to load bin journey.');
      } finally {
        setLoading(false);
      }
    };

    fetchBin();

    return () => controller.abort();
  }, [binNumber, retryKey]);

  const stages = bin
    ? [
        {
          key: 'harvested',
          label: 'Harvested',
          icon: Sprout,
          date: formatDate(bin.IN_DATE_TIME),
          completed: hasValue(bin.IN_DATE_TIME),
        },
        {
          key: 'in-packhouse',
          label: 'IN at Packhouse',
          icon: Package,
          date: formatDate(bin.IN_DATE_TIME),
          completed: hasValue(bin.IN_DATE_TIME),
        },
        {
          key: 'degreening',
          label: 'Degreening',
          icon: Snowflake,
          date: formatDate(bin.DEGREEN_START),
          completed: hasValue(bin.DEGREENING_ROOM) || hasValue(bin.DEGREEN_START),
        },
        {
          key: 'packed',
          label: 'Packed',
          icon: Boxes,
          date: formatDate(bin.OUT_DATE_TIME),
          completed: hasValue(bin.OUT_DATE_TIME),
        },
        {
          key: 'sold',
          label: 'Sold',
          icon: DollarSign,
          date: isMeaningfulNumber(bin.SALE_NUMBER) ? 'Sold' : '—',
          completed: isMeaningfulNumber(bin.SALE_NUMBER),
        },
      ]
    : [];

  const detailRows = bin
    ? [
        ['Season', bin.SEASON || '—'],
        ['IN Number', bin.IN_NUMBER || '—'],
        ['Pool', formatPool(bin.STOCK_POOL, bin.POOL)],
        ['Sub Pool', bin.SUB_POOL || '—'],
        ['Commodity', bin.COMMODITY || '—'],
        ['Cultivar', bin.Cultivar || '—'],
        ['Variety', bin.VARIETY || '—'],
        ['Grade', bin.GRADE || '—'],
        ['IN Weight', formatWeight(bin.IN_WEIGHT)],
        ['OUT Weight', bin.OUT_WEIGHT !== null ? formatWeight(bin.OUT_WEIGHT) : '—'],
        ['IN Date', formatDate(bin.IN_DATE_TIME)],
        ['OUT Date', formatDate(bin.OUT_DATE_TIME)],
        ['Degreening Room', bin.DEGREENING_ROOM || '—'],
        ['Degreening Start', formatDate(bin.DEGREEN_START)],
        ['Degreening Duration', bin.DEGREEN_DURATION || '—'],
        ['Sale Number', isMeaningfulNumber(bin.SALE_NUMBER) ? bin.SALE_NUMBER : '—'],
        ['Run Number', isMeaningfulNumber(bin.RUN_NUMBER) ? bin.RUN_NUMBER : '—'],
        ['Trans User', bin.TRANS_USER || '—'],
        ['Trans Date', formatDate(bin.TRANS_DATE_TIME)],
      ]
    : [];

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 -ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Bins
      </Button>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={() => setRetryKey((k) => k + 1)}>
            Retry
          </Button>
        </div>
      ) : notFound || !bin ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Bin not found.
        </p>
      ) : (
        <>
          <div>
            <h2 className="text-lg font-semibold">Bin {bin.BINNUMBER}</h2>
            <p className="text-sm text-muted-foreground">
              {bin.ORCHARD} · {bin.PACKHOUSE} · {bin.Cultivar} · {bin.VARIETY}
            </p>
            <p className="mt-1 text-sm font-medium">{formatWeight(bin.IN_WEIGHT)}</p>
          </div>

          <div className="mt-6 flex items-start justify-between">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <div key={stage.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="relative">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full border-2',
                          stage.completed
                            ? 'border-green-600 bg-green-50 text-green-600'
                            : 'border-muted-foreground/30 bg-muted text-muted-foreground'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      {stage.completed && (
                        <CheckCircle2 className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-background text-green-600" />
                      )}
                    </div>
                    <span className="text-xs font-medium">{stage.label}</span>
                    <span className="text-xs text-muted-foreground">{stage.date}</span>
                    <Badge
                      variant={stage.completed ? 'default' : 'secondary'}
                      className={cn(
                        'text-[10px]',
                        stage.completed ? 'bg-green-600 hover:bg-green-600' : ''
                      )}
                    >
                      {stage.completed ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                  {index < stages.length - 1 && (
                    <div
                      className={cn(
                        'mx-1 mt-[-2rem] h-0.5 flex-1',
                        stage.completed ? 'bg-green-600' : 'bg-muted-foreground/30'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3">
            {detailRows.map(([label, value]) => (
              <div key={label} className="flex flex-col">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Button variant="outline" disabled title="Coming soon" className="w-full">
              View Pallet Journey →
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
