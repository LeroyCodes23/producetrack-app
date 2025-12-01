
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
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { inspections } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InspectionsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="font-headline text-3xl font-bold">Inspections</h1>
            <p className="text-muted-foreground">Log and view crop inspection details.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Inspection
        </Button>
      </div>

      <Tabs defaultValue="pre-harvest">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pre-harvest">Pre-Harvest Inspections</TabsTrigger>
          <TabsTrigger value="on-site">On-site Inspections</TabsTrigger>
        </TabsList>

        <TabsContent value="pre-harvest">
          <Card>
            <CardHeader>
              <CardTitle>Pre-Harvest Inspections</CardTitle>
              <CardDescription>Log and manage all pre-harvest inspection data for each PUC.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead>PUC ID</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Maturity Index</TableHead>
                    <TableHead>Readiness</TableHead>
                    <TableHead>Estimated Yield</TableHead>
                    <TableHead>Size Distribution</TableHead>
                    <TableHead>Quality Test</TableHead>
                    <TableHead>Image</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                            No inspection data available.
                        </TableCell>
                    </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="on-site">
            <Card>
                <CardHeader>
                    <CardTitle>On-site Inspection Log</CardTitle>
                    <CardDescription>A record of all on-site crop inspections during growth.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table className="table-fixed">
                    <TableHeader>
                    <TableRow>
                        <TableHead>PUC Code</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Inspector</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Quality Test</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Image</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {inspections.map((inspection) => (
                        <TableRow key={inspection.id}>
                        <TableCell className="font-medium">{inspection.pucCode}</TableCell>
                        <TableCell>{inspection.date}</TableCell>
                        <TableCell>{inspection.inspector}</TableCell>
                        <TableCell>
                            <Badge variant={inspection.result === 'Pass' ? 'secondary' : 'destructive'}>
                            {inspection.result}
                            </Badge>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">{inspection.notes}</TableCell>
                        <TableCell className="text-center">-</TableCell>
                        <TableCell className="text-center">-</TableCell>
                        <TableCell className="text-center">-</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
