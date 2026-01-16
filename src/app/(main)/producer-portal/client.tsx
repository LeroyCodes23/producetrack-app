
'use client';

import { useEffect, useRef, useState } from "react";
import type { JourneyBin, PalletJourney } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Box,
  Package,
  MessageSquare,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MarketDistributionChart from "./market-distribution-chart";
import QualityFeedbackChart from "./quality-feedback-chart";
import VarietyPerformanceChart from "./variety-performance-chart";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProducerPortalClientProps {
  journeyBins: JourneyBin[];
  palletJourney: PalletJourney[];
}

export default function ProducerPortalClient({ journeyBins, palletJourney }: ProducerPortalClientProps) {
  const stats = [
    { title: "Bins Harvested (To Date)", value: "1,204" },
    { title: "Pallets Packed (To Date)", value: "150" },
    { title: "Active Shipments", value: "12" },
    { title: "Orders Delivered (Last 7d)", value: "28" },
    { title: "Total Cartons (To Date)", value: "2,350" },
    { 
      title: "Total Cartons SOLD (%)", 
      value: "68%",
      breakdown: [
        { variety: "NAV", percentage: 68 },
        { variety: "AGN", percentage: 71 },
        { variety: "MKN", percentage: 62 },
      ]
    },
    { 
      title: "Total Cartons Finalized (%)", 
      value: "74%",
      breakdown: [
        { variety: "NAV", percentage: 74 },
        { variety: "AGN", percentage: 67 },
        { variety: "MKN", percentage: 52 },
      ]
    },
    { title: "Expected Returns (NBI)", value: "45" },
    { title: "Payments Received (FFS)", value: "$18,450" },
  ];

  // refs + state for auto-scroll behavior
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const tileRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [tileWidth, setTileWidth] = useState<number>(220); // default tile width
  const GAP = 16; // gap in px (matches gap-4)

  // measure tile width (first tile) and update on resize
  useEffect(() => {
    const update = () => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const first = scroller.querySelector<HTMLElement>('[data-tile="true"]');
      if (first) {
        const w = Math.round(first.getBoundingClientRect().width);
        if (w && w !== tileWidth) setTileWidth(w);
      }
    };

    update();

    const ro = (typeof ResizeObserver !== 'undefined') ? new ResizeObserver(update) : null;
    if (ro && scrollerRef.current) ro.observe(scrollerRef.current);

    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      if (ro && scrollerRef.current) ro.unobserve(scrollerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // auto-scroll every 5s, scrolls by one tileWidth + gap; wraps to start
  useEffect(() => {
    // clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const start = () => {
      if (!scrollerRef.current) return;
      intervalRef.current = window.setInterval(() => {
        if (isPaused || !scrollerRef.current) return;
        const el = scrollerRef.current;
        const maxScroll = el.scrollWidth - el.clientWidth;
        const step = tileWidth + GAP;
        const next = el.scrollLeft + step;

        if (next >= maxScroll - 4) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: step, behavior: "smooth" });
        }
      }, 5000);
    };

    start();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, tileWidth]);

  // pause on hover/focus
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const onEnter = () => setIsPaused(true);
    const onLeave = () => setIsPaused(false);
    const onFocusIn = () => setIsPaused(true);
    const onFocusOut = () => setIsPaused(false);

    scroller.addEventListener("mouseenter", onEnter);
    scroller.addEventListener("mouseleave", onLeave);
    scroller.addEventListener("focusin", onFocusIn);
    scroller.addEventListener("focusout", onFocusOut);

    return () => {
      scroller.removeEventListener("mouseenter", onEnter);
      scroller.removeEventListener("mouseleave", onLeave);
      scroller.removeEventListener("focusin", onFocusIn);
      scroller.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  // manual scroll
  const scrollByAmount = (amt: number) => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollBy({ left: amt, behavior: "smooth" });
  };

  return (
    <Tabs defaultValue="dashboard" className="w-full space-y-4">
      <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
        <TabsTrigger value="dashboard">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </TabsTrigger>
        <TabsTrigger value="bin-journey">
          <Box className="mr-2 h-4 w-4" />
          Bin Journey
        </TabsTrigger>
        <TabsTrigger value="pallet-journey">
          <Package className="mr-2 h-4 w-4" />
          Pallet Journey
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {/* Welcome Card */}
          <Card className="lg:col-span-2 h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Welcome, Producer!</CardTitle>
            </CardHeader>

            <CardContent className="flex-1">
              {/* HORIZONTAL FLOATING TILES */}
              <div className="relative mb-4">
                {/* left / right nav (optional) */}
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 z-20 hidden sm:flex">
                  <button
                    aria-label="Scroll left"
                    onClick={() => scrollByAmount(-(tileWidth + GAP))}
                    className="p-1 rounded-full bg-white/90 shadow hover:bg-white"
                  >
                    ‹
                  </button>
                </div>
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-20 hidden sm:flex">
                  <button
                    aria-label="Scroll right"
                    onClick={() => scrollByAmount(tileWidth + GAP)}
                    className="p-1 rounded-full bg-white/90 shadow hover:bg-white"
                  >
                    ›
                  </button>
                </div>

                {/* SCROLLER: flex row, no-wrap so tiles stay on single line */}
                <div
                  ref={scrollerRef}
                  tabIndex={0}
                  role="region"
                  aria-label="Key metrics"
                  className={`
                    w-full
                    overflow-x-auto no-scrollbar
                    scroll-smooth
                    flex flex-row flex-nowrap items-stretch gap-4 px-2 py-1
                  `}
                >
                  {stats.map((stat, idx) => {
                    return (
                      <div
                        key={stat.title}
                        data-tile="true"
                        ref={idx === 0 ? tileRef : null}
                        className="flex-shrink-0 w-[220px] sm:w-[240px]"
                      >
                        <Card className="h-full flex flex-col">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3">
                            <CardTitle className="text-sm font-medium truncate">
                              {stat.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-3 pb-3 flex-1 flex flex-col justify-end">
                            {stat.breakdown ? (
                               <div className="space-y-0.5 text-xs">
                                  {stat.breakdown.map((item) => (
                                    <div key={item.variety} className="flex justify-between font-mono">
                                      <span className="font-semibold text-muted-foreground">{item.variety}</span>
                                      <span>{item.percentage}%</span>
                                    </div>
                                  ))}
                                </div>
                            ) : (
                              <div className="text-2xl font-bold">{stat.value}</div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">Real-time data</p>
                          </CardContent>
                        </Card>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Variety chart remains fixed below */}
              <div className="mt-4">
                <Card className="min-h-0 overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base">Production Summary</CardTitle>
                    <CardDescription>Total Bins and Cartons per Variety</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 max-h-72 overflow-auto">
                    <div className="h-72 w-full">
                      <VarietyPerformanceChart data={journeyBins} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Right analytics card unchanged */}
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>A quick overview of your performance.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center gap-12 pt-4">
              <div className="flex flex-col items-center w-full">
                <h3 className="text-sm font-medium mb-3 text-center">Market Distribution</h3>
                <div className="w-full max-w-[320px] h-[200px]">
                  <MarketDistributionChart />
                </div>
              </div>
              <div className="flex flex-col items-center w-full">
                <h3 className="text-sm font-medium mb-3 text-center">Quality Feedback</h3>
                <div className="w-full max-w-[320px] h-[200px]">
                  <QualityFeedbackChart />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* bin-journey tab unchanged */}
      <TabsContent value="bin-journey">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Bin Journey</CardTitle>
                <CardDescription>
                  Track individual bins from the orchard to the packhouse.
                  Click a row to see its journey.
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Notify Producer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Notify Producer</DialogTitle>
                  </DialogHeader>
                  <p>This is where the notification form will go.</p>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-y-auto h-96">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>PUC</TableHead>
                    <TableHead>Packhouse</TableHead>
                    <TableHead>Cultivar</TableHead>
                    <TableHead>Variety</TableHead>
                    <TableHead>Bins</TableHead>
                    <TableHead>Bins KG</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(journeyBins) && journeyBins.length > 0 ? (
                    journeyBins.slice(0, 10).map((bin, index) => (
                      <TableRow key={index}>
                        <TableCell>{bin.PUC}</TableCell>
                        <TableCell>{bin.PACKHOUSE}</TableCell>
                        <TableCell>{bin.Cultivar}</TableCell>
                        <TableCell>{bin.Variety}</TableCell>
                        <TableCell>{bin.Bins}</TableCell>
                        <TableCell>{bin.BinsKG.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No bin data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="justify-center border-t pt-4">
            <p className="text-sm text-muted-foreground">
              This is where the bin journey animation will be displayed.
            </p>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* pallet-journey tab unchanged */}
      <TabsContent value="pallet-journey">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Pallet Journey</CardTitle>
                <CardDescription>
                  Track individual pallets from the packhouse to the destination. Click a row to see its journey.
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Notify Producer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Notify Producer</DialogTitle>
                  </DialogHeader>
                  <p>This is where the notification form will go.</p>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-y-auto h-96">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Pallet ID</TableHead>
                    <TableHead>PUC</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Target Market</TableHead>
                    <TableHead>Run No</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(palletJourney) && palletJourney.length > 0 ? (
                    palletJourney.slice(0, 10).map((pallet, index) => (
                      <TableRow key={index}>
                        <TableCell>{pallet.Pallet_ID}</TableCell>
                        <TableCell>{pallet.PUC}</TableCell>
                        <TableCell>{pallet.Grade}</TableCell>
                        <TableCell>{pallet.TargetMarket}</TableCell>
                        <TableCell>{pallet['Run No']}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No pallet data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="justify-center border-t pt-4">
            <p className="text-sm text-muted-foreground">
              This is where the pallet journey animation will be displayed.
            </p>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* hide scrollbar CSS (optional) */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </Tabs>
  );
}
