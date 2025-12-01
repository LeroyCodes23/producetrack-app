
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { packhouseBatches } from "@/lib/data";

const packhouses = ["Divers", "Packhouse 1", "Packhouse 2"];

export default function PackhousePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-headline text-3xl font-bold">Packhouse</h1>
        <p className="text-muted-foreground">Track production runs from bin to pallet.</p>
      </div>

      <Tabs defaultValue={packhouses[0]} className="space-y-4">
        <TabsList>
          {packhouses.map((name) => (
            <TabsTrigger key={name} value={name}>{name}</TabsTrigger>
          ))}
        </TabsList>
        {packhouses.map((name) => (
          <TabsContent key={name} value={name}>
            <Card>
              <CardHeader>
                <CardTitle>{name} Processing Data</CardTitle>
                <CardDescription>
                  Live tracking of produce being processed at this packhouse.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead>PUC Code</TableHead>
                      <TableHead>Bin ID</TableHead>
                      <TableHead>Pallet ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Juice</TableHead>
                      <TableHead className="text-right">Packout Yield %</TableHead>
                      <TableHead className="text-right">Defects %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packhouseBatches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">{batch.pucCode}</TableCell>
                        <TableCell>{batch.binId}</TableCell>
                        <TableCell>{batch.palletId}</TableCell>
                        <TableCell>2024-07-18</TableCell>
                        <TableCell>A</TableCell>
                        <TableCell>N/A</TableCell>
                        <TableCell className="text-right">{batch.packoutYield.toFixed(1)}%</TableCell>
                        <TableCell className="text-right">{batch.defects.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
