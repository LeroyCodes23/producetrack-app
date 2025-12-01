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
import { packhouseBatches, pucs } from "@/lib/data";
import PackoutChart from "./packout-chart";
import QualityChart from "./quality-chart";

export default function ReportsPage() {
  const rejectionData = [
    { puc: 'PUC-SF-001', rate: 1.5, reason: 'Bruising' },
    { puc: 'PUC-GVO-001', rate: 3.2, reason: 'Size' },
    { puc: 'PUC-CGE-001', rate: 8.9, reason: 'Disease' },
    { puc: 'PUC-AO-001', rate: 2.1, reason: 'Color' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-headline text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Analyze performance with detailed reports.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Packout Percentage Analysis</CardTitle>
            <CardDescription>Comparison of packout yields across PUCs.</CardDescription>
          </CardHeader>
          <CardContent>
            <PackoutChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fruit Quality Analysis</CardTitle>
            <CardDescription>Average distribution of fruit grades.</CardDescription>
          </CardHeader>
          <CardContent>
            <QualityChart />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Rejection Rate by PUC</CardTitle>
          <CardDescription>Analysis of rejection rates and primary reasons.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PUC</TableHead>
                <TableHead className="text-right">Rejection Rate</TableHead>
                <TableHead>Primary Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rejectionData.map((item) => (
                <TableRow key={item.puc}>
                  <TableCell className="font-medium">{item.puc}</TableCell>
                  <TableCell className="text-right">{item.rate.toFixed(1)}%</TableCell>
                  <TableCell>{item.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
