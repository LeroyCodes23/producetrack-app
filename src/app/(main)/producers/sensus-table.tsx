'use client'

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
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
import { PlusCircle, Search } from "lucide-react";
import { commodities } from "@/lib/data";
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import sensusData from '@/lib/data/SensusData.json';

interface SensusData {
    producer_id: string;
    producer_name: string;
    comm: string;
    variety: string;
    orchard: string;
    puc: string;
    big_status: string;
    plant_year: string;
    onderstam: string;
    tree_width: number;
    row_width: number;
    tree_count: number;
    sum_of_hectares: number;
}

const findCommodityForVariety = (varietyName: string): string => {
    for (const commodity in commodities) {
        if (commodities[commodity as keyof typeof commodities].some(v => v.Description === varietyName)) {
            return commodity;
        }
    }
    return 'Unknown';
}

const processSensusData = (): SensusData[] => {
    const data: SensusData[] = [];
    sensusData.forEach((producer: any) => {
        producer.farms.forEach((farm: any) => {
            farm.rows.forEach((row: any) => {
                if (!row.summaryLabel) {
                    data.push({
                        producer_id: producer.producerCode,
                        producer_name: producer.producerName,
                        comm: row.Comm || findCommodityForVariety(row.Variety),
                        variety: row.Variety,
                        orchard: row.Orchard,
                        puc: row.PUC || 'N/A',
                        big_status: row.BigStatus,
                        plant_year: row.PlantYear ? row.PlantYear.toString() : 'N/A',
                        onderstam: row.Onderstam,
                        tree_width: row.TreeWidth,
                        row_width: row.RowWidth,
                        tree_count: row.TreeCount,
                        sum_of_hectares: row.SumOfHectares,
                    });
                }
            });
        });
    });
    return data;
};

export default function SensusTable() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const allSensusData = useMemo(() => processSensusData(), []);

  const filteredData = useMemo(() => {
    if (!searchTerm) {
      return allSensusData;
    }
    return allSensusData.filter(item =>
      item.producer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.puc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.variety.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allSensusData]);

  return (
    <Card>
      <CardHeader>
           <div className="flex justify-between items-center">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        type="search" 
                        placeholder="Search by producer, PUC, or variety..." 
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
        <ScrollArea className="h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producer Code</TableHead>
                <TableHead>Farm Name</TableHead>
                <TableHead>Comm</TableHead>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow key={`${item.puc}-${index}`}>
                  <TableCell>{item.producer_id}</TableCell>
                  <TableCell>{item.producer_name}</TableCell>
                  <TableCell>{item.comm}</TableCell>
                  <TableCell>{item.variety}</TableCell>
                  <TableCell>{item.orchard}</TableCell>
                  <TableCell>{item.puc}</TableCell>
                  <TableCell>{item.big_status}</TableCell>
                  <TableCell>{item.plant_year}</TableCell>
                  <TableCell>{item.onderstam}</TableCell>
                  <TableCell>{item.tree_width}</TableCell>
                  <TableCell>{item.row_width}</TableCell>
                  <TableCell>{item.tree_count}</TableCell>
                  <TableCell>{item.sum_of_hectares}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
