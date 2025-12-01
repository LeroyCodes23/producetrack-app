"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Package, Tractor, DollarSign, Percent } from "lucide-react";

const lineChartData = [
  { month: "Jan", harvested: 186 },
  { month: "Feb", harvested: 305 },
  { month: "Mar", harvested: 237 },
  { month: "Apr", harvested: 273 },
  { month: "May", harvested: 209 },
  { month: "Jun", harvested: 214 },
];

const barChartData = [
    { produce: "Apples", packout: 85 },
    { produce: "Oranges", packout: 92 },
    { produce: "Grapes", packout: 78 },
    { produce: "Berries", packout: 95 },
    { produce: "Pears", packout: 88 },
];

const lineChartConfig = {
  harvested: {
    label: "Harvested (tons)",
    color: "hsl(var(--chart-1))",
  },
};

const barChartConfig = {
    packout: {
      label: "Packout %",
      color: "hsl(var(--chart-2))",
    },
  };

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total PUCs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,254</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Harvested (tons)
            </CardTitle>
            <Tractor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,380</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Packout
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88.5%</div>
            <p className="text-xs text-muted-foreground">+1.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Export Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,150,320</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Harvested Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={lineChartConfig} className="h-[250px] w-full">
              <LineChart data={lineChartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Line
                  dataKey="harvested"
                  type="monotone"
                  stroke="var(--color-harvested)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Packout by Produce</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-[250px] w-full">
                <BarChart data={barChartData} accessibilityLayer>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="produce"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                    />
                    <YAxis 
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                     <Bar dataKey="packout" fill="var(--color-packout)" radius={4} />
                </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
