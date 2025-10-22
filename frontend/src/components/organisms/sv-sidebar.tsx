"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Label } from "../atoms/label";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../atoms/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../atoms/dropdown-menu";
import { ChevronUp } from "lucide-react";
import { logout } from "@/lib/api";
import { useUser } from "../providers/user-provider";
import { handleError } from "@/lib/utils";

export function SVSidebar() {
  const user = useUser();

  const router = useRouter();
  const pathname = usePathname();
  
  if (!user || !user.user) return null; 

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      handleError(err);
    }
  };

  const links = [
    { key: "dashboard", label: "Dashboard", href: "/dashboard" },
    { key: "statistics", label: "Statistics", href: "/statistics" },
  ];

  if (user.user.role === 'CEO') links.push({ key: "shops", label: "Manage shops", href: "/shops" });

  return (
    <Sidebar className="w-40 border-black text-[var(--color-text-primary)]">
      <SidebarHeader className="bg-[var(--color-bg-secondary)] font-bold">
        Navigation
      </SidebarHeader>

      <SidebarContent className="bg-[var(--color-bg-secondary)]">
        <SidebarMenu>
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);

            return (
              <SidebarMenuItem key={link.key}>
                <SidebarMenuButton
                  asChild
                  className={`transition-colors ${
                    isActive
                      ? "bg-[var(--color-sidebar-button-active)] text-[var(--color-text-primary)] font-semibold"
                      : "hover:bg-[var(--color-sidebar-button-hover)]"
                  }`}
                >
                  <Link href={link.href}>
                    <Label>{link.label}</Label>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="bg-[var(--color-bg-secondary)]">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="hover:bg-[var(--color-sidebar-button-hover)]" asChild>
                <SidebarMenuButton>
                  <Label>{user.user.name}</Label>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width] bg-[var(--color-sidebar-button-hover)]"
              >
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <Label>Account</Label>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Label onClick={handleLogout}>Logout</Label>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
