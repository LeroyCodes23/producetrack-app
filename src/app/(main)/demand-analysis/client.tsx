'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Loader2, Sparkles, Globe, Award, Target, TrendingUp, Star, ChevronsUpDown, Check } from "lucide-react";
import { analyzePucDemand, PucDemandAnalysisOutput, PucDemandAnalysisInput } from "@/ai/flows/puc-demand-analysis";
import { Skeleton } from "@/components/ui/skeleton";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { pucs, commodities } from "@/lib/data";
import type { PUC } from "@/lib/types";
import { cn } from "@/lib/utils";

const mockPucQualityMetrics: { [key: string]: string } = {
    'NL1163': 'Packout: 93.1%, Defects: 2.5%, Grade A: 85%',
    'NL0205': 'Packout: 90.5%, Defects: 5.0%, Grade A: 70%',
    'NL0109': 'Packout: 88.0%, Defects: 7.2%, Grade A: 68%',
    'Y1502': 'Packout: 94.0%, Defects: 2.1%, Grade A: 82%',
    'DEFAULT': 'Packout: 91.0%, Defects: 4.5%, Grade A: 75%',
};

const findCommodityForVariety = (variety: string): string => {
    for (const commodity in commodities) {
        if (commodities[commodity as keyof typeof commodities].some(v => v.Description === variety)) {
            return commodity;
        }
    }
    return 'Unknown';
}

const uniquePucs = pucs.filter((puc, index, self) =>
    index === self.findIndex((t) => t.code === puc.code)
);


export default function DemandAnalysisClient() {
    const [selectedPuc, setSelectedPuc] = useState<PUC | undefined>(uniquePucs[0]);
    const [analysis, setAnalysis] = useState<PucDemandAnalysisOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);

    const handlePucSelect = (puc: PUC) => {
        setSelectedPuc(puc);
        setOpen(false);
    };

    const handleAnalysis = async () => {
        if (!selectedPuc) {
            setError('Please select a PUC code.');
            return;
        }
        
        setIsLoading(true);
        setError('');
        setAnalysis(null);

        try {
            const commodity = findCommodityForVariety(selectedPuc.variety);
            const qualityMetrics = mockPucQualityMetrics[selectedPuc.code] || mockPucQualityMetrics['DEFAULT'];
            
            const input: PucDemandAnalysisInput = {
                pucCode: selectedPuc.code,
                variety: selectedPuc.variety,
                commodity: commodity,
                qualityMetrics: qualityMetrics,
            };

            const result = await analyzePucDemand(input);
            setAnalysis(result);
        } catch (e) {
            setError('Failed to generate analysis. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        return (
            <div className="flex text-yellow-400">
                {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} fill="currentColor" className="w-5 h-5" />)}
                {halfStar && <Star key="half" fill="currentColor" className="w-5 h-5" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />}
                {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="w-5 h-5" />)}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BrainCircuit className="text-primary" />
                        Analyze Demand
                    </CardTitle>
                    <CardDescription>
                        Select a PUC to analyze its global demand, get improvement recommendations, and see crucial license requirements.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <label htmlFor="puc-select" className="text-sm font-medium">PUC Code</label>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full justify-between"
                                    >
                                        {selectedPuc ? selectedPuc.code : "Select a PUC"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search PUC..." />
                                        <CommandEmpty>No PUC found.</CommandEmpty>
                                        <CommandList>
                                            <CommandGroup>
                                                {uniquePucs.map(puc => (
                                                    <CommandItem
                                                        key={puc.id}
                                                        value={puc.code}
                                                        onSelect={() => handlePucSelect(puc)}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedPuc?.code === puc.code ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {puc.code}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        {selectedPuc && (
                             <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-3 bg-muted/50 rounded-md">
                                    <p className="font-semibold text-muted-foreground">Commodity</p>
                                    <p className="font-bold">{findCommodityForVariety(selectedPuc.variety)}</p>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-md">
                                    <p className="font-semibold text-muted-foreground">Variety</p>
                                    <p className="font-bold">{selectedPuc.variety}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleAnalysis} disabled={isLoading || !selectedPuc} className="w-full">
                        {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                        ) : (
                            <><Sparkles className="mr-2 h-4 w-4" /> Generate Analysis</>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            
            {isLoading && (
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            )}

            {analysis && !isLoading && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline"><TrendingUp /> Analysis for {selectedPuc?.code}</CardTitle>
                             <CardDescription>{analysis.summary}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                           <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">PUC Quality Rating</span>
                                {renderStars(analysis.qualityRating.rating)}
                           </div>
                           <p className="text-sm text-muted-foreground italic max-w-md text-right">{analysis.qualityRating.assessment}</p>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="flex flex-col">
                            <CardHeader className="flex-shrink-0">
                                <CardTitle className="flex items-center gap-2 text-lg"><Globe /> Global Demand</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden">
                                <div className="h-64 overflow-y-auto space-y-4 pr-2">
                                    {analysis.globalDemand.map((market, index) => (
                                        <div key={index} className="p-3 bg-secondary/50 rounded-lg">
                                            <div className="flex items-center justify-between font-semibold">
                                                <span>{market.country}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${market.demand_level === 'High' ? 'bg-green-200 text-green-800' : market.demand_level === 'Medium' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>
                                                    {market.demand_level} Demand
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{market.notes}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                         <Card className="flex flex-col">
                            <CardHeader className="flex-shrink-0">
                                <CardTitle className="flex items-center gap-2 text-lg"><Award /> License Requirements</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden">
                                <div className="h-64 overflow-y-auto space-y-4 pr-2">
                                    {analysis.licenseRequirements.map((license, index) => (
                                         <div key={index} className="p-3 bg-secondary/50 rounded-lg">
                                            <div className="flex items-center justify-between font-semibold">
                                                <span>{license.licenseName}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${license.importance === 'Crucial' ? 'bg-red-200 text-red-800' : license.importance === 'Recommended' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'}`}>
                                                    {license.importance}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{license.details}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="flex flex-col">
                        <CardHeader className="flex-shrink-0">
                            <CardTitle className="flex items-center gap-2 font-headline"><Target /> Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden">
                            <div className="h-48 overflow-y-auto prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap pr-2">
                               {analysis.recommendations}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
