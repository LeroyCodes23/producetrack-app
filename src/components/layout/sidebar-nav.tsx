"use client";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Store,
  Users,
  Package,
  ClipboardCheck,
  Tractor,
  Warehouse,
  BarChart3,
  Scaling,
  LineChart,
  Settings,
  UserCircle,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const mainNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Producer Portal", href: "/producer-portal", icon: Store },
  { name: "Producers", href: "/producers", icon: Users },
  { name: "PUC Management", href: "/puc-management", icon: Package },
  { name: "Inspections", href: "/inspections", icon: ClipboardCheck },
  { name: "Harvests", href: "/harvests", icon: Tractor },
  { name: "Packhouse", href: "/packhouse", icon: Warehouse },
];

const analysisNav = [
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Size Per Mass", href: "/size-per-mass", icon: Scaling },
  { name: "Demand Analysis", href: "/demand-analysis", icon: LineChart },
];

const userNav = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Your Profile", href: "/profile", icon: UserCircle },
  { name: "Logout", href: "#", icon: LogOut },
];

export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Management</SidebarGroupLabel>
        <SidebarMenu>
          {mainNav.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={item.name}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarSeparator />

      <SidebarGroup>
        <SidebarGroupLabel>Analysis</SidebarGroupLabel>
        <SidebarMenu>
          {analysisNav.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={item.name}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
      
      <div className="flex-grow" />

      <SidebarSeparator />

      <SidebarGroup>
        <SidebarMenu>
          {userNav.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={item.name}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
