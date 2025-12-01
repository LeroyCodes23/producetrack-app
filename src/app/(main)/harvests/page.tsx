
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

export default function HarvestsPage() {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="font-headline text-3xl font-bold">Harvest Management</h1>
                <p className="text-muted-foreground">Oversee pre-harvest testing and track live harvest operations from the orchard.</p>
            </div>

            <Tabs defaultValue="pre-harvest-planning">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pre-harvest-planning">Pre-Harvest Planning</TabsTrigger>
                    <TabsTrigger value="harvest-tracking">Harvest Tracking</TabsTrigger>
                    <TabsTrigger value="weekly-bin-tracking">Weekly Bin Tracking</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pre-harvest-planning">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pre-Harvest Planning</CardTitle>
                            <CardDescription>Review maturity, readiness, and yield estimations before harvesting.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table className="table-fixed">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>PUC / Orchard</TableHead>
                                        <TableHead>Maturity Index</TableHead>
                                        <TableHead>Readiness</TableHead>
                                        <TableHead>Estimated Yield</TableHead>
                                        <TableHead>Size Distribution</TableHead>
                                        <TableHead>Quality Test</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No pre-harvest data available.
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="harvest-tracking">
                    <Card>
                        <CardHeader>
                            <CardTitle>Harvest Tracking</CardTitle>
                            <CardDescription>Track harvested produce quantities, PUC origin, and status.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table className="table-fixed">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Harvest ID</TableHead>
                                        <TableHead>PUC / Orchard</TableHead>
                                        <TableHead>Variety</TableHead>
                                        <TableHead>Picked Weight</TableHead>
                                        <TableHead>Picker Productivity</TableHead>
                                        <TableHead>Bin Count</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            No harvest data available.
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="weekly-bin-tracking">
                    <Card>
                        <CardHeader>
                            <CardTitle>Weekly Bin Tracking</CardTitle>
                            <CardDescription>View a weekly breakdown of delivered bins per variety and orchard.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table className="table-fixed">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Variety</TableHead>
                                        <TableHead>PUC</TableHead>
                                        <TableHead>Orchard</TableHead>
                                        <TableHead>Total Bins</TableHead>
                                        <TableHead>Delivered Kg</TableHead>
                                        <TableHead>Kg per Bin</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No weekly bin data available.
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
