'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProducersTable from "./producers-table";
import SensusTable from "./sensus-table";

export default function ProducersPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-headline text-3xl font-bold">Producer Management</h1>
        <p className="text-muted-foreground">Manage all your producers and their information.</p>
      </div>

      <Tabs defaultValue="producers">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="producers">Producers</TabsTrigger>
          <TabsTrigger value="sensus">Sensus</TabsTrigger>
        </TabsList>
        <TabsContent value="producers">
          <ProducersTable />
        </TabsContent>
        <TabsContent value="sensus">
          <SensusTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
