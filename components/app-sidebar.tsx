"use client";
import * as React from "react";
import {
  GalleryVerticalEnd,
  Home,
  Users,
  // Calendar,
  // BarChart3,
  GraduationCap,
  // Settings,
  UserCheck,
  Trophy,
  BookOpen,
  ListChecks,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { canManageTeachers } from "@/lib/roles";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";

const navData = {
  navMain: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: Home,
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          title: "Students",
          url: "/dashboard/students",
          icon: GraduationCap,
        },
        {
          title: "Batches",
          url: "/dashboard/batches",
          icon: Users,
        },
        {
          title: "Teachers",
          url: "/dashboard/teachers",
          icon: BookOpen,
        },
        {
          title: "Tasks",
          url: "/dashboard/tasks",
          icon: ListChecks,
        },
      ],
    },
    {
      title: "Tracking",
      items: [
        {
          title: "Attendance",
          url: "/dashboard/attendance",
          icon: UserCheck,
        },
        {
          title: "Rankings",
          url: "/dashboard/rankings",
          icon: Trophy,
        },
      ],
    },
    // {
    //   title: "System",
    //   items: [
    //     {
    //       title: "Settings",
    //       url: "/dashboard/settings",
    //       icon: Settings,
    //     },
    //   ],
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { userRole } = useAuth();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Student Portfolio</span>
                  <span className="text-xs">Management System</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navData.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url;
                const isTeachersItem = item.title === "Teachers";
                const canAccessTeachers = canManageTeachers(userRole);
                const isDisabled = isTeachersItem && !canAccessTeachers;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild={!isDisabled}
                      isActive={isActive}
                      className={
                        isDisabled ? "opacity-50 cursor-not-allowed" : ""
                      }
                      disabled={isDisabled}
                    >
                      {isDisabled ? (
                        <div className="flex items-center gap-2">
                          <Icon className="size-4" />
                          {item.title}
                        </div>
                      ) : (
                        <Link href={item.url}>
                          <Icon className="size-4" />
                          {item.title}
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
