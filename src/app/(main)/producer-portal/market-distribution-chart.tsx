
'use client'

import { Pie, PieChart, Cell } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

const chartData = [
  { market: "UK", value: 480.31, color: "#FFC300" },
  { market: "US", value: 250.29, color: "#E74C3C" },
  { market: "EU", value: 151.08, color: "#293A80" },
  { market: "CA", value: 81.25, color: "#3498DB" },
  { market: "OT", value: 45.42, color: "#9B59B6" },
  { market: "FE", value: 26.29, color: "#F39C12" },
  { market: "ME", value: 11.39, color: "#600080" },
  { market: "ZA", value: 0.24, color: "#00BFFF" },
  { market: "RU", value: 0, color: "#1C2833" },
];

const chartConfig = {
  value: {
    label: "Value",
  },
  UK: { label: "UK", color: "#FFC300" },
  US: { label: "US", color: "#E74C3C" },
  EU: { label: "EU", color: "#293A80" },
  CA: { label: "CA", color: "#3498DB" },
  OT: { label: "OT", color: "#9B59B6" },
  FE: { label: "FE", color: "#F39C12" },
  ME: { label: "ME", color: "#600080" },
  ZA: { label: "ZA", color: "#00BFFF" },
  RU: { label: "RU", color: "#1C2833" },
} satisfies ChartConfig;

export default function MarketDistributionChart() {
  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[200px] w-full"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="market"
          innerRadius={32}
          strokeWidth={5}
          outerRadius={60}
        >
          {chartData.map((entry, index) => (
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
