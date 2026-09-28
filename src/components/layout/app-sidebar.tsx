'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar-nav";
import Link from "next/link";
import Image from 'next/image';
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function AppSidebar() {
  const { user, userRole } = useAuth();

  // Build display name: firstName + lastName, fallback to username or email
  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email
    : userRole === 'admin'
      ? 'Admin User'
      : userRole === 'employee'
        ? 'Employee User'
        : 'Producer User';

  // Display email
  const displayEmail = user?.email || 'unknown@example.com';

  // Initials for avatar
  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.email[0].toUpperCase()
    : userRole === 'admin'
      ? 'A'
      : userRole === 'employee'
        ? 'E'
        : 'P';

  // Role label
  const roleLabel =
    user?.userType ||
    (userRole === 'admin' ? 'Admin' : userRole === 'employee' ? 'Employee' : 'Producer');

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-4">
          <Link
            href={userRole === 'producer' ? '/producer-portal' : '/dashboard'}
            className="flex items-center gap-3"
          >
            <div className="h-9 w-9 overflow-hidden rounded-md bg-white/0">
              <Image
                src='/citrusdal-logo.jpg'
                alt="Goede Hoop Citrus"
                width={36}
                height={36}
                style={{ objectFit: 'cover', objectPosition: '50% -15%' }}
                priority
              />
            </div>
            <div>
              <span className="font-headline text-lg font-bold">Goede Hoop Citrus</span>
              <span className="block text-xs text-sidebar-foreground/70 -mt-1">
                Powered By ProduceTrack Pro
              </span>
            </div>
          </Link>
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
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium text-sidebar-foreground">
              {displayName}
            </span>
            <span className="text-xs text-sidebar-foreground/70">
              {displayEmail}
            </span>
            <span className="text-xs text-sidebar-foreground/50">
              {roleLabel}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </>
  );
}