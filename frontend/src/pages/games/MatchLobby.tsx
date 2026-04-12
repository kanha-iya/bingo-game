import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BingoBoard from "@/components/game/BingoBoard";
import socket from "@/utils/socket";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LocationState = {
  board?: number[];
};

const MatchLobby = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const state = location.state as LocationState | null;

  const initialBoard = useMemo(() => {
    if (state?.board && Array.isArray(state.board) && state.board.length > 0) {
      localStorage.setItem(`bingo-board-${gameId}`, JSON.stringify(state.board));
      return state.board;
    }
    const savedBoard = localStorage.getItem(`bingo-board-${gameId}`);
    return savedBoard ? JSON.parse(savedBoard) : [];
  }, [state, gameId]);

  const [board] = useState<number[]>(initialBoard);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [numberInput, setNumberInput] = useState("");
  const [players, setPlayers] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [turn, setTurn] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Connecting to lobby...");

  const isMyTurn = turn === user?.email;

  useEffect(() => {
    if (!gameId) {
      setStatusMessage("Invalid game id");
      return;
    }

    if (!user?.email) {
      setStatusMessage("User not found. Please login again.");
      return;
    }

    if (!board || board.length === 0) {
      setStatusMessage("Board not found. Please rejoin the game.");
    } else {
      setStatusMessage("Connected to lobby");
    }

    const emitJoinGame = () => {
      socket.emit("joinGame", {
        gameId,
        userId: user.email,
        board,
      });
    };

    const handleConnect = () => {
      emitJoinGame();
    };

    const handlePlayersUpdate = (updatedPlayers: string[]) => {
      setPlayers(updatedPlayers);
      if (updatedPlayers.length < 2) {
        setStatusMessage("Waiting for another player...");
      } else {
        setStatusMessage("Both players joined. Ready to start.");
      }
    };

    const handleReadyToStart = () => {
      setStatusMessage("Both players are here. Start the match.");
    };

    const handleGameStarted = ({ turn }: { turn: string }) => {
      setGameStarted(true);
      setTurn(turn);
      setStatusMessage("Game started");
    };

    const handleTurnChanged = ({ turn }: { turn: string }) => {
      setTurn(turn);
    };

    const handleNumberCalled = (number: number) => {
      setCalledNumbers((prev) => {
        if (prev.includes(number)) return prev;
        return [...prev, number];
      });
    };

    const handleGameState = ({
      calledNumbers,
      turn,
    }: {
      calledNumbers: number[];
      turn: string;
    }) => {
      setCalledNumbers(calledNumbers);
      setTurn(turn);
      setGameStarted(true);
      setStatusMessage("Game in progress");
    };

    const handleBingoWinner = ({ winner }: { winner: string }) => {
      const isWinner = winner === user?.email;
      setStatusMessage(isWinner ? "You won!" : `${winner} got Bingo!`);
      alert(isWinner ? "You got Bingo! You win!" : `${winner} got Bingo! You lose.`);
    };

    const handleErrorMessage = ({ message }: { message: string }) => {
      setStatusMessage(message);
      alert(message);
    };

    const handleRoomFull = ({ message }: { message: string }) => {
      setStatusMessage(message);
      alert(message);
      navigate("/dashboard");
    };

    socket.on("connect", handleConnect);
    socket.on("playersUpdate", handlePlayersUpdate);
    socket.on("readyToStart", handleReadyToStart);
    socket.on("gameStarted", handleGameStarted);
    socket.on("turnChanged", handleTurnChanged);
    socket.on("numberCalled", handleNumberCalled);
    socket.on("gameState", handleGameState);
    socket.on("bingoWinner", handleBingoWinner);
    socket.on("errorMessage", handleErrorMessage);
    socket.on("roomFull", handleRoomFull);

    if (!socket.connected) {
      socket.connect();
    } else {
      emitJoinGame();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("playersUpdate", handlePlayersUpdate);
      socket.off("readyToStart", handleReadyToStart);
      socket.off("gameStarted", handleGameStarted);
      socket.off("turnChanged", handleTurnChanged);
      socket.off("numberCalled", handleNumberCalled);
      socket.off("gameState", handleGameState);
      socket.off("bingoWinner", handleBingoWinner);
      socket.off("errorMessage", handleErrorMessage);
      socket.off("roomFull", handleRoomFull);
    };
  }, [gameId, user?.email, navigate]);

  const handleStartGame = () => {
    if (!gameId) return;
    if (players.length < 2) {
      alert("Need 2 players to start the game");
      return;
    }
    socket.emit("startGame", { gameId });
  };

  const handleCallNumber = () => {
    if (!gameId || !user?.email) return;

    const num = parseInt(numberInput, 10);

    if (isNaN(num) || num < 1 || num > 25) {
      alert("Enter a valid whole number between 1 and 25");
      return;
    }

    if (calledNumbers.includes(num)) {
      alert("This number has already been called");
      return;
    }

    if (!isMyTurn) {
      alert("It's not your turn");
      return;
    }

    socket.emit("callNumber", {
      gameId,
      number: num,
      userId: user.email,
    });

    setNumberInput("");
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Game lobby
          </h2>
          <p className="mt-1 text-sm text-zinc-600 sm:text-base">
            Share the room code so a second player can join, then take turns
            calling numbers.
          </p>
        </div>

        <Card className="border-zinc-200/80 shadow-sm">
          <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 pb-4">
            <CardTitle className="text-lg">Room details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-zinc-500">Room code</dt>
                <dd className="mt-0.5 break-all font-mono font-semibold text-zinc-900">
                  {gameId || "N/A"}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">You</dt>
                <dd className="mt-0.5 break-all text-zinc-800">{user?.email || "—"}</dd>
              </div>
            </dl>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-zinc-500">Players</dt>
                <dd className="mt-0.5 text-zinc-800">
                  {players.length > 0
                    ? players.join(", ")
                    : "Waiting for players…"}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Current turn</dt>
                <dd className="mt-0.5 break-all text-zinc-800">
                  {turn ?? "Not decided yet"}
                </dd>
              </div>
            </dl>
            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Status
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900">{statusMessage}</p>
              <p className="mt-2 text-xs text-zinc-500">
                Match {gameStarted ? "in progress" : "not started yet"}
              </p>
            </div>
          </CardContent>
        </Card>

        {players.length < 2 && (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-4 text-center text-sm text-zinc-600 sm:p-6">
            Waiting for another player to join this room…
          </div>
        )}

        {players.length === 2 && !gameStarted && (
          <Button
            type="button"
            className="h-11 w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto sm:px-8"
            onClick={handleStartGame}
          >
            Start match
          </Button>
        )}

        {gameStarted && (
          <div
            className={cn(
              "rounded-xl border px-4 py-3 text-center text-sm font-semibold sm:text-left",
              isMyTurn
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-zinc-200 bg-zinc-50 text-zinc-800"
            )}
          >
            {isMyTurn ? "Your turn — call a number." : "Opponent's turn — hang tight."}
          </div>
        )}

        <Card className="border-zinc-200/80 shadow-sm">
          <CardHeader className="border-b border-zinc-100 py-4">
            <CardTitle className="text-base">Call a number</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <label htmlFor="call-number" className="text-sm font-medium text-zinc-700">
                  Number (1–25)
                </label>
                <Input
                  id="call-number"
                  type="number"
                  min={1}
                  max={25}
                  inputMode="numeric"
                  value={numberInput}
                  disabled={!gameStarted || !isMyTurn}
                  onChange={(e) => setNumberInput(e.target.value)}
                  className="h-11 max-w-full sm:max-w-[11rem]"
                  placeholder="e.g. 12"
                />
              </div>
              <Button
                type="button"
                className="h-11 w-full bg-zinc-900 hover:bg-zinc-800 sm:w-auto sm:min-w-[8rem]"
                onClick={handleCallNumber}
                disabled={!gameStarted || !isMyTurn}
              >
                Call number
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 shadow-sm">
          <CardHeader className="border-b border-zinc-100 py-4">
            <CardTitle className="text-base">Called numbers</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="min-h-[3rem] rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 text-sm text-zinc-800">
              {calledNumbers.length > 0
                ? calledNumbers.join(", ")
                : "No numbers called yet."}
            </div>
          </CardContent>
        </Card>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Your board
          </h3>
          <BingoBoard board={board} calledNumbers={calledNumbers} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MatchLobby;