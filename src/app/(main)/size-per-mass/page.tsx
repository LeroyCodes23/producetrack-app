'use client'

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SizePerMassPage() {
  return (
    <div className="flex flex-col w-full space-y-4">
      <div>
        <h1 className="font-headline text-3xl font-bold">Size Per Mass Analysis</h1>
        <p className="text-muted-foreground">Analyze fruit size, mass, and value to identify the 'Oes Skat' (Harvest Treasure).</p>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-wrap gap-4">
            <Select>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Producer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="producer1">Producer 1</SelectItem>
                <SelectItem value="producer2">Producer 2</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by PUC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="puc1">PUC-001</SelectItem>
                <SelectItem value="puc2">PUC-002</SelectItem>
              </SelectContent>
            </Select>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producer</TableHead>
                <TableHead>PUC</TableHead>
                <TableHead>Variety</TableHead>
                <TableHead>Commodity</TableHead>
                <TableHead>Avg. Mass (g)</TableHead>
                <TableHead>Size / Count</TableHead>
                <TableHead>Packout %</TableHead>
                <TableHead>Est. Value / Ton</TableHead>
                <TableHead>Oes Skat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No data available for the selected filters.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
