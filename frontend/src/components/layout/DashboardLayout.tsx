import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Menu, PanelLeftClose, PanelLeft } from "lucide-react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const titleFromPath = (pathname: string) => {
  if (pathname.startsWith("/lobby")) return "Live match";
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/play") return "Play match";
  if (pathname === "/subscription") return "Subscription";
  if (pathname === "/history") return "Match history";
  if (pathname === "/settings") return "Settings";
  return "Bingo";
};

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const pageTitle = useMemo(
    () => titleFromPath(location.pathname),
    [location.pathname]
  );

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-zinc-100 text-foreground">
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <div className="min-h-screen lg:flex">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex min-h-screen h-full shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl transition-[transform,width] duration-200 ease-out",
            "w-[min(17.5rem,calc(100vw-3rem))] sm:w-64",
            sidebarCollapsed ? "lg:w-[4.25rem]" : "lg:w-64",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:static lg:translate-x-0 lg:shadow-none"
          )}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onMobileClose={() => setMobileNavOpen(false)}
          />
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header
            className={cn(
              "sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200/80 bg-white/90 px-4 shadow-sm backdrop-blur-md sm:h-16 sm:px-5",
              "supports-[backdrop-filter]:bg-white/75"
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 lg:hidden"
              aria-label="Open navigation menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="size-5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden shrink-0 lg:inline-flex"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setSidebarCollapsed((c) => !c)}
            >
              {sidebarCollapsed ? (
                <PanelLeft className="size-5" />
              ) : (
                <PanelLeftClose className="size-5" />
              )}
            </Button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold tracking-tight text-zinc-900 sm:text-lg">
                {pageTitle}
              </h1>
              <p className="hidden text-xs text-zinc-500 sm:block">
                Bingo multiplayer
              </p>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
