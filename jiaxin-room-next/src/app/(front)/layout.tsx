"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuthStore } from "@/stores/auth-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function FrontLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const showTabPad = isMobile && isLoggedIn;

  return (
    <>
      <Header />
      <main
        className={cn(
          "min-h-screen pt-[var(--header-height)]",
          showTabPad &&
            "pb-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom,0px))]"
        )}
      >
        {children}
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
