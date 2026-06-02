import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import socket from "@/utils/socket";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LocationState = {
  board?: number[];
};

// ── Share Modal ────────────────────────────────────────────────────────────────
const ShareModal = ({
  gameId,
  onClose,
}: {
  gameId: string;
  onClose: () => void;
}) => {
  const [copied, setCopied] = useState(false);

  const shareText = `Join my Bingo match! Room code: ${gameId}`;
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/game/${gameId}`
      : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gameId);
    } catch {
      const el = document.createElement("textarea");
      el.value = gameId;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socials = [
    {
      label: "WhatsApp",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      color: "bg-[#25D366] hover:bg-[#1ebe5d] text-white",
      href: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
    },
    {
      label: "Telegram",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
      color: "bg-[#0088cc] hover:bg-[#0077bb] text-white",
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      label: "X / Twitter",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: "bg-zinc-900 hover:bg-zinc-700 text-white",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <h3 className="text-lg font-semibold text-zinc-900">Share room code</h3>
        <p className="mt-1 text-sm text-zinc-500">Invite a friend to join your Bingo match.</p>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
          <span className="flex-1 font-mono text-base font-bold tracking-widest text-zinc-900 break-all">
            {gameId}
          </span>
          <button
            onClick={handleCopy}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              copied ? "bg-emerald-100 text-emerald-700" : "bg-zinc-900 text-white hover:bg-zinc-700"
            )}
          >
            {copied ? (
              <>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-400">Share via</p>
        <div className="mt-2 flex flex-col gap-2">
          {socials.map(({ label, icon, color, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                color
              )}
            >
              {icon}
              Share on {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Interactive Bingo Board ────────────────────────────────────────────────────
// Normal mode:  tap once → select (green), tap again → call number
// Swap mode:    tap first uncalled cell → pick A (purple), tap second → swap A↔B
const InteractiveBingoBoard = ({
  board,
  calledNumbers,
  isMyTurn,
  gameStarted,
  swapMode,
  onCallNumber,
  onSwap,
}: {
  board: number[];
  calledNumbers: number[];
  isMyTurn: boolean;
  gameStarted: boolean;
  swapMode: boolean;
  onCallNumber: (n: number) => void;
  onSwap: (idxA: number, idxB: number) => void;
}) => {
  const [pending, setPending] = useState<number | null>(null);       // index for call-mode
  const [swapFirst, setSwapFirst] = useState<number | null>(null);   // index for swap-mode

  const handleClick = (idx: number) => {
    const n = board[idx];
    const isCalled = calledNumbers.includes(n);

    if (swapMode) {
      // swap mode — only uncalled cells are swappable
      // if (isCalled) return;
      if (swapFirst === null) {
        setSwapFirst(idx);
      } else if (swapFirst === idx) {
        setSwapFirst(null); // deselect
      } else {
        onSwap(swapFirst, idx);
        setSwapFirst(null);
      }
      return;
    }

    // normal call mode
    if (!gameStarted || !isMyTurn) return;
    if (isCalled) return;
    if (pending === idx) {
      onCallNumber(n);
      setPending(null);
    } else {
      setPending(idx);
    }
  };

  useEffect(() => { setPending(null); }, [isMyTurn]);
  useEffect(() => { if (!swapMode) setSwapFirst(null); }, [swapMode]);

  return (
    <div className="w-full">
      {gameStarted && (
        <p className="mb-3 text-center text-xs text-zinc-400">
          {swapMode
            ? swapFirst !== null
              ? "Now tap the second number to swap with it"
              : "Tap the first number you want to swap"
            : isMyTurn
            ? "Tap a number to select · tap again to call it"
            : "Locked — opponent's turn"}
        </p>
      )}

      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {board.map((n, idx) => {
          const isCalled = calledNumbers.includes(n);
          const isPending = !swapMode && pending === idx;
          const isSwapFirst = swapMode && swapFirst === idx;
          const isSwapTarget = swapMode && !isCalled && swapFirst !== null && swapFirst !== idx;
          const isClickable = swapMode ? true 
            : gameStarted && isMyTurn && !isCalled;

          return (
            <button
              key={idx}
              type="button"
              disabled={!isClickable}
              onClick={() => handleClick(idx)}
              className={cn(
                "relative flex aspect-square w-full items-center justify-center rounded-xl text-sm font-bold transition-all duration-150 select-none",
                isCalled
                  ? "bg-zinc-900 text-white cursor-default"
                  : isSwapFirst
                  ? "bg-violet-500 text-white ring-2 ring-violet-300 ring-offset-1 scale-110 shadow-lg cursor-pointer"
                  : isPending
                  ? "bg-emerald-500 text-white ring-2 ring-emerald-300 ring-offset-1 scale-110 shadow-lg cursor-pointer"
                  : isSwapTarget
                  ? "border-2 border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100 hover:scale-105 cursor-pointer shadow-sm"
                  : isClickable
                  ? "border border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                  : "border border-zinc-100 bg-zinc-50 text-zinc-400 cursor-default"
              )}
            >
              {n}

              {isCalled && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-white opacity-25" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </span>
              )}

              {isPending && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-emerald-600 text-[9px] font-black shadow">✓</span>
              )}
              {isSwapFirst && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-violet-600 text-[9px] font-black shadow">A</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-zinc-900" />
          Called
        </span>
        {swapMode ? (
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-violet-500" />
            Swap selection
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-emerald-500" />
            Selected (tap again to call)
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-zinc-200 bg-white" />
          Available
        </span>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
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

  const [board, setBoard] = useState<number[]>(initialBoard);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [players, setPlayers] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [turn, setTurn] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Connecting to lobby...");
  const [showShareModal, setShowShareModal] = useState(false);
  const [swapMode, setSwapMode] = useState(false);
  const [powerUsed, setPowerUsed] = useState(false);

  const isMyTurn = turn === user?.email;
  const isSubscribed = user?.isSubscribed ?? false;

  useEffect(() => {
    if (!gameId) { setStatusMessage("Invalid game id"); return; }
    if (!user?.email) { setStatusMessage("User not found. Please login again."); return; }
    if (!board || board.length === 0) {
      setStatusMessage("Board not found. Please rejoin the game.");
    } else {
      setStatusMessage("Connected to lobby");
    }

    const emitJoinGame = () => {
      const gid = String(gameId ?? "").trim();
      if (!gid) return;
      socket.emit("joinGame", { gameId: gid, userId: user.email, board });
    };

    const handleConnect = () => emitJoinGame();

    const handlePlayersUpdate = (updatedPlayers: string[]) => {
      setPlayers(updatedPlayers);
      setStatusMessage(
        updatedPlayers.length < 2
          ? "Waiting for another player..."
          : "Both players joined. Ready to start."
      );
    };

    const handleReadyToStart = () =>
      setStatusMessage("Both players are here. Start the match.");

    const handleGameStarted = ({ turn }: { turn: string }) => {
      setGameStarted(true);
      setTurn(turn);
      setStatusMessage("Game started");
    };

    const handleTurnChanged = ({ turn }: { turn: string }) => setTurn(turn);

    const handleNumberCalled = (number: number) =>
      setCalledNumbers((prev) => (prev.includes(number) ? prev : [...prev, number]));

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

    const handleConnectError = () =>
      setStatusMessage("Lost connection to game server. Reconnecting…");

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
    socket.on("connect_error", handleConnectError);

    if (!socket.connected) socket.connect();
    else emitJoinGame();

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
      socket.off("connect_error", handleConnectError);
    };
  }, [gameId, user?.email, navigate]);

  const handleStartGame = () => {
    const gid = String(gameId ?? "").trim();
    if (!gid) return;
    if (players.length < 2) { alert("Need 2 players to start the game"); return; }
    socket.emit("startGame", { gameId: gid });
  };

  const handleCallNumber = (number: number) => {
    if (!gameId || !user?.email || !isMyTurn) return;
    if (calledNumbers.includes(number)) return;
    socket.emit("callNumber", {
      gameId: String(gameId ?? "").trim(),
      number,
      userId: user.email,
    });
  };

  const handleSwap = (idxA: number, idxB: number) => {
    setBoard((prev) => {
      const next = [...prev];
      [next[idxA], next[idxB]] = [next[idxB], next[idxA]];
      localStorage.setItem(`bingo-board-${gameId}`, JSON.stringify(next));
      return next;
    });
    setSwapMode(false);
    setPowerUsed(true);
  };

  const handleSwapNumber = () => {
  if (!gameId || !user?.email || !isMyTurn) return;
  if (powerUsed) { alert("Power already used!..."); return; }
  setSwapMode(true);  // let the board UI handle the actual swap
};

  return (
    <DashboardLayout>
      {showShareModal && gameId && (
        <ShareModal gameId={gameId} onClose={() => setShowShareModal(false)} />
      )}

      <div className="mx-auto max-w-5xl space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              {gameStarted ? "Match in progress" : "Game lobby"}
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              {gameStarted
                ? isMyTurn
                  ? "Your turn — tap a number on your board, then tap again to call it."
                  : "Opponent's turn — wait for them to call a number."
                : "Share the room code so a second player can join."}
            </p>
          </div>

          {/* Share button — lobby only */}
          {!gameStarted && gameId && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowShareModal(true)}
              className="shrink-0 gap-2 border-zinc-300 text-zinc-700 hover:border-zinc-900 hover:text-zinc-900"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" strokeLinecap="round" />
              </svg>
              Share room
            </Button>
          )}
        </div>

        {/* ══════════════════════════════════════
            PRE-GAME — room / lobby details
        ══════════════════════════════════════ */}
        {!gameStarted && (
          <>
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
                    <dt className="text-zinc-500">Players joined</dt>
                    <dd className="mt-0.5 text-zinc-800">
                      {players.length > 0 ? players.join(", ") : "Waiting for players…"}
                    </dd>
                  </div>
                </dl>
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Status
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">{statusMessage}</p>
                </div>
              </CardContent>
            </Card>

            {players.length < 2 && (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-4 text-center text-sm text-zinc-600 sm:p-6">
                Waiting for another player to join this room…
              </div>
            )}

            {players.length === 2 && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <p className="text-sm text-zinc-600">
                  Both players are here. Click start when ready.
                </p>
                <Button
                  type="button"
                  className="h-11 shrink-0 bg-zinc-900 hover:bg-zinc-800"
                  onClick={handleStartGame}
                >
                  Start match
                </Button>
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════
            IN-GAME — compact player cards only
        ══════════════════════════════════════ */}
        {gameStarted && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {players.map((p) => {
              const isActive = turn === p;
              const isMe = p === user?.email;
              return (
                <div
                  key={p}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all",
                    isActive
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-zinc-200 bg-white"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      isActive ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-600"
                    )}
                  >
                    {p.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-zinc-800">
                      {isMe ? "You" : p.split("@")[0]}
                    </p>
                    <p className={cn(
                      "text-[10px] font-medium",
                      isActive ? "text-emerald-600" : "text-zinc-400"
                    )}>
                      {isActive ? (isMe ? "Your turn" : "Their turn") : "Waiting"}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* numbers called counter */}
            <div className="flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-700">
                {calledNumbers.length}
              </span>
              <div>
                <p className="text-xs font-semibold text-zinc-800">Called</p>
                <p className="text-[10px] text-zinc-400">{25 - calledNumbers.length} left</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Turn banner (in-game only) ── */}
        {gameStarted && (
          <div
            className={cn(
              "rounded-xl border px-4 py-3 text-center text-sm font-semibold",
              isMyTurn
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-zinc-200 bg-zinc-50 text-zinc-600"
            )}
          >
            {isMyTurn
              ? "✦ Your turn — tap a number on your board to call it."
              : "Opponent's turn — hang tight."}
          </div>
        )}

        {/* ── Pro Power banner (in-game only) ── */}
        {gameStarted && (
          isSubscribed ? (
            <div className={cn(
              "flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
              swapMode
                ? "border-violet-300 bg-violet-50"
                : powerUsed
                ? "border-zinc-200 bg-zinc-50"
                : "border-amber-200 bg-amber-50"
            )}>
              <div className="flex items-center gap-3">
                {/* icon */}
                <span className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg",
                  swapMode ? "bg-violet-100" : powerUsed ? "bg-zinc-100" : "bg-amber-100"
                )}>
                  {powerUsed ? "🔒" : "⚡"}
                </span>
                <div>
                  <p className={cn(
                    "text-sm font-semibold",
                    swapMode ? "text-violet-900" : powerUsed ? "text-zinc-500" : "text-amber-900"
                  )}>
                    {swapMode
                      ? "Swap mode active — pick 2 numbers on your board"
                      : powerUsed
                      ? "Power used — swap already played this game"
                      : "Pro Power — swap any 2 numbers on your board"}
                  </p>
                  <p className={cn(
                    "text-xs",
                    swapMode ? "text-violet-600" : powerUsed ? "text-zinc-400" : "text-amber-700"
                  )}>
                    {swapMode
                      ? "Tap first number (A), then second number (B) to swap them"
                      : powerUsed
                      ? "You've already used your one swap for this match"
                      : "One-time use per game. Swapped numbers keep their called/uncalled state."}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                {swapMode ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 border-violet-300 text-violet-700 hover:bg-violet-100"
                    onClick={() => setSwapMode(false)}
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={powerUsed}
                    className={cn(
                      "h-9 gap-2",
                      powerUsed
                        ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                        : "bg-violet-600 hover:bg-violet-700 text-white"
                    )}
                    onClick={handleSwapNumber}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {powerUsed ? "Used" : "Use Power"}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg">🔐</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-700">Pro exclusive — number swap</p>
                <p className="text-xs text-zinc-400">
                  Upgrade to Pro to swap any 2 numbers on your board once per game.{" "}
                  <a href="/upgrade" className="font-medium text-violet-600 hover:underline">Upgrade →</a>
                </p>
              </div>
            </div>
          )
        )}

        {/* ── Board (doubles as number caller when game is started) ── */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Your board
          </h3>
          <InteractiveBingoBoard
            board={board}
            calledNumbers={calledNumbers}
            isMyTurn={isMyTurn}
            gameStarted={gameStarted}
            swapMode={swapMode}
            onCallNumber={handleCallNumber}
            onSwap={handleSwap}
          />
        </div>

        {/* ── Called numbers (in-game, non-empty) ── */}
        {gameStarted && calledNumbers.length > 0 && (
          <Card className="border-zinc-200/80 shadow-sm">
            <CardHeader className="border-b border-zinc-100 py-3">
              <CardTitle className="text-sm">Called numbers</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                {calledNumbers.map((n) => (
                  <span
                    key={n}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MatchLobby;