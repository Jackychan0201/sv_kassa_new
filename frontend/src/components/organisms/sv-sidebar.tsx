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
import {
  ChevronUp,
  LayoutDashboard,
  BarChart3,
  Store,
  User,
  LogOut,
} from "lucide-react";
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
    } catch (err) {
      handleError(err);
    } finally {
      router.push("/login");
    }
  };

  const links = [
    { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { key: "statistics", label: "Statistics", href: "/statistics", icon: BarChart3 },
  ];

  if (user.user.role === "CEO") {
    links.push({ key: "shops", label: "Manage Shops", href: "/shops", icon: Store });
  }

  return (
    <Sidebar className="border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
      {/* HEADER */}
      <SidebarHeader className="flex justify-center h-16 border-b border-[var(--color-border)] px-6 py-4 bg-[var(--color-bg-secondary)]">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Navigation
        </h2>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent className="px-3 py-4 bg-[var(--color-bg-secondary)]">
        <SidebarMenu>
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <SidebarMenuItem key={link.key}>
                <SidebarMenuButton
                  asChild
                  className={`group relative transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--color-sidebar-button-active)] hover:bg-[var(--color-sidebar-button-active)] text-[var(--color-text-primary)] hover:text-[var(--color-text-primary)] font-medium"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-button-hover)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  <Link href={link.href} className="flex items-center gap-3 px-3 py-2">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive
                          ? "text-[var(--color-text-primary)]"
                          : "text-[var(--color-text-thirdly)]"
                      }`}
                    />
                    <span className="text-sm">{link.label}</span>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[var(--color-text-thirdly)]" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <SidebarMenu>
          <SidebarMenuItem className="flex justify-center items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full h-[70%] hover:bg-[var(--color-sidebar-button-hover)] transition-colors">
                  <div className="flex items-center gap-3 px-3 py-2 w-full">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-sidebar-button-active)] text-[var(--color-text-primary)]">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <span className="text-sm font-medium truncate w-full text-[var(--color-text-primary)]">
                        {user.user.name}
                      </span>
                      <span className="text-xs text-[var(--color-text-thirdly)] capitalize">
                        {user.user.role.toLowerCase()}
                      </span>
                    </div>
                    <ChevronUp className="h-4 w-4 text-[var(--color-text-thirdly)]" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="top"
                align="center"
                className="w-full bg-[var(--color-bg-select-content)] border border-[var(--color-border)]"
              >
                <DropdownMenuItem asChild>
                  <Link
                    href="/account"
                    className="flex items-center gap-2 cursor-pointer text-[var(--color-text-primary)] hover:bg-[var(--color-sidebar-button-hover)] hover:text-[var(--color-text-primary)] transition-colors px-3 py-2"
                  >
                    <User className="h-4 w-4 text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 cursor-pointer text-[var(--color-caution)] hover:bg-[var(--color-sidebar-button-hover)] hover:text-[var(--color-text-primary)] transition-colors px-3 py-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
