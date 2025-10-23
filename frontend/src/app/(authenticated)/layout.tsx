import { SidebarProvider } from "@/components/atoms/sidebar";
import { SVSidebar } from "@/components/organisms/sv-sidebar";
import DotGrid from "@/components/organisms/DotGrid";
import { UserProvider } from "@/components/providers/user-provider";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TimerNotificationClient } from "@/components/molecules/timer-notification-client";

async function checkAuth() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("Authentication")?.value;

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/me`, {
    headers: {
      cookie: authToken ? `Authentication=${authToken}` : "",
    },
    cache: "no-store",
  });

  if (!res.ok) redirect("/login");

  return res.json();
}

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await checkAuth();

  return (
    <UserProvider user={user}>
      <div className="relative h-screen w-screen bg-[var(--color-bg-main)]">
        <SidebarProvider defaultOpen={true}>
          <SVSidebar />

          <div className="absolute inset-0 z-0">
            {/* <DotGrid
              dotSize={4}
              gap={35}
              baseColor="#666666"
              activeColor="#e0e0e0"
              proximity={100}
              shockRadius={100}
              shockStrength={10}
              resistance={750}
              returnDuration={1.5}
            /> */}
          </div>

          <div className="relative z-10 text-[var(--color-text-primary)] w-full">
            {children}
            <TimerNotificationClient />
          </div>
        </SidebarProvider>
      </div>
    </UserProvider>
  );
}