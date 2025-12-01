'use client';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { Sidebar, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ReactNode } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        <Sidebar collapsible="icon" className="min-h-screen">
          <AppSidebar />
        </Sidebar>
        <div className="flex flex-col flex-1 min-w-0">
          <header className="sticky top-0 z-10 flex items-center h-14 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
            <SidebarTrigger />
            <h1 className="text-lg font-headline font-semibold ml-4">ProduceTrack</h1>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
