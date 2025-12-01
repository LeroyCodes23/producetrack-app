'use client'

import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

const chartData = [
    { grade: 'Grade A', value: 72.8, fill: 'hsl(var(--chart-2))' },
    { grade: 'Grade B', value: 19.3, fill: 'hsl(var(--chart-1))' },
    { grade: 'Defects', value: 7.9, fill: 'hsl(var(--chart-5))' },
];

const chartConfig = {
  value: {
    label: "Value",
  },
  'Grade A': {
    label: "Grade A",
    color: "hsl(var(--chart-2))",
  },
  'Grade B': {
    label: "Grade B",
    color: "hsl(var(--chart-1))",
  },
  'Defects': {
    label: "Defects",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export default function QualityChart() {
    return (
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer>
                <PieChart>
                    <Tooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="grade"
                        innerRadius={60}
                        strokeWidth={5}
                    />
                    <ChartLegend
                        content={<ChartLegendContent nameKey="grade" />}
                        className="-translate-y-[2rem] flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                    />
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
    )
}
