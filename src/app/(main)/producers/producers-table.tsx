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
import { PlusCircle, Search, FileText, CalendarDays, ShieldCheck } from "lucide-react";
import { producers as allProducers } from "@/lib/data";
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Producer } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export default function ProducersTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);

  const filteredProducers = useMemo(() => {
    if (!searchTerm) {
      return allProducers;
    }
    return allProducers.filter(producer =>
      producer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (producer.id && producer.id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      producer.puc_codes.some(puc => puc.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm]);

  const getSizaBadgeVariant = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'platinum':
        return 'secondary';
      case 'gold':
        return 'default';
      case 'silver':
        return 'outline';
      default:
        return 'destructive';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
             <div className="flex justify-between items-center">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        type="search" 
                        placeholder="Search by producer name, ID, or PUC..." 
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Producer
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producer Name</TableHead>
                  <TableHead>Producer ID</TableHead>
                  <TableHead>Accreditation Status</TableHead>
                  <TableHead className="text-center">PUCs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducers.map((producer) => (
                  <TableRow key={producer.id} onClick={() => setSelectedProducer(producer)} className="cursor-pointer">
                    <TableCell className="font-medium">{producer.name}</TableCell>
                    <TableCell>{producer.id || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {producer.siza_status ? (
                          <Badge variant={getSizaBadgeVariant(producer.siza_status)}>SIZA: {producer.siza_status}</Badge>
                        ) : <Badge variant="outline">SIZA: N/A</Badge>}
                        {producer.globalgap_valid_till ? (
                          <Badge variant="secondary">GlobalG.A.P.</Badge>
                        ) : <Badge variant="outline">GG: N/A</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{producer.pucCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {selectedProducer && (
        <Dialog open={!!selectedProducer} onOpenChange={() => setSelectedProducer(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedProducer.name}</DialogTitle>
              <DialogDescription>
                Location: {selectedProducer.location} | Producer ID: {selectedProducer.id}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />PUC Codes ({selectedProducer.puc_codes.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProducer.puc_codes.length > 0 ? (
                    selectedProducer.puc_codes.map(puc => <Badge key={puc} variant="secondary">{puc}</Badge>)
                  ) : (
                    <p className="text-sm text-muted-foreground">No PUC codes listed.</p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                 <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary"/>Accreditation Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="font-semibold">SIZA Status: <Badge variant={getSizaBadgeVariant(selectedProducer.siza_status)}>{selectedProducer.siza_status || 'N/A'}</Badge></p>
                      {selectedProducer.siza_exp_date && <p className="flex items-center gap-1 text-muted-foreground"><CalendarDays className="h-4 w-4" /> Expires: {selectedProducer.siza_exp_date}</p>}
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold">GlobalG.A.P.</p>
                      {selectedProducer.globalgap_valid_till ? <p className="flex items-center gap-1 text-muted-foreground"><CalendarDays className="h-4 w-4" /> Valid until: {selectedProducer.globalgap_valid_till}</p> : <p className="text-muted-foreground">Not specified</p>}
                    </div>
                     <div className="space-y-1">
                      <p className="font-semibold">{selectedProducer.environmental_type || 'Environmental'}</p>
                      {selectedProducer.environmental_exp_date ? <p className="flex items-center gap-1 text-muted-foreground"><CalendarDays className="h-4 w-4" /> Expires: {selectedProducer.environmental_exp_date}</p> : <p className="text-muted-foreground">Not specified</p>}
                    </div>
                     <div className="space-y-1">
                      <p className="font-semibold">Albert Heijn</p>
                      {selectedProducer.albert_heijn_expiry ? <p className="flex items-center gap-1 text-muted-foreground"><CalendarDays className="h-4 w-4" /> Expires: {selectedProducer.albert_heijn_expiry}</p> : <p className="text-muted-foreground">Not specified</p>}
                    </div>
                     <div className="space-y-1">
                      <p className="font-semibold">Tesco Nurture</p>
                      {selectedProducer.tesco_expiry ? <p className="flex items-center gap-1 text-muted-foreground"><CalendarDays className="h-4 w-4" /> Expires: {selectedProducer.tesco_expiry}</p> : <p className="text-muted-foreground">Not specified</p>}
                    </div>
                     <div className="space-y-1">
                      <p className="font-semibold">LEAF Marque</p>
                      {selectedProducer.leaf_expiry ? <p className="flex items-center gap-1 text-muted-foreground"><CalendarDays className="h-4 w-4" /> Expires: {selectedProducer.leaf_expiry}</p> : <p className="text-muted-foreground">Not specified</p>}
                    </div>
                 </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

    </>
  );
}
