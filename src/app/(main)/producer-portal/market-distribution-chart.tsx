
'use client'

import { useEffect, useMemo, useState } from 'react';
import { Pie, PieChart, Cell, Tooltip as ReTooltip, ResponsiveContainer } from "recharts";

type ApiItem = { market: string; value: number; pct?: number };

function generateColor(i: number, n: number) {
  const hue = Math.round((i * 360) / n) % 360;
  return `hsl(${hue} 75% 50%)`;
}

export default function MarketDistributionChart() {
  const [chartData, setChartData] = useState<ApiItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/market-distribution')
      .then((r) => r.json())
      .then((data: any) => {
        if (!mounted) return;
        // validate response shape: expect an array of {market, value}
        if (Array.isArray(data) && data.every(item => item && typeof item.market === 'string' && typeof item.value === 'number')) {
          setChartData(data as ApiItem[]);
        } else {
          console.error('market-distribution: unexpected API response', data);
          setChartData([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load market distribution:', err);
        if (mounted) setChartData([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false };
  }, []);

  const coloredData = useMemo(() => {
    if (!chartData) return [] as (ApiItem & { color: string })[];
    return chartData.map((d, i) => ({ ...d, color: generateColor(i, chartData.length) }));
  }, [chartData]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <ReTooltip cursor={false} />
            <Pie
              data={coloredData}
              dataKey="value"
              nameKey="market"
              innerRadius="35%"
              strokeWidth={2}
              outerRadius="70%"
              cx="50%"
              cy="50%"
            >
              {coloredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 w-full overflow-auto max-h-36">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 justify-items-start px-4 text-[11px] md:text-xs">
          {coloredData.map((d) => (
            <div key={d.market} className="flex items-center gap-2 whitespace-nowrap">
              <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: d.color }} />
              <span className="truncate">{d.market}{d.pct !== undefined ? ` — ${d.pct}%` : ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
