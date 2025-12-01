'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { JourneyBin } from "@/lib/types";

interface VarietyPerformanceChartProps {
    data: JourneyBin[];
}

const chartConfig = {
    totalBins: {
        label: "Total Bins",
        color: "hsl(var(--chart-1))",
    },
    totalCartons: {
        label: "Total Cartons",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

export default function VarietyPerformanceChart({ data }: VarietyPerformanceChartProps) {
    const CARTONS_PER_BIN = 25; // Mock conversion rate

    const processedData = data.reduce((acc, bin) => {
        const variety = bin.Variety ?? "Unknown";
        if (!acc[variety]) {
            acc[variety] = {
                variety: variety,
                totalBins: 0,
            };
        }
        acc[variety].totalBins += bin.Bins ?? 0;
        return acc;
    }, {} as Record<string, { variety: string, totalBins: number }>);

    const chartData = Object.values(processedData).map(item => ({
        ...item,
        totalCartons: item.totalBins * CARTONS_PER_BIN,
    })).slice(0, 7); // Limiting to 7 varieties for better visibility


    return (
        // Make this container fill whatever height the parent gives it (parent must set a height!)
        <ChartContainer config={chartConfig} className="w-full h-full">
            {/* ResponsiveContainer needs an explicit height from parent — we use 100% so parent controls it */}
            <ResponsiveContainer width="100%" height="100%">
                {/* Give extra bottom margin so x-axis labels fit */}
                <BarChart
                    data={chartData}
                    margin={{ top: 16, right: 16, left: 8, bottom: 40 }}
                    barCategoryGap="20%"
                >
                    {/* optional: reduce visual clutter */}
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                        dataKey="variety"
                        tickLine={false}
                        tickMargin={8}
                        axisLine={false}
                        interval={0}                // draw every tick
                        angle={-25}                 // rotate labels to avoid overlap
                        textAnchor="end"            // align rotated labels
                        tickFormatter={(value: string) => (String(value).length > 10 ? `${String(value).slice(0, 10)}…` : value)}
                    />
                    <YAxis />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    {/* barSize keeps bars from being too wide */}
                    <Bar dataKey="totalBins" fill="var(--color-totalBins)" radius={4} barSize={18} />
                    <Bar dataKey="totalCartons" fill="var(--color-totalCartons)" radius={4} barSize={18} />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    )
}
