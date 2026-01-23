'use client'

import { useState, useMemo, useEffect } from 'react';
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
  const [sensusMap, setSensusMap] = useState<Record<string, string[]>>({});
  const [sensusNameMap, setSensusNameMap] = useState<Record<string, string>>({});

  // Normalize keys for matching producer names / ids
  const normalize = (v?: string | number) => String(v ?? '').trim().toLowerCase();

  useEffect(() => {
    let mounted = true;
    const fetchSensus = async () => {
      try {
        const res = await fetch('/api/sensus-data');
        if (!res.ok) return;
        const data = await res.json();
        const map: Record<string, Set<string>> = {};
        const nameMap: Record<string, string> = {};
        for (const row of data || []) {
          const puc = (row.PUC || row.puc || row.Puc || '').toString().trim();
          if (!puc) continue;
          const keys = [row.CardName, row.FatherCard, row.producerName, row.producerCode];
          const displayName = String(row.CardName || row.producerName || row.FatherCard || row.producerCode || '').trim();
          for (const k of keys) {
            if (!k) continue;
            const key = normalize(k);
            map[key] = map[key] || new Set<string>();
            map[key].add(puc);
            // record a canonical display name for this key (first-seen)
            if (displayName && !nameMap[key]) nameMap[key] = displayName;
          }
        }
        if (!mounted) return;
        const out: Record<string, string[]> = {};
        for (const k of Object.keys(map)) out[k] = Array.from(map[k]);
        setSensusMap(out);
        setSensusNameMap(nameMap);
      } catch (e) {
        console.warn('Failed to load sensus data for producers', e);
      }
    };
    fetchSensus();
    return () => { mounted = false };
  }, []);

  // Augment the static producers list with PUCs from sensus when available.
  const producersWithSensus = useMemo(() => {
    return allProducers.map(p => {
      const keyName = normalize(p.name);
      const keyId = normalize(p.id);
      const sensusPucs = sensusMap[keyName] || sensusMap[keyId];
      const puc_codes = (sensusPucs && sensusPucs.length > 0) ? Array.from(new Set(sensusPucs.concat(p.puc_codes || []))) : p.puc_codes || [];
      const displayName = sensusNameMap[keyName] || sensusNameMap[keyId] || p.name;
      return { ...p, name: displayName, puc_codes, pucCount: puc_codes.length };
    });
  }, [sensusMap]);

  const filteredProducers = useMemo(() => {
    if (!searchTerm) return producersWithSensus;
    const q = searchTerm.toLowerCase();
    return producersWithSensus.filter(producer =>
      producer.name.toLowerCase().includes(q) ||
      (producer.id && producer.id.toString().toLowerCase().includes(q)) ||
      producer.puc_codes.some(puc => puc.toLowerCase().includes(q))
    );
  }, [searchTerm, producersWithSensus]);

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
                 {(() => {
                   const items: { title: string; body: JSX.Element }[] = [];
                   // SIZA: show if status or expiry present
                   if (selectedProducer.siza_status || selectedProducer.siza_exp_date) {
                     items.push({
                       title: 'SIZA',
                       body: (
                         <>
                           <div className="flex items-center gap-2">
                             <Badge variant={getSizaBadgeVariant(selectedProducer.siza_status)}>{selectedProducer.siza_status || 'N/A'}</Badge>
                           </div>
                           {selectedProducer.siza_exp_date && <p className="flex items-center gap-1 text-muted-foreground"><CalendarDays className="h-4 w-4" /> Expires: {selectedProducer.siza_exp_date}</p>}
                         </>
                       )
                     });
                   }

                   // GlobalG.A.P.
                   if (selectedProducer.globalgap_valid_till) {
                     items.push({
                       title: 'GlobalG.A.P.',
                       body: (
                         <p className="flex items-center gap-1 text-muted-foreground"><CalendarDays className="h-4 w-4" /> Valid until: {selectedProducer.globalgap_valid_till}</p>
                       )
                     });
                   }

                   // Environmental
                   if (selectedProducer.environmental_type || selectedProducer.environmental_exp_date) {
                     items.push({
                       title: selectedProducer.environmental_type || 'Environmental',
                       body: (
                         <>{selectedProducer.environmental_exp_date && <p className="flex items-center gap-1 text-muted-foreground"><CalendarDays className="h-4 w-4" /> Expires: {selectedProducer.environmental_exp_date}</p>}</>
                       )
                     });
                   }

                   // Albert Heijn
                   if (selectedProducer.albert_heijn_expiry) {
                     items.push({
                       title: 'Albert Heijn',
                       body: (<p className="flex items-center gap-1 text-muted-foreground"><CalendarDays className="h-4 w-4" /> Expires: {selectedProducer.albert_heijn_expiry}</p>)
                     });
                   }

                   // Tesco Nurture
                   if (selectedProducer.tesco_expiry) {
                     items.push({
                       title: 'Tesco Nurture',
                       body: (<p className="flex items-center gap-1 text-muted-foreground"><CalendarDays className="h-4 w-4" /> Expires: {selectedProducer.tesco_expiry}</p>)
                     });
                   }

                   // LEAF Marque
                   if (selectedProducer.leaf_expiry) {
                     items.push({
                       title: 'LEAF Marque',
                       body: (<p className="flex items-center gap-1 text-muted-foreground"><CalendarDays className="h-4 w-4" /> Expires: {selectedProducer.leaf_expiry}</p>)
                     });
                   }

                   if (items.length === 0) {
                     return <p className="text-sm text-muted-foreground">No accreditations specified.</p>;
                   }

                   return (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                       {items.map((it, idx) => (
                         <div className="space-y-1" key={idx}>
                           <p className="font-semibold">{it.title}</p>
                           {it.body}
                         </div>
                       ))}
                     </div>
                   );
                 })()}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

    </>
  );
}
