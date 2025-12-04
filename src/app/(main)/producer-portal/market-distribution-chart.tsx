
'use client'

import { useEffect, useMemo, useState } from 'react';
import { Pie, PieChart, Cell } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

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

  const config = useMemo(() => {
    const cfg: any = { value: { label: 'Value' } };
    if (Array.isArray(chartData)) {
      chartData.forEach((d) => { cfg[d.market] = { label: d.market } });
    }
    return cfg as ChartConfig;
  }, [chartData]);

  const coloredData = useMemo(() => {
    if (!chartData) return [] as (ApiItem & { color: string })[];
    return chartData.map((d, i) => ({ ...d, color: generateColor(i, chartData.length) }));
  }, [chartData]);

  return (
    <ChartContainer
      config={config}
      className="min-h-[200px] w-full"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={coloredData}
          dataKey="value"
          nameKey="market"
          innerRadius={32}
          strokeWidth={5}
          outerRadius={60}
        >
          {coloredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <ChartLegend
            content={<ChartLegendContent nameKey="market" />}
            className="-mt-4 flex-wrap gap-x-2 gap-y-1 [&>*]:basis-auto [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
