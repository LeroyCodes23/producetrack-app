'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

const chartData = [
  { puc: "PUC-AO-001", packout: 92.5 },
  { puc: "PUC-SF-002", packout: 88.1 },
  { puc: "PUC-SF-001", packout: 95.2 },
  { puc: "PUC-GVO-001", packout: 91.3 },
  { puc: "PUC-CGE-002", packout: 89.8 },
];

const chartConfig = {
  packout: {
    label: "Packout %",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function PackoutChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
          <XAxis
            dataKey="puc"
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={50}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[80, 100]}
          />
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
           <Bar dataKey="packout" fill="var(--color-packout)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
