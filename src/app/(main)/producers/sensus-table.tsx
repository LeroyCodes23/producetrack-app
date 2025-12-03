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
import { PlusCircle, Search } from "lucide-react";
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SensusData {
    FatherCard: string;
    CardName: string;
    FarmName: string;
    Orchard: string;
    FruitCode: string;
    PUC: string;
    YearPlnt: string;
    TreeWidth: number;
    RowWidth: number;
    TreeCount: number;
    Ha: number;
    HaBearing: number;
  // new/optional columns returned by stored procedure
  Commodity?: string;
  Comm?: string;
  Cultivar?: string;
  Variety?: string;
  BigStatus?: string;
  // some DBs might return column names with spaces
  // use index access for those if necessary when rendering
  OnderStam?: string;
}

export default function SensusTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sensusData, setSensusData] = useState<SensusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/sensus-data');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch data' }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSensusData(data);
      } catch (error: any) {
        console.error(error);
        setError(error.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm) {
      return sensusData;
    }
    const q = String(searchTerm).toLowerCase();
    const normalize = (v: any) => String(v ?? '').toLowerCase();

    return sensusData.filter(item =>
      normalize(item.FatherCard).includes(q) ||
      normalize(item.CardName).includes(q) ||
      normalize(item.PUC).includes(q) ||
      normalize(item.FruitCode).includes(q)
    );
  }, [searchTerm, sensusData]);

  // helper to pick the first non-empty value from possible column names
  const pickField = (item: any, ...keys: string[]) => {
    for (const k of keys) {
      const v = (item as any)[k];
      if (v !== undefined && v !== null && String(v) !== '') return String(v);
    }
    return 'N/A';
  };

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
      <ScrollArea className="h-[60vh]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producer Code</TableHead>
              <TableHead>Producer Name</TableHead>
              <TableHead>Farm Name</TableHead>
              <TableHead>Comm</TableHead>
              <TableHead>Cultivar</TableHead>
              <TableHead>Variety</TableHead>
              <TableHead>Orchard</TableHead>
              <TableHead>PUC</TableHead>
              <TableHead>Big Status</TableHead>
              <TableHead>Plant year</TableHead>
              <TableHead>Onderstam</TableHead>
              <TableHead>TreeWidth</TableHead>
              <TableHead>RowWidth</TableHead>
              <TableHead>Tree Count</TableHead>
              <TableHead>Sum of Hectares</TableHead>
              <TableHead>Bearing Ha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <TableRow key={`${item.PUC}-${item.Orchard}-${index}`}>
                  <TableCell>{item.FatherCard}</TableCell>
                  <TableCell>{item.CardName}</TableCell>
                  <TableCell>{item.FarmName}</TableCell>
                      <TableCell>{pickField(item, 'Commodity', 'Comm')}</TableCell>
                      <TableCell>{pickField(item, 'Cultivar')}</TableCell>
                      <TableCell>{pickField(item, 'Variety', 'FruitCode')}</TableCell>
                  <TableCell>{item.Orchard}</TableCell>
                  <TableCell>{item.PUC}</TableCell>
                      <TableCell>{pickField(item, 'BigStatus', 'Big Status')}</TableCell>
                      <TableCell>{item.YearPlnt}</TableCell>
                      <TableCell>{pickField(item, 'OnderStam', 'Onder Stam')}</TableCell>
                  <TableCell>{item.TreeWidth}</TableCell>
                  <TableCell>{item.RowWidth}</TableCell>
                  <TableCell>{item.TreeCount}</TableCell>
                  <TableCell>{item.Ha}</TableCell>
                  <TableCell>{item.HaBearing}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={15} className="h-24 text-center text-muted-foreground">
                  No sensus data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    );
  };

  return (
    <Card>
      <CardHeader>
           <div className="flex justify-between items-center">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="search" 
                      placeholder="Search by producer code, producer name, PUC, or variety..." 
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Sensus Entry
                </Button>
            </div>
      </CardHeader>
      <CardContent>
        {renderTableContent()}
      </CardContent>
    </Card>
  );
}
