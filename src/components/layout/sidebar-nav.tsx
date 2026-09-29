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
  Sprout,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";


const mainNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ['admin', 'employee'] },
  { name: "Producer Portal", href: "/producer-portal", icon: Store, roles: ['admin', 'employee', 'producer'] },
  { name: "Producers", href: "/producers", icon: Users, roles: ['admin', 'employee'] },
  { name: "PUC Management", href: "/puc-management", icon: Package, roles: ['admin', 'employee', 'producer'] },
  { name: "Inspections", href: "/inspections", icon: ClipboardCheck, roles: ['admin', 'employee', 'producer'] },
  { name: "Harvests", href: "/harvests", icon: Tractor, roles: ['admin', 'employee', 'producer'] },
  { name: "Packhouse", href: "/packhouse", icon: Warehouse, roles: ['admin', 'employee', 'producer'] },
  { name: "Sensus", href: "/sensus", icon: Sprout, roles: ['producer'] },
];

const analysisNav = [
  { name: "Reports", href: "/reports", icon: BarChart3, roles: ['admin', 'employee', 'producer'] },
  { name: "Size Per Mass", href: "/size-per-mass", icon: Scaling, roles: ['admin', 'employee', 'producer'] },
  { name: "Demand Analysis", href: "/demand-analysis", icon: LineChart, roles: ['admin', 'employee', 'producer'] },
];

const userNav = [
  { name: "Settings", href: "/settings", icon: Settings, roles: ['admin', 'employee', 'producer'] },
  { name: "Your Profile", href: "/profile", icon: UserCircle, roles: ['admin', 'employee', 'producer'] },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { userRole, logout } = useAuth();

  const isActive = (href: string) => pathname === href;

  const renderNavItems = (items: typeof mainNav) => {
    return items
      .filter(item => userRole && item.roles.includes(userRole))
      .map((item) => (
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
      ));
  };

  return (
    <>
      {userRole === 'admin' && (
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarMenu>
              {renderNavItems(mainNav)}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Analysis</SidebarGroupLabel>
            <SidebarMenu>
              {renderNavItems(analysisNav)}
            </SidebarMenu>
          </SidebarGroup>
        </>
      )}

      {userRole === 'producer' && (
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Producer</SidebarGroupLabel>
            <SidebarMenu>
              {renderNavItems(mainNav)}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Analysis</SidebarGroupLabel>
            <SidebarMenu>
              {renderNavItems(analysisNav)}
            </SidebarMenu>
          </SidebarGroup>
        </>
      )}

      {userRole === 'employee' && (
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarMenu>
              {renderNavItems(mainNav)}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Analysis</SidebarGroupLabel>
            <SidebarMenu>
              {renderNavItems(analysisNav)}
            </SidebarMenu>
          </SidebarGroup>
        </>
      )}
      
      <div className="flex-grow" />

      <SidebarSeparator />

      <SidebarGroup>
        <SidebarMenu>
          {renderNavItems(userNav)}
           <SidebarMenuItem>
              <SidebarMenuButton
                onClick={logout}
                tooltip="Logout"
              >
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
