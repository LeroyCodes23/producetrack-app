
import { headers } from "next/headers";
import { auth } from "@/auth";
import ProducerPortalClient from "./client";

async function getBinRegisterData(season?: string) {
    try {
        const headersList = await headers();
        const cookieHeader = headersList.get("cookie") || "";
        const baseUrl = process.env.AUTH_URL || "http://localhost:3000";

        const seasonQuery = season ? `?season=${encodeURIComponent(season)}` : "";
        const res = await fetch(`${baseUrl}/api/bin-register${seasonQuery}`, {
            headers: { cookie: cookieHeader },
            cache: "no-store",
        });

        if (!res.ok) {
            console.error("Failed to fetch bin register:", await res.text());
            return [];
        }

        const json = await res.json();
        return json.data || [];
    } catch (err) {
        console.error("Error fetching bin register:", err);
        return [];
    }
}

export default async function ProducerPortalPage({
    searchParams,
}: {
    searchParams: Promise<{ season?: string | string[] }>;
}) {
    const { season: seasonParam } = await searchParams;
    const season = Array.isArray(seasonParam) ? seasonParam[0] : seasonParam;
    const binData = await getBinRegisterData(season);

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
            <ProducerPortalClient journeyBins={binData} palletJourney={[]} season={season} />
        </div>
    </div>
  );
}
