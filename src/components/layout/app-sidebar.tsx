
'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar-nav";
import { Button } from "../ui/button";
import { Leaf } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function AppSidebar() {
  const { userRole } = useAuth();
  
  return (
    <>
        <SidebarHeader>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-lg bg-primary text-primary-foreground" asChild>
                    <Link href={userRole === 'producer' ? '/producer-portal' : '/dashboard'}>
                        <Leaf />
                    </Link>
                </Button>
                <div>
                  <span className="font-headline text-lg font-bold">Goede Hoop Citrus</span>
                  <span className="block text-xs text-sidebar-foreground/70 -mt-1">Powered By ProduceTrack Pro</span>
                </div>
            </div>
        </SidebarHeader>

        <SidebarContent>
            <SidebarNav />
            <div className="mt-auto p-4 text-xs text-sidebar-foreground/50">
              Created By MM Tech (Pty) Ltd, in partnership with Goede Hoop Citrus (Pty) Ltd
            </div>
        </SidebarContent>

        <SidebarFooter>
             <div className="flex items-center gap-3 p-2">
                <Avatar className="h-9 w-9">
                    <AvatarFallback>{userRole === 'admin' ? 'A' : 'P'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium text-sidebar-foreground">
                        {userRole === 'admin' ? 'Admin User' : 'Producer User'}
                    </span>
                    <span className="text-xs text-sidebar-foreground/70">
                         {userRole === 'admin' ? 'admin@example.com' : 'producer@example.com'}
                    </span>
                </div>
            </div>
        </SidebarFooter>
    </>
  );
}
