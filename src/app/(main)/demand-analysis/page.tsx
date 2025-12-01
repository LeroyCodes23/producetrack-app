
import DemandAnalysisClient from "./client";
import ParallaxBackground from "../producer-portal/parallax-background";

export default function DemandAnalysisPage() {
    return (
        <div className="space-y-4">
            <ParallaxBackground imageUrl="/Demand Analysis-BG.png" />
            <div className="relative z-10 space-y-4">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Global Demand Analysis</h1>
                    <p className="text-muted-foreground">AI-powered insights into global demand and lucrative export routes.</p>
                </div>
                <DemandAnalysisClient />
            </div>
        </div>
    );
}
