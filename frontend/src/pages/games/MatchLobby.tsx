import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BingoBoard from "@/components/game/BingoBoard";
import socket from "@/utils/socket";
import { useAuth } from "@/context/AuthContext";

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
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Game Lobby</h1>

        <div className="mb-6 rounded-lg border p-4 shadow-sm">
          <p className="mb-2">
            <span className="font-semibold">Game ID:</span> {gameId || "N/A"}
          </p>
          <p className="mb-2">
            <span className="font-semibold">You:</span> {user?.email || "N/A"}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Players:</span>{" "}
            {players.length > 0 ? players.join(", ") : "No players joined yet"}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Status:</span> {statusMessage}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Game Started:</span>{" "}
            {gameStarted ? "Yes" : "No"}
          </p>
          <p>
            <span className="font-semibold">Current Turn:</span>{" "}
            {turn ? turn : "Not decided yet"}
          </p>
        </div>

        {players.length < 2 && (
          <p className="mb-6 text-lg">Waiting for another player...</p>
        )}

        {players.length === 2 && !gameStarted && (
          <button
            onClick={handleStartGame}
            className="bg-green-600 text-white px-6 py-2 rounded mb-6 hover:opacity-90"
          >
            Start Match
          </button>
        )}

        {gameStarted && (
          <p className="mb-4 font-semibold text-lg">
            {isMyTurn ? "Your Turn" : "Opponent's Turn"}
          </p>
        )}

        <div className="flex gap-4 mb-6">
          <input
            type="number"
            min="1"
            max="25"
            value={numberInput}
            disabled={!gameStarted || !isMyTurn}
            onChange={(e) => setNumberInput(e.target.value)}
            className="border p-2 rounded w-36"
            placeholder="Enter 1–25"
          />
          <button
            onClick={handleCallNumber}
            disabled={!gameStarted || !isMyTurn}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Call Number
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-3">Called Numbers</h2>
          <div className="border rounded p-3 min-h-[52px]">
            {calledNumbers.length > 0
              ? calledNumbers.join(", ")
              : "No numbers called yet"}
          </div>
        </div>

        <div className="mt-6">
          <BingoBoard board={board} calledNumbers={calledNumbers} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MatchLobby;