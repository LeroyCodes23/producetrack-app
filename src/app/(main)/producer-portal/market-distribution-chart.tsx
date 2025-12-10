
'use client'

import { useEffect, useMemo, useState } from 'react';
import { Pie, PieChart, Cell, Tooltip as ReTooltip, ResponsiveContainer } from "recharts";

type ApiItem = { region: string; value: number; pct?: number };

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
        // Use all regions present in API response
        if (Array.isArray(data)) {
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
              nameKey="region"
              innerRadius="35%"
              strokeWidth={0}
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

      <div
        className="w-full flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-[10px] text-gray-900"
        style={{ marginTop: '8px', marginBottom: '2mm', maxWidth: '320px' }}
      >
        {coloredData.map((d) => (
          <div
            key={d.region}
            className="flex items-center"
            style={{ minWidth: '60px', maxWidth: '120px', margin: '0 5px', whiteSpace: 'normal' }}
            title={`${d.region}${d.pct !== undefined ? ` — ${d.pct}%` : ''}`}
          >
            <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ backgroundColor: d.color }} />
            <span>{d.region}{d.pct !== undefined ? ` — ${d.pct}%` : ''}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
