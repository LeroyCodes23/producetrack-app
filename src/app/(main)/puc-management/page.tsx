'use client'
import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
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
import { PlusCircle, Search, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from '@/components/ui/scroll-area';

interface PUCManagementRow {
  PUC: string;
  Producer: string;
  Varieties: string;
  Location: string | null;
  Status: string;
}

export default function PucManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pucData, setPucData] = useState<PUCManagementRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await fetch('/api/seasons');
        if (!response.ok) return;
        const json = await response.json();
        const availableSeasons = Array.isArray(json.data) ? json.data : [];
        setSeasons(availableSeasons);
        setSelectedSeason((current) => current ?? availableSeasons[0] ?? null);
      } catch (error) {
        console.error('Failed to fetch seasons:', error);
      }
    };

    fetchSeasons();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = `/api/puc-management${selectedSeason ? `?season=${encodeURIComponent(selectedSeason)}` : ''}`;
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch data' }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        setPucData(json.data ?? []);
      } catch (error: any) {
        console.error(error);
        setError(error.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedSeason]);

  const getStatusBadgeClassName = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/80 text-green-900';
      case 'Pending':
        return 'bg-yellow-500/80 text-yellow-900';
      case 'Inactive':
        return 'bg-gray-400/80 text-gray-900';
      default:
        return '';
    }
  }

  const filteredPucs = useMemo(() => {
    if (!searchTerm) {
      return pucData;
    }
    const q = searchTerm.toLowerCase();
    return pucData.filter(puc =>
      puc.PUC.toLowerCase().includes(q) ||
      puc.Producer.toLowerCase().includes(q)
    );
  }, [pucData, searchTerm]);

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-[60vh]">
          <p>Loading data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-[60vh] text-red-500">
          <p>Error: {error}</p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[70vh]">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead>PUC ID</TableHead>
              <TableHead>Producer</TableHead>
              <TableHead>Varieties</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPucs.length > 0 ? (
              filteredPucs.map((puc) => (
                <TableRow key={puc.PUC}>
                  <TableCell className="font-medium">{puc.PUC}</TableCell>
                  <TableCell>{puc.Producer}</TableCell>
                  <TableCell>{puc.Varieties}</TableCell>
                  <TableCell>{puc.Location ?? '—'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClassName(puc.Status)}>
                      {puc.Status}
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No PUCs available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    );
  };

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
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by PUC or Producer..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedSeason ?? ''} onValueChange={setSelectedSeason}>
                <SelectTrigger className="w-[120px] shrink-0">
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderTableContent()}
        </CardContent>
      </Card>
    </div>
  );
}
