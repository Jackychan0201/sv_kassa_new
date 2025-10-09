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

export function SVSidebar() {
  const user = useUser();
  if (!user || !user.user) return null; 

  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const links = [
    { key: "dashboard", label: "Dashboard", href: "/dashboard" },
    { key: "statistics", label: "Statistics", href: "/statistics" },
  ];

  if (user.user.role === 'CEO') links.push({ key: "shops", label: "Manage shops", href: "/shops" });

  return (
    <Sidebar className="w-40 border-black text-[#f0f0f0]">
      <SidebarHeader className="bg-[#292929] font-bold">
        Navigation
      </SidebarHeader>

      <SidebarContent className="bg-[#292929]">
        <SidebarMenu>
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);

            return (
              <SidebarMenuItem key={link.key}>
                <SidebarMenuButton
                  asChild
                  className={`transition-colors ${
                    isActive
                      ? "bg-[#555555] text-[#f0f0f0] font-semibold"
                      : "hover:bg-[#969696]"
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

      <SidebarFooter className="bg-[#292929]">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="hover:bg-[#969696]" asChild>
                <SidebarMenuButton>
                  <Label>{user.user.name}</Label>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width] bg-[#969696]"
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
