import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createMatch, joinMatch } from "@/services/match.service";
import { Users, PlusCircle } from "lucide-react";

const PlayMatch = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");

  const createMutation = useMutation({
    mutationFn: createMatch,
    onSuccess: (data) => {
      const player = data.players[0];
      navigate(`/lobby/${data.gameId}`, {
        state: {
          board: player.board,
          markedNumbers: player.markedNumbers,
        },
      });
    },
  });

  const joinMutation = useMutation({
    mutationFn: joinMatch,
    onSuccess: (data) => {
      const player = data.players[1];
      navigate(`/lobby/${data.gameId}`, {
        state: {
          board: player.board,
          markedNumbers: player.markedNumbers,
        },
      });
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Play match
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-zinc-600 sm:text-base">
            Start a new room or join a friend with their room code.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <Card className="border-zinc-200/80 shadow-sm">
            <CardHeader className="space-y-1 border-b border-zinc-100 bg-zinc-50/50 pb-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="size-5 text-emerald-600" aria-hidden />
                <CardTitle className="text-lg">Create match</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <p className="text-sm leading-relaxed text-zinc-600">
                Create a room, share the code with one other player, then start
                when you are both ready.
              </p>
              <Button
                className="w-full bg-zinc-900 text-white hover:bg-zinc-800"
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating…" : "Create new room"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-zinc-200/80 shadow-sm">
            <CardHeader className="space-y-1 border-b border-zinc-100 bg-zinc-50/50 pb-4">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-emerald-600" aria-hidden />
                <CardTitle className="text-lg">Join match</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <label htmlFor="room-code" className="sr-only">
                Room code
              </label>
              <Input
                id="room-code"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.trim())}
                className="h-11"
                autoCapitalize="none"
                autoCorrect="off"
              />
              <Button
                className="w-full bg-zinc-900 text-white hover:bg-zinc-800"
                onClick={() => {
                  if (!roomCode) return;
                  joinMutation.mutate(roomCode);
                }}
                disabled={joinMutation.isPending || !roomCode}
              >
                {joinMutation.isPending ? "Joining…" : "Join room"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlayMatch;
