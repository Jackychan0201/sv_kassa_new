import { SidebarProvider } from "@/components/atoms/sidebar";
import { SVSidebar } from "@/components/organisms/sv-sidebar";
import DotGrid from "@/components/organisms/DotGrid";
import { UserProvider, useUser } from "@/components/providers/user-provider";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TimerNotification } from "@/components/molecules/notification";
import { TimerNotificationClient } from "@/components/molecules/timer-notification-client";

async function checkAuth() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("Authentication")?.value;

  const res = await fetch("http://localhost:3000/auth/me", {
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
      <div className="bg-[#1e1e1e] relative h-screen w-screen">
        <SidebarProvider defaultOpen={true}>
          <SVSidebar />

          <div className="absolute inset-0 z-0">
            <DotGrid
              dotSize={4}
              gap={35}
              baseColor="#666666"
              activeColor="#e0e0e0"
              proximity={100}
              shockRadius={100}
              shockStrength={10}
              resistance={750}
              returnDuration={1.5}
            />
          </div>

          <div className="relative z-10 ml-45 mt-3 text-[#f0f0f0] w-full">
            {children}
            <TimerNotificationClient />
          </div>
        </SidebarProvider>
      </div>
    </UserProvider>
  );
}