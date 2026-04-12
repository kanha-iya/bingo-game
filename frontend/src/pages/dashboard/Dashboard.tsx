import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserStats } from "@/services/user.service";
import { useEffect, useState } from "react";
import { PlayCircle, Crown, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [totalMatches, setTotalMatches] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);

  const navigate = useNavigate();

  const { data: userStats, isLoading } = useQuery({
    queryKey: ["userStats"],
    queryFn: getUserStats,
    select: (data) => data,
  });

  const stats = [
    { title: "Matches played", value: totalMatches },
    { title: "Wins", value: wins },
    { title: "Losses", value: losses },
  ];

  const actions = [
    { title: "Play match", path: "/play", icon: PlayCircle },
    { title: "Subscription", path: "/subscription", icon: Crown },
    { title: "Match history", path: "/history", icon: History },
    { title: "Settings", path: "/settings", icon: Settings },
  ];

  useEffect(() => {
    if (userStats) {
      setTotalMatches(userStats.totalMatches);
      setWins(userStats.wins);
      setLosses(userStats.losses);
    }
  }, [userStats]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Overview
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-zinc-600 sm:text-base">
            Your stats and shortcuts in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          {stats.map((item) => (
            <Card
              key={item.title}
              className="border-zinc-200/80 shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-9 w-16 animate-pulse rounded-md bg-zinc-200" />
                ) : (
                  <p className="text-3xl font-bold tabular-nums text-zinc-900 sm:text-4xl">
                    {item.value}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Quick actions
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
            {actions.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(item.path)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(item.path);
                    }
                  }}
                  className={cn(
                    "cursor-pointer border-zinc-200/80 shadow-sm transition-all",
                    "hover:border-zinc-300 hover:shadow-md active:scale-[0.99]"
                  )}
                >
                  <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="font-semibold text-zinc-900">
                      {item.title}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
