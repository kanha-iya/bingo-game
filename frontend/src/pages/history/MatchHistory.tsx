import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  getMatchHistory,
  type MatchHistoryEntry,
} from "@/services/user.service";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const formatOpponentLabel = (o: { email?: string; username?: string }) =>
  o.username || o.email || "Unknown player";

const outcomeLabel = (row: MatchHistoryEntry) => {
  switch (row.result) {
    case "win":
      return "Win";
    case "loss":
      return "Loss";
    case "waiting":
      return "Waiting";
    case "playing":
      return "In progress";
    case "finished":
      return "Finished";
    default:
      return row.result;
  }
};

const outcomeClass = (row: MatchHistoryEntry) => {
  if (row.result === "win") return "bg-emerald-100 text-emerald-900";
  if (row.result === "loss") return "bg-red-100 text-red-900";
  if (row.result === "playing") return "bg-amber-100 text-amber-900";
  if (row.result === "waiting") return "bg-zinc-200 text-zinc-800";
  return "bg-zinc-100 text-zinc-700";
};

const formatDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const MatchHistory = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["matchHistory"],
    queryFn: getMatchHistory,
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              Match history
            </h2>
            <p className="mt-1 max-w-xl text-sm text-zinc-600 sm:text-base">
              Rooms you joined, including live and completed games.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full shrink-0 border-zinc-900 sm:w-auto"
            onClick={() => navigate("/play")}
          >
            Play a match
          </Button>
        </div>

        <Card className="overflow-hidden border-zinc-200/80 shadow-sm">
          <CardHeader className="border-b border-zinc-100 bg-white py-4">
            <CardTitle className="text-lg">Your matches</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading && (
              <p className="p-6 text-sm text-zinc-600">Loading match history…</p>
            )}
            {isError && (
              <p className="p-6 text-sm text-red-600">
                {(error as Error)?.message || "Could not load match history."}
              </p>
            )}
            {!isLoading && !isError && data && data.length === 0 && (
              <div className="p-8 text-center">
                <p className="mb-4 text-sm text-zinc-600">
                  You have not played a match yet.
                </p>
                <Button
                  className="bg-zinc-900 hover:bg-zinc-800"
                  onClick={() => navigate("/play")}
                >
                  Create or join a room
                </Button>
              </div>
            )}
            {!isLoading && !isError && data && data.length > 0 && (
              <>
                <ul className="divide-y divide-zinc-100 md:hidden">
                  {data.map((row) => (
                    <li key={row.gameId} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-semibold text-zinc-900">
                            {row.gameId}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {formatDate(row.updatedAt)}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            outcomeClass(row)
                          )}
                        >
                          {outcomeLabel(row)}
                        </span>
                      </div>
                      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                        <div>
                          <dt className="text-zinc-500">Opponent</dt>
                          <dd className="mt-0.5 font-medium text-zinc-800">
                            {row.opponents.length > 0
                              ? row.opponents.map(formatOpponentLabel).join(", ")
                              : "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-zinc-500">Numbers called</dt>
                          <dd className="mt-0.5 font-medium text-zinc-800">
                            {row.calledNumbers?.length
                              ? row.calledNumbers.length
                              : "—"}
                          </dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ul>

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                      <tr>
                        <th className="px-4 py-3 font-medium">Room</th>
                        <th className="px-4 py-3 font-medium">Last update</th>
                        <th className="px-4 py-3 font-medium">Opponent</th>
                        <th className="px-4 py-3 font-medium">Outcome</th>
                        <th className="px-4 py-3 font-medium">Numbers called</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 bg-white">
                      {data.map((row) => (
                        <tr key={row.gameId} className="hover:bg-zinc-50/80">
                          <td className="px-4 py-3 font-mono font-medium text-zinc-900">
                            {row.gameId}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-zinc-700">
                            {formatDate(row.updatedAt)}
                          </td>
                          <td className="px-4 py-3 text-zinc-700">
                            {row.opponents.length > 0
                              ? row.opponents.map(formatOpponentLabel).join(", ")
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                outcomeClass(row)
                              )}
                            >
                              {outcomeLabel(row)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-zinc-700">
                            {row.calledNumbers?.length
                              ? row.calledNumbers.length
                              : "—"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MatchHistory;
