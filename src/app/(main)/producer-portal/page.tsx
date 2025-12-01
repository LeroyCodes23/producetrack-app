
import { journeyBins, palletJourney } from "@/lib/data";
import ProducerPortalClient from "./client";

export default function ProducerPortalPage() {
  // Fetch data in the Server Component
  const binData = journeyBins;
  const palletData = palletJourney;

  return (
    <div className="space-y-4">
        <div 
            className="absolute top-0 right-0 w-1/2 h-full bg-no-repeat bg-cover bg-center"
            style={{
                backgroundImage: "url('/Producer Portal-background.jpg')",
                clipPath: 'ellipse(100% 100% at 100% 50%)',
                zIndex: 0,
                filter: 'blur(1px)',
                maskImage: 'radial-gradient(circle at center, black 0%, transparent 98%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 98%)',
  
            }}
        />
        <div className="relative z-10 space-y-4">
            <div>
                <h1 className="font-headline text-3xl font-bold">Producer Portal</h1>
                <p className="text-muted-foreground">
                Track your produce from farm to destination.
                </p>
            </div>
            {/* Pass the fetched data as props to the Client Component */}
            <ProducerPortalClient journeyBins={binData} palletJourney={palletData} />
        </div>
    </div>
  );
}
