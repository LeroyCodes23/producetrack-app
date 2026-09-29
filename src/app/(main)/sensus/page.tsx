import SensusTable from "../producers/sensus-table";

export default function SensusPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-headline text-3xl font-bold">Sensus</h1>
        <p className="text-muted-foreground">Your orchard and planting data.</p>
      </div>
      <SensusTable />
    </div>
  );
}
