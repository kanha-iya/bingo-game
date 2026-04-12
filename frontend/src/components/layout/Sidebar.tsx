import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlayCircle,
  Crown,
  History,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  collapsed: boolean;
  onMobileClose: () => void;
};

const Sidebar = ({ collapsed, onMobileClose }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Play match", path: "/play", icon: PlayCircle },
    { name: "Subscription", path: "/subscription", icon: Crown },
    { name: "Match history", path: "/history", icon: History },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/play") {
      return (
        location.pathname === "/play" ||
        location.pathname.startsWith("/lobby/")
      );
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    onMobileClose();
    navigate("/login");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-zinc-800 px-3 sm:h-16">
        <Link
          to="/dashboard"
          onClick={onMobileClose}
          className={cn(
            "flex min-w-0 items-center font-bold tracking-tight text-white",
            collapsed ? "lg:justify-center" : "gap-2"
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-sm font-black text-zinc-950">
            B
          </span>
          <span
            className={cn(
              "truncate text-lg transition-opacity",
              collapsed ? "lg:hidden" : "block"
            )}
          >
            Bingo
          </span>
        </Link>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-zinc-300 hover:bg-zinc-800 hover:text-white lg:hidden"
          aria-label="Close menu"
          onClick={onMobileClose}
        >
          <X className="size-5" />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2 sm:p-3" aria-label="Main">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.name : undefined}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                "outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                collapsed && "lg:justify-center lg:px-2",
                active
                  ? "bg-white/10 text-white ring-1 ring-white/15"
                  : "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-100"
              )}
            >
              <Icon className="size-5 shrink-0 opacity-90" aria-hidden />
              <span
                className={cn(
                  "truncate",
                  collapsed ? "lg:sr-only" : "block"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-zinc-800 p-2 sm:p-3">
        {user?.email && (
          <div
            className={cn(
              "mb-2 rounded-lg bg-zinc-900/80 px-3 py-2 text-xs text-zinc-400",
              collapsed && "lg:hidden"
            )}
          >
            <p className="font-medium text-zinc-300">Signed in</p>
            <p className="truncate" title={user.email}>
              {user.email}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          title="Log out"
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-300 transition-colors",
            "outline-none hover:bg-red-950/50 hover:text-red-200 focus-visible:ring-2 focus-visible:ring-red-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
            collapsed && "lg:justify-center lg:px-2"
          )}
        >
          <LogOut className="size-5 shrink-0" aria-hidden />
          <span className={cn(collapsed ? "lg:sr-only" : "block")}>Log out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
