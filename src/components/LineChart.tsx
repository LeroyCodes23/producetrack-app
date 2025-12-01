'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

interface LineChartProps {
  data: any[];
  config: any;
}

export default function ReusableLineChart({ data, config }: LineChartProps) {
  const lines = Object.keys(config).filter(key => key !== 'xAxis');

  return (
    <ChartContainer config={config} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey={config.xAxis.dataKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value}
          />
          <YAxis
             tickLine={false}
             axisLine={false}
             tickMargin={8}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          {lines.map((lineKey) => (
            <Line
              key={lineKey}
              dataKey={lineKey}
              type="monotone"
              stroke={config[lineKey].color}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
