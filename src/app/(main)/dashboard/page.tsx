import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CircleDollarSign, Package, Tractor, Percent } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import ReusableLineChart from "@/components/LineChart";
import { harvests } from "@/lib/data";
import ParallaxBackground from "../producer-portal/parallax-background";
import type { ChartConfig } from "@/components/ui/chart";

export default function DashboardPage() {
  const dashboardBanner = PlaceHolderImages.find(
    (img) => img.id === "dashboard-banner"
  );
  const totalPUCs = 542;
  const totalHarvested = 58; // Mock data
  const avgPackout = 91.6; // Mock data
  const totalExportValue = 250000; // Mock data

  const lineChartData = harvests.map((h) => ({
    date: new Date(h.harvestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    quantity: h.quantity,
  }));

  const chartConfig = {
    quantity: {
      label: "Quantity (Tons)",
      color: "hsl(var(--chart-2))",
    },
    xAxis: {
      dataKey: "date",
    }
  } satisfies ChartConfig;


  return (
    <div className="space-y-4">
      <ParallaxBackground imageUrl="/MDash-background.jpg" />

      {/* make the content wrapper shrinkable in flex containers */}
      <div className="relative z-10 space-y-4 min-w-0">
        {/* Banner container: constrained parent for next/image fill */}
        <div className="relative w-full h-48 md:h-56 rounded-lg overflow-hidden border-2 border-[#8BC34A]">
          {dashboardBanner && (
            <Image
              src={dashboardBanner.imageUrl}
              alt={dashboardBanner.description}
              fill
              className="object-cover w-full h-full max-w-full"
              data-ai-hint={dashboardBanner.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center p-6 md:p-8">
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-white shadow-lg">
              Welcome to ProduceTrack
            </h1>
            <p className="text-lg text-white/90 mt-2 max-w-2xl">
              Your all-in-one solution for tracking produce from farm to global
              markets.
            </p>
          </div>
        </div>

        {/* Top metric cards - ensure each card is full width and shrinkable */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="w-full min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total PUCs</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPUCs}</div>
              <p className="text-xs text-muted-foreground">+2 since last month</p>
            </CardContent>
          </Card>

          <Card className="w-full min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Harvested (Tons)
              </CardTitle>
              <Tractor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHarvested}</div>
              <p className="text-xs text-muted-foreground">
                +18.2% from last season
              </p>
            </CardContent>
          </Card>

          <Card className="w-full min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Packout %</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgPackout}%</div>
              <p className="text-xs text-muted-foreground">-1.2% from last month</p>
            </CardContent>
          </Card>

          <Card className="w-full min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Export Value</CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalExportValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Season to date</p>
            </CardContent>
          </Card>
        </div>

        {/* Main content: Harvest Overview + Progress */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4 w-full min-w-0">
            <CardHeader>
              <CardTitle className="font-headline">Harvest Overview</CardTitle>
              <CardDescription>Quantity harvested over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {/* Chart wrapper: fixed height + shrinkable */}
              <div className="w-full min-w-0 h-64">
                <ReusableLineChart data={lineChartData} config={chartConfig} />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 w-full min-w-0">
            <CardHeader>
              <CardTitle className="font-headline">Harvest Progress</CardTitle>
              <CardDescription>A summary of current harvest journeys.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="min-w-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>PUC</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {harvests.slice(0, 4).map((harvest) => (
                    <TableRow key={harvest.id}>
                      <TableCell className="font-medium min-w-0">
                        {harvest.pucCode}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            harvest.status === "Processed"
                              ? "secondary"
                              : harvest.status === "At Packhouse"
                              ? "default"
                              : "outline"
                          }
                          className={
                            harvest.status === "At Packhouse"
                              ? "bg-accent text-accent-foreground"
                              : ""
                          }
                        >
                          {harvest.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2">
                          <Progress value={harvest.progress} className="h-2" />
                          <span className="text-xs text-muted-foreground">
                            {harvest.progress}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
