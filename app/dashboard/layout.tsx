// import { AppSidebar } from "@/components/app-sidebar";
// import { ProtectedRoute } from "@/components/protected-route";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbList,
//   BreadcrumbPage,
// } from "@/components/ui/breadcrumb";
// import { Separator } from "@/components/ui/separator";
// import {
//   SidebarInset,
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";
// import { ModeToggle } from "@/components/dark-mode-toggle";

// interface DashboardLayoutProps {
//   children: React.ReactNode;
// }

// export default function DashboardLayout({ children }: DashboardLayoutProps) {
//   return (
//     <ProtectedRoute>
//       <SidebarProvider>
//         <AppSidebar />
//         <SidebarInset>
//           <header className="flex h-14 shrink-0 items-center gap-2 border-b">
//             <div className="flex flex-1 items-center gap-2 px-3">
//               <SidebarTrigger />
//               <Separator orientation="vertical" className="mr-2 h-4" />
//               <Breadcrumb>
//                 <BreadcrumbList>
//                   <BreadcrumbItem>
//                     <BreadcrumbPage className="line-clamp-1">
//                       Dashboard
//                       <ModeToggle />
//                     </BreadcrumbPage>
//                   </BreadcrumbItem>
//                 </BreadcrumbList>
//               </Breadcrumb>
//             </div>
//           </header>

//           <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
//             {children}
//           </main>
//           {/* <div className="bg-muted/50 mx-auto h-24 w-full max-w-3xl rounded-xl" />
//           <div className="bg-muted/50 mx-auto h-full w-full max-w-3xl rounded-xl" /> */}
//         </SidebarInset>
//       </SidebarProvider>
//     </ProtectedRoute>
//   );
// }

"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/dark-mode-toggle";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  // Define route mappings for breadcrumbs
  const routeMap: Record<string, { label: string; href?: string }[]> = {
    "/dashboard": [{ label: "Dashboard" }],
    "/dashboard/students": [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Students" },
    ],
    "/dashboard/batches": [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Batches" },
    ],
    "/dashboard/attendance": [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Attendance" },
    ],
    "/dashboard/rankings": [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Rankings" },
    ],
    "/dashboard/settings": [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings" },
    ],
    "/dashboard/teachers": [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Teachers" },
    ],
    "/dashboard/profile": [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Profile" },
    ],
  };

  // Get breadcrumb items for current path
  const getBreadcrumbItems = () => {
    const items = routeMap[pathname] || [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Page" },
    ];
    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />

              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbItems.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <BreadcrumbItem>
                        {item.href ? (
                          <BreadcrumbLink asChild>
                            <Link href={item.href}>{item.label}</Link>
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage className="line-clamp-1">
                            {item.label}
                          </BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbItems.length - 1 && (
                        <BreadcrumbSeparator />
                      )}
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="ml-auto px-3">
              <ModeToggle />
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
