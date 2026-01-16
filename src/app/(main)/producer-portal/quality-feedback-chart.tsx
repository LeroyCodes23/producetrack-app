
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
  { feedback: "Red", value: 6.03, color: "red" },
  { feedback: "Orange", value: 3.5, color: "orange" },
  { feedback: "Green", value: 29.74, color: "green" },
  { feedback: "Finalized without Claim", value: 58.63, color: "blue" },
  { feedback: "Finalized with Claim", value: 2.1, color: "brown" },
];

const chartConfig = {
  value: {
    label: "Value",
  },
  Red: {
    label: "Red",
    color: "red",
  },
  Orange: {
    label: "Orange",
    color: "orange",
  },
  Green: {
    label: "Green",
    color: "green",
  },
  "Finalized without Claim": {
    label: "Finalized without Claim",
    color: "blue",
  },
  "Finalized with Claim": {
    label: "Finalized with Claim",
    color: "brown",
  },
} satisfies ChartConfig;

export default function QualityFeedbackChart() {
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
          nameKey="feedback"
          innerRadius={32}
          strokeWidth={5}
          outerRadius={60}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <ChartLegend
            content={<ChartLegendContent nameKey="feedback" />}
            className="-mt-4 flex-wrap gap-x-4 gap-y-2 [&>*]:basis-auto [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
