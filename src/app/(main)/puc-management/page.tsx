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
import { PlusCircle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { pucs, producers } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

export default function PucManagementPage() {

  const pucData = pucs.map(puc => {
    const producer = producers.find(p => p.name === puc.producer);
    return {
      ...puc,
      location: producer?.location || 'N/A',
      status: ['Active', 'Inactive', 'Pending'][Math.floor(Math.random() * 3)] as 'Active' | 'Inactive' | 'Pending'
    }
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'secondary';
      case 'Inactive':
        return 'outline';
      case 'Pending':
        return 'default';
      default:
        return 'default';
    }
  }


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="font-headline text-3xl font-bold">PUC Management</h1>
            <p className="text-muted-foreground">Register and manage all Production Unit Codes.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add PUC
        </Button>
      </div>
      <Card>
        <CardContent className="mt-6">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead>PUC ID</TableHead>
                <TableHead>Producer</TableHead>
                <TableHead>Variety</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pucData.map((puc) => (
                <TableRow key={puc.id}>
                  <TableCell className="font-medium">{puc.code}</TableCell>
                  <TableCell>{puc.producer}</TableCell>
                  <TableCell>{puc.variety}</TableCell>
                  <TableCell>{puc.location}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(puc.status)} className={puc.status === 'Pending' ? 'bg-yellow-500/80 text-yellow-900' : ''}>
                      {puc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
